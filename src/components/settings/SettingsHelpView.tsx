import React, { useState, useEffect } from 'react';
import { StorageService, AppSettings } from '../../services/storage';
import {
  ShieldCheck,
  Settings,
  Lock,
  Database,
  Calculator,
  RotateCcw,
  BookOpen,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

export const SettingsHelpView: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');
  const [savedToast, setSavedToast] = useState(false);
  const [clearToast, setClearToast] = useState(false);

  useEffect(() => {
    setSettings(StorageService.getSettings());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings({
      ...settings,
      apiKey: apiKeyInput.trim(),
    });
    setSettings(StorageService.getSettings());
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleClearAllData = () => {
    if (confirm('Permanently delete all cases, uploaded documents, extracted facts, and audit reports from local storage?')) {
      StorageService.clearAllData();
      setClearToast(true);
      setTimeout(() => setClearToast(false), 3000);
    }
  };

  const cases = StorageService.getCases();
  const totalDocs = cases.reduce((sum, c) => sum + (c.documents?.length || 0), 0);
  const totalFacts = cases.reduce((sum, c) => sum + (c.extractedFacts?.length || 0), 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl space-y-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Transparency & System Configuration
        </span>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          Security, Transparency & Disclaimers
        </h1>
        <p className="text-xs text-slate-400">
          Inspect configuration status, understand our deterministic audit algorithms, and review privacy protections.
        </p>
      </div>

      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Settings saved successfully to local browser sandbox.
        </div>
      )}

      {clearToast && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-red-400" />
          All local cases and document records deleted.
        </div>
      )}

      {/* AI Provider & API Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings className="w-4 h-4 text-indigo-400" />
          AI Provider & Engine Configuration
        </h2>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Selected Drafting Engine</label>
            <select
              value={settings.aiProvider}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="offline_deterministic">
                Built-in Deterministic Engine (Offline Verified Templates — Default)
              </option>
              <option value="gemini">Google Gemini API (Requires local API key)</option>
              <option value="openai">OpenAI API (Requires local API key)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              In Offline mode, no external network requests are dispatched. Drafts and audits run entirely on your local machine.
            </p>
          </div>

          {settings.aiProvider !== 'offline_deterministic' && (
            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">
                {settings.aiProvider.toUpperCase()} API Key (Stored in your local session only)
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={`Paste your ${settings.aiProvider} key here...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-500">
                Never shared publicly or committed to source control. Configure in .env locally.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={settings.enableVoiceSynthesis}
                onChange={(e) =>
                  setSettings({ ...settings, enableVoiceSynthesis: e.target.checked })
                }
                className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
              />
              Enable Read-Aloud Voice Synthesis (Web Speech API)
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Layered Document Security & Privacy Notice (Objective 6) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lock className="w-4 h-4 text-emerald-400" />
          Layered Document Security & Privacy Architecture
        </h2>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              File Signature Verification & Path Traversal Prevention
            </h4>
            <p>
              Uploaded PDF, DOCX, and Image files are validated on the server via binary magic bytes (e.g. <code>%PDF</code>, <code>PK\x03\x04</code>, <code>\x89PNG</code>, <code>\xFF\xD8\xFF</code>) and strictly limited to 20 MB. Files are identified by cryptographically generated internal UUIDs, completely preventing path traversal vulnerabilities.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Prompt Injection Defense
            </h4>
            <p>
              Text extracted from uploaded evidence documents is treated strictly as passive, untrusted data. Any instructions or system prompt override attempts contained inside document bodies are quarantined and never executed as agent instructions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Security Limitations & Malware Scanning Disclosure
            </h4>
            <p>
              Malware scanning and binary virus checks are <strong>NOT</strong> implemented. Uploaded files are parsed in isolated memory sandboxes using pure JavaScript parsers (pdf-parse, mammoth, tesseract.js). Do not upload untrusted executable binary files (.exe, .bat, .sh).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              No Attorney-Client Privilege
            </h4>
            <p>
              DraftMate.ai is an assistive information and drafting workspace, not a law firm. Using this application does not create attorney-client confidentiality or legal privilege under the Indian Evidence Act, 1872 or the Bharatiya Sakshya Adhiniyam, 2023.
            </p>
          </div>
        </div>

        {/* Storage stats and Deletion control */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs text-slate-400 font-mono">
            Local Storage: {cases.length} cases • {totalDocs} files • {totalFacts} facts
          </div>

          <button
            onClick={handleClearAllData}
            className="px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Delete All Cases & Local Records
          </button>
        </div>
      </div>

      {/* Health Score Calculation Transparency */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calculator className="w-4 h-4 text-indigo-400" />
          Transparent Health Score Formula
        </h2>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
          <div className="text-indigo-400 font-bold">Base Clean Document = 100 points</div>
          <div>Deduction: Critical Contradictions = -25 points per finding</div>
          <div>Deduction: Non-Statutory / Citation Mismatches = -15 points per finding</div>
          <div>Deduction: Missing Fields / Placeholders = -10 points per finding</div>
          <div>Deduction: Ambiguous Phrases = -4 points per finding</div>
          <div className="text-slate-400 pt-1">
            Rule: Any active CRITICAL contradiction or non-statutory assertion automatically places the matter in the CRITICAL_RISK tier regardless of point total.
          </div>
        </div>
      </div>
    </div>
  );
};
