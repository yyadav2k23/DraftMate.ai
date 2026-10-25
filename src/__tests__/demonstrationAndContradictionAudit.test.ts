import { describe, expect, it, beforeEach } from 'vitest';
import {
  buildFictionalDemoCase1,
  buildFictionalDemoCase2,
  buildFictionalDemoCase3,
  getThreeFictionalDemoCases,
  getThreeFictionalDemoDocuments,
} from '../data/demonstrationCases';
import { extractCaseFacts, extractStructuredFactsFromDocument } from '../engine/factExtractor';
import { detectCrossDocumentContradictions } from '../engine/crossDocumentContradiction';
import { validateFileSignature } from '../services/documentParser';
import { StorageService } from '../services/storage';
import { AIProviderService } from '../services/aiProvider';
import { CaseDocument, LegalCase } from '../types';

describe('DraftMate.ai — Demonstration Cases, Contradiction Engine & Ingestion Audit', () => {
  beforeEach(() => {
    StorageService.initialize();
  });

  /* =========================================================================
     1. THREE DIVERSE FICTIONAL DEMONSTRATION CASES AUDIT
     ========================================================================= */

  describe('Three Demonstration Cases Audit', () => {
    it('Case 1 (DM-DEMO-001): Commercial Payment Dispute is fully labelled and flags paid vs unpaid conflict', () => {
      const c1 = buildFictionalDemoCase1();

      // Fictional test case label prominently displayed
      expect(c1.title).toContain('[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER]');
      expect(c1.referenceNumber).toBe('DM-DEMO-001');
      expect(c1.isDemoCase).toBe(true);

      // Verify parties & fictional non-CIN identifiers
      expect(c1.parties[0].name).toBe('Aster Supplies Private Limited');
      expect(c1.parties[0].identifier).toContain('DEMO-ASTER-001');
      expect(c1.parties[1].name).toBe('Northstar Retail Private Limited');
      expect(c1.parties[1].identifier).toContain('DEMO-NORTHSTAR-002');

      // Verify evidentiary documents
      expect(c1.documents.length).toBeGreaterThanOrEqual(2);
      expect(c1.documents[0].originalFilename).toContain('Payment_Receipt_TXN123');
      expect(c1.documents[1].originalFilename).toContain('Statement');

      // Verify extracted facts
      expect(c1.extractedFacts.length).toBeGreaterThanOrEqual(4);
      const paidFact = c1.extractedFacts.find((f) => f.normalizedValue === 'PAID');
      const unpaidFact = c1.extractedFacts.find((f) => f.normalizedValue === 'UNPAID');
      const txnFact = c1.extractedFacts.find((f) => String(f.normalizedValue).includes('TXN123'));
      const amtFact = c1.extractedFacts.find((f) => f.normalizedValue === 50000);

      expect(paidFact).toBeDefined();
      expect(unpaidFact).toBeDefined();
      expect(txnFact).toBeDefined();
      expect(amtFact).toBeDefined();

      // Verify critical cross-document contradiction
      const criticalPaymentConflict = c1.findings.find(
        (f) => f.category === 'CONTRADICTION' && f.severity === 'CRITICAL'
      );
      expect(criticalPaymentConflict).toBeDefined();
      expect(criticalPaymentConflict?.explanation).toContain('indicates the obligation was settled/paid');
      expect(criticalPaymentConflict?.explanation).toContain('remains pending and unpaid');

      // Neutrality: Does not decide which record is true
      expect(criticalPaymentConflict?.contradictionDetails?.nonJudgmentalNotice).toContain(
        'does not determine which record is true'
      );
      expect(criticalPaymentConflict?.contradictionDetails?.suggestedResolvingEvidence).toContain(
        'Certified bank statement'
      );
    });

    it('Case 2 (DM-DEMO-002): Employment Dispute distinguishes payroll processing from bank credit confirmation', () => {
      const c2 = buildFictionalDemoCase2();

      expect(c2.title).toContain('[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER]');
      expect(c2.referenceNumber).toBe('DM-DEMO-002');
      expect(c2.isDemoCase).toBe(true);

      // Verify parties & fictional identifiers
      expect(c2.parties[0].name).toBe('Priya Sharma');
      expect(c2.parties[0].identifier).toContain('DEMO-EMPLOYEE-002');
      expect(c2.parties[1].name).toBe('Meridian Digital Services Private Limited');
      expect(c2.parties[1].identifier).toContain('DEMO-EMPLOYER-002');

      // Verify documents: Salary statement, Payroll advice, Appointment letter, HR exit email
      expect(c2.documents.length).toBeGreaterThanOrEqual(4);

      // Verify factual extractions
      const salaryAmountFact = c2.extractedFacts.find((f) => f.normalizedValue === 35000);
      const processedFact = c2.extractedFacts.find((f) => f.normalizedValue === 'PROCESSED_UNCONFIRMED_RECEIPT');
      const incompleteDateFact = c2.extractedFacts.find((f) => String(f.normalizedValue).includes('05-____-2026'));
      const noticeClauseFact = c2.extractedFacts.find((f) => f.label.includes('Notice Period Obligation'));

      expect(salaryAmountFact).toBeDefined();
      expect(processedFact).toBeDefined();
      expect(incompleteDateFact).toBeDefined();
      expect(noticeClauseFact).toBeDefined();

      // Contradiction: Unpaid vs Payroll Processed (Receipt Unconfirmed)
      const payrollConflict = c2.findings.find(
        (f) => f.id.includes('cross-contra-payroll')
      );
      expect(payrollConflict).toBeDefined();
      expect(payrollConflict?.explanation).toContain('internal payroll processing or dispatch notation does not establish that funds were actually credited');
      expect(payrollConflict?.recommendedAction).toContain('bank account statement');

      // Missing evidence: Unverified notice period compliance
      const noticeFinding = c2.findings.find((f) => f.id.includes('unverified-notice-compliance'));
      expect(noticeFinding).toBeDefined();
      expect(noticeFinding?.explanation).toContain('notice period');

      // Incomplete date record detected
      const corruptDateFinding = c2.findings.find((f) => f.id.includes('fact-date-incomplete'));
      expect(corruptDateFinding).toBeDefined();
      expect(corruptDateFinding?.title).toContain('Incomplete Date Record');
    });

    it('Case 3 (DM-DEMO-003): Tenancy Dispute detects ₹5,000 arithmetic divergence and missing contractor receipts', () => {
      const c3 = buildFictionalDemoCase3();

      expect(c3.title).toContain('[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER]');
      expect(c3.referenceNumber).toBe('DM-DEMO-003');
      expect(c3.isDemoCase).toBe(true);

      // Verify parties & fictional identifiers
      expect(c3.parties[0].name).toBe('Rahul Verma');
      expect(c3.parties[0].identifier).toContain('DEMO-TENANT-003');
      expect(c3.parties[1].name).toBe('Greenview Properties');
      expect(c3.parties[1].identifier).toContain('DEMO-LANDLORD-003');

      // Documents: Move-out email, Draft settlement, Landlord message
      expect(c3.documents.length).toBe(3);

      // Facts extracted: Deposit ₹30,000, Cleaning ₹2,000, Repairs ₹3,000, Stated Refund ₹20,000
      const depositFact = c3.extractedFacts.find((f) => f.label.includes('Security Deposit'));
      const cleaningFact = c3.extractedFacts.find((f) => f.label.includes('Cleaning'));
      const repairFact = c3.extractedFacts.find((f) => f.label.includes('Repair'));
      const refundFact = c3.extractedFacts.find((f) => f.label.includes('Refund') && f.normalizedValue === 20000);

      expect(depositFact?.normalizedValue).toBe(30000);
      expect(cleaningFact?.normalizedValue).toBe(2000);
      expect(repairFact?.normalizedValue).toBe(3000);
      expect(refundFact?.normalizedValue).toBe(20000);

      // Arithmetic deduction divergence: Net = ₹30k - ₹2k - ₹3k = ₹25,000 vs landlord stating ₹20,000
      const depositConflict = c3.findings.find((f) => f.id.includes('cross-contra-deposit-refund'));
      expect(depositConflict).toBeDefined();
      expect(depositConflict?.explanation).toContain('calculates a net refund of ₹25,000');
      expect(depositConflict?.explanation).toContain('asserts only ₹20,000 will be returned');
      expect(depositConflict?.explanation).toContain('unexplained difference of ₹5,000');

      // Missing evidence: Handover deductions lack contractor tax invoices or move-out photos
      const missingEvidence = c3.findings.find((f) => f.id.includes('tenancy-missing-evidence'));
      expect(missingEvidence).toBeDefined();
      expect(missingEvidence?.explanation).toContain('Cleaning charges (₹2,000) and repair charges (₹3,000) are listed on the handover checklist without contractor tax invoices');
    });
  });

  /* =========================================================================
     2. EIGHT EXPLICIT CONTRADICTION & FALSE-POSITIVE PREVENTION TESTS
     ========================================================================= */

  describe('Eight Explicit Contradiction & False-Positive Tests', () => {
    // 1. Paid vs unpaid conflict
    it('Rule 1: Paid vs unpaid conflict is flagged neutrally with both excerpts', () => {
      const testCase: LegalCase = {
        id: 'case-test-rule-1',
        title: 'Test Commercial Matter',
        matterType: 'Commercial Dispute',
        jurisdiction: 'India',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [
          {
            id: 'doc-1a',
            caseId: 'case-test-rule-1',
            originalFilename: 'Receipt_Doc.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Received payment of ₹50,000 on 25 August 2026 via NEFT.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
          {
            id: 'doc-1b',
            caseId: 'case-test-rule-1',
            originalFilename: 'Ledger_Doc.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Account balance remains unpaid and in default as of 30 August 2026.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
        ],
        extractedFacts: [],
        findings: [],
      };

      testCase.extractedFacts = extractCaseFacts(testCase.documents, testCase.id);
      const findings = detectCrossDocumentContradictions(testCase);
      const conflict = findings.find((f) => f.category === 'CONTRADICTION' && f.severity === 'CRITICAL');

      expect(conflict).toBeDefined();
      expect(conflict?.evidenceExcerpts?.length).toBe(2);
      expect(conflict?.contradictionDetails?.recordA.filename).toBe('Receipt_Doc.pdf');
      expect(conflict?.contradictionDetails?.recordB.filename).toBe('Ledger_Doc.pdf');
    });

    // 2. Salary unpaid vs payroll processed
    it('Rule 2: Salary unpaid vs payroll processed distinguishes processing notation from bank credit', () => {
      const testCase: LegalCase = {
        id: 'case-test-rule-2',
        title: 'Test Employment Matter',
        matterType: 'Employment Dispute',
        jurisdiction: 'India',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [
          {
            id: 'doc-2a',
            caseId: 'case-test-rule-2',
            originalFilename: 'Salary_Slip.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Salary for August 2026 is unpaid.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
          {
            id: 'doc-2b',
            caseId: 'case-test-rule-2',
            originalFilename: 'Payroll_Email.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Salary was processed on 5 September 2026 by payroll.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
        ],
        extractedFacts: [],
        findings: [],
      };

      testCase.extractedFacts = extractCaseFacts(testCase.documents, testCase.id);
      const findings = detectCrossDocumentContradictions(testCase);
      const conflict = findings.find((f) => f.id.includes('cross-contra-payroll'));

      expect(conflict).toBeDefined();
      expect(conflict?.explanation).toContain('does not establish that funds were actually credited to the employee');
    });

    // 3. Deposit arithmetic divergence
    it('Rule 3: Tenancy deposit calculation arithmetic is verified and unexplained variance flagged', () => {
      const testCase: LegalCase = {
        id: 'case-test-rule-3',
        title: 'Tenancy Deposit Reconciliation',
        matterType: 'Tenancy Dispute',
        jurisdiction: 'India',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [
          {
            id: 'doc-3a',
            caseId: 'case-test-rule-3',
            originalFilename: 'Checklist.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Security deposit: ₹30,000. Cleaning charges: ₹2,000. Repair charges: ₹3,000.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
          {
            id: 'doc-3b',
            caseId: 'case-test-rule-3',
            originalFilename: 'Landlord_Msg.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Only ₹20,000 will be returned as refund.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
        ],
        extractedFacts: [],
        findings: [],
      };

      testCase.extractedFacts = extractCaseFacts(testCase.documents, testCase.id);
      const findings = detectCrossDocumentContradictions(testCase);
      const divergence = findings.find((f) => f.id.includes('cross-contra-deposit-refund'));

      expect(divergence).toBeDefined();
      expect(divergence?.explanation).toContain('net refund of ₹25,000');
      expect(divergence?.explanation).toContain('only ₹20,000 will be returned');
    });

    // 4. Inconsistent dates
    it('Rule 4: Inconsistent timeline dates and incomplete date formats are detected', () => {
      const testCase: LegalCase = {
        id: 'case-test-rule-4',
        title: 'Timeline Inconsistency',
        matterType: 'Employment Dispute',
        jurisdiction: 'India',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [
          {
            id: 'doc-4a',
            caseId: 'case-test-rule-4',
            originalFilename: 'Exit_Form_A.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Final working day: 10 September 2026.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
          {
            id: 'doc-4b',
            caseId: 'case-test-rule-4',
            originalFilename: 'Exit_Form_B.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Last working date: 15 September 2026. Prior notice memo dated 05-____-2026.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
        ],
        extractedFacts: [],
        findings: [],
      };

      testCase.extractedFacts = extractCaseFacts(testCase.documents, testCase.id);
      const findings = detectCrossDocumentContradictions(testCase);

      const lwdContradiction = findings.find((f) => f.id.includes('cross-contra-lwd'));
      expect(lwdContradiction).toBeDefined();
      expect(lwdContradiction?.explanation).toContain('states final working day as 10 September 2026');
      expect(lwdContradiction?.explanation).toContain('records 15 September 2026');

      const corruptDateFinding = findings.find((f) => f.title.includes('Incomplete Date Record'));
      expect(corruptDateFinding).toBeDefined();
    });

    // 5. Missing evidence
    it('Rule 5: Missing notice execution and missing third-party contractor bills are detected', () => {
      const c2 = buildFictionalDemoCase2();
      const noticeMissing = c2.findings.find((f) => f.id.includes('unverified-notice-compliance'));
      expect(noticeMissing).toBeDefined();

      const c3 = buildFictionalDemoCase3();
      const invoiceMissing = c3.findings.find((f) => f.id.includes('tenancy-missing-evidence'));
      expect(invoiceMissing).toBeDefined();
    });

    // 6. Duplicate facts (False-positive prevention)
    it('Rule 6: Identical amounts and dates across multiple documents do NOT trigger false contradictions', () => {
      const testCase: LegalCase = {
        id: 'case-test-rule-6',
        title: 'Consistent Multi-Document Matter',
        matterType: 'Commercial Dispute',
        jurisdiction: 'India',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [
          {
            id: 'doc-6a',
            caseId: 'case-test-rule-6',
            originalFilename: 'Invoice_1.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Tax invoice for ₹50,000 due on 25 August 2026.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
          {
            id: 'doc-6b',
            caseId: 'case-test-rule-6',
            originalFilename: 'Confirmation_Letter.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Confirming invoice of ₹50,000 due on 25 August 2026.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
        ],
        extractedFacts: [],
        findings: [],
      };

      testCase.extractedFacts = extractCaseFacts(testCase.documents, testCase.id);
      const findings = detectCrossDocumentContradictions(testCase);

      // Should have zero contradictions
      const contradictions = findings.filter((f) => f.category === 'CONTRADICTION');
      expect(contradictions.length).toBe(0);
    });

    // 7. Compatible statements (False-positive prevention)
    it('Rule 7: Compatible chronological statements do NOT trigger a false contradiction', () => {
      const testCase: LegalCase = {
        id: 'case-test-rule-7',
        title: 'Chronology Matter',
        matterType: 'Commercial Dispute',
        jurisdiction: 'India',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [
          {
            id: 'doc-7a',
            caseId: 'case-test-rule-7',
            originalFilename: 'Dispatch_Note.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Notice served on 1 August 2026.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
          {
            id: 'doc-7b',
            caseId: 'case-test-rule-7',
            originalFilename: 'Reply_Acknowledgment.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Received notice in August 2026.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
        ],
        extractedFacts: [],
        findings: [],
      };

      testCase.extractedFacts = extractCaseFacts(testCase.documents, testCase.id);
      const findings = detectCrossDocumentContradictions(testCase);
      const contradictions = findings.filter((f) => f.category === 'CONTRADICTION');
      expect(contradictions.length).toBe(0);
    });

    // 8. Document without payment date
    it('Rule 8: Document lacking a payment date does NOT invent one or report an unstated contradiction', () => {
      const testCase: LegalCase = {
        id: 'case-test-rule-8',
        title: 'Undated Invoice Matter',
        matterType: 'Commercial Dispute',
        jurisdiction: 'India',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [
          {
            id: 'doc-8a',
            caseId: 'case-test-rule-8',
            originalFilename: 'Undated_Invoice.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            status: 'EXTRACTED',
            extractedText: 'Invoice INV-990 for ₹20,000 for consulting services rendered.',
            securityValidation: { isValidSignature: true, detectedType: 'application/pdf', fileSizeOk: true, sanitized: true },
          },
        ],
        extractedFacts: [],
        findings: [],
      };

      testCase.extractedFacts = extractCaseFacts(testCase.documents, testCase.id);

      // Verify no imaginary payment date was hallucinated
      const paymentDateFact = testCase.extractedFacts.find(
        (f) => f.category === 'DATE' && f.label.toLowerCase().includes('payment date')
      );
      expect(paymentDateFact).toBeUndefined();

      const findings = detectCrossDocumentContradictions(testCase);
      const dateContradictions = findings.filter((f) => f.title.toLowerCase().includes('date'));
      expect(dateContradictions.length).toBe(0);
    });
  });

  /* =========================================================================
     3. DOCUMENT INGESTION & SECURITY VALIDATION TESTS
     ========================================================================= */

  describe('Document Ingestion Edge Cases & Security Checks', () => {
    it('Rejects empty files (0 bytes) with descriptive error', () => {
      const emptyBuffer = new Uint8Array(0);
      const validation = validateFileSignature(emptyBuffer, 'empty.pdf');

      expect(validation.isValid).toBe(false);
      expect(validation.detectedType).toBe('empty');
      expect(validation.error).toContain('empty');
    });

    it('Detects file disguised with .pdf extension that lacks PDF magic bytes', () => {
      // Plain ASCII text buffer: "Hello world this is not a PDF"
      const fakePdfBuffer = new TextEncoder().encode('Hello world, this is a plain text file pretending to be PDF.');
      const validation = validateFileSignature(fakePdfBuffer, 'fake.pdf');

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Unsupported file format');
    });

    it('Validates authentic PDF magic bytes (%PDF-)', () => {
      const validPdfBuffer = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
      const validation = validateFileSignature(validPdfBuffer, 'valid.pdf');

      expect(validation.isValid).toBe(true);
      expect(validation.detectedType).toBe('application/pdf');
    });

    it('Validates authentic PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)', () => {
      const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
      const validation = validateFileSignature(pngHeader, 'test.png');

      expect(validation.isValid).toBe(true);
      expect(validation.detectedType).toBe('image/png');
    });

    it('Validates authentic JPEG magic bytes (FF D8 FF)', () => {
      const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
      const validation = validateFileSignature(jpegHeader, 'test.jpg');

      expect(validation.isValid).toBe(true);
      expect(validation.detectedType).toBe('image/jpeg');
    });

    it('Validates authentic Word DOCX magic bytes (PK 03 04)', () => {
      const docxHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
      const validation = validateFileSignature(docxHeader, 'contract.docx');

      expect(validation.isValid).toBe(true);
      expect(validation.detectedType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('Rejects oversized file exceeding 20 MB limit', () => {
      const oversizedBuffer = new Uint8Array(21 * 1024 * 1024);
      const validation = validateFileSignature(oversizedBuffer, 'oversized.pdf');

      expect(validation.isValid).toBe(false);
      expect(validation.detectedType).toBe('oversized');
      expect(validation.error).toContain('exceeds 20 MB limit');
    });
  });

  /* =========================================================================
     4. STORAGE ISOLATION & DEMO RESET TESTS
     ========================================================================= */

  describe('Storage Isolation & Demo Case Management', () => {
    it('loadDemonstrationCases loads 3 demo cases without deleting user cases', () => {
      // Create a user case
      const userCase: LegalCase = {
        id: 'case-user-alpha-99',
        title: 'Alpha Corp v. Beta Logistics',
        matterType: 'Commercial Dispute',
        jurisdiction: 'Delhi Commercial Court',
        parties: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        documents: [],
        extractedFacts: [],
        findings: [],
        isDemoCase: false,
      };

      StorageService.saveCase(userCase);

      // Load demo cases
      const demoCases = StorageService.loadDemonstrationCases();
      expect(demoCases.length).toBe(6);

      // Verify all 6 cases loaded
      const allCases = StorageService.getCases();
      expect(allCases.some((c) => c.id === 'case-user-alpha-99')).toBe(true);
      expect(allCases.some((c) => c.id === 'case-demo-001')).toBe(true);
      expect(allCases.some((c) => c.id === 'case-demo-002')).toBe(true);
      expect(allCases.some((c) => c.id === 'case-demo-003')).toBe(true);
      expect(allCases.some((c) => c.id === 'case-demo-004')).toBe(true);
      expect(allCases.some((c) => c.id === 'case-demo-005')).toBe(true);
      expect(allCases.some((c) => c.id === 'case-demo-006')).toBe(true);

      // Verify demo documents loaded into draft studio
      const demoDocs = StorageService.getDocuments().filter((d) => d.isDemoCase);
      expect(demoDocs.length).toBe(6);
      expect(demoDocs.some((d) => d.id === 'doc-demo-draft-001')).toBe(true);
      expect(demoDocs.some((d) => d.id === 'doc-demo-draft-002')).toBe(true);
      expect(demoDocs.some((d) => d.id === 'doc-demo-draft-003')).toBe(true);
      expect(demoDocs.some((d) => d.id === 'doc-demo-draft-004')).toBe(true);
      expect(demoDocs.some((d) => d.id === 'doc-demo-draft-005')).toBe(true);
      expect(demoDocs.some((d) => d.id === 'doc-demo-draft-006')).toBe(true);
      expect(demoDocs.some((d) => d.id === 'doc-demo-draft-003')).toBe(true);

      // Reset demo cases
      StorageService.resetDemonstrationCases();

      // Verify user case is intact, demo cases and demo docs removed
      const postResetCases = StorageService.getCases();
      expect(postResetCases.some((c) => c.id === 'case-user-alpha-99')).toBe(true);
      expect(postResetCases.some((c) => c.id === 'case-demo-001')).toBe(false);
      expect(postResetCases.some((c) => c.id === 'case-demo-002')).toBe(false);
      expect(postResetCases.some((c) => c.id === 'case-demo-003')).toBe(false);

      const postResetDocs = StorageService.getDocuments().filter((d) => d.isDemoCase);
      expect(postResetDocs.length).toBe(0);
    });
  });

  /* =========================================================================
     5. DRAFT STUDIO TEMPLATE COVERAGE TESTS
     ========================================================================= */

  describe('Draft Studio Multi-Dispute Template Coverage', () => {
    it('Generates salary clarification representation for Case 2 with explicit placeholders', () => {
      const draftResult = AIProviderService.generateDeterministicDraft({
        type: 'SALARY_CLARIFICATION_REPRESENTATION',
        jurisdiction: 'India (Employment Law)',
        claimantName: 'Priya Sharma',
        claimantAddress: '14 Sample Residency, Lucknow',
        respondentName: 'Meridian Digital Services Private Limited',
        respondentAddress: '303 Sample Corporate Plaza, Noida',
        principalAmount: 35000,
        noticeDate: '2026-09-08',
        defaultDate: '2026-08-31',
        facts: 'Salary for August unpaid; payroll email states processed on 5 Sept without UTR.',
        tone: 'FORMAL_ASSERTIVE',
      });

      expect(draftResult.content).toContain('FORMAL REPRESENTATION & SALARY DISBURSEMENT CLARIFICATION');
      expect(draftResult.content).toContain('Priya Sharma');
      expect(draftResult.content).toContain('Meridian Digital Services Private Limited');
      expect(draftResult.content).toContain('₹35,000');
      expect(draftResult.content).toContain('Internal payroll processing denotes batch submission and does NOT establish that funds were successfully credited');
      expect(draftResult.content).toContain('[MISSING:');
    });

    it('Generates security deposit reconciliation requisition for Case 3 with explicit placeholders', () => {
      const draftResult = AIProviderService.generateDeterministicDraft({
        type: 'SECURITY_DEPOSIT_RECONCILIATION',
        jurisdiction: 'India (Tenancy Law)',
        claimantName: 'Rahul Verma',
        claimantAddress: 'Flat 4B, Sample Apartments, Lucknow',
        respondentName: 'Greenview Properties',
        respondentAddress: '404 Commercial Complex, Lucknow',
        principalAmount: 30000,
        noticeDate: '2026-09-04',
        defaultDate: '2026-08-31',
        facts: 'Deposit ₹30,000. Handover notes cleaning ₹2,000 and repairs ₹3,000 (net ₹25,000). Landlord says only ₹20,000 returned.',
        tone: 'FORMAL_ASSERTIVE',
      });

      expect(draftResult.content).toContain('FORMAL REQUISITION FOR SECURITY DEPOSIT RECONCILIATION');
      expect(draftResult.content).toContain('Rahul Verma');
      expect(draftResult.content).toContain('Greenview Properties');
      expect(draftResult.content).toContain('₹30,000');
      expect(draftResult.content).toContain('Deep Cleaning Charges: ₹2,000');
      expect(draftResult.content).toContain('Wall Painting / Repair Charges: ₹3,000');
      expect(draftResult.content).toContain('₹30,000 − ₹2,000 − ₹3,000 = ₹25,000');
      expect(draftResult.content).toContain('Unexplained Difference: Recent communication states that only ₹20,000/- will be refunded');
      expect(draftResult.content).toContain('[MISSING:');
    });
  });
});
