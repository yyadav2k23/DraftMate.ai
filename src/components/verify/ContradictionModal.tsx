import React from 'react';
import { Finding } from '../../types';
import { Modal } from '../common/Modal';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRightLeft, FileSpreadsheet, FileText } from 'lucide-react';

interface ContradictionModalProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (findingId: string, status: Finding['status']) => void;
}

export const ContradictionModal: React.FC<ContradictionModalProps> = ({
  finding,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!finding || !finding.contradictionDetails) return null;

  const { recordA, recordB, conflictReason, recommendedAction, nonJudgmentalNotice } =
    finding.contradictionDetails;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Critical Factual Contradiction Deep-Dive"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Warning Banner */}
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-red-200">
              Deterministic Conflict Detected: Mutually Exclusive Factual Claims
            </h4>
            <p className="text-red-300/90 mt-1 leading-relaxed">
              {finding.explanation}
            </p>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Record A */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <FileText className="w-4 h-4" />
                  Record A (Evidentiary Receipt)
                </span>
                {recordA.date && (
                  <span className="text-xs text-slate-400 font-mono">Date: {recordA.date}</span>
                )}
              </div>
              <h5 className="font-medium text-slate-100 text-sm mb-1">{recordA.title}</h5>
              <p className="text-xs text-slate-400 mb-3">Field: {recordA.field}</p>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-emerald-200 font-mono leading-relaxed">
                "{recordA.excerpt}"
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2 text-xs text-emerald-400/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Settlement Status: Asserted Paid via NEFT
            </div>
          </div>

          {/* Record B */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <FileSpreadsheet className="w-4 h-4" />
                  Record B (Claimant Accounting Ledger)
                </span>
                {recordB.date && (
                  <span className="text-xs text-slate-400 font-mono">Date: {recordB.date}</span>
                )}
              </div>
              <h5 className="font-medium text-slate-100 text-sm mb-1">{recordB.title}</h5>
              <p className="text-xs text-slate-400 mb-3">Field: {recordB.field}</p>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-amber-200 font-mono leading-relaxed">
                "{recordB.excerpt}"
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2 text-xs text-amber-400/90">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Settlement Status: Asserted Pending & Unpaid
            </div>
          </div>
        </div>

        {/* Why this conflicts */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
            Nature of Contradiction
          </h5>
          <p className="text-sm text-slate-300 leading-relaxed">{conflictReason}</p>
        </div>

        {/* Non-judgmental Principle Note */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h5 className="font-semibold text-indigo-200 uppercase tracking-wider">
              Legal Safeguard: Neutrality Assurance
            </h5>
            <p className="text-indigo-200/90 leading-relaxed">
              {nonJudgmentalNotice}
            </p>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recommended Action Before Serving Notice
          </h5>
          <p className="text-sm text-slate-200 leading-relaxed">{recommendedAction}</p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Status:</span>
            <span className="font-semibold text-slate-200 uppercase">{finding.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onStatusChange(finding.id, 'NEEDS_HUMAN_REVIEW');
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 transition-colors"
            >
              Flag for Counsel Review
            </button>
            <button
              onClick={() => {
                onStatusChange(finding.id, 'RESOLVED');
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 border border-emerald-500/40 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Resolved (Reconciliation Done)
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
