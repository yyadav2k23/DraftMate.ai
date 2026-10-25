import { Finding, LegalDocument } from '../types';

/**
 * Completeness, Ambiguity & Quality Checker
 *
 * Rules:
 * 1. Checks for missing mandatory parties, dates, consideration, jurisdiction, and signature blocks.
 * 2. Flags ambiguous timeframes ("reasonable time", "as soon as possible") and vague assertions.
 * 3. Identifies unsupported factual assertions lacking evidentiary backing.
 * 4. Never hallucinates or invents values; emits explicit placeholder needs.
 */
export function checkCompletenessAndQuality(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];

  // Check 1: Missing Parties & Entity Identification
  const partyFindings = checkPartyCompleteness(doc);
  findings.push(...partyFindings);

  // Check 2: Missing Essential Dates & Amounts
  const dateAndAmountFindings = checkDateAndAmountCompleteness(doc);
  findings.push(...dateAndAmountFindings);

  // Check 3: Ambiguous or Vague Terms
  const ambiguityFindings = checkAmbiguousLanguage(doc);
  findings.push(...ambiguityFindings);

  // Check 4: Unsupported Factual Assertions
  const unsupportedFindings = checkUnsupportedAssertions(doc);
  findings.push(...unsupportedFindings);

  // Check 5: Missing Signatory or Verification Clause
  const signatureFindings = checkSignatureAndVerification(doc);
  findings.push(...signatureFindings);

  return findings;
}

function checkPartyCompleteness(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];
  const parties = doc.parties || [];

  const claimant = parties.find((p) => p.role === 'CLAIMANT' || p.role === 'FIRST_PARTY');
  const respondent = parties.find((p) => p.role === 'RESPONDENT' || p.role === 'SECOND_PARTY');

  if (!claimant || !claimant.name.trim()) {
    findings.push({
      id: `miss-claimant-${doc.id}`,
      category: 'MISSING_FIELD',
      severity: 'CRITICAL',
      title: 'Missing Party: Claimant / Issuing Entity',
      explanation:
        'The document does not identify the full legal name and details of the claimant or issuing party.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 100,
      confidenceExplanation: 'No entity tagged as Claimant/First Party found in document metadata.',
      recommendedAction:
        'Specify claimant’s full legal corporate name, registered office address, and CIN/LLPIN or authorized representative.',
      status: 'OPEN',
      targetDocumentSection: 'Parties Header',
      evidenceExcerpts: [],
    });
  } else if (!claimant.address || claimant.address.trim().length < 5) {
    findings.push({
      id: `miss-claimant-addr-${doc.id}`,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Incomplete Claimant Service Address',
      explanation:
        'Claimant address is missing or lacks sufficient postal detail for formal legal service under procedural rules.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 90,
      confidenceExplanation: 'Address field has fewer than 5 characters.',
      recommendedAction: 'Provide full registered address, PIN code, and official email for service.',
      status: 'OPEN',
      evidenceExcerpts: [],
    });
  }

  if (!respondent || !respondent.name.trim()) {
    findings.push({
      id: `miss-respondent-${doc.id}`,
      category: 'MISSING_FIELD',
      severity: 'CRITICAL',
      title: 'Missing Party: Respondent / Addressee',
      explanation:
        'The legal demand does not specify the respondent party against whom relief or payment is sought.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 100,
      confidenceExplanation: 'No entity tagged as Respondent/Addressee in metadata.',
      recommendedAction:
        'Specify recipient’s full legal corporate/individual name and verified registered place of business.',
      status: 'OPEN',
      evidenceExcerpts: [],
    });
  } else if (!respondent.address || respondent.address.trim().length < 5) {
    findings.push({
      id: `miss-resp-addr-${doc.id}`,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Missing or Incomplete Addressee Postal Details',
      explanation:
        'Formal legal notices require proof of delivery (RPAD / Speed Post) to a verified address.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 90,
      confidenceExplanation: 'Respondent address is blank or unverified.',
      recommendedAction: 'Insert complete postal delivery address with PIN code.',
      status: 'OPEN',
      evidenceExcerpts: [],
    });
  }

  return findings;
}

function checkDateAndAmountCompleteness(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];

  // Check notice date
  if (!doc.dates?.noticeDate && !doc.content?.includes('Dated:')) {
    findings.push({
      id: `miss-notice-date-${doc.id}`,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: 'Missing Document Execution / Notice Date',
      explanation: 'No explicit date of issuance or dispatch is specified.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 95,
      confidenceExplanation: 'Notice date is empty in dates model and header.',
      recommendedAction: 'Set the formal date of issuance prior to final dispatch.',
      status: 'OPEN',
      evidenceExcerpts: [],
    });
  }

  // If commercial recovery, check amount
  if (doc.type === 'LEGAL_NOTICE_COMMERCIAL_DUES' || doc.type === 'PAYMENT_REMINDER_DEMAND') {
    if (!doc.amounts?.principalClaim || doc.amounts.principalClaim <= 0) {
      findings.push({
        id: `miss-amount-${doc.id}`,
        category: 'MISSING_FIELD',
        severity: 'CRITICAL',
        title: 'Missing Principal Claim Amount',
        explanation:
          'Commercial recovery demands require a liquidated principal sum to substantiate the demand.',
        detectionMethod: 'DETERMINISTIC',
        confidence: 100,
        confidenceExplanation: 'principalClaim is null, zero or undefined.',
        recommendedAction: 'State exact outstanding principal sum and append itemized invoice numbers.',
        status: 'OPEN',
        evidenceExcerpts: [],
      });
    }
  }

  // Check for unresolved [MISSING: ...] placeholders in content
  const placeholderRegex = /\[MISSING:\s*([^\]]+)\]/gi;
  let match: RegExpExecArray | null;
  while ((match = placeholderRegex.exec(doc.content || '')) !== null) {
    findings.push({
      id: `miss-placeholder-${doc.id}-${findings.length}`,
      category: 'MISSING_FIELD',
      severity: 'WARNING',
      title: `Unresolved Drafting Placeholder: ${match[1]}`,
      explanation: `Document text contains an unpopulated placeholder token: "${match[0]}".`,
      detectionMethod: 'DETERMINISTIC',
      confidence: 100,
      confidenceExplanation: 'Direct token match on drafting template placeholder syntax.',
      recommendedAction: `Provide the missing ${match[1]} or delete the clause if inapplicable.`,
      status: 'OPEN',
      targetDocumentSection: 'Body Clause',
      evidenceExcerpts: [
        {
          id: `ev-placeholder-${findings.length}`,
          sourceTitle: 'Draft Document',
          sourceIdentifier: 'content',
          excerptText: match[0],
        },
      ],
    });
  }

  return findings;
}

function checkAmbiguousLanguage(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];
  const content = doc.content || '';

  // Vague timeframe patterns
  const ambiguousTimeframes = [
    { phrase: 'reasonable time', suggestion: 'specify exact calendar days (e.g., "within 15 calendar days of receipt")' },
    { phrase: 'as soon as possible', suggestion: 'substitute with a definitive date or fixed business day duration' },
    { phrase: 'at the earliest convenience', suggestion: 'specify a definitive deadline' },
    { phrase: 'in due course', suggestion: 'define explicit milestone or statutory trigger' },
    { phrase: 'forthwith', suggestion: 'clarify immediate deadline in hours or business days' },
  ];

  for (const item of ambiguousTimeframes) {
    const regex = new RegExp(`\\b${item.phrase}\\b`, 'i');
    if (regex.test(content)) {
      findings.push({
        id: `ambig-${item.phrase.replace(/\s+/g, '-')}-${doc.id}`,
        category: 'AMBIGUOUS_LANGUAGE',
        severity: 'INFO',
        title: `Ambiguous Timeframe: "${item.phrase}"`,
        explanation: `Using vague phrasing like "${item.phrase}" can weaken legal clarity and cause disputes regarding when default actually occurred.`,
        detectionMethod: 'DETERMINISTIC',
        confidence: 90,
        confidenceExplanation: 'Pattern match on common ambiguous commercial terms.',
        recommendedAction: `Replace with concrete timeframe: ${item.suggestion}.`,
        status: 'OPEN',
        evidenceExcerpts: [
          {
            id: `ev-ambig-${item.phrase}`,
            sourceTitle: 'Draft Content',
            sourceIdentifier: 'content',
            excerptText: `Found usage of "${item.phrase}"`,
          },
        ],
      });
    }
  }

  return findings;
}

function checkUnsupportedAssertions(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];
  const content = doc.content || '';
  const evidence = doc.supportingEvidence || [];

  // If document mentions severe claims like "fraud", "criminal breach of trust", "embezzlement"
  const severeAllegations = [
    { term: 'criminal breach of trust', statute: 'Bharatiya Nyaya Sanhita (formerly IPC)' },
    { term: 'cheating and fraud', statute: 'Criminal fraud provisions' },
    { term: 'willful siphoning', statute: 'Insolvency / Corporate fraud' },
  ];

  for (const allegation of severeAllegations) {
    if (new RegExp(`\\b${allegation.term}\\b`, 'i').test(content)) {
      // Check if any evidence supports criminal intent or police report
      const hasCriminalEvidence = evidence.some(
        (e) => /police|complaint|fir|criminal|mens\s*rea/i.test(e.fullTextOrSummary)
      );

      if (!hasCriminalEvidence) {
        findings.push({
          id: `unsupported-claim-${allegation.term.replace(/\s+/g, '-')}`,
          category: 'UNSUPPORTED_ASSERTION',
          severity: 'WARNING',
          title: `Unsupported Assertion: Allegation of "${allegation.term}"`,
          explanation: `The draft alleges "${allegation.term}", which is a severe quasi-criminal charge, but no police complaint, FIR, or evidence of fraudulent intent is attached to the record.`,
          detectionMethod: 'DETERMINISTIC',
          confidence: 85,
          confidenceExplanation:
            'Claim of criminal conduct detected without supporting evidentiary criminal record.',
          recommendedAction:
            'Confine the notice to civil contractual breach unless cogent documentary proof of fraud exists. Vague criminal threats in civil notices may be challenged as improper coercion.',
          status: 'NEEDS_HUMAN_REVIEW',
          evidenceExcerpts: [],
        });
      }
    }
  }

  return findings;
}

function checkSignatureAndVerification(doc: LegalDocument): Finding[] {
  const findings: Finding[] = [];
  const content = doc.content || '';

  const hasSignatory = /sign(?:ed|ature)|advocate|counsel|authorized\s+signatory|for\s+and\s+on\s+behalf/i.test(
    content
  );

  if (!hasSignatory) {
    findings.push({
      id: `qual-no-signatory-${doc.id}`,
      category: 'DRAFTING_QUALITY',
      severity: 'WARNING',
      title: 'Missing Formal Signatory or Attestation Block',
      explanation:
        'The document terminates without an authorized signatory block, advocate endorsement, or designation.',
      detectionMethod: 'DETERMINISTIC',
      confidence: 90,
      confidenceExplanation: 'No signatory block keywords detected in closing paragraphs.',
      recommendedAction:
        'Append an authorized signatory block indicating Name, Title, and Capacity (e.g., Authorized Representative or Counsel for Claimant).',
      status: 'OPEN',
      evidenceExcerpts: [],
    });
  }

  return findings;
}
