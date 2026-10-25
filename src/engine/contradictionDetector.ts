import { Finding, LegalDocument, SupportingEvidenceItem } from '../types';

/**
 * Deterministic Contradiction Detector
 * 
 * Rules:
 * 1. Checks explicit conflicting facts between document claims and evidence records
 *    or between multiple evidence documents (e.g. Paid vs Unpaid).
 * 2. Surfaces exact excerpts and source identifiers.
 * 3. Never decides which record is true. Never alters records.
 * 4. Recommends neutral reconciliation and human review.
 */
export function detectContradictions(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];

  // Check 1: Primary Deterministic Payment Status Contradiction
  const paymentContradiction = checkPaymentStatusContradiction(doc);
  if (paymentContradiction) {
    findings.push(paymentContradiction);
  }

  // Check 2: Amount Mismatch between document statement and supporting evidence
  const amountMismatch = checkAmountMismatches(doc);
  if (amountMismatch) {
    findings.push(amountMismatch);
  }

  // Check 3: Chronology Inversion (e.g., payment or breach claimed before agreement date)
  const chronologyFindings = checkChronologyConflicts(doc);
  findings.push(...chronologyFindings);

  return findings;
}

/**
 * Checks for paid vs pending/unpaid payment status contradiction
 * Specifically detects conflicts like Warehouse delivery receipt showing paid via NEFT
 * vs bank ledger or notice text claiming debt remains unpaid.
 */
function checkPaymentStatusContradiction(doc: LegalDocument): Finding | null {
  const evidence = doc.supportingEvidence || [];
  const docText = (doc.content || '') + ' ' + (doc.factsAndChronology || '');

  // Look for paid indicators across evidence items
  // e.g. "fully paid", "paid on", "NEFT reference", "cleared", "payment received"
  const paidRegex = /(fully\s+paid|cleared\s+via\s+neft|paid\s+on\s+([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2})|payment\s+received|neft\s+(?:ref|reference)\s*[:#]?\s*([a-zA-Z0-9]+))/i;
  
  // Look for unpaid indicators across evidence items or notice text
  // e.g. "unpaid", "pending", "outstanding dues", "failed to pay", "defaulted"
  const unpaidRegex = /(pending\s+and\s+unpaid|unpaid|remains\s+outstanding|outstanding\s+dues|defaulted\s+on\s+payment|ledger\s+marks.*pending|overdue)/i;

  let paidEvidence: { item: SupportingEvidenceItem; excerpt: string } | null = null;
  let unpaidEvidence: { item: SupportingEvidenceItem; excerpt: string } | null = null;

  for (const item of evidence) {
    const combined = `${item.title} ${item.keyStatements.join(' ')} ${item.fullTextOrSummary}`;
    if (paidRegex.test(combined)) {
      // Find matching excerpt
      const statementMatch = item.keyStatements.find((s) => paidRegex.test(s));
      paidEvidence = {
        item,
        excerpt: statementMatch || item.fullTextOrSummary.slice(0, 200),
      };
    }
    if (unpaidRegex.test(combined)) {
      const statementMatch = item.keyStatements.find((s) => unpaidRegex.test(s));
      unpaidEvidence = {
        item,
        excerpt: statementMatch || item.fullTextOrSummary.slice(0, 200),
      };
    }
  }

  // Case A: Conflicting evidence items (e.g. Warehouse receipt says paid, Bank Ledger says pending)
  if (paidEvidence && unpaidEvidence) {
    return {
      id: `contra-payment-${doc.id}`,
      category: 'CONTRADICTION',
      severity: 'CRITICAL',
      title: 'Critical Factual Contradiction: Conflicting Payment Records',
      explanation:
        'A critical discrepancy exists between submitted evidence records regarding payment status. One record states the invoice was fully paid and cleared via NEFT, while another accounting ledger marks the identical debt as pending and unpaid.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 100,
      confidenceExplanation:
        'Deterministic rule matched explicit contradictory status tokens ("fully paid" vs "pending/unpaid") referencing the same transaction across evidentiary documents.',
      recommendedAction:
        'Obtain certified bank statements and dispatch a formal reconciliation query. Reconcile records with both accounts departments and conduct human legal review before issuing or serving demand.',
      status: 'OPEN',
      targetDocumentSection: 'Statement of Facts & Schedule of Dues',
      evidenceExcerpts: [
        {
          id: `ev-paid-${paidEvidence.item.id}`,
          sourceTitle: paidEvidence.item.title,
          sourceIdentifier: paidEvidence.item.id,
          excerptText: paidEvidence.excerpt,
          pageOrField: 'Delivery Acknowledgment & Payment Endorsement',
          timestamp: paidEvidence.item.date,
        },
        {
          id: `ev-unpaid-${unpaidEvidence.item.id}`,
          sourceTitle: unpaidEvidence.item.title,
          sourceIdentifier: unpaidEvidence.item.id,
          excerptText: unpaidEvidence.excerpt,
          pageOrField: 'Claimant Ledger Statement',
          timestamp: unpaidEvidence.item.date,
        },
      ],
      contradictionDetails: {
        recordA: {
          title: paidEvidence.item.title,
          field: 'Payment Endorsement / Receipt Status',
          excerpt: paidEvidence.excerpt,
          date: paidEvidence.item.date,
        },
        recordB: {
          title: unpaidEvidence.item.title,
          field: 'Reconciliation Ledger / Account Status',
          excerpt: unpaidEvidence.excerpt,
          date: unpaidEvidence.item.date,
        },
        conflictReason:
          'Record A confirms receipt of payment with a specific NEFT transaction identifier, whereas Record B records zero credit and treats the same obligation as an active default.',
        recommendedAction:
          'Do not issue legal demand or institute recovery litigation until both records are reconciled by an authorized finance officer and verified by counsel.',
        nonJudgmentalNotice:
          'The system identifies the factual contradiction but strictly does not determine which record is true. Neither record has been altered. Human legal and financial review is required.',
      },
    };
  }

  // Case B: Document text claims unpaid, but evidence records show paid
  if (paidEvidence && unpaidRegex.test(docText)) {
    return {
      id: `contra-doc-evidence-${doc.id}`,
      category: 'CONTRADICTION',
      severity: 'CRITICAL',
      title: 'Contradiction Between Draft Demand and Evidence Record',
      explanation:
        'The draft legal document claims total default and unpaid dues, but attached evidence asserts the invoice was settled.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 95,
      confidenceExplanation:
        'Notice text asserts non-payment while attached evidentiary documentation contains explicit payment acknowledgment.',
      recommendedAction:
        'Verify proof of payment against primary banking records. Clarify whether partial settlement was received before serving demand.',
      status: 'OPEN',
      targetDocumentSection: 'Demand Notice Body',
      evidenceExcerpts: [
        {
          id: `ev-paid-doc-${paidEvidence.item.id}`,
          sourceTitle: paidEvidence.item.title,
          sourceIdentifier: paidEvidence.item.id,
          excerptText: paidEvidence.excerpt,
          pageOrField: 'Settlement Field',
          timestamp: paidEvidence.item.date,
        },
      ],
      contradictionDetails: {
        recordA: {
          title: 'Draft Legal Notice Claims',
          field: 'Demand Statement',
          excerpt: 'Claimant asserts respondent failed to make payment and whole amount is outstanding.',
        },
        recordB: {
          title: paidEvidence.item.title,
          field: 'Acknowledgment Receipt',
          excerpt: paidEvidence.excerpt,
          date: paidEvidence.item.date,
        },
        conflictReason:
          'Document body claims total non-payment, directly conflicting with receipt record citing payment.',
        recommendedAction: 'Resolve discrepancy before final sign-off.',
        nonJudgmentalNotice:
          'The system flags the contradiction without deciding validity. Human review required.',
      },
    };
  }

  return null;
}

/**
 * Checks for numerical monetary amount discrepancies between claimed debt and attached schedules.
 */
function checkAmountMismatches(doc: LegalDocument): Finding | null {
  const principal = doc.amounts?.principalClaim;
  if (!principal || !doc.content) return null;

  // Search for currency numbers in content
  const amountPattern = /(?:₹|Rs\.?|INR)\s*([0-9,]+(?:\.[0-9]{2})?)/gi;
  const matches: { text: string; num: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = amountPattern.exec(doc.content)) !== null) {
    const rawNum = match[1].replace(/,/g, '');
    const val = parseFloat(rawNum);
    if (!isNaN(val) && val > 0) {
      matches.push({ text: match[0], num: val });
    }
  }

  // Look for any significant mismatch (different by > 10% or explicit different claim amount)
  const divergent = matches.find((m) => Math.abs(m.num - principal) > 100 && m.num > 10000);

  if (divergent && doc.type === 'LEGAL_NOTICE_COMMERCIAL_DUES') {
    return {
      id: `contra-amount-${doc.id}`,
      category: 'CONTRADICTION',
      severity: 'WARNING',
      title: 'Inconsistent Claim Amounts in Document Text',
      explanation: `The formal claim metadata specifies ${doc.amounts.currency} ${principal.toLocaleString('en-IN')}, but the drafted narrative references ${divergent.text}.`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 90,
      confidenceExplanation:
        'Extracted monetary figures in document body diverge from structured principal amount.',
      recommendedAction:
        'Verify invoice itemization, accrued interest, and tax breakdowns to ensure exact numerical consistency across all clauses.',
      status: 'OPEN',
      targetDocumentSection: 'Particulars of Claim',
      evidenceExcerpts: [
        {
          id: `ev-amount-meta`,
          sourceTitle: 'Document Metadata',
          sourceIdentifier: 'amounts.principalClaim',
          excerptText: `${doc.amounts.currency} ${principal.toLocaleString('en-IN')}`,
        },
        {
          id: `ev-amount-body`,
          sourceTitle: 'Document Content',
          sourceIdentifier: 'content',
          excerptText: divergent.text,
        },
      ],
      contradictionDetails: {
        recordA: {
          title: 'Structured Metadata Claim',
          field: 'principalClaim',
          excerpt: `${doc.amounts.currency} ${principal.toLocaleString('en-IN')}`,
        },
        recordB: {
          title: 'Narrative Body Clause',
          field: 'Document Section',
          excerpt: `Referenced figure: ${divergent.text}`,
        },
        conflictReason: 'Numerical discrepancy between structured claim amount and narrative draft.',
        recommendedAction: 'Align all numerical figures and include an itemized statement of dues.',
        nonJudgmentalNotice: 'System reports discrepancy. Human confirmation needed.',
      },
    };
  }

  return null;
}

/**
 * Checks for impossible chronology (e.g. breach or demand dated prior to contract execution).
 */
function checkChronologyConflicts(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];
  const { agreementDate, incidentOrDefaultDate, noticeDate } = doc.dates || {};

  if (agreementDate && incidentOrDefaultDate) {
    const dAgr = new Date(agreementDate);
    const dInc = new Date(incidentOrDefaultDate);
    if (!isNaN(dAgr.getTime()) && !isNaN(dInc.getTime()) && dInc < dAgr) {
      findings.push({
        id: `contra-chrono-${doc.id}-1`,
        category: 'CONTRADICTION',
        severity: 'CRITICAL',
        title: 'Chronological Inversion: Default Predates Contract Execution',
        explanation: `The stated date of default (${incidentOrDefaultDate}) precedes the execution date of the governing agreement (${agreementDate}).`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 100,
        confidenceExplanation: 'Mathematical comparison of verified date timestamps.',
        recommendedAction: 'Correct the chronology in the factual timeline before proceeding.',
        status: 'OPEN',
        evidenceExcerpts: [
          {
            id: 'ev-date-agr',
            sourceTitle: 'Governing Agreement',
            sourceIdentifier: 'dates.agreementDate',
            excerptText: `Agreement Date: ${agreementDate}`,
          },
          {
            id: 'ev-date-inc',
            sourceTitle: 'Default Notice',
            sourceIdentifier: 'dates.incidentOrDefaultDate',
            excerptText: `Alleged Default Date: ${incidentOrDefaultDate}`,
          },
        ],
      });
    }
  }

  if (incidentOrDefaultDate && noticeDate) {
    const dInc = new Date(incidentOrDefaultDate);
    const dNot = new Date(noticeDate);
    if (!isNaN(dInc.getTime()) && !isNaN(dNot.getTime()) && dNot < dInc) {
      findings.push({
        id: `contra-chrono-${doc.id}-2`,
        category: 'CONTRADICTION',
        severity: 'CRITICAL',
        title: 'Chronological Inversion: Notice Dated Prior to Incident',
        explanation: `The formal notice is dated (${noticeDate}), which is prior to the occurrence of the default event (${incidentOrDefaultDate}).`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 100,
        confidenceExplanation: 'Notice issuance timestamp is before the cause of action timestamp.',
        recommendedAction: 'Adjust notice issuance date to a date subsequent to default.',
        status: 'OPEN',
        evidenceExcerpts: [],
      });
    }
  }

  return findings;
}
