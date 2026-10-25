import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { CaseDocument, LegalCase, LegalDocument } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit3,
  ShieldCheck,
  PlusCircle,
  Download,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  FileCheck,
  FolderOpen,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface DocumentLibraryViewProps {
  onNavigateToDraft: (docId: string) => void;
  onNavigateToVerify: (docId: string) => void;
  onOpenCreateDraft: () => void;
}

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({
  onNavigateToDraft,
  onNavigateToVerify,
  onOpenCreateDraft,
}) => {
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'DRAFTS'>('EVIDENCE');
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');
  const [draftDocuments, setDraftDocuments] = useState<LegalDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [docToDelete, setDocToDelete] = useState<LegalDocument | null>(null);
  const [inspectedDoc, setInspectedDoc] = useState<CaseDocument | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const allCases = StorageService.getCases();
    setCases(allCases);
    setDraftDocuments(StorageService.getDocuments());
  };

  const handleDuplicate = (id: string) => {
    const copy = StorageService.duplicateDocument(id);
    if (copy) {
      setDraftDocuments(StorageService.getDocuments());
      showNotification(`Duplicated document as "${copy.title}"`);
    }
  };

  const confirmDelete = () => {
    if (!docToDelete) return;
    StorageService.deleteDocument(docToDelete.id);
    setDraftDocuments(StorageService.getDocuments());
    showNotification(`Deleted "${docToDelete.title}"`);
    setDocToDelete(null);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportText = (doc: LegalDocument) => {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compile all evidence documents across cases
  const allEvidenceDocs: { doc: CaseDocument; caseTitle: string; caseRef?: string; caseId: string }[] = [];
  cases.forEach((c) => {
    if (selectedCaseId === 'ALL' || c.id === selectedCaseId) {
      (c.documents || []).forEach((d) => {
        allEvidenceDocs.push({
          doc: d,
          caseTitle: c.title,
          caseRef: c.referenceNumber,
          caseId: c.id,
        });
      });
    }
  });

  // Filter evidence docs
  const filteredEvidence = allEvidenceDocs.filter(({ doc, caseTitle }) => {
    const matchesSearch =
      doc.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'IMAGE' && (doc.isImage || doc.mimeType.startsWith('image/'))) ||
      (typeFilter === 'PDF' && doc.mimeType.includes('pdf')) ||
      (typeFilter === 'DOCX' && doc.mimeType.includes('word'));

    return matchesSearch && matchesType;
  });

  // Filter draft docs
  const filteredDrafts = draftDocuments.filter((doc) => {
    const matchesCase = selectedCaseId === 'ALL' || doc.caseId === selectedCaseId;

    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.parties.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;

    return matchesCase && matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Evidence & Drafting Library
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Cross-Document Integration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Case Document Library
          </h1>
          <p className="text-xs text-slate-400">
            Inspect source evidence files (PDF, Word DOCX, PNG, JPG) and generated legal drafts connected to each matter.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateDraft}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Draft
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {notification}
        </div>
      )}

      {/* Case Selector and Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        {/* Case Filter Selector */}
        <div className="flex items-center gap-3">
          <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">Filter Case:</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 max-w-xs truncate"
            >
              <option value="ALL">All Matters ({cases.length} Cases)</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.referenceNumber ? `[${c.referenceNumber}] ` : ''}
                  {c.title.replace(/^\[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER\]\s*/, '')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'EVIDENCE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Case Evidence Files ({allEvidenceDocs.length})
          </button>
          <button
            onClick={() => setActiveTab('DRAFTS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'DRAFTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Case Legal Drafts ({draftDocuments.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'EVIDENCE'
                ? 'Search evidence files by filename, extracted text, or matter...'
                : 'Search drafts by title, party names, or text content...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {activeTab === 'EVIDENCE' ? (
              <>
                <option value="ALL">All File Formats</option>
                <option value="PDF">PDF Documents</option>
                <option value="DOCX">Word DOCX Files</option>
                <option value="IMAGE">Image Evidence (PNG / JPG)</option>
              </>
            ) : (
              <>
                <option value="ALL">All Draft Types</option>
                <option value="LEGAL_NOTICE_COMMERCIAL_DUES">Commercial Dues Notices</option>
                <option value="SALARY_CLARIFICATION_REPRESENTATION">Salary Clarification Representations</option>
                <option value="SECURITY_DEPOSIT_RECONCILIATION">Security Deposit Requisitions</option>
                <option value="CONSUMER_DEFECTIVE_GOODS_COMPLAINT">Consumer Defect Complaints</option>
                <option value="LOAN_REPAYMENT_RECONCILIATION">Loan Repayment Demands</option>
                <option value="DELIVERY_DISCREPANCY_JOINT_INSPECTION">Logistics Delivery Discrepancies</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* TAB 1: EVIDENCE FILES GRID */}
      {activeTab === 'EVIDENCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvidence.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No evidence documents found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No uploaded files match your search filter or selected case.
              </p>
            </div>
          ) : (
            filteredEvidence.map(({ doc, caseTitle, caseRef }) => {
              const isImage = doc.isImage || doc.mimeType.startsWith('image/');
              const formatLabel = doc.mimeType.includes('pdf')
                ? 'PDF'
                : doc.mimeType.includes('word') || doc.mimeType.includes('openxml')
                ? 'DOCX'
                : doc.mimeType.includes('png')
                ? 'PNG'
                : doc.mimeType.includes('jpeg') || doc.mimeType.includes('jpg')
                ? 'JPEG'
                : 'FILE';

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                            formatLabel === 'PDF'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                              : formatLabel === 'DOCX'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-500/30'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {formatLabel}
                        </span>
                        {isImage && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" />
                            Image Evidence
                          </span>
                        )}
                        {doc.ocrApplied && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            {doc.ocrConfidence || 95}% OCR
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {/* Image Preview Thumbnail if available */}
                    {isImage && doc.imageDataUri && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
                        <img
                          src={doc.imageDataUri}
                          alt={doc.originalFilename}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-[8px] font-mono text-amber-300 border border-amber-500/40">
                          Synthetic Demo
                        </div>
                      </div>
                    )}

                    {/* Document Title & Case Ref */}
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {doc.originalFilename}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        <strong>Matter: </strong>
                        {caseRef ? `[${caseRef}] ` : ''}
                        {caseTitle.replace(/^\[FICTIONAL TEST CASE — NOT A REAL LEGAL MATTER\]\s*/, '')}
                      </div>
                    </div>

                    {/* Provenance & Text snippet */}
                    {doc.sourceProvenance && (
                      <div className="text-[11px] text-indigo-300/80 bg-indigo-950/30 px-2 py-1 rounded border border-indigo-500/20 truncate">
                        <strong>Provenance: </strong>
                        {doc.sourceProvenance}
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 line-clamp-3 font-mono leading-relaxed">
                      {doc.extractedText || 'No text content available.'}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <button
                      onClick={() => setInspectedDoc(doc)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Evidence
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: DRAFTS GRID */}
      {activeTab === 'DRAFTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrafts.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No draft documents found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No legal drafts match your filter parameters. Click "Create New Draft" to draft a legal instrument.
              </p>
              <button
                onClick={onOpenCreateDraft}
                className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Draft a Document
              </button>
            </div>
          ) : (
            filteredDrafts.map((doc) => {
              const audit = StorageService.getAuditReport(doc.id);

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                        {doc.type.replace(/_/g, ' ')}
                      </span>
                      {doc.isDemoCase && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                          Demo Draft
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {doc.title}
                    </h3>

                    <div className="text-xs text-slate-400 space-y-1 pt-1">
                      <div className="truncate">
                        <strong>Parties: </strong>
                        {doc.parties.map((p) => p.name).join(' vs ') || 'Unspecified'}
                      </div>
                      {doc.amounts.principalClaim ? (
                        <div className="font-mono text-emerald-400">
                          Claim: ₹{doc.amounts.principalClaim.toLocaleString('en-IN')}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Audit Health Pill */}
                  {audit && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Audit Score:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {audit.healthScore.finalScore} / 100
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          audit.healthScore.grade === 'CRITICAL_RISK'
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {audit.healthScore.grade.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onNavigateToVerify(doc.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
                        title="Verify and audit this document"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify
                      </button>
                      <button
                        onClick={() => onNavigateToDraft(doc.id)}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                        title="Edit in Draft Studio"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => handleExportText(doc)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="Export TXT"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(doc.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="Duplicate Document"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="p-1.5 rounded-lg hover:bg-red-950/60 hover:text-red-300 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Evidence Inspection Modal */}
      {inspectedDoc && (
        <Modal
          isOpen={Boolean(inspectedDoc)}
          onClose={() => setInspectedDoc(null)}
          title={`Evidence File Inspection: ${inspectedDoc.originalFilename}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Metadata Overview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">MIME Type</span>
                <span className="font-mono text-slate-200">{inspectedDoc.mimeType}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">File Size</span>
                <span className="font-mono text-slate-200">
                  {(inspectedDoc.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">OCR Status</span>
                <span className="font-mono text-emerald-400">
                  {inspectedDoc.ocrApplied
                    ? `Applied (${inspectedDoc.ocrConfidence || 95}%)`
                    : 'Text Stream Direct'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Document Category</span>
                <span className="font-mono text-indigo-300">
                  {inspectedDoc.documentCategory || 'PRIMARY_DOCUMENT'}
                </span>
              </div>
            </div>

            {/* Source Provenance */}
            {inspectedDoc.sourceProvenance && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                <span className="font-semibold text-indigo-300 block mb-0.5">
                  Source Provenance & Chain of Custody:
                </span>
                <p className="text-slate-300">{inspectedDoc.sourceProvenance}</p>
              </div>
            )}

            {/* Visual Image Render if Image Evidence */}
            {(inspectedDoc.isImage || inspectedDoc.mimeType.startsWith('image/')) &&
              inspectedDoc.imageDataUri && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                      Visual Image Evidence
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                      [FICTIONAL DEMO EVIDENCE — NOT A REAL DOCUMENT]
                    </span>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 text-center">
                    <img
                      src={inspectedDoc.imageDataUri}
                      alt={inspectedDoc.originalFilename}
                      className="w-full max-h-80 object-contain mx-auto rounded-lg"
                    />
                  </div>

                  {inspectedDoc.imageMetadata && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] grid grid-cols-3 gap-2 font-mono text-slate-400">
                      <div>Dimensions: {inspectedDoc.imageMetadata.width} × {inspectedDoc.imageMetadata.height}px</div>
                      <div>Engine: {inspectedDoc.imageMetadata.ocrEngine}</div>
                      <div>Confidence: {inspectedDoc.imageMetadata.extractionConfidence}%</div>
                    </div>
                  )}
                </div>
              )}

            {/* Extracted Text Content */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Parsed & Extracted Text
              </span>
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {inspectedDoc.extractedText}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        title="Confirm Document Deletion"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-200 leading-relaxed">
              Are you sure you want to delete <strong>"{docToDelete?.title}"</strong>? This will also remove associated audit reports from local storage.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDocToDelete(null)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
            >
              Delete Document
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
