import { describe, expect, it, beforeEach } from 'vitest';
import { auditLegalCitations } from '../engine/citationVerifier';
import { checkCompletenessAndQuality } from '../engine/completenessChecker';
import { detectContradictions } from '../engine/contradictionDetector';
import { calculateHealthScore } from '../engine/healthScore';
import { runDocumentAudit } from '../engine/index';
import { extractCaseFacts, extractStructuredFactsFromDocument } from '../engine/factExtractor';
import { detectCrossDocumentContradictions } from '../engine/crossDocumentContradiction';
import { validateFileSignature, sanitizeDocumentText } from '../services/documentParser';
import { AIProviderService } from '../services/aiProvider';
import { ASTER_NORTHSTAR_DEMO_CASE } from '../services/demoCase';
import { StorageService } from '../services/storage';
import { CaseDocument, LegalCase, LegalDocument } from '../types';
import {
  SourceRegistryService,
  LegislativeDeptConstitutionAdapter,
  IndiaCodeAdapter,
  SupremeCourtJudgmentsAdapter,
} from '../services/sourceAdapters';

describe('DraftMate.ai Verification Engine & Legal Safeguards', () => {
  it('1. Paid receipt versus unpaid ledger triggers a critical contradiction in Aster vs Northstar demo fixture', () => {
    const findings = detectContradictions(ASTER_NORTHSTAR_DEMO_CASE);
    const criticalPaymentContradiction = findings.find(
      (f) => f.category === 'CONTRADICTION' && f.severity === 'CRITICAL'
    );

    expect(criticalPaymentContradiction).toBeDefined();
    expect(criticalPaymentContradiction?.contradictionDetails).toBeDefined();
    expect(criticalPaymentContradiction?.contradictionDetails?.recordA.excerpt).toContain(
      'fully paid on 25 August 2026 via NEFT reference N239842'
    );
    expect(criticalPaymentContradiction?.contradictionDetails?.recordB.excerpt).toContain(
      'Invoice INV-8821 marked pending and unpaid'
    );
  });

  it('2. The system does NOT decide which conflicting record is true', () => {
    const findings = detectContradictions(ASTER_NORTHSTAR_DEMO_CASE);
    const contradiction = findings.find((f) => f.category === 'CONTRADICTION');

    expect(contradiction).toBeDefined();
    expect(contradiction?.contradictionDetails?.nonJudgmentalNotice).toContain(
      'does not determine which record is true'
    );
    expect(contradiction?.recommendedAction).toContain('reconciliation');
  });

  it('3. Consistent payment records do NOT trigger a payment contradiction', () => {
    const consistentDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-consistent',
      supportingEvidence: [
        {
          id: 'ev-consistent-ledger',
          title: 'Bank Ledger Statement',
          documentType: 'Accounting Ledger',
          date: '2026-10-15',
          keyStatements: ['Invoice INV-8821 marked pending and unpaid as of 15 October 2026.'],
          fullTextOrSummary: 'Ledger shows outstanding balance of ₹14,50,000.',
        },
        {
          id: 'ev-consistent-delivery',
          title: 'Goods Delivery Note',
          documentType: 'Delivery Receipt',
          date: '2026-08-16',
          keyStatements: ['120 units delivered. Payment terms: 30 days pending.'],
          fullTextOrSummary: 'Goods delivered; invoice pending settlement.',
        },
      ],
    };

    const findings = detectContradictions(consistentDoc);
    const paymentContradiction = findings.find(
      (f) => f.id.startsWith('contra-payment') || f.id.startsWith('contra-doc-evidence')
    );

    expect(paymentContradiction).toBeUndefined();
  });

  it('4. Missing fields are identified with explicit placeholders without inventing values', () => {
    const incompleteDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-incomplete',
      parties: [], // No parties provided
      amounts: { currency: 'INR' }, // No principal amount
      content: 'Demand for payment. Details: [MISSING: Invoice Number]',
    };

    const findings = checkCompletenessAndQuality(incompleteDoc);

    const missingClaimant = findings.find((f) => f.id.includes('miss-claimant'));
    const missingRespondent = findings.find((f) => f.id.includes('miss-respondent'));
    const missingAmount = findings.find((f) => f.id.includes('miss-amount'));
    const placeholderFinding = findings.find((f) => f.title.includes('Invoice Number'));

    expect(missingClaimant).toBeDefined();
    expect(missingRespondent).toBeDefined();
    expect(missingAmount).toBeDefined();
    expect(placeholderFinding).toBeDefined();
  });

  it('5. Inaccurate universal 15-day statutory claim is detected and flagged as non-statutory', () => {
    const audit = auditLegalCitations(ASTER_NORTHSTAR_DEMO_CASE);
    const deadlineFinding = audit.findings.find((f) => f.id.includes('cite-false-15day'));

    expect(deadlineFinding).toBeDefined();
    expect(deadlineFinding?.severity).toBe('CRITICAL');
    expect(deadlineFinding?.explanation).toContain('Section 73 of the Indian Contract Act does not prescribe any 15-day statutory deadline');
  });

  it('6. Fabricated legal authority is detected and marked invalid', () => {
    const fakeDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-fake-law',
      content: 'Pursuant to the Rule of Factual Consistency in Legal Demands, debtor must submit audited accounts.',
    };

    const audit = auditLegalCitations(fakeDoc);
    const fakeFinding = audit.findings.find((f) => f.id.includes('cite-fabricated-authority'));

    expect(fakeFinding).toBeDefined();
    expect(fakeFinding?.severity).toBe('CRITICAL');
    expect(fakeFinding?.explanation).toContain('does not exist in the Indian legal framework');
  });

  it('7. Local database match is truthfully identified as LOCAL_DB_MATCH, not live official verification', () => {
    const validDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-valid-cite',
      content: 'Claimant seeks compensation under Section 73 of the Indian Contract Act, 1872 for direct breach.',
    };

    const audit = auditLegalCitations(validDoc);
    const s73Record = audit.records.find((r) => r.provision === 'Section 73');

    expect(s73Record).toBeDefined();
    expect(s73Record?.verificationStatus).toBe('LOCAL_DB_MATCH');
    expect(s73Record?.verificationLimitations).toContain('Does not represent real-time court docket scraping');
  });

  it('8. Section 73 Contract Act summary correctly matches actual provision for breach of contract', () => {
    const audit = auditLegalCitations(ASTER_NORTHSTAR_DEMO_CASE);
    const s73Record = audit.records.find((r) => r.provision === 'Section 73');

    expect(s73Record).toBeDefined();
    expect(s73Record?.relevantSupportingPassage).toContain('compensation for any loss or damage caused to him thereby');
    expect(s73Record?.relevantSupportingPassage).toContain('remote and indirect loss');
  });

  it('9. Source that does not support the claim is flagged (Order XXXVII universal applicability claim)', () => {
    const universalOrder37Doc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-order-37-overreach',
      content: 'Claimant is automatically entitled to summary suit under Order XXXVII of the Code of Civil Procedure.',
    };

    const audit = auditLegalCitations(universalOrder37Doc);
    const order37Record = audit.records.find((r) => r.provision === 'Order XXXVII (Rules 1 to 7)');

    expect(order37Record).toBeDefined();
    expect(order37Record?.verificationStatus).toBe('SOURCE_DOES_NOT_SUPPORT');
    expect(order37Record?.supportsProposition).toBe(false);
  });

  it('10. Transparent Health Score calculation accurately deducts points per defined severity formula', () => {
    const audit = runDocumentAudit(ASTER_NORTHSTAR_DEMO_CASE);
    const score = audit.healthScore;

    expect(score.baseScore).toBe(100);
    expect(score.criticalPenalties).toBeGreaterThanOrEqual(25);
    expect(score.finalScore).toBeLessThan(60);
    expect(score.grade).toBe('CRITICAL_RISK');
    expect(score.disclaimer).toContain('Document quality indicators only');
  });

  it('11. AI Provider deterministic generation produces numbered sections without inventing missing facts', async () => {
    const result = await AIProviderService.generateDraft({
      type: 'LEGAL_NOTICE_COMMERCIAL_DUES',
      jurisdiction: 'India',
      claimantName: 'Kaveri Logistics Ltd',
      claimantAddress: '', // missing
      respondentName: 'Deccan Retailers Pvt Ltd',
      respondentAddress: 'MG Road, Bengaluru',
      principalAmount: 500000,
      facts: 'Defaulted on invoice payment after 45 days.',
      tone: 'FORMAL_ASSERTIVE',
    });

    expect(result.engineUsed).toBe('OFFLINE_DETERMINISTIC');
    expect(result.content).toContain('LEGAL DEMAND NOTICE');
    expect(result.content).toContain('1.');
    expect(result.content).toContain('2.');
    expect(result.content).toContain('[MISSING: Registered Address of Claimant]');
    expect(result.missingPlaceholdersIdentified).toContain('Claimant Address');
    expect(result.content).toContain('₹5,00,000/-');
  });

  it('12. Storage persistence duplicates and saves documents reliably', () => {
    const newDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-test-persistence-123',
      title: 'Persistent Test Notice',
    };

    StorageService.saveDocument(newDoc);
    const retrieved = StorageService.getDocumentById('doc-test-persistence-123');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Persistent Test Notice');

    const copy = StorageService.duplicateDocument('doc-test-persistence-123');
    expect(copy).toBeDefined();
    expect(copy?.title).toBe('Persistent Test Notice (Copy)');

    StorageService.deleteDocument('doc-test-persistence-123');
    if (copy) StorageService.deleteDocument(copy.id);
  });

  it('13. Chronology Inversion flags critical finding when default predates contract', () => {
    const invertedDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-chrono-inverted',
      dates: {
        agreementDate: '2026-06-01',
        incidentOrDefaultDate: '2026-01-15',
        noticeDate: '2026-07-01',
      },
    };

    const findings = detectContradictions(invertedDoc);
    const chronoFinding = findings.find((f) => f.id.includes('contra-chrono'));

    expect(chronoFinding).toBeDefined();
    expect(chronoFinding?.severity).toBe('CRITICAL');
    expect(chronoFinding?.title).toContain('Chronological Inversion');
  });

  it('14. BSA 2023 vs Indian Evidence Act 1872: legacy Section 65B is flagged as replaced by Section 63 BSA', () => {
    const legacyEvidenceDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-legacy-evidence',
      content: 'Claimant attaches computer printouts accompanied by certificate under Section 65B of the Indian Evidence Act.',
    };

    const audit = auditLegalCitations(legacyEvidenceDoc);
    const legacyRecord = audit.records.find((r) => r.provision === 'Section 65B');

    expect(legacyRecord).toBeDefined();
    expect(legacyRecord?.verificationStatus).toBe('SOURCE_DOES_NOT_SUPPORT');
    expect(legacyRecord?.verificationLimitations).toContain('Bharatiya Sakshya Adhiniyam, 2023');
    expect(legacyRecord?.verificationLimitations).toContain('Section 63 BSA');
  });

  it('15. AI Provider fallback produces honest metadata when external provider fails', async () => {
    StorageService.saveSettings({ aiProvider: 'gemini', apiKey: 'test-key' });
    const result = await AIProviderService.generateDraft({
      type: 'PAYMENT_REMINDER_DEMAND',
      jurisdiction: 'India',
      claimantName: 'Test Claimant',
      claimantAddress: 'Mumbai',
      respondentName: 'Test Debtor',
      respondentAddress: 'Delhi',
      facts: 'Overdue bill',
      tone: 'STANDARD_COMMERCIAL',
    });

    expect(result.content).toBeDefined();
    expect(result.content).toContain('FORMAL PAYMENT REMINDER');
    StorageService.saveSettings({ aiProvider: 'offline_deterministic', apiKey: '' });
  });

  /* =========================================================================
     NEW AUTOMATED TESTS FOR ENHANCED OBJECTIVES 1 TO 7
     ========================================================================= */

  it('16. Clean initial dashboard state: starts with empty cases array and no hardcoded demo cases', () => {
    StorageService.clearAllData();
    const cases = StorageService.getCases();
    expect(cases).toEqual([]);
    expect(StorageService.getActiveCaseId()).toBeFalsy();
  });

  it('17. Creating and reopening a user-created case persists custom metadata and parties', () => {
    const customCase: LegalCase = {
      id: 'case-test-user-custom',
      title: 'Solar Energy Consortium vs Grid Power Corp',
      referenceNumber: 'SEC-GPC-2026',
      matterType: 'Commercial Dispute',
      jurisdiction: 'High Court of Delhi',
      parties: [
        { name: 'Solar Energy Consortium LLP', role: 'CLAIMANT', entityType: 'LLP' },
        { name: 'Grid Power Corporation Ltd', role: 'RESPONDENT', entityType: 'COMPANY' },
      ],
      summary: 'Failure to clear power supply tariff invoices under PPA.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      documents: [],
      extractedFacts: [],
      findings: [],
    };

    StorageService.saveCase(customCase);
    const retrieved = StorageService.getCaseById('case-test-user-custom');

    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Solar Energy Consortium vs Grid Power Corp');
    expect(retrieved?.jurisdiction).toBe('High Court of Delhi');
    expect(retrieved?.parties.length).toBe(2);
    expect(StorageService.getActiveCaseId()).toBe('case-test-user-custom');

    // Clean up
    StorageService.deleteCase('case-test-user-custom');
  });

  it('18. File signature validation accepts valid PDF, DOCX, PNG, and JPEG magic bytes', () => {
    // Valid PDF (%PDF-...)
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
    const pdfVal = validateFileSignature(pdfBytes, 'agreement.pdf');
    expect(pdfVal.isValid).toBe(true);
    expect(pdfVal.detectedType).toBe('application/pdf');

    // Valid PNG (\x89PNG...)
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pngVal = validateFileSignature(pngBytes, 'receipt.png');
    expect(pngVal.isValid).toBe(true);
    expect(pngVal.detectedType).toBe('image/png');

    // Valid JPEG (\xFF\xD8\xFF)
    const jpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const jpgVal = validateFileSignature(jpgBytes, 'invoice.jpg');
    expect(jpgVal.isValid).toBe(true);
    expect(jpgVal.detectedType).toBe('image/jpeg');

    // Valid DOCX (PK\x03\x04...)
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const docxVal = validateFileSignature(docxBytes, 'contract.docx');
    expect(docxVal.isValid).toBe(true);
    expect(docxVal.detectedType).toContain('wordprocessingml');
  });

  it('19. File signature validation rejects extension spoofing and unsupported formats', () => {
    // Executable/text renamed to .pdf
    const spoofedBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]); // MZ executable signature
    const spoofedVal = validateFileSignature(spoofedBytes, 'malware.pdf');
    expect(spoofedVal.isValid).toBe(false);

    // Mismatched extension: PDF content saved as .png
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const mismatchVal = validateFileSignature(pdfBytes, 'file.png');
    expect(mismatchVal.isValid).toBe(false);
    expect(mismatchVal.error).toContain('mismatch');
  });

  it('20. Structured fact extraction extracts parties, amounts, and dates without inventing missing data', () => {
    const sampleDoc: CaseDocument = {
      id: 'doc-sample-test-1',
      caseId: 'case-test-1',
      originalFilename: 'TaxInvoice_INV4901.pdf',
      fileSize: 45000,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      status: 'EXTRACTED',
      extractedText: `TAX INVOICE
From: M/s Bharat Industrial Components Private Limited
To: Apex Electricals Limited
Invoice No: INV-4901
Date: 15 August 2026
Total Payable: ₹8,75,000/-
Payment Status: pending and unpaid
Notes: [MISSING: Delivery Acknowledgment Number]`,
      securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
    };

    const facts = extractStructuredFactsFromDocument(sampleDoc, 'case-test-1');

    const partyFact = facts.find((f) => f.category === 'PARTY');
    const amountFact = facts.find((f) => f.category === 'AMOUNT');
    const dateFact = facts.find((f) => f.category === 'DATE');
    const paymentStatusFact = facts.find((f) => f.category === 'PAYMENT' && f.normalizedValue === 'UNPAID');
    const missingFact = facts.find((f) => f.status === 'MISSING');

    expect(partyFact).toBeDefined();
    expect(partyFact?.normalizedValue).toContain('Bharat Industrial Components');

    expect(amountFact).toBeDefined();
    expect(amountFact?.normalizedValue).toBe(875000);

    expect(dateFact).toBeDefined();
    expect(dateFact?.normalizedValue).toBe('15 August 2026');

    expect(paymentStatusFact).toBeDefined();

    expect(missingFact).toBeDefined();
    expect(missingFact?.normalizedValue).toContain('Delivery Acknowledgment Number');
  });

  it('21. Cross-document contradiction engine flags paid vs unpaid across separate files in a case', () => {
    const docA: CaseDocument = {
      id: 'doc-receipt-a',
      caseId: 'case-cross-test',
      originalFilename: 'Bank_NEFT_Receipt.pdf',
      fileSize: 2048,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      status: 'EXTRACTED',
      extractedText: 'NEFT Transfer Advice: Invoice INV-4901 was fully paid on 20 August 2026 via NEFT ref N881299.',
      securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
    };

    const docB: CaseDocument = {
      id: 'doc-ledger-b',
      caseId: 'case-cross-test',
      originalFilename: 'Accounts_Ledger_Extract.docx',
      fileSize: 3000,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date().toISOString(),
      status: 'EXTRACTED',
      extractedText: 'Accounts Receivable: Invoice INV-4901 marked pending and unpaid as of 30 September 2026.',
      securityValidation: { isValidSignature: true, detectedType: 'application/docx', fileSizeOk: true, sanitized: true },
    };

    const testCase: LegalCase = {
      id: 'case-cross-test',
      title: 'Payment Reconciliation Test',
      matterType: 'Debt Recovery',
      jurisdiction: 'India',
      parties: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      documents: [docA, docB],
      extractedFacts: [
        ...extractStructuredFactsFromDocument(docA, 'case-cross-test'),
        ...extractStructuredFactsFromDocument(docB, 'case-cross-test'),
      ],
      findings: [],
    };

    const crossFindings = detectCrossDocumentContradictions(testCase);
    const paymentConflict = crossFindings.find(
      (f) => f.category === 'CONTRADICTION' && f.severity === 'CRITICAL'
    );

    expect(paymentConflict).toBeDefined();
    expect(paymentConflict?.contradictionDetails?.recordA.filename).toBe('Bank_NEFT_Receipt.pdf');
    expect(paymentConflict?.contradictionDetails?.recordB.filename).toBe('Accounts_Ledger_Extract.docx');
    expect(paymentConflict?.contradictionDetails?.nonJudgmentalNotice).toContain('does not determine which record is true');
  });

  it('22. Fact review updates and user corrections persist distinctly without altering original quotation', () => {
    const testCase: LegalCase = {
      id: 'case-fact-review-test',
      title: 'Fact Review Case',
      matterType: 'Commercial Dispute',
      jurisdiction: 'India',
      parties: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      documents: [],
      extractedFacts: [
        {
          id: 'fact-101',
          caseId: 'case-fact-review-test',
          sourceDocId: 'doc-1',
          sourceDocName: 'Contract.pdf',
          category: 'AMOUNT',
          label: 'Principal Sum',
          originalText: 'Amount claimed: Rs. 14,00,000',
          normalizedValue: 1400000,
          confidence: 85,
          status: 'DIRECTLY_STATED',
          reviewStatus: 'UNREVIEWED',
        },
      ],
      findings: [],
    };

    StorageService.saveCase(testCase);

    // Apply user correction
    StorageService.updateFact('case-fact-review-test', 'fact-101', {
      reviewStatus: 'CORRECTED',
      userCorrection: '₹14,50,000 (Adjusted after debit note deduction)',
      userNotes: 'Counsel verified against updated reconciliation sheet.',
    });

    const retrieved = StorageService.getCaseById('case-fact-review-test');
    const updatedFact = retrieved?.extractedFacts.find((f) => f.id === 'fact-101');

    expect(updatedFact?.reviewStatus).toBe('CORRECTED');
    expect(updatedFact?.userCorrection).toContain('Adjusted after debit note');
    // Original text remains preserved!
    expect(updatedFact?.originalText).toBe('Amount claimed: Rs. 14,00,000');

    StorageService.deleteCase('case-fact-review-test');
  });

  it('23. Removing a document from a case also purges its associated extracted facts', () => {
    const testCase: LegalCase = {
      id: 'case-deletion-test',
      title: 'Deletion Purge Test',
      matterType: 'General Civil',
      jurisdiction: 'India',
      parties: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      documents: [
        {
          id: 'doc-to-delete',
          caseId: 'case-deletion-test',
          originalFilename: 'temp_doc.pdf',
          fileSize: 1000,
          mimeType: 'application/pdf',
          uploadedAt: new Date().toISOString(),
          status: 'EXTRACTED',
          extractedText: 'Temporary text',
          securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
        },
      ],
      extractedFacts: [
        {
          id: 'fact-to-delete',
          caseId: 'case-deletion-test',
          sourceDocId: 'doc-to-delete',
          sourceDocName: 'temp_doc.pdf',
          category: 'OTHER',
          label: 'Temp Fact',
          originalText: 'Temporary text',
          normalizedValue: 'temp',
          confidence: 80,
          status: 'DIRECTLY_STATED',
          reviewStatus: 'UNREVIEWED',
        },
      ],
      findings: [],
    };

    StorageService.saveCase(testCase);
    expect(StorageService.getCaseById('case-deletion-test')?.documents.length).toBe(1);
    expect(StorageService.getCaseById('case-deletion-test')?.extractedFacts.length).toBe(1);

    // Remove document
    StorageService.removeDocumentFromCase('case-deletion-test', 'doc-to-delete');

    const after = StorageService.getCaseById('case-deletion-test');
    expect(after?.documents.length).toBe(0);
    expect(after?.extractedFacts.length).toBe(0);

    StorageService.deleteCase('case-deletion-test');
  });

  it('24. Constitution of India citation verification recognizes Article 14 and detects Article 226 misuse for private money claims', () => {
    const constDoc: LegalDocument = {
      ...ASTER_NORTHSTAR_DEMO_CASE,
      id: 'doc-constitution-test',
      content: 'Claimant invokes Article 14 and files writ under Article 226 of the Constitution of India for invoice recovery in private contract.',
    };

    const audit = auditLegalCitations(constDoc);

    const art14 = audit.records.find((r) => r.provision === 'Article 14');
    expect(art14).toBeDefined();
    expect(art14?.statutoryCategory).toBe('CONSTITUTION');

    const art226 = audit.records.find((r) => r.provision === 'Article 226');
    expect(art226).toBeDefined();
    expect(art226?.verificationStatus).toBe('SOURCE_FOUND_PROPOSITION_NOT_CONFIRMED');
    expect(art226?.verificationLimitations).toContain('High Courts ordinarily decline Article 226 writ petitions for recovery of money in private commercial contracts');
  });

  it('25. SourceRegistryService indexes Constitution, Central Acts, Delegated Legislation, and Judgments', () => {
    const allSources = SourceRegistryService.getAllSources();
    expect(allSources.length).toBeGreaterThanOrEqual(10);

    const constitutionSources = allSources.filter((s) => s.category === 'CONSTITUTION');
    const centralActs = allSources.filter((s) => s.category === 'CENTRAL_ACT');
    const delegatedRules = allSources.filter((s) => s.category === 'DELEGATED_LEGISLATION');
    const judgments = allSources.filter((s) => s.category === 'JUDGMENT');

    expect(constitutionSources.length).toBeGreaterThanOrEqual(6); // Articles 14, 19(1)(g), 21, 226, 299, 300A
    expect(centralActs.length).toBeGreaterThanOrEqual(2); // Sections 73, 74 Contract Act
    expect(delegatedRules.length).toBeGreaterThanOrEqual(2); // Commercial Courts Mediation Rules & IT Security Rules
    expect(judgments.length).toBeGreaterThanOrEqual(3); // Radhakrishna Agarwal, Kailash Nath, Patil Automation

    // Confirm that every source includes required provenance fields
    for (const src of allSources) {
      expect(src.officialSourceUrl).toMatch(/^https?:\/\//);
      expect(src.officialSourceOrganization.length).toBeGreaterThan(0);
      expect(src.statutoryText.length).toBeGreaterThan(15);
      expect(src.jurisdiction.length).toBeGreaterThan(0);
    }
  });

  it('26. Source adapters target official portals and return structured probe metadata', async () => {
    const legAdapter = new LegislativeDeptConstitutionAdapter();
    expect(legAdapter.portalBaseUrl).toBe('https://www.legislative.gov.in/documents');
    expect(legAdapter.canHandle('Article 21 Constitution of India')).toBe(true);

    const indiaCodeAdapter = new IndiaCodeAdapter();
    expect(indiaCodeAdapter.portalBaseUrl).toBe('https://www.indiacode.nic.in/');
    expect(indiaCodeAdapter.canHandle('Section 73 Indian Contract Act')).toBe(true);

    const scAdapter = new SupremeCourtJudgmentsAdapter();
    expect(scAdapter.portalBaseUrl).toBe('https://www.sci.gov.in/');
    expect(scAdapter.canHandle('Kailash Nath Associates judgment')).toBe(true);

    // Verify probe result structure
    const probe = await legAdapter.probe();
    expect(probe.url).toBe('https://www.legislative.gov.in/documents');
    expect(probe.isReachable).toBe(true);
    expect(probe.portalName).toContain('Legislative Department');
  });

  it('27. Manual Source Import validates required fields and rejects incomplete inputs', () => {
    // Missing title
    const resNoTitle = SourceRegistryService.importManualSource({
      actOrCaseTitle: '',
      provisionOrCitation: 'Section 9',
      category: 'CENTRAL_ACT',
      officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2163',
      officialSourceOrganization: 'India Code',
      jurisdiction: 'India (Central)',
      statutoryOrJudgmentText: 'A party may, before or during arbitral proceedings...',
    });
    expect(resNoTitle.success).toBe(false);
    expect(resNoTitle.error).toContain('title');

    // Invalid URL
    const resInvalidUrl = SourceRegistryService.importManualSource({
      actOrCaseTitle: 'Arbitration and Conciliation Act, 1996',
      provisionOrCitation: 'Section 9',
      category: 'CENTRAL_ACT',
      officialSourceUrl: 'ftp://invalid-url',
      officialSourceOrganization: 'India Code',
      jurisdiction: 'India (Central)',
      statutoryOrJudgmentText: 'A party may, before or during arbitral proceedings, apply to a court for an interim measure of protection.',
    });
    expect(resInvalidUrl.success).toBe(false);
    expect(resInvalidUrl.error).toContain('URL');

    // Text too short
    const resShortText = SourceRegistryService.importManualSource({
      actOrCaseTitle: 'Arbitration and Conciliation Act, 1996',
      provisionOrCitation: 'Section 9',
      category: 'CENTRAL_ACT',
      officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2163',
      officialSourceOrganization: 'India Code',
      jurisdiction: 'India (Central)',
      statutoryOrJudgmentText: 'Too short',
    });
    expect(resShortText.success).toBe(false);
    expect(resShortText.error).toContain('at least 20 characters');
  });

  it('28. Manual Source Import persists into registry with provenance and is searchable', () => {
    const importRes = SourceRegistryService.importManualSource({
      actOrCaseTitle: 'The Arbitration and Conciliation Act, 1996 (Act No. 26 of 1996)',
      provisionOrCitation: 'Section 9',
      category: 'CENTRAL_ACT',
      officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2163',
      officialSourceOrganization: 'Legislative Department, Ministry of Law and Justice',
      jurisdiction: 'India (Central)',
      statutoryOrJudgmentText:
        'A party may, before or during arbitral proceedings or at any time after the making of the arbitral award but before it is enforced in accordance with section 36, apply to a court for an interim measure of protection.',
      summaryOfLaw: 'Authorizes pre-arbitration and post-award interim protective relief from commercial civil courts.',
    });

    expect(importRes.success).toBe(true);
    expect(importRes.item).toBeDefined();
    expect(importRes.item?.id).toContain('src-import-');
    expect(importRes.item?.importMethod).toBe('MANUAL_OFFICIAL_IMPORT');

    // Confirm it is now searchable
    const searchResults = SourceRegistryService.searchSources('Arbitration and Conciliation');
    expect(searchResults.some((s) => s.provision === 'Section 9')).toBe(true);
  });

  it('29. SourceRegistryService.verifyProposition enforces strict honesty on legal claims', () => {
    // 1. Inaccurate claim: claiming s.73 mandates a 15-day statutory cure notice
    const eval1 = SourceRegistryService.verifyProposition(
      'Under statutory requirements of Section 73 of the Indian Contract Act, notice of 15 days is mandatory.',
      'When a contract has been broken, the party who suffers by such breach is entitled to receive compensation...',
      'Section 73'
    );
    expect(eval1.status).toBe('SOURCE_FOUND_PROPOSITION_NOT_CONFIRMED');
    expect(eval1.supportsProposition).toBe(false);
    expect(eval1.explanation).toContain('proposition is NOT confirmed');

    // 2. Legitimate claim: claiming s.73 compensates for loss naturally arising
    const eval2 = SourceRegistryService.verifyProposition(
      'Claimant seeks compensation for loss naturally arising from breach under Section 73.',
      'When a contract has been broken, the party who suffers by such breach is entitled to receive compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things...',
      'Section 73'
    );
    expect(eval2.status).toBe('VERIFIED_AGAINST_RETRIEVED_SOURCE');
    expect(eval2.supportsProposition).toBe(true);

    // 3. Empty text -> source unavailable
    const eval3 = SourceRegistryService.verifyProposition('Claim', '', 'Section 1');
    expect(eval3.status).toBe('SOURCE_UNAVAILABLE');
    expect(eval3.supportsProposition).toBe(false);
  });

  it('30. Attaching verified legal source to a case finding updates finding metadata and case state', () => {
    const testCase: LegalCase = {
      id: `case-attach-test-${Date.now()}`,
      title: 'Global Motors v. Apex Components',
      matterType: 'Commercial Dispute',
      jurisdiction: 'High Court of Delhi',
      parties: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      documents: [],
      extractedFacts: [],
      findings: [
        {
          id: 'finding-attach-1',
          category: 'CITATION_CHECK',
          severity: 'CRITICAL',
          title: 'Unverified Statutory Claim',
          explanation: 'Asserted Section 73 requires 15-day statutory payment window.',
          detectionMethod: 'DETERMINISTIC',
          confidence: 95,
          confidenceExplanation: 'High confidence rule match.',
          recommendedAction: 'Verify against India Code official text.',
          status: 'OPEN',
          userReviewStatus: 'UNRESOLVED',
          evidenceExcerpts: [],
        },
      ],
    };

    StorageService.saveCase(testCase);

    const art14Source = SourceRegistryService.getSourceById('src-ica-73');
    expect(art14Source).toBeDefined();

    const attached = SourceRegistryService.attachSourceToFinding(
      testCase.id,
      'finding-attach-1',
      art14Source!,
      art14Source!.statutoryText,
      'Asserted Section 73 requires 15-day statutory payment window.',
      'Auditor note: Cross-checked against India Code Central Act No. 9 of 1872.'
    );

    expect(attached).toBeDefined();
    expect(attached.sourceId).toBe('src-ica-73');
    expect(attached.officialSourceUrl).toContain('indiacode.nic.in');

    // Fetch refreshed case from storage
    const refreshed = StorageService.getCaseById(testCase.id);
    expect(refreshed).toBeDefined();
    const updatedFinding = refreshed?.findings.find((f) => f.id === 'finding-attach-1');
    expect(updatedFinding?.attachedSource).toBeDefined();
    expect(updatedFinding?.attachedSource?.provision).toBe('Section 73');
    expect(updatedFinding?.attachedSource?.verificationStatus).toBe('SOURCE_FOUND_PROPOSITION_NOT_CONFIRMED');
    expect(refreshed?.attachedSources?.length).toBeGreaterThanOrEqual(1);
  });
});
