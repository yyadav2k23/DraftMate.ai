import React, { useState } from 'react';
import { ExtractedFact, FactCategory, FactReviewStatus, LegalCase } from '../../types';
import { StorageService } from '../../services/storage';
import { extractCaseFacts } from '../../engine/factExtractor';
import {
  FileText,
  Check,
  X,
  Edit2,
  Filter,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Tag,
  Calendar,
  DollarSign,
  CreditCard,
  Scale,
  User,
  AlertCircle,
  FileSearch,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface FactReviewViewProps {
  legalCase: LegalCase | null;
  onCaseUpdated: (updatedCase: LegalCase) => void;
  onNavigateToVerify: (caseId: string) => void;
}

export const FactReviewView: React.FC<FactReviewViewProps> = ({
  legalCase,
  onCaseUpdated,
  onNavigateToVerify,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [reviewFilter, setReviewFilter] = useState<string>('ALL');
  const [editingFact, setEditingFact] = useState<ExtractedFact | null>(null);
  const [correctionInput, setCorrectionInput] = useState('');
  const [userNotesInput, setUserNotesInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  if (!legalCase) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <FileSearch className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-semibold text-slate-200">No Case Selected for Fact Review</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please select or create a legal case workspace to review structured document facts.
        </p>
      </div>
    );
  }

  const facts = legalCase.extractedFacts || [];

  const handleExtractFacts = () => {
    setIsExtracting(true);
    try {
      const extracted = extractCaseFacts(legalCase.documents, legalCase.id);
      const updatedCase: LegalCase = {
        ...legalCase,
        extractedFacts: extracted,
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveCase(updatedCase);
      onCaseUpdated(updatedCase);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAcceptFact = (factId: string) => {
    StorageService.updateFact(legalCase.id, factId, {
      reviewStatus: 'ACCEPTED',
    });
    const updated = StorageService.getCaseById(legalCase.id);
    if (updated) onCaseUpdated(updated);
  };

  const handleRejectFact = (factId: string) => {
    StorageService.updateFact(legalCase.id, factId, {
      reviewStatus: 'REJECTED',
    });
    const updated = StorageService.getCaseById(legalCase.id);
    if (updated) onCaseUpdated(updated);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFact) return;

    StorageService.updateFact(legalCase.id, editingFact.id, {
      reviewStatus: 'CORRECTED',
      userCorrection: correctionInput.trim(),
      userNotes: userNotesInput.trim() || undefined,
    });

    const updated = StorageService.getCaseById(legalCase.id);
    if (updated) onCaseUpdated(updated);
    setEditingFact(null);
  };

  const filteredFacts = facts.filter((f) => {
    const matchesCat = categoryFilter === 'ALL' || f.category === categoryFilter;
    const matchesRev = reviewFilter === 'ALL' || f.reviewStatus === reviewFilter;
    return matchesCat && matchesRev;
  });

  const getCategoryIcon = (category: FactCategory) => {
    switch (category) {
      case 'PARTY':
        return <User className="w-4 h-4 text-indigo-400" />;
      case 'DATE':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'AMOUNT':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      case 'CITATION':
      case 'CLAUSE':
        return <Scale className="w-4 h-4 text-blue-400" />;
      default:
        return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Grounded Fact Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Case: {legalCase.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Structured Fact Review
          </h1>
          <p className="text-xs text-slate-400">
            Audit, correct, and verify structured facts extracted from your case documents. Original excerpts and user corrections are preserved as distinct records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExtractFacts}
            disabled={isExtracting || legalCase.documents.length === 0}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isExtracting ? 'Extracting...' : 'Re-Extract Facts from Documents'}
          </button>

          <button
            onClick={() => onNavigateToVerify(legalCase.id)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Run Contradiction Audit
          </button>
        </div>
      </div>

      {/* Prominent Demo Warning Banner */}
      {legalCase.isDemoCase && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-900/80 border border-amber-500/40 text-amber-200">
                  {legalCase.referenceNumber || 'DEMO BENCHMARK'}
                </span>
              </div>
              <p className="text-amber-200/80 text-[11px] mt-0.5">
                Facts below were extracted from synthetic test documents. You can inspect confidence scores, audit source excerpts, and test user manual overrides.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Stats Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="PARTY">Parties & Roles</option>
              <option value="DATE">Dates & Chronology</option>
              <option value="AMOUNT">Amounts & Currencies</option>
              <option value="PAYMENT">Payments & Invoices</option>
              <option value="CLAUSE">Contract Clauses</option>
              <option value="SIGNATURE">Signatures & Formal Blocks</option>
              <option value="OTHER">Missing Essentials</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Review Status:</span>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="UNREVIEWED">Unreviewed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="CORRECTED">User Corrected</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span>Total Extracted: {facts.length}</span>
          <span>•</span>
          <span className="text-emerald-400">
            Accepted: {facts.filter((f) => f.reviewStatus === 'ACCEPTED').length}
          </span>
          <span>•</span>
          <span className="text-purple-400">
            Corrected: {facts.filter((f) => f.reviewStatus === 'CORRECTED').length}
          </span>
        </div>
      </div>

      {/* Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFacts.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Extracted Facts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload case documents (PDF, DOCX, or Images) and click "Re-Extract Facts" to populate structured facts.
            </p>
          </div>
        ) : (
          filteredFacts.map((fact) => {
            const isAccepted = fact.reviewStatus === 'ACCEPTED';
            const isRejected = fact.reviewStatus === 'REJECTED';
            const isCorrected = fact.reviewStatus === 'CORRECTED';

            return (
              <div
                key={fact.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isAccepted
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isCorrected
                    ? 'bg-purple-950/20 border-purple-500/40'
                    : isRejected
                    ? 'bg-red-950/10 border-red-500/30 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                      {getCategoryIcon(fact.category)}
                      <span>{fact.category}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isAccepted
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : isCorrected
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                          : isRejected
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {fact.reviewStatus}
                    </span>
                  </div>

                  {/* Fact Label */}
                  <h4 className="font-semibold text-slate-100 text-xs">{fact.label}</h4>

                  {/* Original Supporting Quotation */}
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed">
                    "{fact.originalText}"
                  </div>

                  {/* User Correction if present */}
                  {fact.userCorrection && (
                    <div className="p-2 rounded bg-purple-950/40 border border-purple-500/40 text-purple-200 text-[11px]">
                      <strong>User Correction: </strong>
                      {fact.userCorrection}
                      {fact.userNotes && (
                        <div className="text-[10px] text-purple-300/80 mt-1">
                          Notes: {fact.userNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location & Document Reference */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="truncate">Source: {fact.sourceDocName}</span>
                    <span className="font-mono">{fact.locationReference || 'Document Body'}</span>
                  </div>
                </div>

                {/* Fact Actions Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-500">
                    Confidence: {fact.confidence}% ({fact.status.replace('_', ' ')})
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAcceptFact(fact.id)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                      title="Accept fact extraction as accurate"
                    >
                      <Check className="w-3 h-3" /> Accept
                    </button>

                    <button
                      onClick={() => {
                        setEditingFact(fact);
                        setCorrectionInput(fact.userCorrection || String(fact.normalizedValue));
                        setUserNotesInput(fact.userNotes || '');
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-500/30 flex items-center gap-1 transition-colors"
                      title="Correct fact value"
                    >
                      <Edit2 className="w-3 h-3" /> Correct
                    </button>

                    <button
                      onClick={() => handleRejectFact(fact.id)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/30 flex items-center gap-1 transition-colors"
                      title="Reject fact as irrelevant or inaccurate"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fact Correction Modal */}
      {editingFact && (
        <Modal
          isOpen={Boolean(editingFact)}
          onClose={() => setEditingFact(null)}
          title={`Correct Extracted Fact: ${editingFact.label}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                Original Supporting Document Text:
              </span>
              <p className="font-mono text-slate-300 text-[11px]">"{editingFact.originalText}"</p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium block">
                User Corrected Value / Normalized Form:
              </label>
              <input
                type="text"
                required
                value={correctionInput}
                onChange={(e) => setCorrectionInput(e.target.value)}
                placeholder="Enter verified value..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium block">
                Optional Advocate / Reviewer Notes:
              </label>
              <textarea
                rows={2}
                value={userNotesInput}
                onChange={(e) => setUserNotesInput(e.target.value)}
                placeholder="Reason for correction or reference to counter-evidence..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingFact(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Save Correction
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
