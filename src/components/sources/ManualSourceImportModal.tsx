import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ManualSourceImportInput, SourceRegistryService } from '../../services/sourceAdapters';
import { LegalSourceCategory } from '../../types';
import { Scale, FileText, CheckCircle2, AlertCircle, Link, ShieldCheck, Globe } from 'lucide-react';

interface ManualSourceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceImported?: () => void;
}

export const ManualSourceImportModal: React.FC<ManualSourceImportModalProps> = ({
  isOpen,
  onClose,
  onSourceImported,
}) => {
  const [formData, setFormData] = useState<ManualSourceImportInput>({
    actOrCaseTitle: '',
    provisionOrCitation: '',
    category: 'CONSTITUTION',
    officialSourceUrl: '',
    officialSourceOrganization: '',
    jurisdiction: 'India (Official Central Registry)',
    statutoryOrJudgmentText: '',
    summaryOfLaw: '',
    enactmentOrDecisionDate: '',
    publicationOrGazetteDate: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = SourceRegistryService.importManualSource(formData);
    if (!result.success) {
      setError(result.error || 'Failed to import source. Please verify all required fields.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onSourceImported) onSourceImported();
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manual Official Legal Source Import" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-100">Official Source Provenance Enforcement</div>
            <p className="text-slate-400 mt-0.5">
              DraftMate.ai strictly prohibits fabricated legal references. When automated scraping is restricted by government firewalls, use this form to import verified provisions directly from the official Legislative Department, India Code, or court registries.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Official source imported successfully with provenance tracking!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Source Type / Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as LegalSourceCategory })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="CONSTITUTION">Constitution of India (Legislative Dept)</option>
              <option value="CENTRAL_ACT">Central Act / Parliamentary Statute (India Code)</option>
              <option value="DELEGATED_LEGISLATION">Delegated Legislation (Rules & Notifications)</option>
              <option value="JUDGMENT">Supreme Court or High Court Judgment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jurisdiction *
            </label>
            <input
              type="text"
              required
              value={formData.jurisdiction}
              onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              placeholder="e.g. Supreme Court of India, India (Central), High Court of Delhi"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Act, Statute, or Case Name *
            </label>
            <input
              type="text"
              required
              value={formData.actOrCaseTitle}
              onChange={(e) => setFormData({ ...formData, actOrCaseTitle: e.target.value })}
              placeholder="e.g. The Constitution of India, Indian Contract Act 1872, Kailash Nath v. DDA"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Provision, Article, Section, or Paragraph *
            </label>
            <input
              type="text"
              required
              value={formData.provisionOrCitation}
              onChange={(e) => setFormData({ ...formData, provisionOrCitation: e.target.value })}
              placeholder="e.g. Article 226, Section 73, (2015) 4 SCC 136 Para 43"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official Source URL *
            </label>
            <input
              type="url"
              required
              value={formData.officialSourceUrl}
              onChange={(e) => setFormData({ ...formData, officialSourceUrl: e.target.value })}
              placeholder="https://www.legislative.gov.in/... or https://www.indiacode.nic.in/..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official Publishing Organization *
            </label>
            <input
              type="text"
              required
              value={formData.officialSourceOrganization}
              onChange={(e) => setFormData({ ...formData, officialSourceOrganization: e.target.value })}
              placeholder="e.g. Legislative Department, India Code, Supreme Court Registry"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Authentic Statutory / Judgment Text (Exact Retrieved Passage) *
          </label>
          <textarea
            required
            rows={5}
            value={formData.statutoryOrJudgmentText}
            onChange={(e) => setFormData({ ...formData, statutoryOrJudgmentText: e.target.value })}
            placeholder="Paste the exact text from the official gazette publication, legislative PDF, or official law report..."
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <span className="text-[10px] text-slate-500">
            This passage will be displayed as immutable evidentiary proof during contradiction & citation verification.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Summary of Law & Core Legal Principle (Optional)
          </label>
          <input
            type="text"
            value={formData.summaryOfLaw}
            onChange={(e) => setFormData({ ...formData, summaryOfLaw: e.target.value })}
            placeholder="Concise plain-English legal rule established by this provision or precedent"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Scale className="w-3.5 h-3.5" />
            Import & Verify Official Source
          </button>
        </div>
      </form>
    </Modal>
  );
};
