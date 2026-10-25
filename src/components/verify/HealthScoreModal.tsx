import React from 'react';
import { HealthScoreBreakdown } from '../../types';
import { Modal } from '../common/Modal';
import { ShieldCheck, AlertCircle, Info, Calculator } from 'lucide-react';

interface HealthScoreModalProps {
  score: HealthScoreBreakdown;
  isOpen: boolean;
  onClose: () => void;
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({ score, isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transparent Health Score Formula & Audit Metrics"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Header score card */}
        <div className="flex items-center justify-between p-5 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              Document Health Index
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-slate-100 font-mono">
                {score.finalScore}
              </span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">{score.summary}</div>
          </div>
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                score.grade === 'EXCELLENT'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : score.grade === 'ADEQUATE'
                  ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                  : score.grade === 'NEEDS_ATTENTION'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-red-950 text-red-300 border border-red-500/40'
              }`}
            >
              Grade: {score.grade.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Calculation breakdown table */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-indigo-400" />
            Deterministic Penalty Deduction Formula
          </h4>
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-slate-800/60 p-3 font-semibold text-slate-300 border-b border-slate-800">
              <div className="col-span-6">Audit Dimension</div>
              <div className="col-span-3 text-center">Formula Multiplier</div>
              <div className="col-span-3 text-right">Deduction</div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center border-b border-slate-800/60 hover:bg-slate-800/20">
              <div className="col-span-6 text-slate-200">Base Clean Document</div>
              <div className="col-span-3 text-center font-mono text-slate-400">Fixed</div>
              <div className="col-span-3 text-right font-mono text-emerald-400 font-bold">+100 pts</div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center border-b border-slate-800/60 hover:bg-slate-800/20">
              <div className="col-span-6 text-red-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Critical Contradictions & Factual Conflicts
              </div>
              <div className="col-span-3 text-center font-mono text-slate-400">-25 pts each</div>
              <div className="col-span-3 text-right font-mono text-red-400 font-bold">
                -{score.criticalPenalties} pts
              </div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center border-b border-slate-800/60 hover:bg-slate-800/20">
              <div className="col-span-6 text-amber-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Missing Fields & Unsupported Claims
              </div>
              <div className="col-span-3 text-center font-mono text-slate-400">-10 pts each</div>
              <div className="col-span-3 text-right font-mono text-amber-400 font-bold">
                -{score.warningPenalties} pts
              </div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center border-b border-slate-800/60 hover:bg-slate-800/20">
              <div className="col-span-6 text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Citation Mismatches / Non-Statutory Claims
              </div>
              <div className="col-span-3 text-center font-mono text-slate-400">-15 pts each</div>
              <div className="col-span-3 text-right font-mono text-purple-400 font-bold">
                -{score.citationPenalties} pts
              </div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-800/20">
              <div className="col-span-6 text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Ambiguous Phrases & Drafting Stylistics
              </div>
              <div className="col-span-3 text-center font-mono text-slate-400">-4 pts each</div>
              <div className="col-span-3 text-right font-mono text-slate-300 font-bold">
                -{score.infoPenalties} pts
              </div>
            </div>

            <div className="grid grid-cols-12 p-3 bg-slate-800/80 font-bold border-t border-slate-700">
              <div className="col-span-9 text-slate-100">Calculated Final Score (Floor: 0, Ceiling: 100)</div>
              <div className="col-span-3 text-right font-mono text-indigo-400 text-sm">
                {score.finalScore} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Ethical Legal Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider">
              Statutory Transparency & Limitation Notice
            </h5>
            <p className="text-slate-300 leading-relaxed">{score.disclaimer}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
