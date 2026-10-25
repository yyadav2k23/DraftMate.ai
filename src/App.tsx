import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { AuditReport, LegalCase } from './types';
import { Shell } from './components/layout/Shell';
import { DashboardView } from './components/dashboard/DashboardView';
import { DraftStudioView } from './components/draft/DraftStudioView';
import { VerifyStudioView } from './components/verify/VerifyStudioView';
import { FactReviewView } from './components/facts/FactReviewView';
import { DocumentLibraryView } from './components/library/DocumentLibraryView';
import { LegalSourcesView } from './components/sources/LegalSourcesView';
import { VoiceAssistantView } from './components/voice/VoiceAssistantView';
import { SettingsHelpView } from './components/settings/SettingsHelpView';
import { ExportAuditModal } from './components/export/ExportAuditModal';
import { runDocumentAudit } from './engine';

export function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeCaseId, setActiveCaseId] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [exportModalReport, setExportModalReport] = useState<AuditReport | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    StorageService.initialize();
    const cases = StorageService.getCases();
    if (cases.length > 0) {
      setActiveCaseId(cases[0].id);
    }
  }, []);

  const handleNavigate = (view: string, caseOrDocId?: string) => {
    setCurrentView(view);
    if (caseOrDocId) {
      if (caseOrDocId.startsWith('case-')) {
        setActiveCaseId(caseOrDocId);
        StorageService.setActiveCaseId(caseOrDocId);
      } else {
        setSelectedDocId(caseOrDocId);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenExportModal = (report?: AuditReport) => {
    if (report) {
      setExportModalReport(report);
    } else {
      const activeCase = StorageService.getCaseById(activeCaseId);
      if (activeCase) {
        setExportModalReport({
          id: `audit-${activeCase.id}`,
          caseId: activeCase.id,
          documentId: activeCase.id,
          documentTitle: activeCase.title,
          generatedAt: new Date().toISOString(),
          healthScore: {
            baseScore: 100,
            criticalPenalties: 0,
            warningPenalties: 0,
            infoPenalties: 0,
            citationPenalties: 0,
            finalScore: 100,
            grade: 'EXCELLENT',
            summary: 'Case documents and extracted facts audited.',
            disclaimer: 'Informational analysis only.',
          },
          findings: activeCase.findings || [],
          summary: {
            criticalCount: 0,
            warningCount: 0,
            infoCount: 0,
            resolvedCount: 0,
            openCount: 0,
          },
          verifiedCitations: [],
          disclaimer: 'Informational analysis only.',
        });
      }
    }
    setIsExportModalOpen(true);
  };

  const currentCase = StorageService.getCaseById(activeCaseId) || null;

  return (
    <Shell currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'dashboard' && (
        <DashboardView
          onNavigate={handleNavigate}
          onOpenExportModal={handleOpenExportModal}
        />
      )}

      {currentView === 'verify' && (
        <VerifyStudioView
          currentCaseId={activeCaseId}
          onNavigateToDraft={(caseId) => handleNavigate('draft', caseId)}
          onNavigateToFacts={(caseId) => handleNavigate('facts', caseId)}
          onOpenExportModal={handleOpenExportModal}
        />
      )}

      {currentView === 'facts' && (
        <FactReviewView
          legalCase={currentCase}
          onCaseUpdated={(updated) => {
            setActiveCaseId(updated.id);
          }}
          onNavigateToVerify={(caseId) => handleNavigate('verify', caseId)}
        />
      )}

      {currentView === 'draft' && (
        <DraftStudioView
          initialDocumentId={selectedDocId}
          onNavigateToVerify={(docId) => handleNavigate('verify', docId)}
          onOpenExportModal={() => handleOpenExportModal()}
        />
      )}

      {currentView === 'library' && (
        <DocumentLibraryView
          onNavigateToDraft={(docId) => handleNavigate('draft', docId)}
          onNavigateToVerify={(docId) => handleNavigate('verify', docId)}
          onOpenCreateDraft={() => handleNavigate('draft')}
        />
      )}

      {currentView === 'sources' && <LegalSourcesView />}

      {currentView === 'voice' && <VoiceAssistantView />}

      {currentView === 'settings' && <SettingsHelpView />}

      {/* Global Export Modal */}
      <ExportAuditModal
        report={exportModalReport}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </Shell>
  );
}

export default App;
