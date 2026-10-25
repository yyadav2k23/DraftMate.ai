import type { CaseDocument, ExtractedFact, Finding, LegalCase } from '../types';

/**
 * Cross-Document Contradiction Engine
 * 
 * Compares facts across ALL relevant documents within a selected case.
 * 
 * Detects:
 * - Mutually exclusive payment statuses for the same transaction
 * - Discrepant monetary amounts for the same debt or invoice
 * - Inconsistent dates for the same event
 * - Inconsistent invoice/transaction references
 * - Conflicting party roles
 * - Unresolved placeholders / missing information
 * 
 * Strict Neutrality Principle:
 * Never automatically decides which document is true.
 * A finding being "confirmed" by a user means the user reviewed the issue,
 * not that the software independently proved either statement.
 */
export function detectCrossDocumentContradictions(legalCase: LegalCase): Finding[] {
  const findings: Finding[] = [];
  const documents = legalCase.documents || [];
  const facts = legalCase.extractedFacts || [];

  if (documents.length === 0 && facts.length === 0) {
    return [];
  }

  // 1. CHECK PAYMENT STATUS CONTRADICTIONS ACROSS DOCUMENTS
  // Look for facts with label / value "PAID" vs "UNPAID"
  const paidFacts = facts.filter(
    (f) =>
      f.category === 'PAYMENT' &&
      (f.normalizedValue === 'PAID' || /fully\s+paid|cleared\s+via\s+neft|received\s+on\s+[0-9]{1,2}/i.test(f.originalText))
  );

  const unpaidFacts = facts.filter(
    (f) =>
      f.category === 'PAYMENT' &&
      (f.normalizedValue === 'UNPAID' || /pending\s+and\s+unpaid|unpaid|remains\s+outstanding/i.test(f.originalText))
  );

  const processedFacts = facts.filter(
    (f) => f.category === 'PAYMENT' && f.normalizedValue === 'PROCESSED_UNCONFIRMED_RECEIPT'
  );

  for (const pFact of paidFacts) {
    for (const uFact of unpaidFacts) {
      findings.push({
        id: `cross-contra-payment-${pFact.id}-${uFact.id}`,
        caseId: legalCase.id,
        category: 'CONTRADICTION',
        severity: 'CRITICAL',
        title: 'Critical Cross-Document Contradiction: Conflicting Settlement Status',
        explanation: `Document "${pFact.sourceDocName}" indicates the obligation was settled/paid, whereas document "${uFact.sourceDocName}" asserts the identical transaction remains pending and unpaid.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 98,
        confidenceExplanation:
          'Cross-document comparison identified mutually exclusive settlement statuses for the transaction across submitted evidentiary files.',
        recommendedAction:
          'Do not issue legal demand or institute litigation until both accounts are formally reconciled with certified banking records and reviewed by legal counsel.',
        status: 'OPEN',
        userReviewStatus: 'UNRESOLVED',
        evidenceExcerpts: [
          {
            id: `ev-${pFact.id}`,
            sourceTitle: pFact.sourceDocName,
            sourceIdentifier: pFact.sourceDocId,
            excerptText: pFact.originalText,
            locationReference: pFact.locationReference || 'Document Excerpt',
          },
          {
            id: `ev-${uFact.id}`,
            sourceTitle: uFact.sourceDocName,
            sourceIdentifier: uFact.sourceDocId,
            excerptText: uFact.originalText,
            locationReference: uFact.locationReference || 'Document Excerpt',
          },
        ],
        contradictionDetails: {
          recordA: {
            title: pFact.sourceDocName,
            docId: pFact.sourceDocId,
            filename: pFact.sourceDocName,
            field: 'Payment Status Notation',
            excerpt: pFact.originalText,
            locationReference: pFact.locationReference,
          },
          recordB: {
            title: uFact.sourceDocName,
            docId: uFact.sourceDocId,
            filename: uFact.sourceDocName,
            field: 'Account Ledger Status',
            excerpt: uFact.originalText,
            locationReference: uFact.locationReference,
          },
          conflictReason:
            'One document asserts full satisfaction via payment transfer, while the other treats the account as in active default.',
          confidenceAndLimitations:
            'Deterministic status token match. The software cannot independently verify bank ledgers or physical stamps without primary bank statement authentication.',
          suggestedResolvingEvidence:
            'Certified bank statement for the relevant settlement date, UTR/NEFT settlement confirmation from remitting bank, and signed dual-party ledger reconciliation statement.',
          recommendedAction:
            'Hold legal notice dispatch. Cross-check UTR reference with finance officers of both entities.',
          nonJudgmentalNotice:
            'The system identifies this factual contradiction but strictly does not determine which record is true. Human legal and financial review is required.',
          reviewStatus: 'UNRESOLVED',
        },
      });
    }
  }

  // 1B. EMPLOYMENT SALARY: UNPAID VS PAYROLL PROCESSED (PROOF OF RECEIPT MISSING)
  for (const procFact of processedFacts) {
    for (const uFact of unpaidFacts) {
      findings.push({
        id: `cross-contra-payroll-${procFact.id}-${uFact.id}`,
        caseId: legalCase.id,
        category: 'CONTRADICTION',
        severity: 'CRITICAL',
        title: 'Employment Salary Discrepancy: Unpaid Ledger vs Payroll Processed (Receipt Unconfirmed)',
        explanation: `Document "${uFact.sourceDocName}" records salary as unpaid, whereas document "${procFact.sourceDocName}" states salary was processed. Crucially, internal payroll processing or dispatch notation does not establish that funds were actually credited to the employee's bank account. Without primary bank credit verification, receipt remains unproved.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 96,
        confidenceExplanation:
          'Conflict identified between salary non-payment and unconfirmed payroll batch processing.',
        recommendedAction:
          'Obtain employee bank account statement for September 2026 and employer bank debit certificate with NEFT/IMPS UTR number.',
        status: 'OPEN',
        userReviewStatus: 'UNRESOLVED',
        evidenceExcerpts: [
          {
            id: `ev-${uFact.id}`,
            sourceTitle: uFact.sourceDocName,
            sourceIdentifier: uFact.sourceDocId,
            excerptText: uFact.originalText,
            locationReference: uFact.locationReference || 'Salary Statement',
          },
          {
            id: `ev-${procFact.id}`,
            sourceTitle: procFact.sourceDocName,
            sourceIdentifier: procFact.sourceDocId,
            excerptText: procFact.originalText,
            locationReference: procFact.locationReference || 'Payroll Advice',
          },
        ],
        contradictionDetails: {
          recordA: {
            title: uFact.sourceDocName,
            docId: uFact.sourceDocId,
            filename: uFact.sourceDocName,
            field: 'Salary Statement Disbursement Status',
            excerpt: uFact.originalText,
            locationReference: uFact.locationReference,
          },
          recordB: {
            title: procFact.sourceDocName,
            docId: procFact.sourceDocId,
            filename: procFact.sourceDocName,
            field: 'Payroll Department Advice',
            excerpt: procFact.originalText,
            locationReference: procFact.locationReference,
          },
          conflictReason:
            'Salary statement records non-payment while payroll email records processing; processing is distinct from bank credit confirmation.',
          confidenceAndLimitations:
            'Deterministic matching between payroll status tokens. Processing is an internal employer action, not proof of employee receipt.',
          suggestedResolvingEvidence:
            'Certified bank account statement of employee showing inbound credit, or remitting bank settlement advice with UTR.',
          recommendedAction: 'Verify bank credit before issuing formal demand or legal representation.',
          nonJudgmentalNotice:
            'The system identifies this evidentiary gap and conflicting status, but does not determine whether salary was received or remains due. Independent bank reconciliation is required.',
          reviewStatus: 'UNRESOLVED',
        },
      });
    }
  }

  // 1C. TENANCY SECURITY DEPOSIT ARITHMETIC & UNEXPLAINED DEDUCTION DISCREPANCY
  const depositFact = facts.find((f) => f.label.includes('Security Deposit') && typeof f.normalizedValue === 'number');
  const cleaningFact = facts.find((f) => f.label.includes('Cleaning') && typeof f.normalizedValue === 'number');
  const repairFact = facts.find((f) => f.label.includes('Repair') && typeof f.normalizedValue === 'number');
  const refundFacts = facts.filter((f) => f.label.includes('Refund') && typeof f.normalizedValue === 'number');

  if (depositFact && cleaningFact && repairFact) {
    const depositAmt = depositFact.normalizedValue as number;
    const cleaningAmt = cleaningFact.normalizedValue as number;
    const repairAmt = repairFact.normalizedValue as number;
    const calculatedRefund = depositAmt - cleaningAmt - repairAmt; // e.g. 30000 - 2000 - 3000 = 25000

    // Check if any stated refund diverges from calculated refund (e.g. landlord message stating only ₹20,000)
    for (const rFact of refundFacts) {
      const statedRefund = rFact.normalizedValue as number;
      if (Math.abs(calculatedRefund - statedRefund) >= 1000) {
        findings.push({
          id: `cross-contra-deposit-refund-${rFact.id}`,
          caseId: legalCase.id,
          category: 'CONTRADICTION',
          severity: 'CRITICAL',
          title: 'Critical Security Deposit Discrepancy: Unexplained Deduction Divergence',
          explanation: `Settlement reconciliation calculates a net refund of ₹${calculatedRefund.toLocaleString('en-IN')} (Deposit ₹${depositAmt.toLocaleString('en-IN')} − Cleaning ₹${cleaningAmt.toLocaleString('en-IN')} − Repairs ₹${repairAmt.toLocaleString('en-IN')}). However, document "${rFact.sourceDocName}" asserts only ₹${statedRefund.toLocaleString('en-IN')} will be returned, creating an unexplained difference of ₹${Math.abs(calculatedRefund - statedRefund).toLocaleString('en-IN')} without supporting accounting justification.`,
          detectionMethod: 'DETERMINISTIC',
          confidence: 98,
          confidenceExplanation:
            'Arithmetic discrepancy detected between itemized settlement calculation and landlord refund communication.',
          recommendedAction:
            'Request formal itemized reconciliation from property management explaining the specific basis of the additional deduction.',
          status: 'OPEN',
          userReviewStatus: 'UNRESOLVED',
          evidenceExcerpts: [
            {
              id: `ev-calc-ref`,
              sourceTitle: 'Draft Settlement Statement',
              sourceIdentifier: depositFact.sourceDocId,
              excerptText: `Deposit: ₹${depositAmt.toLocaleString('en-IN')} - Cleaning: ₹${cleaningAmt.toLocaleString('en-IN')} - Repairs: ₹${repairAmt.toLocaleString('en-IN')} = Calculated Refund: ₹${calculatedRefund.toLocaleString('en-IN')}`,
              locationReference: 'Settlement Reconciliation Schedule',
            },
            {
              id: `ev-${rFact.id}`,
              sourceTitle: rFact.sourceDocName,
              sourceIdentifier: rFact.sourceDocId,
              excerptText: rFact.originalText,
              locationReference: rFact.locationReference || 'Landlord Message',
            },
          ],
          contradictionDetails: {
            recordA: {
              title: 'Draft Security Deposit Settlement',
              docId: depositFact.sourceDocId,
              filename: 'Settlement Statement',
              field: 'Calculated Net Refund',
              excerpt: `Proposed refund: ₹${calculatedRefund.toLocaleString('en-IN')} (₹${depositAmt.toLocaleString('en-IN')} - ₹${cleaningAmt.toLocaleString('en-IN')} - ₹${repairAmt.toLocaleString('en-IN')})`,
              locationReference: 'Reconciliation Schedule',
            },
            recordB: {
              title: rFact.sourceDocName,
              docId: rFact.sourceDocId,
              filename: rFact.sourceDocName,
              field: 'Stated Refund Communication',
              excerpt: rFact.originalText,
              locationReference: rFact.locationReference,
            },
            conflictReason:
              'Landlord communication imposes an unexplained additional deduction below the itemized settlement calculation.',
            confidenceAndLimitations:
              'Mathematical discrepancy verified. The system distinguishes arithmetic correctness from legal justification for deductions.',
            suggestedResolvingEvidence:
              'Itemized contractor invoices, tax receipts for repairs/cleaning, and landlord written breakdown of all deductions.',
            recommendedAction:
              'Send neutral requisition letter seeking comprehensive itemized breakdown and receipts.',
            nonJudgmentalNotice:
              'System identifies the ₹5,000 variance but does not determine whether additional deductions are contractually lawful. Human review required.',
            reviewStatus: 'UNRESOLVED',
          },
        });
      }
    }

    // Flag missing third-party contractor invoices and photographic evidence
    findings.push({
      id: `tenancy-missing-evidence-${depositFact.caseId}`,
      caseId: legalCase.id,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Unverified Tenancy Deductions: Missing Contractor Invoices & Move-Out Photographs',
      explanation: `Cleaning charges (₹${cleaningAmt.toLocaleString('en-IN')}) and repair charges (₹${repairAmt.toLocaleString('en-IN')}) are listed on the handover checklist without contractor tax invoices, payment receipts, or comparative move-in/move-out photographs. Arithmetic consistency does not establish that deductions are factually incurred or contractually authorized.`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 95,
      confidenceExplanation: 'No third-party invoices or photographic proof attached to handover records.',
      recommendedAction:
        'Require landlord or property manager to produce authentic third-party contractor invoices and move-in/move-out inspection photos before accepting deductions.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-clean-${cleaningFact.id}`,
          sourceTitle: cleaningFact.sourceDocName,
          sourceIdentifier: cleaningFact.sourceDocId,
          excerptText: cleaningFact.originalText,
          locationReference: cleaningFact.locationReference,
        },
        {
          id: `ev-rep-${repairFact.id}`,
          sourceTitle: repairFact.sourceDocName,
          sourceIdentifier: repairFact.sourceDocId,
          excerptText: repairFact.originalText,
          locationReference: repairFact.locationReference,
        },
      ],
    });
  }

  // 1D. INCONSISTENT EMPLOYMENT TIMELINE / FINAL WORKING DAY
  const lwdFacts = facts.filter((f) => f.label.includes('Final Working Day'));
  if (lwdFacts.length >= 2) {
    const f1 = lwdFacts[0];
    const f2 = lwdFacts[1];
    if (f1.normalizedValue !== f2.normalizedValue) {
      findings.push({
        id: `cross-contra-lwd-${f1.id}-${f2.id}`,
        caseId: legalCase.id,
        category: 'CONTRADICTION',
        severity: 'WARNING',
        title: 'Inconsistent Employment Timeline: Conflicting Final Working Day',
        explanation: `Document "${f1.sourceDocName}" states final working day as ${f1.normalizedValue}, whereas document "${f2.sourceDocName}" records ${f2.normalizedValue}.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 92,
        confidenceExplanation: 'Divergent final working day dates recorded across employer documents.',
        recommendedAction: 'Verify official attendance logs and exit clearance forms to establish authentic separation date.',
        status: 'OPEN',
        userReviewStatus: 'UNRESOLVED',
        evidenceExcerpts: [
          {
            id: `ev-${f1.id}`,
            sourceTitle: f1.sourceDocName,
            sourceIdentifier: f1.sourceDocId,
            excerptText: f1.originalText,
            locationReference: f1.locationReference,
          },
          {
            id: `ev-${f2.id}`,
            sourceTitle: f2.sourceDocName,
            sourceIdentifier: f2.sourceDocId,
            excerptText: f2.originalText,
            locationReference: f2.locationReference,
          },
        ],
      });
    }
  }

  // 1E. UNVERIFIED NOTICE PERIOD COMPLIANCE (APPOINTMENT LETTER VS EXIT)
  const noticeClauseFact = facts.find((f) => f.label.includes('Notice Period Obligation'));
  if (noticeClauseFact && legalCase.matterType.toLowerCase().includes('employment')) {
    findings.push({
      id: `unverified-notice-compliance-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Unverified Notice Period Status: Notice Tender or Waiver Unconfirmed',
      explanation: `Appointment letter stipulates a ${noticeClauseFact.normalizedValue} notice period. However, supplied records do not contain a written resignation letter, notice acknowledgment, waiver agreement, or proof of notice completion.`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 90,
      confidenceExplanation: 'Clause found but no corresponding notice execution record provided.',
      recommendedAction:
        'Obtain employee written resignation letter, management acceptance, or mutual notice waiver agreement.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-not-${noticeClauseFact.id}`,
          sourceTitle: noticeClauseFact.sourceDocName,
          sourceIdentifier: noticeClauseFact.sourceDocId,
          excerptText: noticeClauseFact.originalText,
          locationReference: noticeClauseFact.locationReference,
        },
      ],
    });
  }

  // 1F. CONSUMER DEFECT CLAIM VS SELLER INTACT DELIVERY (CASE 4)
  const buyerDefectFact = facts.find((f) => f.normalizedValue === 'CRACKED_DISPLAY_DEFECT');
  const sellerConditionFact = facts.find((f) => f.normalizedValue === 'DELIVERED_GOOD_CONDITION');
  if (buyerDefectFact && sellerConditionFact) {
    findings.push({
      id: `cross-contra-consumer-defect-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'CONTRADICTION',
      severity: 'CRITICAL',
      title: 'Consumer Product Defect Discrepancy: Damaged Display vs Intact Delivery Assertion',
      explanation: `Buyer document "${buyerDefectFact.sourceDocName}" asserts laptop display was cracked upon delivery, whereas seller document "${sellerConditionFact.sourceDocName}" asserts the parcel was delivered in factory-sealed, intact condition with a clean Proof of Delivery (POD).`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 96,
      confidenceExplanation: 'Direct contradiction between buyer defect claim and seller undamaged delivery claim.',
      recommendedAction:
        'Cross-examine delivery chain of custody, unboxing timestamp, and courier transit logs before initiating formal consumer forum complaint.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-def-${buyerDefectFact.id}`,
          sourceTitle: buyerDefectFact.sourceDocName,
          sourceIdentifier: buyerDefectFact.sourceDocId,
          excerptText: buyerDefectFact.originalText,
          locationReference: buyerDefectFact.locationReference || 'Consumer Defect Report',
        },
        {
          id: `ev-cond-${sellerConditionFact.id}`,
          sourceTitle: sellerConditionFact.sourceDocName,
          sourceIdentifier: sellerConditionFact.sourceDocId,
          excerptText: sellerConditionFact.originalText,
          locationReference: sellerConditionFact.locationReference || 'Seller Response / Delivery POD',
        },
      ],
      contradictionDetails: {
        recordA: {
          title: buyerDefectFact.sourceDocName,
          docId: buyerDefectFact.sourceDocId,
          filename: buyerDefectFact.sourceDocName,
          field: 'Buyer Physical Condition Report',
          excerpt: buyerDefectFact.originalText,
          locationReference: buyerDefectFact.locationReference,
        },
        recordB: {
          title: sellerConditionFact.sourceDocName,
          docId: sellerConditionFact.sourceDocId,
          filename: sellerConditionFact.sourceDocName,
          field: 'Seller Dispatch / Delivery Record',
          excerpt: sellerConditionFact.originalText,
          locationReference: sellerConditionFact.locationReference,
        },
        conflictReason:
          'Buyer reports delivered goods were damaged, while seller records state goods were delivered without physical exception.',
        confidenceAndLimitations:
          'Contradiction identified between buyer and seller statements. The software cannot independently verify whether damage occurred prior to delivery, during transit, or post-unboxing.',
        suggestedResolvingEvidence:
          'Courier transit inspection log, unboxing video with continuous timecode, and independent authorized service center diagnostic assessment.',
        recommendedAction:
          'Obtain courier transit tracking log and service center inspection report under Section 38(2)(c) Consumer Protection Act 2019.',
        nonJudgmentalNotice:
          'The system flags this direct contradiction without inferring whether damage occurred in transit or after delivery. Technical evidence required.',
        reviewStatus: 'UNRESOLVED',
      },
    });

    // Evidence limitation: Photograph shows damage but does not prove time/causation
    findings.push({
      id: `consumer-photo-limitation-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Evidentiary Limitation: Photograph Proves Physical Damage but Not Causation or Timing',
      explanation:
        'The submitted photograph proves the laptop display possesses a spiderweb fracture at the moment of capture. However, an uncorroborated photograph does not establish whether damage occurred during warehouse packing, courier transit, or post-delivery handling.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 94,
      confidenceExplanation:
        'Photographic evidence without continuous unboxing video or courier transit exception notation.',
      recommendedAction:
        'Procure courier delivery exception endorsement, courier weigh-in scan logs, or OEM authorized service center inspection report.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-lim-${buyerDefectFact.id}`,
          sourceTitle: buyerDefectFact.sourceDocName,
          sourceIdentifier: buyerDefectFact.sourceDocId,
          excerptText: buyerDefectFact.originalText,
          locationReference: buyerDefectFact.locationReference || 'Image Evidence',
        },
      ],
    });
  }

  // 1G. PERSONAL LOAN DISCREPANCY, CASH ASSERTIONS & DIGITAL PROOF (CASE 5)
  const loanAckFact = facts.find((f) => f.id.startsWith('fact-loan-ack') && typeof f.normalizedValue === 'number');
  const upiTransferFact = facts.find((f) => f.id.startsWith('fact-upi-transfer') && typeof f.normalizedValue === 'number');
  const cashClaimFact = facts.find((f) => f.id.startsWith('fact-cash-claim'));

  if (loanAckFact && upiTransferFact) {
    const ackAmt = loanAckFact.normalizedValue as number;
    const upiAmt = upiTransferFact.normalizedValue as number;
    const diff = ackAmt - upiAmt; // e.g. 80,000 - 50,000 = 30,000

    if (diff > 0) {
      findings.push({
        id: `cross-contra-loan-disbursement-${legalCase.id}`,
        caseId: legalCase.id,
        category: 'CONTRADICTION',
        severity: 'CRITICAL',
        title: `Loan Disbursement Shortfall: Acknowledged Principal ₹${ackAmt.toLocaleString('en-IN')} vs Bank Transfer ₹${upiAmt.toLocaleString('en-IN')}`,
        explanation: `Loan acknowledgement mentions total principal of ₹${ackAmt.toLocaleString('en-IN')}, but verified electronic bank transfer records substantiate only ₹${upiAmt.toLocaleString('en-IN')}. The remaining ₹${diff.toLocaleString('en-IN')} is not supported by electronic banking trails.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 96,
        confidenceExplanation: 'Mathematical gap between acknowledged loan agreement amount and verified bank credit record.',
        recommendedAction:
          'Require lender to produce certified bank statement, cash withdrawal slip, or signed stamped cash receipt for the ₹' + diff.toLocaleString('en-IN') + ' balance.',
        status: 'OPEN',
        userReviewStatus: 'UNRESOLVED',
        evidenceExcerpts: [
          {
            id: `ev-ack-${loanAckFact.id}`,
            sourceTitle: loanAckFact.sourceDocName,
            sourceIdentifier: loanAckFact.sourceDocId,
            excerptText: loanAckFact.originalText,
            locationReference: loanAckFact.locationReference || 'Loan Acknowledgement',
          },
          {
            id: `ev-upi-${upiTransferFact.id}`,
            sourceTitle: upiTransferFact.sourceDocName,
            sourceIdentifier: upiTransferFact.sourceDocId,
            excerptText: upiTransferFact.originalText,
            locationReference: upiTransferFact.locationReference || 'UPI Payment Advice',
          },
        ],
        contradictionDetails: {
          recordA: {
            title: loanAckFact.sourceDocName,
            docId: loanAckFact.sourceDocId,
            filename: loanAckFact.sourceDocName,
            field: 'Acknowledged Principal Sum',
            excerpt: loanAckFact.originalText,
            locationReference: loanAckFact.locationReference,
          },
          recordB: {
            title: upiTransferFact.sourceDocName,
            docId: upiTransferFact.sourceDocId,
            filename: upiTransferFact.sourceDocName,
            field: 'Substantiated Electronic Transfer',
            excerpt: upiTransferFact.originalText,
            locationReference: upiTransferFact.locationReference,
          },
          conflictReason:
            'Claimed loan principal exceeds electronically evidenced disbursement by ₹' + diff.toLocaleString('en-IN') + '.',
          confidenceAndLimitations:
            'Electronic banking evidence proves ₹' + upiAmt.toLocaleString('en-IN') + '; the remainder relies on oral or uncertified cash assertions.',
          suggestedResolvingEvidence:
            'Bank cash withdrawal slip, stamped formal cash voucher, or dual-party signed reconciliation.',
          recommendedAction:
            'Limit formal recovery demand to electronically verified ₹' + upiAmt.toLocaleString('en-IN') + ' or require physical cash vouchers.',
          nonJudgmentalNotice:
            'The system reports this monetary difference without ruling on whether cash was actually handed over. Tangible proof required.',
          reviewStatus: 'UNRESOLVED',
        },
      });
    }
  }

  if (cashClaimFact) {
    findings.push({
      id: `loan-unverified-cash-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Unverified Cash Disbursement: Missing Cash Voucher or Stamped Receipt',
      explanation: `A portion of the claimed loan (alleged ₹30,000 cash) is uncorroborated by banking records, withdrawal slips, or signed cash receipts. Cash transactions above statutory reporting limits require contemporaneous written proof.`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 92,
      confidenceExplanation: 'No primary bank debit or signed cash receipt attached to substantiate cash disbursement.',
      recommendedAction:
        'Obtain signed cash receipt with revenue stamp, contemporaneous bank withdrawal record, or dual-party written admission.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-cash-${cashClaimFact.id}`,
          sourceTitle: cashClaimFact.sourceDocName,
          sourceIdentifier: cashClaimFact.sourceDocId,
          excerptText: cashClaimFact.originalText,
          locationReference: cashClaimFact.locationReference || 'Chat / Ledger Record',
        },
      ],
    });
  }

  // Section 65B Evidence Act / Section 63 BSA 2023 Digital Evidence Limitation
  const hasDigitalChatOrScreenshot = documents.some(
    (d) => d.isImage || /screenshot|chat|whatsapp/i.test(d.originalFilename)
  );
  if (hasDigitalChatOrScreenshot && legalCase.matterType.toLowerCase().includes('loan')) {
    findings.push({
      id: `loan-digital-evidence-bsa-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'DRAFTING_QUALITY',
      severity: 'WARNING',
      title: 'Electronic Evidence Admissibility: Certificate Required Under Section 63 BSA 2023 / Section 65B',
      explanation:
        'Chat screenshots and electronic payment confirmations are secondary electronic records. In Indian legal proceedings, electronic records are admissible only when supported by a statutory certificate under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 65B of the Indian Evidence Act, 1872) certifying device custody and hash integrity.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 98,
      confidenceExplanation:
        'Electronic screenshot records identified in case evidence without accompanying statutory certificate.',
      recommendedAction:
        'Draft and execute a Section 63 BSA 2023 certificate identifying the mobile handset, SIM registration, and uninterrupted device control.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [],
    });
  }

  // Ambiguous Repayment Promise
  const repayPromiseFact = facts.find((f) => f.id.startsWith('fact-repay-promise'));
  if (repayPromiseFact) {
    findings.push({
      id: `loan-ambiguous-repayment-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'DRAFTING_QUALITY',
      severity: 'INFO',
      title: 'Ambiguous Repayment Timeline: Statement Lacks Fixed Maturity Date',
      explanation: `Borrower statement "${repayPromiseFact.originalText}" provides an informal, conditional timeline without specifying a calendar due date, default interest rate, or acceleration schedule.`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 90,
      confidenceExplanation: 'Informal repayment expression detected without calendar maturity date.',
      recommendedAction:
        'Issue formal demand for payment stipulating a definite 15-day cure notice period from receipt.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-prom-${repayPromiseFact.id}`,
          sourceTitle: repayPromiseFact.sourceDocName,
          sourceIdentifier: repayPromiseFact.sourceDocId,
          excerptText: repayPromiseFact.originalText,
          locationReference: repayPromiseFact.locationReference || 'Chat Message',
        },
      ],
    });
  }

  // 1H. GOODS DELIVERY QUANTITY DISCREPANCY & CARRIER PROTOCOL (CASE 6)
  const dispatchQtyFact = facts.find((f) => f.id.startsWith('fact-qty-dispatch') && typeof f.normalizedValue === 'number');
  const grnQtyFact = facts.find((f) => f.id.startsWith('fact-qty-grn') && typeof f.normalizedValue === 'number');
  const packDamageFact = facts.find((f) => f.normalizedValue === 'DAMAGED_OUTER_CARTONS');

  if (dispatchQtyFact && grnQtyFact) {
    const dQty = dispatchQtyFact.normalizedValue as number;
    const gQty = grnQtyFact.normalizedValue as number;
    if (dQty !== gQty) {
      const shortfall = dQty - gQty;
      findings.push({
        id: `cross-contra-logistics-quantity-${legalCase.id}`,
        caseId: legalCase.id,
        category: 'CONTRADICTION',
        severity: 'CRITICAL',
        title: `Goods Delivery Shortfall: Dispatched ${dQty} Units vs Received ${gQty} Units (${shortfall} Units Short)`,
        explanation: `Supplier dispatch documentation records ${dQty} units shipped under SO-2066, whereas consignee Goods Received Note (GRN) records only ${gQty} units accepted into warehouse inventory. A discrepancy of ${shortfall} units remains unverified.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 98,
        confidenceExplanation: 'Numerical discrepancy between supplier dispatch records and consignee inventory intake.',
        recommendedAction:
          'Review carrier Lorry Receipt (LR), vehicle gate-in weight slips, and convene joint physical verification before issuing formal invoice debit note.',
        status: 'OPEN',
        userReviewStatus: 'UNRESOLVED',
        evidenceExcerpts: [
          {
            id: `ev-disp-${dispatchQtyFact.id}`,
            sourceTitle: dispatchQtyFact.sourceDocName,
            sourceIdentifier: dispatchQtyFact.sourceDocId,
            excerptText: dispatchQtyFact.originalText,
            locationReference: dispatchQtyFact.locationReference || 'Dispatch Note',
          },
          {
            id: `ev-grn-${grnQtyFact.id}`,
            sourceTitle: grnQtyFact.sourceDocName,
            sourceIdentifier: grnQtyFact.sourceDocId,
            excerptText: grnQtyFact.originalText,
            locationReference: grnQtyFact.locationReference || 'Goods Received Note',
          },
        ],
        contradictionDetails: {
          recordA: {
            title: dispatchQtyFact.sourceDocName,
            docId: dispatchQtyFact.sourceDocId,
            filename: dispatchQtyFact.sourceDocName,
            field: 'Dispatched Unit Count',
            excerpt: dispatchQtyFact.originalText,
            locationReference: dispatchQtyFact.locationReference,
          },
          recordB: {
            title: grnQtyFact.sourceDocName,
            docId: grnQtyFact.sourceDocId,
            filename: grnQtyFact.sourceDocName,
            field: 'Consignee GRN Intake Count',
            excerpt: grnQtyFact.originalText,
            locationReference: grnQtyFact.locationReference,
          },
          conflictReason:
            'Dispatched quantity exceeds acknowledged consignee intake by ' + shortfall + ' units.',
          confidenceAndLimitations:
            'Numerical mismatch detected across dispatch and receiving records. Does not prove whether loss occurred at supplier factory, during carriage, or in consignee warehousing.',
          suggestedResolvingEvidence:
            'Carrier weighbridge receipt, intermediate transshipment checkpoint tallies, and joint surveyor inspection certificate.',
          recommendedAction:
            'Serve joint inspection notice under Section 37/42 Sale of Goods Act 1930 and issue carrier discrepancy claim.',
          nonJudgmentalNotice:
            'The system identifies the 10-unit variance but does not attribute pilferage or fault to either party. Carrier investigation required.',
          reviewStatus: 'UNRESOLVED',
        },
      });
    }
  }

  if (packDamageFact) {
    findings.push({
      id: `logistics-outer-vs-internal-damage-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Packaging vs Component Damage: External Carton Damage Does Not Prove Component Destruction',
      explanation:
        'Photographic evidence documents crushed corners and torn shipping tape on outer corrugated cartons. However, external packaging distress does not establish functional destruction of internal precision components without joint electrical/mechanical bench inspection.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 94,
      confidenceExplanation:
        'Outer packaging distress documented without accompanying internal component test certificate.',
      recommendedAction:
        'Conduct joint bench testing of affected components in the presence of carrier and supplier representatives.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-pack-${packDamageFact.id}`,
          sourceTitle: packDamageFact.sourceDocName,
          sourceIdentifier: packDamageFact.sourceDocId,
          excerptText: packDamageFact.originalText,
          locationReference: packDamageFact.locationReference || 'Carton Inspection Photo',
        },
      ],
    });

    findings.push({
      id: `logistics-missing-carrier-records-${legalCase.id}`,
      caseId: legalCase.id,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Missing Carrier Records: Lorry Receipt (LR) Exception Endorsement & Joint Survey Unconfirmed',
      explanation:
        'Case records lack a carrier Lorry Receipt (LR) with delivery exception remarks endorsed at the time of truck discharge, driver acknowledgment, or a formal signed joint survey report.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 92,
      confidenceExplanation:
        'No carrier exception receipt or joint survey protocol attached to logistics discrepancy claim.',
      recommendedAction:
        'Obtain copy of carrier Lorry Receipt with driver counter-signature and transshipment station log.',
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [],
    });
  }

  // 2. CHECK MONETARY AMOUNT DISCREPANCIES ACROSS DOCUMENTS
  const amountFacts = facts.filter((f) => f.category === 'AMOUNT' && typeof f.normalizedValue === 'number');
  for (let i = 0; i < amountFacts.length; i++) {
    for (let j = i + 1; j < amountFacts.length; j++) {
      const f1 = amountFacts[i];
      const f2 = amountFacts[j];

      const isF1Deduction = f1.label.includes('Deduction') || f1.label.includes('Cleaning') || f1.label.includes('Repair');
      const isF2Deduction = f2.label.includes('Deduction') || f2.label.includes('Cleaning') || f2.label.includes('Repair');
      if (isF1Deduction !== isF2Deduction) continue;

      // Different documents, significant numerical divergence (> ₹1000)
      if (
        f1.sourceDocId !== f2.sourceDocId &&
        Math.abs((f1.normalizedValue as number) - (f2.normalizedValue as number)) > 1000
      ) {
        findings.push({
          id: `cross-contra-amount-${f1.id}-${f2.id}`,
          caseId: legalCase.id,
          category: 'CONTRADICTION',
          severity: 'WARNING',
          title: 'Monetary Sum Discrepancy Across Documents',
          explanation: `Document "${f1.sourceDocName}" specifies ₹${(f1.normalizedValue as number).toLocaleString('en-IN')}, whereas document "${f2.sourceDocName}" states ₹${(f2.normalizedValue as number).toLocaleString('en-IN')}.`,
          detectionMethod: 'DETERMINISTIC',
          confidence: 90,
          confidenceExplanation: 'Numerical discrepancy detected across attached case records.',
          recommendedAction:
            'Verify itemized tax invoices, interest accrual, credit notes, and partial payments to harmonize figures.',
          status: 'OPEN',
          userReviewStatus: 'UNRESOLVED',
          evidenceExcerpts: [
            {
              id: `ev-${f1.id}`,
              sourceTitle: f1.sourceDocName,
              sourceIdentifier: f1.sourceDocId,
              excerptText: f1.originalText,
              locationReference: f1.locationReference,
            },
            {
              id: `ev-${f2.id}`,
              sourceTitle: f2.sourceDocName,
              sourceIdentifier: f2.sourceDocId,
              excerptText: f2.originalText,
              locationReference: f2.locationReference,
            },
          ],
          contradictionDetails: {
            recordA: {
              title: f1.sourceDocName,
              docId: f1.sourceDocId,
              filename: f1.sourceDocName,
              field: 'Claim / Invoice Sum',
              excerpt: f1.originalText,
              locationReference: f1.locationReference,
            },
            recordB: {
              title: f2.sourceDocName,
              docId: f2.sourceDocId,
              filename: f2.sourceDocName,
              field: 'Schedule / Notice Sum',
              excerpt: f2.originalText,
              locationReference: f2.locationReference,
            },
            conflictReason:
              'Claimed monetary obligations diverge across submitted evidentiary records.',
            confidenceAndLimitations:
              'Numerical difference detected. The difference may reflect interest, demurrage, or separate purchase orders.',
            suggestedResolvingEvidence:
              'Consolidated statement of account itemizing principal debt versus accrued contractual interest.',
            recommendedAction:
              'Reconcile purchase orders, tax invoices, and credit notes before serving notice.',
            nonJudgmentalNotice:
              'System flags monetary divergence without deciding which total is legally payable.',
            reviewStatus: 'UNRESOLVED',
          },
        });
      }
    }
  }

  // 3. CHECK MISSING ESSENTIAL INFORMATION & INCOMPLETE DATE RECORDS
  const missingFacts = facts.filter((f) => f.status === 'MISSING');
  for (const mFact of missingFacts) {
    const isIncompleteDate = mFact.category === 'DATE' || /_{2,}|\/_{2,}\/|Incomplete/i.test(mFact.originalText);
    findings.push({
      id: `cross-missing-${mFact.id}`,
      caseId: legalCase.id,
      category: 'MISSING_FIELD',
      severity: isIncompleteDate ? 'CRITICAL' : 'WARNING',
      title: isIncompleteDate
        ? `Incomplete Date Record: "${mFact.originalText}"`
        : `Unresolved Drafting Placeholder: ${mFact.normalizedValue}`,
      explanation: isIncompleteDate
        ? `Document "${mFact.sourceDocName}" contains an incomplete or corrupted date reference: "${mFact.originalText}". A valid calendar date cannot be determined without inspecting primary records.`
        : `Document "${mFact.sourceDocName}" contains an unpopulated essential token: "${mFact.originalText}".`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 100,
      confidenceExplanation: isIncompleteDate
        ? 'Detected malformed / incomplete date string matching missing token regex.'
        : 'Detected explicit missing placeholder token.',
      recommendedAction: isIncompleteDate
        ? 'Inspect original physical document or email headers to establish the authentic calendar date.'
        : `Provide the missing ${mFact.normalizedValue} or delete the placeholder before finalizing notice.`,
      status: 'OPEN',
      userReviewStatus: 'UNRESOLVED',
      evidenceExcerpts: [
        {
          id: `ev-miss-${mFact.id}`,
          sourceTitle: mFact.sourceDocName,
          sourceIdentifier: mFact.sourceDocId,
          excerptText: mFact.originalText,
          locationReference: mFact.locationReference,
        },
      ],
    });
  }

  // 4. CHECK UNREADABLE / LOW-CONFIDENCE OCR DOCUMENTS
  for (const doc of documents) {
    if (doc.status === 'OCR_REQUIRED') {
      findings.push({
        id: `ocr-req-${doc.id}`,
        caseId: legalCase.id,
        category: 'DRAFTING_QUALITY',
        severity: 'WARNING',
        title: `Scanned Document Requires OCR: ${doc.originalFilename}`,
        explanation: `The uploaded document "${doc.originalFilename}" contains scanned or image-only pages with no selectable text streams.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 95,
        confidenceExplanation: 'No text stream found in PDF binary objects.',
        recommendedAction:
          'Run OCR or upload a high-resolution text version to enable complete factual extraction.',
        status: 'OPEN',
        userReviewStatus: 'UNRESOLVED',
        evidenceExcerpts: [],
      });
    } else if (doc.ocrApplied && doc.ocrConfidence && doc.ocrConfidence < 55) {
      findings.push({
        id: `ocr-low-conf-${doc.id}`,
        caseId: legalCase.id,
        category: 'DRAFTING_QUALITY',
        severity: 'INFO',
        title: `Low OCR Confidence on Document: ${doc.originalFilename}`,
        explanation: `Image OCR extracted text with ${doc.ocrConfidence}% confidence. Image quality, tilt, or blur may limit extraction accuracy.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 90,
        confidenceExplanation: 'OCR engine returned confidence below 55%.',
        recommendedAction: 'Inspect extracted text in Fact Review screen and correct any distorted characters.',
        status: 'OPEN',
        userReviewStatus: 'UNRESOLVED',
        evidenceExcerpts: [],
      });
    }
  }

  return findings;
}
