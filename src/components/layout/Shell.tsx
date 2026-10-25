import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileEdit,
  FolderOpen,
  Scale,
  Mic,
  Settings,
  ShieldCheck,
  Menu,
  X,
  FileSearch,
  Briefcase,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { LegalCase } from '../../types';
import { CaseModal } from '../cases/CaseModal';

interface ShellProps {
  currentView: string;
  onNavigate: (view: string, caseOrDocId?: string) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ currentView, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>('');
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  useEffect(() => {
    loadCases();
  }, [currentView]);

  const loadCases = () => {
    const stored = StorageService.getCases();
    setCases(stored);
    const active = StorageService.getActiveCaseId() || (stored.length > 0 ? stored[0].id : '');
    setActiveCaseId(active);
  };

  const handleCaseChange = (caseId: string) => {
    setActiveCaseId(caseId);
    StorageService.setActiveCaseId(caseId);
    onNavigate(currentView, caseId);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'verify', label: 'Verify Studio', icon: ShieldCheck, badge: 'Signature' },
    { id: 'facts', label: 'Fact Review', icon: FileSearch },
    { id: 'draft', label: 'Draft Studio', icon: FileEdit },
    { id: 'library', label: 'Document Library', icon: FolderOpen },
    { id: 'sources', label: 'Legal Sources', icon: Scale },
    { id: 'voice', label: 'Voice Assistant', icon: Mic },
    { id: 'settings', label: 'Settings & Help', icon: Settings },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId, activeCaseId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            D
          </div>
          <div>
            <span className="font-bold text-slate-100 text-sm tracking-tight">DraftMate.ai</span>
            <span className="text-[10px] text-slate-400 block -mt-1">LegalTech Studio</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Left Navigation Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-base tracking-tight flex items-center gap-1.5">
                DraftMate.ai
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Draft smarter. Verify deeper.
              </p>
            </div>
          </div>

          {/* Active Case Context Pill */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-indigo-400" /> Active Case
              </span>
              <button
                onClick={() => setIsCaseModalOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 font-bold"
                title="Create a new case"
              >
                + New
              </button>
            </div>

            {cases.length > 0 ? (
              <div className="space-y-1.5">
                <select
                  value={activeCaseId}
                  onChange={(e) => handleCaseChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 truncate"
                >
                  {cases.filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-')).length > 0 && (
                    <optgroup label="Client Matters">
                      {cases
                        .filter((c) => !c.isDemoCase && !c.id.startsWith('case-demo-'))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
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
                            [DEMO] {c.title.replace(/^\[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER\]\s*/i, '')}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>

                {cases.find((c) => c.id === activeCaseId)?.isDemoCase && (
                  <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">FICTIONAL TEST CASE</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsCaseModalOpen(true)}
                className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-colors"
              >
                + Create First Case
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Jurisdiction:</span>
              <span className="text-slate-300 font-mono">India (Central)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Constitution & Law:</span>
              <span className="text-emerald-400 font-mono font-medium">B.S.A. 2023</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-[10px] text-slate-500">
            <span>v2.0 • Case Intelligence</span>
            <span className="text-indigo-400">Safe Sandbox</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0a0f1d]/60 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-200 capitalize">
              {currentView.replace(/_/g, ' ')}
            </h2>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-xs text-slate-400 font-mono">
              DraftMate.ai Workspace
            </span>
            {cases.find((c) => c.id === activeCaseId)?.isDemoCase && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCaseModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Case
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="px-8 py-4 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#090d16]">
          <div>
            DraftMate.ai — <em>Draft confidently. Check carefully. Know what needs a lawyer.</em>
          </div>
          <div className="text-[11px] text-slate-600">
            Legal informational assistant only. Not a licensed advocate or legal advice provider.
          </div>
        </footer>
      </div>

      {/* Case Creation Modal */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => {
          setIsCaseModalOpen(false);
          loadCases();
        }}
        onSaveCase={(newCase) => {
          StorageService.saveCase(newCase);
          loadCases();
          onNavigate('dashboard', newCase.id);
        }}
      />
    </div>
  );
};
