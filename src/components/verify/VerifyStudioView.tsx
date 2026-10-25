import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { AttachedLegalSource, AuditReport, Finding, LegalCase, UserReviewStatus } from '../../types';
import { detectCrossDocumentContradictions } from '../../engine/crossDocumentContradiction';
import { calculateHealthScore } from '../../engine/healthScore';
import { SeverityBadge, CitationStatusBadge } from '../common/Badge';
import { HealthScoreModal } from './HealthScoreModal';
import { DocumentUploadModal } from '../cases/DocumentUploadModal';
import { SourceLinkerModal } from '../sources/SourceLinkerModal';
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale,
  Download,
  HelpCircle,
  ArrowRight,
  Filter,
  Eye,
  RefreshCw,
  Layers,
  UploadCloud,
  FileSearch,
  MessageSquare,
  Check,
  X,
  FileSpreadsheet,
  ArrowRightLeft,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface VerifyStudioViewProps {
  currentCaseId?: string;
  onNavigateToDraft?: (caseId: string) => void;
  onNavigateToFacts?: (caseId: string) => void;
  onOpenExportModal?: (report: AuditReport) => void;
}

export const VerifyStudioView: React.FC<VerifyStudioViewProps> = ({
  currentCaseId,
  onNavigateToDraft,
  onNavigateToFacts,
  onOpenExportModal,
}) => {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [activeCase, setActiveCase] = useState<LegalCase | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isHealthScoreModalOpen, setIsHealthScoreModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSourceLinkerOpen, setIsSourceLinkerOpen] = useState(false);
  const [sourceLinkerFinding, setSourceLinkerFinding] = useState<Finding | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'CONTRADICTION' | 'MISSING' | 'QUALITY'>('ALL');
  const [userNoteDraft, setUserNoteDraft] = useState('');

  useEffect(() => {
    loadCaseData();
  }, [currentCaseId]);

  const loadCaseData = () => {
    const storedCases = StorageService.getCases();
    setCases(storedCases);

    let targetId = currentCaseId || StorageService.getActiveCaseId() || '';
    if (!targetId && storedCases.length > 0) {
      targetId = storedCases[0].id;
    }

    setSelectedCaseId(targetId);
    if (targetId) {
      const c = StorageService.getCaseById(targetId);
      if (c) {
        setActiveCase(c);
        runAudit(c);
      }
    }
  };

  const runAudit = (c: LegalCase) => {
    const crossFindings = detectCrossDocumentContradictions(c);

    // Preserve any existing attached sources and user reviews on findings
    if (c.findings && c.findings.length > 0) {
      for (const finding of crossFindings) {
        const existing = c.findings.find(
          (f) => f.id === finding.id || f.title === finding.title
        );
        if (existing) {
          if (existing.attachedSource) finding.attachedSource = existing.attachedSource;
          if (existing.attachedSources) finding.attachedSources = existing.attachedSources;
          if (existing.userReviewStatus) finding.userReviewStatus = existing.userReviewStatus;
          if (existing.userNotes) finding.userNotes = existing.userNotes;
          if (existing.resolutionNote) finding.resolutionNote = existing.resolutionNote;
        }
      }
    }

    setFindings(crossFindings);

    // Update case findings in storage
    const updated = { ...c, findings: crossFindings };
    StorageService.saveCase(updated);
  };

  const handleCaseChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    StorageService.setActiveCaseId(caseId);
    const c = StorageService.getCaseById(caseId);
    if (c) {
      setActiveCase(c);
      runAudit(c);
    }
  };

  const handleUpdateReviewStatus = (
    findingId: string,
    status: UserReviewStatus,
    notes?: string
  ) => {
    if (!activeCase) return;

    StorageService.updateFindingReview(activeCase.id, findingId, status, notes);
    const updatedCase = StorageService.getCaseById(activeCase.id);
    if (updatedCase) {
      setActiveCase(updatedCase);
      setFindings(updatedCase.findings);
    }
    if (selectedFinding && selectedFinding.id === findingId) {
      setSelectedFinding((prev) => (prev ? { ...prev, userReviewStatus: status, userNotes: notes } : null));
    }
  };

  const healthScore = calculateHealthScore(findings);

  const filteredFindings = findings.filter((f) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return f.severity === 'CRITICAL';
    if (activeFilter === 'CONTRADICTION') return f.category === 'CONTRADICTION';
    if (activeFilter === 'MISSING') return f.category === 'MISSING_FIELD';
    if (activeFilter === 'QUALITY') return f.category === 'DRAFTING_QUALITY';
    return true;
  });

  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <Scale className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-semibold text-slate-200">No Case Available for Verification</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please create a case and upload legal documents (PDF, DOCX, or Images) to run multi-document contradiction audits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Health Score Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Verify Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">Cross-Document Evidence Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Evidence Contradiction & Consistency Audit
          </h1>
          <div className="flex items-center gap-3 pt-1">
            <label className="text-xs text-slate-400">Selected Case:</label>
            <select
              value={selectedCaseId}
              onChange={(e) => handleCaseChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {cases.filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-')).length > 0 && (
                <optgroup label="Client Matters">
                  {cases
                    .filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-'))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.documents?.length || 0} files)
                      </option>
                    ))}
                </optgroup>
              )}
              {cases.filter((c) => c.isDemoCase || c.id.startsWith('case-demo-')).length > 0 && (
                <optgroup label="Demonstration Benchmarks [FICTIONAL]">
                  {cases
                    .filter((c) => c.isDemoCase || c.id.startsWith('case-demo-'))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        [DEMO] {c.referenceNumber ? `${c.referenceNumber} • ` : ''}
                        {c.title.replace(/^\[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER\]\s*/i, '')} ({c.documents?.length || 0} files)
                      </option>
                    ))}
                </optgroup>
              )}
            </select>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline"
            >
              <UploadCloud className="w-3.5 h-3.5" /> Manage Files
            </button>
          </div>
        </div>

        {/* Health Score Metric Card */}
        <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-md">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              Health Score
              <button
                onClick={() => setIsHealthScoreModalOpen(true)}
                className="text-indigo-400 hover:text-indigo-300"
                title="View transparent formula"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold font-mono text-slate-100">
                {healthScore.finalScore}
              </span>
              <span className="text-slate-400 text-xs">/ 100</span>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-700" />

          <div className="space-y-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                healthScore.grade === 'CRITICAL_RISK'
                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                  : healthScore.grade === 'NEEDS_ATTENTION'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {healthScore.grade.replace('_', ' ')}
            </span>
            <div className="text-[11px] text-slate-400">
              {findings.filter((f) => f.severity === 'CRITICAL').length} Critical Conflicts
            </div>
          </div>

          <div className="h-10 w-px bg-slate-700" />

          <button
            onClick={() => {
              if (onOpenExportModal) {
                const report: AuditReport = {
                  id: `audit-${activeCase.id}`,
                  caseId: activeCase.id,
                  documentId: activeCase.id,
                  documentTitle: activeCase.title,
                  generatedAt: new Date().toISOString(),
                  healthScore,
                  findings,
                  summary: {
                    criticalCount: findings.filter((f) => f.severity === 'CRITICAL').length,
                    warningCount: findings.filter((f) => f.severity === 'WARNING').length,
                    infoCount: findings.filter((f) => f.severity === 'INFO').length,
                    resolvedCount: findings.filter((f) => f.userReviewStatus === 'CONFIRMED_BY_USER').length,
                    openCount: findings.filter((f) => f.userReviewStatus === 'UNRESOLVED').length,
                  },
                  verifiedCitations: [],
                  disclaimer: healthScore.disclaimer,
                };
                onOpenExportModal(report);
              }
            }}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit
          </button>
        </div>
      </div>

      {/* Prominent Demo Warning Banner */}
      {activeCase?.isDemoCase && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-900/80 border border-amber-500/40 text-amber-200">
                  {activeCase.referenceNumber || 'DEMO BENCHMARK'}
                </span>
              </div>
              <p className="text-amber-200/80 text-[11px] mt-0.5">
                This workspace contains synthetic evidentiary files created for automated contradiction audits and citation testing. No real individuals, companies, or court proceedings are depicted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Case Documents & Side-by-Side Excerpts (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Contradiction Deep-Dive Viewer */}
          {selectedFinding && selectedFinding.contradictionDetails ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-red-500/40 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold text-slate-100 text-sm">
                    Cross-Document Contradiction Comparison
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedFinding(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Close Comparison
                </button>
              </div>

              {/* Side by side comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Statement A */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 uppercase">
                    <span>Statement A ({selectedFinding.contradictionDetails.recordA.filename || 'Doc 1'})</span>
                    <span className="font-mono text-slate-400">{selectedFinding.contradictionDetails.recordA.locationReference || 'Body'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 text-xs font-mono text-emerald-300 leading-relaxed">
                    "{selectedFinding.contradictionDetails.recordA.excerpt}"
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Field: {selectedFinding.contradictionDetails.recordA.field}
                  </div>
                </div>

                {/* Statement B */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 uppercase">
                    <span>Statement B ({selectedFinding.contradictionDetails.recordB.filename || 'Doc 2'})</span>
                    <span className="font-mono text-slate-400">{selectedFinding.contradictionDetails.recordB.locationReference || 'Body'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 text-xs font-mono text-amber-300 leading-relaxed">
                    "{selectedFinding.contradictionDetails.recordB.excerpt}"
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Field: {selectedFinding.contradictionDetails.recordB.field}
                  </div>
                </div>
              </div>

              {/* Why they conflict */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-300 block">Why Statements Conflict:</span>
                <p className="text-slate-400 leading-relaxed">
                  {selectedFinding.contradictionDetails.conflictReason}
                </p>
              </div>

              {/* Resolving Evidence Suggestion */}
              {selectedFinding.contradictionDetails.suggestedResolvingEvidence && (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1">
                  <span className="font-semibold text-indigo-200 block">Suggested Resolving Evidence:</span>
                  <p className="text-indigo-300/90 leading-relaxed">
                    {selectedFinding.contradictionDetails.suggestedResolvingEvidence}
                  </p>
                </div>
              )}

              {/* Strict Neutrality Notice */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-[11px] text-slate-400">
                <strong>Neutrality Guarantee: </strong>
                {selectedFinding.contradictionDetails.nonJudgmentalNotice}
              </div>

              {/* User Review Status & Actions */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Review Status:{' '}
                    <strong className="text-slate-200">
                      {selectedFinding.userReviewStatus || 'UNRESOLVED'}
                    </strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateReviewStatus(selectedFinding.id, 'CONFIRMED_BY_USER', userNoteDraft)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                      title="User has reviewed and confirmed this factual discrepancy"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm Discrepancy Reviewed
                    </button>

                    <button
                      onClick={() => handleUpdateReviewStatus(selectedFinding.id, 'DISMISSED_BY_USER', userNoteDraft)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Dismiss Issue
                    </button>
                  </div>
                </div>

                {/* User Notes Input */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={userNoteDraft}
                    onChange={(e) => setUserNoteDraft(e.target.value)}
                    placeholder="Add advocate notes on how to resolve this contradiction..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* Attached Case Documents Overview Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-slate-100 text-base">
                  Case Evidentiary Files ({activeCase.documents?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>

            {activeCase.documents?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No documents uploaded to this case yet. Click "Upload File" to add PDF, DOCX, or images.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCase.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 truncate">
                        {doc.originalFilename}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-400 max-h-24 overflow-y-auto leading-relaxed">
                      {doc.extractedText.slice(0, 200)}...
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Status: {doc.status}</span>
                      {doc.ocrApplied && <span>OCR ({doc.ocrConfidence}%)</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cross-Document Audit Findings (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-semibold text-slate-100 text-base">Case Audit Findings</h3>
                <p className="text-xs text-slate-400">
                  {filteredFindings.length} findings across {activeCase.documents?.length || 0} files
                </p>
              </div>

              {onNavigateToFacts && (
                <button
                  onClick={() => onNavigateToFacts(activeCase.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <FileSearch className="w-3.5 h-3.5" /> Fact Review
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 pb-2">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'CRITICAL', label: 'Critical' },
                { id: 'CONTRADICTION', label: 'Contradictions' },
                { id: 'MISSING', label: 'Missing Info' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    activeFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Findings List */}
            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
              {filteredFindings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No findings matching this filter.
                </div>
              ) : (
                filteredFindings.map((finding) => {
                  const isContradiction = finding.category === 'CONTRADICTION';
                  const isConfirmed = finding.userReviewStatus === 'CONFIRMED_BY_USER';

                  return (
                    <div
                      key={finding.id}
                      className={`p-4 rounded-xl border transition-all ${
                        finding.severity === 'CRITICAL'
                          ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/60'
                          : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                      } ${isConfirmed ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={finding.severity} size="sm" />
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {finding.detectionMethod}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {finding.userReviewStatus || 'UNRESOLVED'}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100 mb-1.5">{finding.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {finding.explanation}
                      </p>

                      {/* Contradiction Compare Button */}
                      {isContradiction && finding.contradictionDetails && (
                        <div className="mb-3">
                          <button
                            onClick={() => setSelectedFinding(finding)}
                            className="w-full py-2 px-3 rounded-lg bg-red-900/40 hover:bg-red-800/50 text-red-200 border border-red-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-red-400" />
                            Compare Conflicting Evidence Excerpts
                          </button>
                        </div>
                      )}

                      {/* Attached Official Legal Source Card */}
                      {finding.attachedSource && (
                        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2 mb-3">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Scale className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="font-semibold text-indigo-200">
                                Verified Source: {finding.attachedSource.provision}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                finding.attachedSource.verificationStatus === 'VERIFIED_AGAINST_RETRIEVED_SOURCE'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {finding.attachedSource.verificationStatus === 'VERIFIED_AGAINST_RETRIEVED_SOURCE'
                                ? 'VERIFIED SOURCE'
                                : 'PROPOSITION NOT CONFIRMED'}
                            </span>
                          </div>

                          <div className="text-xs font-medium text-slate-100">
                            {finding.attachedSource.actTitle}
                          </div>

                          <div className="p-2.5 rounded bg-slate-950 text-[11px] font-mono text-slate-200 leading-relaxed border border-slate-800">
                            "{finding.attachedSource.relevantPassage}"
                          </div>

                          {finding.attachedSource.userExplanation && (
                            <div className="text-[11px] text-slate-300 italic">
                              Note: {finding.attachedSource.userExplanation}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>{finding.attachedSource.jurisdiction}</span>
                            <a
                              href={finding.attachedSource.officialSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              Official Portal <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Action to Attach / Verify Official Legal Source */}
                      <div className="mb-3">
                        <button
                          onClick={() => {
                            setSourceLinkerFinding(finding);
                            setIsSourceLinkerOpen(true);
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Scale className="w-3.5 h-3.5 text-indigo-400" />
                          {finding.attachedSource
                            ? 'Change / Re-verify Attached Legal Source'
                            : 'Attach Verified Official Legal Source'}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 mb-2">
                        <strong className="text-slate-200">Recommended Next Step: </strong>
                        {finding.recommendedAction}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60 text-xs">
                        <button
                          onClick={() => handleUpdateReviewStatus(finding.id, 'CONFIRMED_BY_USER')}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 transition-colors"
                        >
                          Confirm Reviewed
                        </button>
                        <button
                          onClick={() => handleUpdateReviewStatus(finding.id, 'DISMISSED_BY_USER')}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <HealthScoreModal
        score={healthScore}
        isOpen={isHealthScoreModalOpen}
        onClose={() => setIsHealthScoreModalOpen(false)}
      />

      {isUploadModalOpen && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            loadCaseData();
          }}
          caseId={activeCase.id}
          existingDocuments={activeCase.documents}
          onDocumentsAdded={(newDocs) => {
            for (const doc of newDocs) {
              StorageService.addDocumentToCase(activeCase.id, doc);
            }
            loadCaseData();
          }}
          onRemoveDocument={(docId) => {
            StorageService.removeDocumentFromCase(activeCase.id, docId);
            loadCaseData();
          }}
        />
      )}

      {isSourceLinkerOpen && (
        <SourceLinkerModal
          isOpen={isSourceLinkerOpen}
          onClose={() => {
            setIsSourceLinkerOpen(false);
            setSourceLinkerFinding(null);
          }}
          finding={sourceLinkerFinding}
          caseId={activeCase.id}
          onSourceAttached={(attached) => {
            loadCaseData();
          }}
        />
      )}
    </div>
  );
};
