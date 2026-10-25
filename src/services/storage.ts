import { AttachedLegalSource, AuditReport, CaseDocument, ExtractedFact, Finding, LegalCase, LegalDocument } from '../types';
import { LegalSourceRegistryItem } from '../data/legalSourcesData';
import { SAMPLE_DOCUMENTS } from './demoCase';
import {
  getSixFictionalDemoCases,
  getSixFictionalDemoDocuments,
  getThreeFictionalDemoCases,
  getThreeFictionalDemoDocuments,
} from '../data/demonstrationCases';

const STORAGE_KEYS = {
  CASES: 'draftmate_cases_v2',
  ACTIVE_CASE_ID: 'draftmate_active_case_id_v2',
  DOCUMENTS: 'draftmate_documents_v2',
  AUDITS: 'draftmate_audits_v2',
  SETTINGS: 'draftmate_settings_v2',
  IMPORTED_SOURCES: 'draftmate_imported_sources_v1',
};

export interface AppSettings {
  apiKey?: string;
  aiProvider: 'offline_deterministic' | 'gemini' | 'openai';
  enableVoiceSynthesis: boolean;
  userRole: 'legal_engineer' | 'advocate' | 'corporate_counsel' | 'student';
}

const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'offline_deterministic',
  enableVoiceSynthesis: true,
  userRole: 'student',
};

// In-memory fallback map for non-browser / test environments
const memoryStore = new Map<string, string>();

function safeGet(key: string): string | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) || null;
    }
  }
  return memoryStore.get(key) || null;
}

function safeSet(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {}
  }
  memoryStore.set(key, value);
}

export class StorageService {
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Clean initial state for new users:
    // Do NOT automatically seed Aster vs Northstar or fake records!
    // A first-time user sees an empty dashboard.
    const existingCases = safeGet(STORAGE_KEYS.CASES);
    if (!existingCases) {
      safeSet(STORAGE_KEYS.CASES, JSON.stringify([]));
    }

    const existingDocs = safeGet(STORAGE_KEYS.DOCUMENTS);
    if (!existingDocs) {
      safeSet(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    }
  }

  /* =========================================================================
     CASE MANAGEMENT
     ========================================================================= */

  public static getCases(): LegalCase[] {
    try {
      const raw = safeGet(STORAGE_KEYS.CASES);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static getCaseById(id: string): LegalCase | undefined {
    const cases = this.getCases();
    return cases.find((c) => c.id === id);
  }

  public static saveCase(c: LegalCase): void {
    const cases = this.getCases();
    const index = cases.findIndex((item) => item.id === c.id);
    const updated = {
      ...c,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      cases[index] = updated;
    } else {
      cases.unshift(updated);
    }

    try {
      safeSet(STORAGE_KEYS.CASES, JSON.stringify(cases));
      this.setActiveCaseId(c.id);
    } catch (e) {
      console.error('Failed to save case to storage', e);
    }
  }

  public static deleteCase(id: string): void {
    const cases = this.getCases().filter((c) => c.id !== id);
    try {
      safeSet(STORAGE_KEYS.CASES, JSON.stringify(cases));
      if (this.getActiveCaseId() === id) {
        const next = cases.length > 0 ? cases[0].id : '';
        this.setActiveCaseId(next);
      }
    } catch (e) {
      console.error('Failed to delete case', e);
    }
  }

  public static getActiveCaseId(): string | null {
    return safeGet(STORAGE_KEYS.ACTIVE_CASE_ID);
  }

  public static setActiveCaseId(id: string): void {
    safeSet(STORAGE_KEYS.ACTIVE_CASE_ID, id);
  }

  public static getUserCases(): LegalCase[] {
    return this.getCases().filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-'));
  }

  public static getDemoCases(): LegalCase[] {
    return this.getCases().filter((c) => c.isDemoCase || c.id.startsWith('case-demo-'));
  }

  public static hasDemoCasesLoaded(): boolean {
    return this.getCases().some((c) => c.isDemoCase || c.id.startsWith('case-demo-'));
  }

  public static loadDemonstrationCases(): LegalCase[] {
    const demoCases = getSixFictionalDemoCases();
    const existing = this.getCases().filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-'));
    const combined = [...demoCases, ...existing];
    try {
      safeSet(STORAGE_KEYS.CASES, JSON.stringify(combined));
      this.setActiveCaseId(demoCases[0].id);

      // Also seed demonstration documents for Draft Studio
      const demoDocs = getSixFictionalDemoDocuments();
      const existingDocs = this.getDocuments().filter((d) => !d.isDemoCase && !d.id.startsWith('doc-demo-'));
      safeSet(STORAGE_KEYS.DOCUMENTS, JSON.stringify([...demoDocs, ...existingDocs]));
    } catch (e) {
      console.error('Failed to load demo cases', e);
    }
    return demoCases;
  }

  public static resetDemonstrationCases(): void {
    const userOnly = this.getCases().filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-'));
    try {
      safeSet(STORAGE_KEYS.CASES, JSON.stringify(userOnly));
      const activeId = this.getActiveCaseId();
      if (activeId && (activeId.startsWith('case-demo-') || activeId.includes('demo'))) {
        const nextId = userOnly.length > 0 ? userOnly[0].id : '';
        this.setActiveCaseId(nextId);
      }

      // Also reset demonstration documents
      const userDocsOnly = this.getDocuments().filter((d) => !d.isDemoCase && !d.id.startsWith('doc-demo-'));
      safeSet(STORAGE_KEYS.DOCUMENTS, JSON.stringify(userDocsOnly));
    } catch (e) {
      console.error('Failed to reset demo cases', e);
    }
  }

  public static addDocumentToCase(caseId: string, doc: CaseDocument): void {
    const legalCase = this.getCaseById(caseId);
    if (!legalCase) return;

    const existingIndex = legalCase.documents.findIndex((d) => d.id === doc.id);
    if (existingIndex >= 0) {
      legalCase.documents[existingIndex] = doc;
    } else {
      legalCase.documents.push(doc);
    }

    this.saveCase(legalCase);
  }

  public static removeDocumentFromCase(caseId: string, docId: string): void {
    const legalCase = this.getCaseById(caseId);
    if (!legalCase) return;

    legalCase.documents = legalCase.documents.filter((d) => d.id !== docId);
    // Also remove associated facts
    legalCase.extractedFacts = legalCase.extractedFacts.filter((f) => f.sourceDocId !== docId);

    this.saveCase(legalCase);
  }

  public static updateFact(caseId: string, factId: string, updates: Partial<ExtractedFact>): void {
    const legalCase = this.getCaseById(caseId);
    if (!legalCase) return;

    const factIndex = legalCase.extractedFacts.findIndex((f) => f.id === factId);
    if (factIndex >= 0) {
      legalCase.extractedFacts[factIndex] = {
        ...legalCase.extractedFacts[factIndex],
        ...updates,
        reviewedAt: new Date().toISOString(),
      };
      this.saveCase(legalCase);
    }
  }

  public static updateFindingReview(
    caseId: string,
    findingId: string,
    reviewStatus: Finding['userReviewStatus'],
    userNotes?: string
  ): void {
    const legalCase = this.getCaseById(caseId);
    if (!legalCase) return;

    const findingIndex = legalCase.findings.findIndex((f) => f.id === findingId);
    if (findingIndex >= 0) {
      legalCase.findings[findingIndex].userReviewStatus = reviewStatus;
      if (userNotes !== undefined) {
        legalCase.findings[findingIndex].userNotes = userNotes;
      }
      legalCase.findings[findingIndex].reviewedAt = new Date().toISOString();

      if (legalCase.findings[findingIndex].contradictionDetails) {
        legalCase.findings[findingIndex].contradictionDetails!.reviewStatus = reviewStatus;
        if (userNotes !== undefined) {
          legalCase.findings[findingIndex].contradictionDetails!.userNotes = userNotes;
        }
        legalCase.findings[findingIndex].contradictionDetails!.reviewedAt = new Date().toISOString();
      }

      this.saveCase(legalCase);
    }
  }

  /* =========================================================================
     OFFICIAL LEGAL SOURCES & ATTACHMENT PERSISTENCE
     ========================================================================= */

  public static getImportedSources(): LegalSourceRegistryItem[] {
    try {
      const raw = safeGet(STORAGE_KEYS.IMPORTED_SOURCES);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static saveImportedSource(source: LegalSourceRegistryItem): void {
    const sources = this.getImportedSources();
    const index = sources.findIndex((s) => s.id === source.id);
    if (index >= 0) {
      sources[index] = source;
    } else {
      sources.unshift(source);
    }
    safeSet(STORAGE_KEYS.IMPORTED_SOURCES, JSON.stringify(sources));
  }

  public static deleteImportedSource(id: string): void {
    const sources = this.getImportedSources().filter((s) => s.id !== id);
    safeSet(STORAGE_KEYS.IMPORTED_SOURCES, JSON.stringify(sources));
  }

  public static attachSourceToFinding(
    caseId: string,
    findingId: string,
    attached: AttachedLegalSource
  ): LegalCase | null {
    const legalCase = this.getCaseById(caseId);
    if (!legalCase) return null;

    if (!legalCase.findings) {
      legalCase.findings = [];
    }

    const finding = legalCase.findings.find((f) => f.id === findingId);
    if (finding) {
      finding.attachedSource = attached;
      if (!finding.attachedSources) {
        finding.attachedSources = [];
      }
      finding.attachedSources = finding.attachedSources.filter((s) => s.id !== attached.id);
      finding.attachedSources.push(attached);

      // Reflect in userReviewStatus and resolution note
      if (attached.verificationStatus === 'SOURCE_FOUND_PROPOSITION_NOT_CONFIRMED') {
        finding.severity = 'CRITICAL';
        finding.userReviewStatus = 'UNRESOLVED';
        finding.resolutionNote = `Verified discrepancy: Source found (${attached.provision}), but claim was NOT confirmed by the retrieved statutory text.`;
      } else if (attached.verificationStatus === 'VERIFIED_AGAINST_RETRIEVED_SOURCE') {
        finding.userReviewStatus = 'CONFIRMED_BY_USER';
        finding.resolutionNote = `Verified against authentic source (${attached.provision}).`;
      }
    }

    if (!legalCase.attachedSources) {
      legalCase.attachedSources = [];
    }
    legalCase.attachedSources = legalCase.attachedSources.filter((s) => s.id !== attached.id);
    legalCase.attachedSources.push(attached);

    this.saveCase(legalCase);
    return legalCase;
  }

  /* =========================================================================
     LEGACY DRAFT STUDIO DOCUMENT PERSISTENCE (Preserved for compatibility)
     ========================================================================= */

  public static getDocuments(): LegalDocument[] {
    try {
      const raw = safeGet(STORAGE_KEYS.DOCUMENTS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static getDocumentById(id: string): LegalDocument | undefined {
    const docs = this.getDocuments();
    return docs.find((d) => d.id === id);
  }

  public static saveDocument(doc: LegalDocument): void {
    const docs = this.getDocuments();
    const index = docs.findIndex((d) => d.id === doc.id);
    const updatedDoc = {
      ...doc,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      docs[index] = updatedDoc;
    } else {
      docs.unshift(updatedDoc);
    }

    try {
      safeSet(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save document to storage', e);
    }
  }

  public static deleteDocument(id: string): void {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    try {
      safeSet(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      this.deleteAudit(id);
    } catch (e) {
      console.error('Failed to delete document', e);
    }
  }

  public static duplicateDocument(id: string): LegalDocument | null {
    const doc = this.getDocumentById(id);
    if (!doc) return null;

    const copy: LegalDocument = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${doc.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'DRAFT',
      isDemoCase: false,
    };

    this.saveDocument(copy);
    return copy;
  }

  public static getAuditReport(docId: string): AuditReport | null {
    try {
      const raw = safeGet(STORAGE_KEYS.AUDITS);
      if (!raw) return null;
      const audits: Record<string, AuditReport> = JSON.parse(raw);
      return audits[docId] || null;
    } catch {
      return null;
    }
  }

  public static saveAuditReport(report: AuditReport): void {
    try {
      const raw = safeGet(STORAGE_KEYS.AUDITS);
      const audits: Record<string, AuditReport> = raw ? JSON.parse(raw) : {};
      audits[report.documentId] = report;
      safeSet(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
    } catch (e) {
      console.error('Failed to save audit report', e);
    }
  }

  public static deleteAudit(docId: string): void {
    try {
      const raw = safeGet(STORAGE_KEYS.AUDITS);
      if (!raw) return;
      const audits: Record<string, AuditReport> = JSON.parse(raw);
      delete audits[docId];
      safeSet(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
    } catch (e) {
      console.error('Failed to delete audit', e);
    }
  }

  public static getSettings(): AppSettings {
    try {
      const raw = safeGet(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: Partial<AppSettings>): void {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      safeSet(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  public static clearAllData(): void {
    try {
      safeSet(STORAGE_KEYS.CASES, JSON.stringify([]));
      safeSet(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
      safeSet(STORAGE_KEYS.AUDITS, JSON.stringify({}));
      safeSet(STORAGE_KEYS.ACTIVE_CASE_ID, '');
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  }
}
