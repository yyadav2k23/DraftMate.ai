import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';
import { AIProviderService } from '../services/aiProvider';
import {
  getSixFictionalDemoCases,
  getSixFictionalDemoDocuments,
  buildFictionalDemoCase1,
  buildFictionalDemoCase2,
  buildFictionalDemoCase3,
  buildFictionalDemoCase4,
  buildFictionalDemoCase5,
  buildFictionalDemoCase6,
} from '../data/demonstrationCases';
import {
  DEMO_IMG_CASE_1_RECEIPT,
  DEMO_IMG_CASE_2_PAYROLL_NOTIFICATION,
  DEMO_IMG_CASE_3_DEDUCTION_SHEET,
  DEMO_IMG_CASE_4_CRACKED_LAPTOP,
  DEMO_IMG_CASE_4_SELLER_CHAT,
  DEMO_IMG_CASE_5_BANK_TRANSFER,
  DEMO_IMG_CASE_6_DAMAGED_CARTONS,
} from '../data/syntheticEvidenceImages';
import {
  TEST_EVALUATION_RUBRIC,
  runCaseEvaluation,
} from '../data/testEvaluationRubric';
import { LegalCase } from '../types';

describe('DraftMate.ai — Multi-Case Evidence Library & End-to-End Integration Tests', () => {
  beforeEach(() => {
    StorageService.clearAllData();
  });

  /* =========================================================================
     PART 1: SIX DIVERSE DEMONSTRATION CASES AUDIT
     ========================================================================= */

  describe('Six Diverse Demonstration Cases Benchmark', () => {
    it('provides exactly 6 fully populated fictional demonstration cases', () => {
      const demoCases = getSixFictionalDemoCases();
      expect(demoCases.length).toBe(6);

      const refNumbers = demoCases.map((c) => c.referenceNumber);
      expect(refNumbers).toEqual([
        'DM-DEMO-001',
        'DM-DEMO-002',
        'DM-DEMO-003',
        'DM-DEMO-004',
        'DM-DEMO-005',
        'DM-DEMO-006',
      ]);

      // Every case must have the prominent fictional disclaimer
      for (const c of demoCases) {
        expect(c.title).toContain('[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER]');
        expect(c.isDemoCase).toBe(true);
        expect(c.documents.length).toBeGreaterThanOrEqual(2);
        expect(c.extractedFacts.length).toBeGreaterThanOrEqual(3);
        expect(c.findings.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('Case 4 (DM-DEMO-004): Consumer Defective Goods flags cracked screen vs intact POD and image limitation', () => {
      const c4 = buildFictionalDemoCase4();

      expect(c4.referenceNumber).toBe('DM-DEMO-004');
      expect(c4.matterType).toContain('Consumer Dispute');
      expect(c4.parties.some((p) => p.name === 'Ananya Mehta')).toBe(true);
      expect(c4.parties.some((p) => p.name.includes('BrightCart'))).toBe(true);

      // Verify documents include PDF invoice, POD, DOCX chat, PNG chat, and JPG cracked laptop photo
      expect(c4.documents.length).toBe(5);
      const photoDoc = c4.documents.find((d) => d.id === 'doc-demo-c4-laptop-photo');
      expect(photoDoc).toBeDefined();
      expect(photoDoc?.isImage).toBe(true);
      expect(photoDoc?.imageDataUri).toBe(DEMO_IMG_CASE_4_CRACKED_LAPTOP);
      expect(photoDoc?.imageMetadata?.extractionConfidence).toBe(95);

      // Verify facts extracted: ₹60,000, cracked display claim, intact delivery claim
      const invAmtFact = c4.extractedFacts.find((f) => f.normalizedValue === 60000);
      const buyerDefectFact = c4.extractedFacts.find((f) => f.normalizedValue === 'CRACKED_DISPLAY_DEFECT');
      const sellerGoodCondFact = c4.extractedFacts.find((f) => f.normalizedValue === 'DELIVERED_GOOD_CONDITION');

      expect(invAmtFact).toBeDefined();
      expect(buyerDefectFact).toBeDefined();
      expect(sellerGoodCondFact).toBeDefined();

      // Verify cross-document contradiction detected
      const defectFinding = c4.findings.find((f) => f.id.includes('cross-contra-consumer-defect'));
      expect(defectFinding).toBeDefined();
      expect(defectFinding?.severity).toBe('CRITICAL');
      expect(defectFinding?.contradictionDetails).toBeDefined();
      expect(defectFinding?.contradictionDetails?.recordA.excerpt).toMatch(/cracked|broken/i);
      expect(defectFinding?.contradictionDetails?.recordB.excerpt).toMatch(/good condition|intact/i);

      // Verify photographic limitation finding
      const photoLimitationFinding = c4.findings.find((f) => f.id.includes('consumer-photo-limitation'));
      expect(photoLimitationFinding).toBeDefined();
      expect(photoLimitationFinding?.title).toContain('Photograph Proves Physical Damage but Not Causation or Timing');
      expect(photoLimitationFinding?.explanation).toContain('spiderweb fracture');
    });

    it('Case 5 (DM-DEMO-005): Personal Loan Dispute flags ₹30,000 shortfall, unverified cash, and Section 63 BSA certificate', () => {
      const c5 = buildFictionalDemoCase5();

      expect(c5.referenceNumber).toBe('DM-DEMO-005');
      expect(c5.matterType).toContain('Personal Loan');
      expect(c5.parties.some((p) => p.name === 'Arjun Malhotra')).toBe(true);
      expect(c5.parties.some((p) => p.name === 'Karan Sethi')).toBe(true);

      // Verify documents include loan ack PDF, bank transfer PNG, chat DOCX, ledger PDF
      expect(c5.documents.length).toBe(4);
      const upiDoc = c5.documents.find((d) => d.id === 'doc-demo-c5-upi-transfer');
      expect(upiDoc).toBeDefined();
      expect(upiDoc?.isImage).toBe(true);
      expect(upiDoc?.imageDataUri).toBe(DEMO_IMG_CASE_5_BANK_TRANSFER);

      // Verify facts: ₹80,000 acknowledged, ₹50,000 UPI transfer, ₹30,000 cash claim
      const ackFact = c5.extractedFacts.find((f) => f.id.startsWith('fact-loan-ack') && f.normalizedValue === 80000);
      const upiFact = c5.extractedFacts.find((f) => f.id.startsWith('fact-upi-transfer') && f.normalizedValue === 50000);
      const cashFact = c5.extractedFacts.find((f) => f.id.startsWith('fact-cash-claim'));

      expect(ackFact).toBeDefined();
      expect(upiFact).toBeDefined();
      expect(cashFact).toBeDefined();

      // Verify disbursement shortfall contradiction
      const shortfallFinding = c5.findings.find((f) => f.id.includes('cross-contra-loan-disbursement'));
      expect(shortfallFinding).toBeDefined();
      expect(shortfallFinding?.severity).toBe('CRITICAL');
      expect(shortfallFinding?.title).toContain('Shortfall');
      expect(shortfallFinding?.explanation).toContain('80,000');
      expect(shortfallFinding?.explanation).toContain('50,000');

      // Verify unverified cash finding
      const cashFinding = c5.findings.find((f) => f.id.includes('loan-unverified-cash'));
      expect(cashFinding).toBeDefined();
      expect(cashFinding?.severity).toBe('WARNING');
      expect(cashFinding?.explanation).toContain('uncorroborated by banking records');

      // Verify Section 63 BSA 2023 / Section 65B certificate finding
      const bsaFinding = c5.findings.find((f) => f.id.includes('loan-digital-evidence-bsa'));
      expect(bsaFinding).toBeDefined();
      expect(bsaFinding?.title).toContain('Section 63 BSA 2023');
    });

    it('Case 6 (DM-DEMO-006): Goods Delivery Discrepancy flags 10-unit shortfall, carton vs component damage, and missing carrier LR', () => {
      const c6 = buildFictionalDemoCase6();

      expect(c6.referenceNumber).toBe('DM-DEMO-006');
      expect(c6.matterType).toContain('Sale of Goods');
      expect(c6.parties.some((p) => p.name === 'Silverline Components')).toBe(true);
      expect(c6.parties.some((p) => p.name.includes('Dev Industrial'))).toBe(true);

      // Verify documents: PO PDF, Dispatch PDF, GRN DOCX, Dock Photo JPG, Requisition PDF
      expect(c6.documents.length).toBe(5);
      const dockPhoto = c6.documents.find((d) => d.id === 'doc-demo-c6-photo');
      expect(dockPhoto).toBeDefined();
      expect(dockPhoto?.isImage).toBe(true);
      expect(dockPhoto?.imageDataUri).toBe(DEMO_IMG_CASE_6_DAMAGED_CARTONS);

      // Verify facts: 100 dispatched, 90 received into GRN, damaged outer cartons
      const dispatchQtyFact = c6.extractedFacts.find((f) => f.id.startsWith('fact-qty-dispatch') && f.normalizedValue === 100);
      const grnQtyFact = c6.extractedFacts.find((f) => f.id.startsWith('fact-qty-grn') && f.normalizedValue === 90);
      const packDamageFact = c6.extractedFacts.find((f) => f.normalizedValue === 'DAMAGED_OUTER_CARTONS');

      expect(dispatchQtyFact).toBeDefined();
      expect(grnQtyFact).toBeDefined();
      expect(packDamageFact).toBeDefined();

      // Verify 10-unit delivery shortfall contradiction
      const qtyFinding = c6.findings.find((f) => f.id.includes('cross-contra-logistics-quantity'));
      expect(qtyFinding).toBeDefined();
      expect(qtyFinding?.severity).toBe('CRITICAL');
      expect(qtyFinding?.title).toContain('Shortfall: Dispatched 100 Units vs Received 90 Units');

      // Verify packaging vs internal component distinction
      const packFinding = c6.findings.find((f) => f.id.includes('logistics-outer-vs-internal-damage'));
      expect(packFinding).toBeDefined();
      expect(packFinding?.explanation).toMatch(/external packaging distress does not establish functional destruction/i);

      // Verify missing carrier records finding
      const carrierFinding = c6.findings.find((f) => f.id.includes('logistics-missing-carrier-records'));
      expect(carrierFinding).toBeDefined();
      expect(carrierFinding?.title).toContain('Missing Carrier Records: Lorry Receipt (LR)');
    });
  });

  /* =========================================================================
     PART 2: PRIVATE TEST-EVALUATION RUBRIC AUDIT
     ========================================================================= */

  describe('Ground-Truth Rubric Runner & Prohibited Conclusions Check', () => {
    it('contains ground truth definitions for all 6 cases', () => {
      expect(Object.keys(TEST_EVALUATION_RUBRIC).length).toBeGreaterThanOrEqual(6);
      expect(TEST_EVALUATION_RUBRIC['DEMO-COM-001']).toBeDefined();
      expect(TEST_EVALUATION_RUBRIC['DEMO-EMP-002']).toBeDefined();
      expect(TEST_EVALUATION_RUBRIC['DEMO-RENT-003']).toBeDefined();
      expect(TEST_EVALUATION_RUBRIC['DEMO-CON-004']).toBeDefined();
      expect(TEST_EVALUATION_RUBRIC['DEMO-LOAN-005']).toBeDefined();
      expect(TEST_EVALUATION_RUBRIC['DEMO-LOG-006']).toBeDefined();
    });

    it('evaluates all 6 cases successfully with >= 90% score and 0 prohibited conclusions', () => {
      const demoCases = getSixFictionalDemoCases();

      for (const c of demoCases) {
        const evalResult = runCaseEvaluation(c);
        expect(evalResult.passed).toBe(true);
        expect(evalResult.score).toBeGreaterThanOrEqual(90);
        expect(evalResult.prohibitedConclusionsPassed).toBe(true);
        expect(evalResult.contradictionsDetected?.length).toBeGreaterThanOrEqual(1);

        // Verify no findings contain accusatory language
        for (const finding of c.findings) {
          const lowerText = (finding.title + ' ' + finding.explanation).toLowerCase();
          expect(lowerText).not.toContain('guilty of fraud');
          expect(lowerText).not.toContain('committed theft');
          expect(lowerText).not.toContain('deliberately forged');
          expect(lowerText).not.toContain('guilty of perjury');
        }
      }
    });
  });

  /* =========================================================================
     PART 3: SYNTHETIC EVIDENCE IMAGES AUDIT
     ========================================================================= */

  describe('Synthetic Evidence Images & Watermark Integrity', () => {
    it('ensures all 7 synthetic evidence images have valid SVG data URIs and watermarks', () => {
      const images = [
        { name: 'Case 1 Receipt', uri: DEMO_IMG_CASE_1_RECEIPT },
        { name: 'Case 2 Payroll Notification', uri: DEMO_IMG_CASE_2_PAYROLL_NOTIFICATION },
        { name: 'Case 3 Deduction Sheet', uri: DEMO_IMG_CASE_3_DEDUCTION_SHEET },
        { name: 'Case 4 Cracked Laptop', uri: DEMO_IMG_CASE_4_CRACKED_LAPTOP },
        { name: 'Case 4 Seller Chat', uri: DEMO_IMG_CASE_4_SELLER_CHAT },
        { name: 'Case 5 Bank Transfer', uri: DEMO_IMG_CASE_5_BANK_TRANSFER },
        { name: 'Case 6 Damaged Cartons', uri: DEMO_IMG_CASE_6_DAMAGED_CARTONS },
      ];

      for (const img of images) {
        expect(img.uri.startsWith('data:image/svg+xml;utf8,')).toBe(true);
        expect(decodeURIComponent(img.uri)).toContain('FICTIONAL DEMO EVIDENCE');
        expect(img.uri.length).toBeGreaterThan(500);
      }
    });
  });

  /* =========================================================================
     PART 4: STORAGE ISOLATION & DEMO RESET AUDIT
     ========================================================================= */

  describe('Storage Isolation & Multi-Case Loading', () => {
    it('loads all 6 demo cases and 6 draft documents while preserving client cases', () => {
      // Seed a client case
      const userCase: LegalCase = {
        id: 'case-client-actual-42',
        title: 'Actual Client Proprietary Matter v. Supplier Co',
        referenceNumber: 'CLIENT-2026-042',
        matterType: 'Commercial Dispute',
        jurisdiction: 'New Delhi Commercial Court',
        parties: [
          { name: 'Actual Client', role: 'CLAIMANT', entityType: 'COMPANY' },
          { name: 'Supplier Co', role: 'RESPONDENT', entityType: 'COMPANY' },
        ],
        summary: 'Proprietary matter of actual user.',
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: '2026-10-01T10:00:00Z',
        status: 'ACTIVE',
        documents: [],
        extractedFacts: [],
        findings: [],
        isDemoCase: false,
      };

      StorageService.saveCase(userCase);

      // Load 6 demo cases
      const loadedDemos = StorageService.loadDemonstrationCases();
      expect(loadedDemos.length).toBe(6);

      // Verify all cases in storage: 1 client case + 6 demo cases = 7 cases
      const allCases = StorageService.getCases();
      expect(allCases.length).toBe(7);
      expect(allCases.some((c) => c.id === 'case-client-actual-42')).toBe(true);

      // Verify 6 draft documents loaded into Draft Studio
      const allDrafts = StorageService.getDocuments();
      expect(allDrafts.length).toBe(6);
      expect(allDrafts.every((d) => d.isDemoCase)).toBe(true);

      // Reset demo cases
      StorageService.resetDemonstrationCases();

      // Only client case remains
      const afterResetCases = StorageService.getCases();
      expect(afterResetCases.length).toBe(1);
      expect(afterResetCases[0].id).toBe('case-client-actual-42');

      // Demo drafts cleared
      const afterResetDrafts = StorageService.getDocuments();
      expect(afterResetDrafts.length).toBe(0);
    });
  });

  /* =========================================================================
     PART 5: MULTI-TEMPLATE DRAFT GENERATION COVERAGE
     ========================================================================= */

  describe('Multi-Template Draft Studio Coverage (All 6 Templates)', () => {
    it('generates Consumer Defective Goods Complaint with CPA 2019 reference and missing placeholders', async () => {
      const draft = await AIProviderService.generateDraft({
        type: 'CONSUMER_DEFECTIVE_GOODS_COMPLAINT',
        jurisdiction: 'India (Consumer Forum, New Delhi)',
        tone: 'FORMAL_ASSERTIVE',
        claimantName: 'Ananya Mehta',
        claimantAddress: 'Saket, New Delhi',
        respondentName: 'BrightCart Electronics Private Limited',
        respondentAddress: 'Okhla, New Delhi',
        principalAmount: 60000,
        facts: 'Purchased UltraBook Pro 15. Delivered with cracked display.',
      });

      expect(draft.content).toContain('CONSUMER PROTECTION ACT, 2019');
      expect(draft.content).toContain('SECTION 35');
      expect(draft.content).toContain('Ananya Mehta');
      expect(draft.content).toContain('BrightCart Electronics');
      expect(draft.content).toContain('₹60,000');
      expect(draft.content).toContain('[MISSING: Order Ref]');
      expect(draft.missingPlaceholdersIdentified.length).toBeGreaterThanOrEqual(1);
    });

    it('generates Loan Repayment Demand with BSA 2023 Section 63 reservation and missing placeholders', async () => {
      const draft = await AIProviderService.generateDraft({
        type: 'LOAN_REPAYMENT_RECONCILIATION',
        jurisdiction: 'India (Gurugram, Haryana)',
        tone: 'FORMAL_ASSERTIVE',
        claimantName: 'Arjun Malhotra',
        claimantAddress: 'Gurugram, Haryana',
        respondentName: 'Karan Sethi',
        respondentAddress: 'Greater Kailash, New Delhi',
        principalAmount: 50000,
        facts: 'Loan accommodation granted. ₹50,000 via UPI. Balance cash unverified.',
      });

      expect(draft.content).toContain('Bharatiya Sakshya Adhiniyam, 2023');
      expect(draft.content).toContain('Section 63');
      expect(draft.content).toContain('Arjun Malhotra');
      expect(draft.content).toContain('Karan Sethi');
      expect(draft.content).toContain('₹50,000');
      expect(draft.content).toContain('[MISSING: Lender Bank Name]');
    });

    it('generates Delivery Discrepancy Requisition with Sale of Goods Act reference and missing placeholders', async () => {
      const draft = await AIProviderService.generateDraft({
        type: 'DELIVERY_DISCREPANCY_JOINT_INSPECTION',
        jurisdiction: 'India (Pune, Maharashtra)',
        tone: 'FORMAL_ASSERTIVE',
        claimantName: 'Silverline Components',
        claimantAddress: 'Pune, Maharashtra',
        respondentName: 'Dev Industrial Services Private Limited',
        respondentAddress: 'Ahmedabad, Gujarat',
        principalAmount: 120000,
        facts: 'Dispatched 100 units under SO-2066. Consignee GRN reports 90 units.',
      });

      expect(draft.content).toContain('SALE OF GOODS ACT, 1930');
      expect(draft.content).toContain('SECTIONS 37 & 42');
      expect(draft.content).toContain('Silverline Components');
      expect(draft.content).toContain('Dev Industrial Services');
      expect(draft.content).toContain('₹1,20,000');
      expect(draft.content).toContain('[MISSING: PO Number]');
    });
  });
});
