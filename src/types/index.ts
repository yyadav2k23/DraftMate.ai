export type FindingCategory =
  | 'CONTRADICTION'
  | 'MISSING_FIELD'
  | 'AMBIGUOUS_LANGUAGE'
  | 'UNSUPPORTED_ASSERTION'
  | 'CITATION_CHECK'
  | 'DRAFTING_QUALITY';

export type FindingSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type FindingStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED' | 'NEEDS_HUMAN_REVIEW';

export type UserReviewStatus = 'UNRESOLVED' | 'CONFIRMED_BY_USER' | 'DISMISSED_BY_USER';

export type DetectionMethod = 'DETERMINISTIC' | 'AI_ASSISTED' | 'MANUAL';

export interface EvidenceExcerpt {
  id: string;
  sourceTitle: string;
  sourceIdentifier: string;
  excerptText: string;
  pageOrField?: string;
  locationReference?: string;
  timestamp?: string;
}

export interface ContradictionDetails {
  recordA: {
    title: string;
    docId?: string;
    filename?: string;
    field: string;
    excerpt: string;
    locationReference?: string;
    date?: string;
  };
  recordB: {
    title: string;
    docId?: string;
    filename?: string;
    field: string;
    excerpt: string;
    locationReference?: string;
    date?: string;
  };
  conflictReason: string;
  confidenceAndLimitations?: string;
  suggestedResolvingEvidence?: string;
  recommendedAction: string;
  nonJudgmentalNotice: string; // "The system identifies the discrepancy but does not determine which record is true. Human verification is required."
  reviewStatus?: UserReviewStatus;
  userNotes?: string;
  reviewedAt?: string;
}

export type CitationVerificationStatus =
  | 'VERIFIED_AGAINST_RETRIEVED_SOURCE'
  | 'SOURCE_FOUND_PROPOSITION_NOT_CONFIRMED'
  | 'NOT_INDEPENDENTLY_VERIFIED'
  | 'SOURCE_UNAVAILABLE'
  // Legacy aliases for backward compatibility with existing tests
  | 'VERIFIED_OFFICIAL_SOURCE'
  | 'LOCAL_DB_MATCH'
  | 'RELEVANCE_NOT_ESTABLISHED'
  | 'SOURCE_DOES_NOT_SUPPORT'
  | 'HUMAN_REVIEW_REQUIRED';

export type LegalSourceCategory =
  | 'CONSTITUTION'
  | 'CENTRAL_ACT'
  | 'DELEGATED_LEGISLATION'
  | 'JUDGMENT'
  | 'PROCEDURAL_CODE'
  | 'SPECIAL_STATUTE';

export interface AttachedLegalSource {
  id: string;
  sourceId: string;
  actTitle: string;
  shortTitle?: string;
  provision: string;
  category: LegalSourceCategory;
  officialSourceUrl: string;
  officialSourceOrganization: string;
  jurisdiction: string;
  relevantPassage: string;
  summaryOfLaw?: string;
  retrievedAt: string;
  publicationOrAmendmentDate?: string;
  supportsProposition: boolean;
  userExplanation?: string;
  verificationStatus: CitationVerificationStatus;
}

export interface CitationRecord {
  id: string;
  title: string;
  provision: string;
  jurisdiction: string;
  officialSourceUrl?: string;
  sourceRetrievalTime?: string;
  relevantSupportingPassage: string;
  isOfficialSource: boolean;
  supportsProposition: boolean;
  verificationStatus: CitationVerificationStatus;
  verificationLimitations: string;
  claimInDocument: string;
  statutoryCategory: 'CONSTITUTION' | 'CENTRAL_ACT' | 'PROCEDURAL_CODE' | 'SPECIAL_STATUTE' | 'CASE_LAW' | 'UNVERIFIED_CLAIM';
  publicationOrAmendmentDate?: string;
  isCurrentLaw?: boolean;
}

export interface Finding {
  id: string;
  caseId?: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  detectionMethod: DetectionMethod;
  confidence: number; // 0 - 100
  confidenceExplanation: string;
  recommendedAction: string;
  status: FindingStatus;
  userReviewStatus?: UserReviewStatus;
  userNotes?: string;
  reviewedAt?: string;
  evidenceExcerpts: EvidenceExcerpt[];
  contradictionDetails?: ContradictionDetails;
  citationDetails?: CitationRecord;
  attachedSource?: AttachedLegalSource;
  attachedSources?: AttachedLegalSource[];
  targetDocumentSection?: string;
  resolutionNote?: string;
}

export interface HealthScoreBreakdown {
  baseScore: number;
  criticalPenalties: number;
  warningPenalties: number;
  infoPenalties: number;
  citationPenalties: number;
  finalScore: number;
  grade: 'EXCELLENT' | 'ADEQUATE' | 'NEEDS_ATTENTION' | 'CRITICAL_RISK';
  summary: string;
  disclaimer: string;
}

export type DocumentType =
  | 'LEGAL_NOTICE_COMMERCIAL_DUES'
  | 'PAYMENT_REMINDER_DEMAND'
  | 'RESPONSE_TO_LEGAL_NOTICE'
  | 'SALARY_CLARIFICATION_REPRESENTATION'
  | 'SECURITY_DEPOSIT_RECONCILIATION'
  | 'CONSUMER_DEFECTIVE_GOODS_COMPLAINT'
  | 'LOAN_REPAYMENT_RECONCILIATION'
  | 'DELIVERY_DISCREPANCY_JOINT_INSPECTION'
  | 'BASIC_AGREEMENT_OUTLINE'
  | 'GENERAL_LEGAL_CORRESPONDENCE'
  | 'CUSTOM';

export interface DocumentParty {
  name: string;
  role: 'CLAIMANT' | 'RESPONDENT' | 'FIRST_PARTY' | 'SECOND_PARTY' | 'COUNSEL' | 'OTHER';
  entityType?: 'INDIVIDUAL' | 'COMPANY' | 'LLP' | 'PROPRIETORSHIP' | 'GOVERNMENT_BODY';
  address?: string;
  contact?: string;
  identifier?: string; // e.g. CIN, LLPIN, PAN, Aadhaar ref
}

export interface SupportingEvidenceItem {
  id: string;
  title: string;
  documentType: string;
  date: string;
  keyStatements: string[];
  fullTextOrSummary: string;
}

/* =========================================================================
   NEW ENHANCED CASE & DOCUMENT PROCESSING MODELS
   ========================================================================= */

export type DocumentProcessingStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'EXTRACTED'
  | 'OCR_APPLIED'
  | 'FAILED'
  | 'OCR_REQUIRED';

export interface DocumentPage {
  pageNumber: number;
  text: string;
  isScanned?: boolean;
}

export interface DocumentParagraph {
  index: number;
  text: string;
  heading?: boolean;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  status: DocumentProcessingStatus;
  extractedText: string;
  pageCount?: number;
  pages?: DocumentPage[];
  paragraphs?: DocumentParagraph[];
  confidence?: number;
  ocrApplied?: boolean;
  ocrEngine?: string;
  ocrConfidence?: number;
  extractionError?: string;
  previewUrl?: string; // Base64 or local object URL
  documentCategory?:
    | 'PRIMARY_DOCUMENT'
    | 'CORRESPONDENCE'
    | 'INVOICE'
    | 'RECEIPT'
    | 'CONTRACT'
    | 'EMAIL'
    | 'IMAGE_EVIDENCE'
    | 'STATEMENT'
    | 'DISPATCH_NOTE'
    | 'TALLY'
    | 'OTHER';
  reviewStatus?: 'UNREVIEWED' | 'CONFIRMED' | 'FLAGGED';
  sourceProvenance?: string;
  isImage?: boolean;
  imageDataUri?: string;
  imageMetadata?: {
    format?: string;
    width?: number;
    height?: number;
    ocrEngine?: string;
    extractionConfidence?: number;
    colorSpace?: string;
    hasExif?: boolean;
    captureTime?: string;
    chainOfCustody?: string;
    resolution?: string;
    inspectionStatus?: string;
    visualObservation?: string;
  };
  securityValidation: {
    isValidSignature: boolean;
    detectedType: string;
    fileSizeOk: boolean;
    sanitized: boolean;
  };
}

export type FactCategory =
  | 'PARTY'
  | 'DATE'
  | 'AMOUNT'
  | 'PAYMENT'
  | 'CLAUSE'
  | 'ALLEGATION'
  | 'SIGNATURE'
  | 'CITATION'
  | 'OTHER';

export type FactExtractionStatus =
  | 'DIRECTLY_STATED'
  | 'INFERRED'
  | 'AMBIGUOUS'
  | 'MISSING';

export type FactReviewStatus =
  | 'UNREVIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CORRECTED';

export interface ExtractedFact {
  id: string;
  caseId: string;
  sourceDocId: string;
  sourceDocName: string;
  category: FactCategory;
  label: string;
  originalText: string; // Concise quotation from the document
  normalizedValue: string | number | boolean;
  locationReference?: string; // e.g., "Page 1, Paragraph 3"
  confidence: number; // 0 - 100
  status: FactExtractionStatus;
  reviewStatus: FactReviewStatus;
  userCorrection?: string;
  userNotes?: string;
  reviewedAt?: string;
}

export interface LegalCase {
  id: string;
  title: string;
  referenceNumber?: string;
  matterType: string; // e.g. "Commercial Dispute", "Contract Breach", "Debt Recovery", "Constitutional / Writ"
  jurisdiction: string; // e.g. "India (Commercial Courts Jurisdiction)", "High Court of Delhi"
  parties: DocumentParty[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'IN_REVIEW' | 'FLAGGED' | 'COMPLETED';
  documents: CaseDocument[];
  extractedFacts: ExtractedFact[];
  findings: Finding[];
  attachedSources?: AttachedLegalSource[];
  isDemoCase?: boolean;
  auditReport?: AuditReport;
}

/* =========================================================================
   LEGACY / DRAFT STUDIO DOCUMENT MODEL (Preserved for compatibility)
   ========================================================================= */

export interface LegalDocument {
  id: string;
  caseId?: string;
  title: string;
  type: DocumentType;
  jurisdiction: string;
  parties: DocumentParty[];
  dates: {
    noticeDate?: string;
    incidentOrDefaultDate?: string;
    agreementDate?: string;
    demandDeadlineDays?: number;
    statutoryOrContractualBasis?: string;
  };
  factsAndChronology: string;
  amounts: {
    principalClaim?: number;
    interestRatePercent?: number;
    currency: string;
    paymentReferences?: string[];
  };
  desiredTone: 'FORMAL_ASSERTIVE' | 'CONCILIATORY' | 'STRICT_STATUTORY' | 'STANDARD_COMMERCIAL';
  supportingEvidence: SupportingEvidenceItem[];
  additionalInstructions: string;
  content: string; // The formatted drafted text with sections
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'AUDITED' | 'FLAGGED' | 'READY_FOR_LEGAL_COUNSEL';
  isDemoCase?: boolean;
}

export interface AuditReport {
  id: string;
  caseId?: string;
  documentId: string;
  documentTitle: string;
  generatedAt: string;
  healthScore: HealthScoreBreakdown;
  findings: Finding[];
  summary: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    resolvedCount: number;
    openCount: number;
  };
  verifiedCitations: CitationRecord[];
  disclaimer: string;
}

export interface VoiceAssistantMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  text: string;
  timestamp: string;
  isAudio?: boolean;
  citationsReferenced?: string[];
}

/* =========================================================================
   PRIVATE TEST-EVALUATION GROUND TRUTH RUBRIC (PART 2)
   ========================================================================= */

export interface TestDocumentGroundTruth {
  documentId: string;
  filename: string;
  explicitlyStatedFacts: string[];
  evidenceNature: 'DIRECT_ASSERTION' | 'SCREENSHOT' | 'PHOTOGRAPH' | 'ITEMISED_STATEMENT' | 'CONTRACTUAL_CLAUSE';
  isDeliberatelyFalseForTesting?: boolean;
  evidentiaryLimitations: string[];
}

export interface TestCaseEvaluationRubric {
  caseId: string;
  caseReferenceNumber: string;
  caseTitle: string;
  matterClassification: string;
  documentsGroundTruth: TestDocumentGroundTruth[];
  deliberateContradictions: {
    description: string;
    conflictingDocuments: [string, string];
    expectedSeverity: FindingSeverity;
  }[];
  missingInformationTokens?: string[];
  missingInformationOrTokens?: string[];
  arithmeticVerification?: {
    formula: string;
    calculatedValue: number;
    discrepantStatedValue?: number;
    unexplainedVariance?: number;
  };
  prohibitedConclusions: string[];
  expectedStatutoryReferences?: string[];
  relevantStatutoryProvisions?: string[];
  expectedReviewOutcome: string;
}

export interface CaseEvaluationResult {
  caseId: string;
  caseTitle: string;
  caseReference?: string;
  evaluatedAt: string;
  passed: boolean;
  score?: number;
  checks: {
    name: string;
    category: 'CONTRADICTION' | 'MISSING_EVIDENCE' | 'PROHIBITED_CONCLUSION' | 'ARITHMETIC' | 'IMAGE_LIMITATION';
    status: 'PASS' | 'FAIL' | 'WARNING';
    detail: string;
  }[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
  contradictionsDetected?: string[];
  expectedContradictions?: string[];
  missingDetailsDetected?: string[];
  expectedMissingDetails?: string[];
  prohibitedConclusionsPassed?: boolean;
  expectedStatutes?: string[];
}
