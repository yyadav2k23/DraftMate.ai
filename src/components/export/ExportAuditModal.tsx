import React from 'react';
import { AuditReport, LegalDocument } from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { Download, Printer, FileText, CheckCircle2, ShieldCheck, Copy } from 'lucide-react';

interface ExportAuditModalProps {
  report: AuditReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportAuditModal: React.FC<ExportAuditModalProps> = ({ report, isOpen, onClose }) => {
  if (!report) return null;

  const doc = StorageService.getDocumentById(report.documentId);

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_report_${report.documentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    let md = `# Legal Audit Report: ${report.documentTitle}\n\n`;
    md += `**Generated:** ${report.generatedAt}\n`;
    md += `**Document Health Score:** ${report.healthScore.finalScore} / 100 (${report.healthScore.grade})\n\n`;
    md += `## Transparent Health Score Breakdown\n`;
    md += `- Base Clean Document: +100 pts\n`;
    md += `- Critical Contradictions Penalty: -${report.healthScore.criticalPenalties} pts\n`;
    md += `- Warning Deductions: -${report.healthScore.warningPenalties} pts\n`;
    md += `- Citation Mismatches / Non-Statutory Claims: -${report.healthScore.citationPenalties} pts\n`;
    md += `- Info Deductions: -${report.healthScore.infoPenalties} pts\n\n`;
    md += `## Prioritized Findings (${report.findings.length})\n\n`;

    for (const f of report.findings) {
      md += `### [${f.severity}] ${f.title}\n`;
      md += `- **Category:** ${f.category}\n`;
      md += `- **Detection Method:** ${f.detectionMethod}\n`;
      md += `- **Status:** ${f.status}\n`;
      md += `- **Explanation:** ${f.explanation}\n`;
      md += `- **Recommended Action:** ${f.recommendedAction}\n`;

      if (f.contradictionDetails) {
        md += `\n**Conflicting Records Comparison:**\n`;
        md += `* Record A: ${f.contradictionDetails.recordA.title} - "${f.contradictionDetails.recordA.excerpt}"\n`;
        md += `* Record B: ${f.contradictionDetails.recordB.title} - "${f.contradictionDetails.recordB.excerpt}"\n`;
        md += `* Neutrality Rule: ${f.contradictionDetails.nonJudgmentalNotice}\n`;
      }
      md += `\n---\n\n`;
    }

    md += `## Statutory & Regulatory Disclaimer\n`;
    md += `${report.disclaimer}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_report_${report.documentId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Shareable Legal Audit Report"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Report Overview Card */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">{report.documentTitle}</h4>
            <div className="text-xs text-slate-400 mt-1">
              Generated: {new Date(report.generatedAt).toLocaleString()} | Findings: {report.findings.length}
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-bold text-slate-100">
              {report.healthScore.finalScore}
            </span>
            <span className="text-xs text-slate-400"> / 100</span>
          </div>
        </div>

        {/* Quick export formats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadMarkdown}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 text-center transition-all group"
          >
            <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Markdown (.md)</div>
              <div className="text-[10px] text-slate-400">For documentation & repos</div>
            </div>
          </button>

          <button
            onClick={handleDownloadJson}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 text-center transition-all group"
          >
            <Download className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-semibold text-slate-200">JSON Audit Packet</div>
              <div className="text-[10px] text-slate-400">Machine-readable data</div>
            </div>
          </button>

          <button
            onClick={handlePrint}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 text-center transition-all group"
          >
            <Printer className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-semibold text-slate-200">Print / PDF View</div>
              <div className="text-[10px] text-slate-400">Formal printable packet</div>
            </div>
          </button>
        </div>

        {/* Audit Packet Contents Preview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 max-h-48 overflow-y-auto font-mono text-slate-300">
          <div className="text-indigo-400 font-bold">--- AUDIT REPORT SUMMARY ---</div>
          <div>Health Score: {report.healthScore.finalScore}/100 ({report.healthScore.grade})</div>
          <div>Critical Contradictions: {report.summary.criticalCount}</div>
          <div>Warnings: {report.summary.warningCount}</div>
          <div>Verified Statutory Provisions: {report.verifiedCitations.length}</div>
          <div className="text-slate-500 pt-1">
            Disclaimer: {report.disclaimer.slice(0, 100)}...
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
