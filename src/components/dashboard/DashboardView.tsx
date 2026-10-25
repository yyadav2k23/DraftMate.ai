import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { AuditReport, CaseEvaluationResult, LegalCase } from '../../types';
import { CaseModal } from '../cases/CaseModal';
import { DocumentUploadModal } from '../cases/DocumentUploadModal';
import { Modal } from '../common/Modal';
import { runCaseEvaluation } from '../../data/testEvaluationRubric';
import {
  FileText,
  ShieldCheck,
  Scale,
  PlusCircle,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Compass,
  UploadCloud,
  FolderOpen,
  Briefcase,
  TrendingUp,
  RotateCcw,
  FlaskConical,
  Sparkles,
  Award,
  XCircle,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string, caseId?: string) => void;
  onOpenExportModal?: (report: AuditReport) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCaseForUpload, setSelectedCaseForUpload] = useState<LegalCase | null>(null);
  const [evaluatingCase, setEvaluatingCase] = useState<LegalCase | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<CaseEvaluationResult | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    const storedCases = StorageService.getCases();
    setCases(storedCases);
  };

  const handleSaveCase = (newCase: LegalCase) => {
    StorageService.saveCase(newCase);
    loadCases();
  };

  const handleQuickUpload = (c?: LegalCase) => {
    if (c) {
      setSelectedCaseForUpload(c);
      setIsUploadModalOpen(true);
    } else if (cases.length > 0) {
      setSelectedCaseForUpload(cases[0]);
      setIsUploadModalOpen(true);
    } else {
      setIsCaseModalOpen(true);
    }
  };

  const handleLoadDemoCases = () => {
    StorageService.loadDemonstrationCases();
    loadCases();
  };

  const handleResetDemoCases = () => {
    StorageService.resetDemonstrationCases();
    loadCases();
  };

  const handleRunEvaluation = (c: LegalCase) => {
    setEvaluatingCase(c);
    const res = runCaseEvaluation(c);
    setEvaluationResult(res);
  };

  const userCases = cases.filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-'));
  const demoCases = cases.filter((c) => c.isDemoCase || c.id.startsWith('case-demo-'));

  return (
    <div className="space-y-8">
      {/* Hero Welcome Area */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              LegalTech Intelligence Workspace
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Indian Jurisdiction Suite
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Draft smarter. Verify deeper.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            AI-assisted legal document drafting, multi-document contradiction audit, and statutory citation verification.
            Built with deterministic safeguards: <strong className="text-white">Draft confidently. Check carefully. Know what needs a lawyer.</strong>
          </p>

          {/* Primary User Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Case
            </button>

            <button
              onClick={() => handleQuickUpload()}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              Upload Documents (PDF, DOCX, Images)
            </button>

            {cases.length > 0 && (
              <button
                onClick={() => onNavigate('verify', cases[0].id)}
                className="px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Open Verify Studio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4-Stage Legal Workflow Overview */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            Core Workflow: From Description to Counsel-Ready Audit
          </h2>
          <span className="text-xs text-slate-500 font-mono">4-Stage Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center font-mono text-[10px]">1</span>
              Case Setup & Intake
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create clean client matters and upload multi-format files (PDF, Word DOCX, PNG, JPG).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center font-mono text-[10px]">2</span>
              Deterministic Fact Extraction
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract parties, payments, dates, clauses, and damage reports with optical OCR confidence scores.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center font-mono text-[10px]">3</span>
              Cross-Document Contradiction Audit
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flag conflicting payment statuses, arithmetic variances, missing contractor invoices, and unverified assertions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center font-mono text-[10px]">4</span>
              Legal Sources & Verify Studio
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Retrieve authentic Indian legal provisions (India Code, Supreme Court) and generate shareable audit reports.
            </p>
          </div>
        </div>
      </div>

      {/* Client Cases Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              My Active Cases ({userCases.length})
            </h2>
          </div>

          <button
            onClick={() => setIsCaseModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Case
          </button>
        </div>

        {userCases.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-200">No client cases created yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Create a new case workspace to upload client documents (PDF, Word DOCX, PNG, JPG).
                The system extracts structured facts, audits multi-file contradictions, and safeguards drafts.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCaseModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Case
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userCases.map((c) => {
              const docCount = c.documents?.length || 0;
              const factCount = c.extractedFacts?.length || 0;
              const contradictionCount = (c.findings || []).filter(
                (f) => f.category === 'CONTRADICTION'
              ).length;

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {c.matterType}
                      </span>
                      {c.referenceNumber && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Ref: {c.referenceNumber}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {c.title}
                    </h3>

                    <div className="text-xs text-slate-400 space-y-1 pt-1">
                      <div className="truncate">
                        <strong>Parties: </strong>
                        {c.parties.map((p) => p.name).join(' vs ') || 'Not specified'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Jurisdiction: {c.jurisdiction}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500">Files</div>
                      <div className="font-mono font-bold text-slate-200">{docCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Facts</div>
                      <div className="font-mono font-bold text-slate-200">{factCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Conflicts</div>
                      <div
                        className={`font-mono font-bold ${
                          contradictionCount > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {contradictionCount}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleQuickUpload(c)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <UploadCloud className="w-3 h-3" /> Upload
                    </button>

                    <button
                      onClick={() => onNavigate('facts', c.id)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                    >
                      <FileSearch className="w-3 h-3" /> Review Facts
                    </button>

                    <button
                      onClick={() => onNavigate('verify', c.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
                    >
                      <ShieldCheck className="w-3 h-3" /> Verify
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Demonstration Benchmarks Section (6 Fictional Test Cases) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-amber-900/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              Demonstration Benchmarks (6 Fictional Test Cases Suite)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {demoCases.length === 0 ? (
              <button
                onClick={handleLoadDemoCases}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load 6 Demonstration Cases
              </button>
            ) : (
              <button
                onClick={handleResetDemoCases}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo Cases
              </button>
            )}
          </div>
        </div>

        {demoCases.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-3">
            <FlaskConical className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-amber-200">
                Load Fictional Indian Legal Benchmark Suite (6 Test Cases)
              </h3>
              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                Explore six diverse benchmark cases spanning commercial dues, employment salary, tenancy deposits, consumer defective goods with transit damage, personal loan electronic reconciliation, and goods delivery discrepancies.
              </p>
            </div>
            <button
              onClick={handleLoadDemoCases}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Load All 6 Demonstration Cases
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>PROMINENT NOTICE:</strong> All records below are strictly{' '}
                <span className="underline font-bold">FICTIONAL TEST CASES — NOT REAL LEGAL MATTERS</span>.
                Synthetic facts and documents are provided for testing multi-file contradiction audits and statutory citation verifications.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {demoCases.map((c) => {
                const docCount = c.documents?.length || 0;
                const factCount = c.extractedFacts?.length || 0;
                const contradictionCount = (c.findings || []).filter(
                  (f) => f.category === 'CONTRADICTION'
                ).length;

                // Format badges
                const formats = Array.from(
                  new Set(
                    c.documents.map((d) => {
                      if (d.mimeType.includes('pdf')) return 'PDF';
                      if (d.mimeType.includes('word') || d.mimeType.includes('openxml')) return 'DOCX';
                      if (d.mimeType.includes('png')) return 'PNG';
                      if (d.mimeType.includes('jpeg') || d.mimeType.includes('jpg')) return 'JPEG';
                      return 'FILE';
                    })
                  )
                );
                const hasImage = c.documents.some((d) => d.isImage || d.mimeType.startsWith('image/'));

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-800/60 border border-amber-500/30 hover:border-amber-400/60 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          {c.referenceNumber}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                          FICTIONAL TEST
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                        {c.title.replace(/^\[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER\]\s*/, '')}
                      </h3>

                      {/* File formats & image badge */}
                      <div className="flex flex-wrap items-center gap-1">
                        {formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700"
                          >
                            {fmt}
                          </span>
                        ))}
                        {hasImage && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/90 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                            <ImageIcon className="w-2.5 h-2.5" />
                            Image Evidence
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 space-y-1 pt-1">
                        <div className="truncate">
                          <strong>Parties: </strong>
                          {c.parties.map((p) => p.name).join(' vs ') || 'Not specified'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Venue: {c.jurisdiction}
                        </div>
                      </div>
                    </div>

                    {/* Metrics bar */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500">Files</div>
                        <div className="font-mono font-bold text-slate-200">{docCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Facts</div>
                        <div className="font-mono font-bold text-slate-200">{factCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Conflicts</div>
                        <div
                          className={`font-mono font-bold ${
                            contradictionCount > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {contradictionCount}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onNavigate('facts', c.id)}
                          className="px-2 py-1 text-[11px] font-medium rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                        >
                          <FileSearch className="w-3 h-3" /> Facts
                        </button>

                        <button
                          onClick={() => onNavigate('verify', c.id)}
                          className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck className="w-3 h-3" /> Audit
                        </button>
                      </div>

                      <button
                        onClick={() => handleRunEvaluation(c)}
                        className="px-2 py-1 text-[11px] font-medium rounded-lg bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-colors"
                        title="Evaluate against private test ground-truth rubric"
                      >
                        <Award className="w-3 h-3" />
                        Run Evaluation
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Case Creation Modal */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        onSaveCase={handleSaveCase}
      />

      {/* Document Upload Modal */}
      {selectedCaseForUpload && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedCaseForUpload(null);
            loadCases();
          }}
          caseId={selectedCaseForUpload.id}
          existingDocuments={selectedCaseForUpload.documents}
          onDocumentsAdded={(newDocs) => {
            for (const doc of newDocs) {
              StorageService.addDocumentToCase(selectedCaseForUpload.id, doc);
            }
            loadCases();
          }}
          onRemoveDocument={(docId) => {
            StorageService.removeDocumentFromCase(selectedCaseForUpload.id, docId);
            loadCases();
          }}
        />
      )}

      {/* Ground Truth Evaluation Modal */}
      {evaluationResult && evaluatingCase && (
        <Modal
          isOpen={Boolean(evaluationResult)}
          onClose={() => {
            setEvaluationResult(null);
            setEvaluatingCase(null);
          }}
          title={`Ground-Truth Rubric Evaluation: ${evaluationResult.caseReference}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Score Card */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                evaluationResult.passed
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/50 border-red-500/40 text-red-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {evaluationResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-bold text-sm">
                    {evaluationResult.passed ? 'Rubric Passed (All Checks Satisfied)' : 'Evaluation Incomplete'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Evaluated against isolated ground-truth benchmark without model context leakage.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Accuracy Score</span>
                <span className="text-2xl font-black font-mono">
                  {evaluationResult.score}%
                </span>
              </div>
            </div>

            {/* Contradictions Detected vs Expected */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Contradiction Detection Audit ({(evaluationResult.contradictionsDetected || []).length} / {(evaluationResult.expectedContradictions || []).length} Verified)
              </h4>
              <div className="space-y-1.5">
                {(evaluationResult.expectedContradictions || []).map((exp: string, idx: number) => {
                  const detected = (evaluationResult.contradictionsDetected || []).includes(exp);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start gap-2"
                    >
                      {detected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-medium">{exp}</span>
                        <div className="text-[11px] text-slate-400">
                          {detected ? 'Detected deterministically by contradiction engine' : 'Not identified'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missing Information & Limitations */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
                Missing Detail & Evidence Limitation Checks ({(evaluationResult.missingDetailsDetected || []).length} / {(evaluationResult.expectedMissingDetails || []).length} Flagged)
              </h4>
              <div className="space-y-1.5">
                {(evaluationResult.expectedMissingDetails || []).map((exp: string, idx: number) => {
                  const detected = (evaluationResult.missingDetailsDetected || []).includes(exp);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start gap-2"
                    >
                      {detected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-slate-200 font-medium">{exp}</span>
                        <div className="text-[11px] text-slate-400">
                          {detected ? 'Flagged as unverified claim or evidentiary limitation' : 'Omitted from findings'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strict Neutrality & Prohibited Conclusions Check */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Strict Neutrality & Non-Accusatory Tone
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {evaluationResult.prohibitedConclusionsPassed ? (
                  <span className="text-emerald-300">
                    PASS: The analysis adhered to strict neutrality. Zero prohibited conclusions (no unfounded accusations of fraud, theft, bad faith, or criminal guilt) were asserted in findings.
                  </span>
                ) : (
                  <span className="text-red-300">
                    FAIL: Findings contained prohibited subjective accusations.
                  </span>
                )}
              </p>
            </div>

            {/* Applicable Legal Authorities Verified */}
            {evaluationResult.expectedStatutes && evaluationResult.expectedStatutes.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  Relevant Indian Statutory Framework
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(evaluationResult.expectedStatutes || []).map((st: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-500/30 text-xs font-mono"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setEvaluationResult(null);
                  setEvaluatingCase(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Evaluation
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
