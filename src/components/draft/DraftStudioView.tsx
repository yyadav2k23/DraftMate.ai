import React, { useState, useEffect } from 'react';
import { AIProviderService } from '../../services/aiProvider';
import { StorageService } from '../../services/storage';
import { DocumentType, LegalDocument } from '../../types';
import {
  FileEdit,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Eye,
  Download,
} from 'lucide-react';

interface DraftStudioViewProps {
  initialDocumentId?: string;
  onNavigateToVerify: (docId: string) => void;
  onOpenExportModal: () => void;
}

export const DraftStudioView: React.FC<DraftStudioViewProps> = ({
  initialDocumentId,
  onNavigateToVerify,
  onOpenExportModal,
}) => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('LEGAL_NOTICE_COMMERCIAL_DUES');
  const [jurisdiction, setJurisdiction] = useState('India (Commercial Courts Jurisdiction)');
  const [claimantName, setClaimantName] = useState('');
  const [claimantAddress, setClaimantAddress] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [respondentAddress, setRespondentAddress] = useState('');
  const [principalAmount, setPrincipalAmount] = useState<number>(1450000);
  const [interestRate, setInterestRate] = useState<number>(18);
  const [noticeDate, setNoticeDate] = useState('2026-10-18');
  const [defaultDate, setDefaultDate] = useState('2026-08-15');
  const [tone, setTone] = useState<'FORMAL_ASSERTIVE' | 'CONCILIATORY' | 'STRICT_STATUTORY' | 'STANDARD_COMMERCIAL'>('FORMAL_ASSERTIVE');
  const [facts, setFacts] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationEngine, setGenerationEngine] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    const docs = StorageService.getDocuments();
    setDocuments(docs);
    if (initialDocumentId && docs.some((d) => d.id === initialDocumentId)) {
      loadDoc(initialDocumentId);
    } else if (docs.length > 0) {
      loadDoc(docs[0].id);
    }
  }, [initialDocumentId]);

  const loadDoc = (id: string) => {
    const d = StorageService.getDocumentById(id);
    if (!d) return;
    setSelectedDocId(d.id);
    setDocTitle(d.title);
    setDocType(d.type);
    setJurisdiction(d.jurisdiction);
    const claimant = d.parties.find((p) => p.role === 'CLAIMANT' || p.role === 'FIRST_PARTY');
    const respondent = d.parties.find((p) => p.role === 'RESPONDENT' || p.role === 'SECOND_PARTY');
    setClaimantName(claimant?.name || '');
    setClaimantAddress(claimant?.address || '');
    setRespondentName(respondent?.name || '');
    setRespondentAddress(respondent?.address || '');
    setPrincipalAmount(d.amounts.principalClaim || 0);
    setInterestRate(d.amounts.interestRatePercent || 0);
    setNoticeDate(d.dates.noticeDate || '2026-10-18');
    setDefaultDate(d.dates.incidentOrDefaultDate || '2026-08-15');
    setTone(d.desiredTone);
    setFacts(d.factsAndChronology);
    setContent(d.content);
    setHasUnsavedChanges(false);
  };

  const handleSave = () => {
    if (!selectedDocId) return;
    const current = StorageService.getDocumentById(selectedDocId);
    if (!current) return;

    const updated: LegalDocument = {
      ...current,
      title: docTitle,
      type: docType,
      jurisdiction,
      parties: [
        {
          name: claimantName,
          role: 'CLAIMANT',
          entityType: 'COMPANY',
          address: claimantAddress,
        },
        {
          name: respondentName,
          role: 'RESPONDENT',
          entityType: 'COMPANY',
          address: respondentAddress,
        },
      ],
      amounts: {
        ...current.amounts,
        principalClaim: principalAmount,
        interestRatePercent: interestRate,
      },
      dates: {
        ...current.dates,
        noticeDate,
        incidentOrDefaultDate: defaultDate,
      },
      desiredTone: tone,
      factsAndChronology: facts,
      content,
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveDocument(updated);
    setDocuments(StorageService.getDocuments());
    setHasUnsavedChanges(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await AIProviderService.generateDraft({
        type: docType,
        jurisdiction,
        claimantName,
        claimantAddress,
        respondentName,
        respondentAddress,
        principalAmount,
        interestRate,
        noticeDate,
        defaultDate,
        facts,
        tone,
      });

      setContent(result.content);
      setGenerationEngine(result.modelName);
      setHasUnsavedChanges(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveClarity = () => {
    const updated = AIProviderService.improveClarity(content);
    setContent(updated);
    setHasUnsavedChanges(true);
  };

  const handleSimplifyLegalese = () => {
    const updated = AIProviderService.simplifyLanguage(content);
    setContent(updated);
    setHasUnsavedChanges(true);
  };

  const handleIdentifyMissing = () => {
    const placeholders: string[] = [];
    if (!claimantName) placeholders.push('Claimant Legal Name');
    if (!claimantAddress) placeholders.push('Claimant Address');
    if (!respondentName) placeholders.push('Respondent Legal Name');
    if (!respondentAddress) placeholders.push('Respondent Service Address');
    if (!principalAmount) placeholders.push('Principal Debt Amount');

    let newContent = content;
    if (placeholders.length > 0) {
      alert(`Identified missing essentials: ${placeholders.join(', ')}. Populating placeholders.`);
    } else {
      alert('All major structured fields are populated. Check document body for custom placeholders.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Studio Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Guided Drafting Studio
            </span>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-500/40">
                Unsaved Changes
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Draft Studio
          </h1>
          <p className="text-xs text-slate-400">
            Guided Indian legal document drafting with structured sections and placeholder safeguarding.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDocId}
            onChange={(e) => loadDoc(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {documents.filter((d) => !d.isDemoCase && !d.id.startsWith('doc-demo-')).length > 0 && (
              <optgroup label="User Drafts">
                {documents
                  .filter((d) => !d.isDemoCase && !d.id.startsWith('doc-demo-'))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
              </optgroup>
            )}
            {documents.filter((d) => d.isDemoCase || d.id.startsWith('doc-demo-')).length > 0 && (
              <optgroup label="Demonstration Drafts [FICTIONAL]">
                {documents
                  .filter((d) => d.isDemoCase || d.id.startsWith('doc-demo-'))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      [DEMO] {d.title.replace(/^\[FICTIONAL TEST CASE\]\s*/i, '')}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          <button
            onClick={() => onNavigateToVerify(selectedDocId)}
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit in Verify Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Document draft saved successfully to local storage.
        </div>
      )}

      {/* Prominent Demo Warning Banner */}
      {documents.find((d) => d.id === selectedDocId)?.isDemoCase && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-900/80 border border-amber-500/40 text-amber-200">
                  DEMONSTRATION BENCHMARK DRAFT
                </span>
              </div>
              <p className="text-amber-200/80 text-[11px] mt-0.5">
                This drafting template contains synthetic parties and dispute narratives. Explicit placeholders like [MISSING: ...] are intentionally highlighted to ensure human counsel review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Guided Drafting Form (5 Columns) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              1. Document Metadata & Parties
            </h3>

            {/* Document Title */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => {
                  setDocTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Document Type Selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Document Template Type</label>
              <select
                value={docType}
                onChange={(e) => {
                  setDocType(e.target.value as DocumentType);
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="LEGAL_NOTICE_COMMERCIAL_DUES">Legal Notice for Commercial Invoice Dues (Commercial)</option>
                <option value="SALARY_CLARIFICATION_REPRESENTATION">Representation for Salary Clarification & Disbursement (Employment)</option>
                <option value="SECURITY_DEPOSIT_RECONCILIATION">Requisition for Security Deposit Reconciliation (Tenancy)</option>
                <option value="CONSUMER_DEFECTIVE_GOODS_COMPLAINT">Consumer Notice for Defective Goods & Transit Damage (CPA 2019)</option>
                <option value="LOAN_REPAYMENT_RECONCILIATION">Demand for Loan Repayment & Electronic Reconciliation (Civil / BSA 2023)</option>
                <option value="DELIVERY_DISCREPANCY_JOINT_INSPECTION">Requisition for Joint Survey & Delivery Discrepancy (Sale of Goods Act)</option>
                <option value="PAYMENT_REMINDER_DEMAND">Payment Reminder & Formal Demand Letter</option>
                <option value="RESPONSE_TO_LEGAL_NOTICE">Response / Reply to Legal Notice</option>
                <option value="BASIC_AGREEMENT_OUTLINE">Basic Agreement Outline</option>
                <option value="GENERAL_LEGAL_CORRESPONDENCE">General Formal Legal Correspondence</option>
              </select>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Claimant / Sender</label>
                <input
                  type="text"
                  value={claimantName}
                  placeholder="e.g. Aster Supplies Pvt Ltd"
                  onChange={(e) => {
                    setClaimantName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Respondent / Addressee</label>
                <input
                  type="text"
                  value={respondentName}
                  placeholder="e.g. Northstar Retail Logistics Ltd"
                  onChange={(e) => {
                    setRespondentName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Claimant Registered Address</label>
                <input
                  type="text"
                  value={claimantAddress}
                  placeholder="Full registered office address"
                  onChange={(e) => {
                    setClaimantAddress(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Respondent Postal Address</label>
                <input
                  type="text"
                  value={respondentAddress}
                  placeholder="Full postal address for registered service"
                  onChange={(e) => {
                    setRespondentAddress(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Financials & Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Principal Amount (₹)</label>
                <input
                  type="number"
                  value={principalAmount}
                  onChange={(e) => {
                    setPrincipalAmount(parseFloat(e.target.value) || 0);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Interest %</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => {
                    setInterestRate(parseFloat(e.target.value) || 0);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notice Date</label>
                <input
                  type="date"
                  value={noticeDate}
                  onChange={(e) => {
                    setNoticeDate(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Desired Tone</label>
              <select
                value={tone}
                onChange={(e) => {
                  setTone(e.target.value as any);
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="FORMAL_ASSERTIVE">Formal & Assertive (Notice before Action)</option>
                <option value="CONCILIATORY">Conciliatory & Commercial (Pre-dispute negotiation)</option>
                <option value="STRICT_STATUTORY">Strict Statutory (Formal pre-litigation demand)</option>
                <option value="STANDARD_COMMERCIAL">Standard Commercial (Accounts payable reminder)</option>
              </select>
            </div>

            {/* Facts and Chronology */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Factual Narrative & Chronology
              </label>
              <textarea
                value={facts}
                rows={4}
                placeholder="Enter sequence of transaction events, purchase orders, deliveries, and payment defaults..."
                onChange={(e) => {
                  setFacts(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Structuring Draft...' : 'Generate / Regenerate Structured Draft'}
            </button>
          </div>
        </div>

        {/* Right: Live Document Editor & Actions (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            {/* Editor Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                  Live Structured Editor
                </span>
              </div>

              {/* Refinement Actions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleImproveClarity}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                  title="Improve operative clause clarity"
                >
                  <Wand2 className="w-3 h-3 text-indigo-400" />
                  Improve Clarity
                </button>
                <button
                  onClick={handleSimplifyLegalese}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                  title="Simplify archaic legalese into modern commercial English"
                >
                  <Sparkles className="w-3 h-3 text-mint-400" />
                  Simplify Legalese
                </button>
                <button
                  onClick={handleIdentifyMissing}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                  title="Detect missing placeholders"
                >
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Audit Placeholders
                </button>
              </div>
            </div>

            {/* Engine Disclosure Banner */}
            <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-[11px] text-indigo-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Engine: {generationEngine || 'Offline Deterministic Drafting Engine v1.0'}
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">
                No external API required
              </span>
            </div>

            {/* Document Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setHasUnsavedChanges(true);
              }}
              rows={24}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 selection:bg-indigo-600/40"
              placeholder="Structured document draft will render here with numbered paragraphs and placeholders..."
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{content.length} characters | {content.split(/\s+/).filter(Boolean).length} words</span>
              <span>Drafts require independent review by qualified legal counsel.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
