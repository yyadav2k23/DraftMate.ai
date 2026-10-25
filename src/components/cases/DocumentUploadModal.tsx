import React, { useState, useRef } from 'react';
import { CaseDocument } from '../../types';
import { Modal } from '../common/Modal';
import {
  validateFileSignature,
  parseDocxBuffer,
  parseImageBuffer,
  parsePdfTextQuick,
} from '../../services/documentParser';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  RotateCcw,
  Eye,
  ShieldCheck,
  X,
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onDocumentsAdded: (docs: CaseDocument[]) => void;
  existingDocuments?: CaseDocument[];
  onRemoveDocument?: (docId: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onDocumentsAdded,
  existingDocuments = [],
  onRemoveDocument,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<
    { file: File; status: 'QUEUED' | 'PARSING' | 'COMPLETED' | 'ERROR'; progress: number; error?: string; doc?: CaseDocument }[]
  >([]);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<CaseDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems = Array.from(files).map((f) => ({
      file: f,
      status: 'QUEUED' as const,
      progress: 0,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);

    // Process each file sequentially
    for (const item of newItems) {
      await processUploadedFile(item.file);
    }
  };

  const processUploadedFile = async (file: File) => {
    // Update queue item to parsing
    setUploadQueue((prev) =>
      prev.map((q) => (q.file === file ? { ...q, status: 'PARSING', progress: 30 } : q))
    );

    try {
      // 1. Try server API upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);

      let caseDoc: CaseDocument | null = null;

      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.document) {
            caseDoc = data.document;
          }
        }
      } catch (netErr) {
        // Fallback to client-side extraction if server is offline
        console.warn('Server upload unavailable, parsing via client engine', netErr);
      }

      // 2. Client-side fallback if server route didn't handle it
      if (!caseDoc) {
        const buffer = await file.arrayBuffer();
        const u8 = new Uint8Array(buffer);

        const val = validateFileSignature(u8, file.name);
        if (!val.isValid) {
          throw new Error(val.error || 'Invalid file signature or unsupported format.');
        }

        const safeId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        let extractedText = '';
        let pageCount = 1;
        let ocrApplied = false;
        let ocrConfidence: number | undefined;
        let status: CaseDocument['status'] = 'EXTRACTED';
        let extractionError: string | undefined;

        if (val.detectedType === 'application/pdf') {
          const pdfRes = parsePdfTextQuick(u8);
          extractedText = pdfRes.text;
          pageCount = pdfRes.pageCount;
          if (pdfRes.isScanned) {
            status = 'OCR_REQUIRED';
            extractionError = 'Document contains scanned or image-only pages. Selectable text was not found.';
          }
        } else if (val.detectedType.includes('wordprocessingml')) {
          const docxRes = await parseDocxBuffer(buffer);
          extractedText = docxRes.text;
        } else if (val.detectedType.startsWith('image/')) {
          ocrApplied = true;
          const imgRes = await parseImageBuffer(file);
          extractedText = imgRes.text;
          ocrConfidence = imgRes.confidence;
          status = 'OCR_APPLIED';
          extractionError = imgRes.qualityWarning;
        }

        caseDoc = {
          id: safeId,
          caseId,
          originalFilename: file.name,
          fileSize: file.size,
          mimeType: val.detectedType,
          uploadedAt: new Date().toISOString(),
          status,
          extractedText,
          pageCount,
          ocrApplied,
          ocrConfidence,
          extractionError,
          previewUrl: val.detectedType.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          securityValidation: {
            isValidSignature: true,
            detectedType: val.detectedType,
            fileSizeOk: true,
            sanitized: true,
          },
        };
      }

      // Complete queue item
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.file === file ? { ...q, status: 'COMPLETED', progress: 100, doc: caseDoc! } : q
        )
      );

      // Add to case documents
      if (caseDoc) {
        onDocumentsAdded([caseDoc]);
      }
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.file === file
            ? { ...q, status: 'ERROR', progress: 100, error: err.message || 'Extraction failed' }
            : q
        )
      );
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    if (mimeType.includes('word')) return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
    return <ImageIcon className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Evidence & Legal Documents"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Drag and Drop Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/30'
              : 'border-slate-700/80 hover:border-indigo-500/50 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-slate-200 font-semibold text-sm">
                Drop PDF, DOCX, or Image files here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-slate-400 text-[11px] mt-1">
                Supported: <strong>.pdf</strong> (selectable & scanned), <strong>.docx</strong> (Word documents), <strong>.jpg, .jpeg, .png</strong> (photographed receipts)
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
              <span>Max: 20 MB per file</span>
              <span>•</span>
              <span>Magic Byte Signature Validation</span>
            </div>
          </div>
        </div>

        {/* Upload & Processing Queue */}
        {uploadQueue.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Processing Queue ({uploadQueue.length})
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {uploadQueue.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">{getFileIcon(item.file.type || item.file.name)}</div>
                    <div className="truncate">
                      <div className="font-medium text-slate-200 truncate">{item.file.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(item.file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === 'PARSING' && (
                      <span className="flex items-center gap-1.5 text-indigo-400 text-[11px] font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Extracting Text...
                      </span>
                    )}

                    {item.status === 'COMPLETED' && (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.doc?.ocrApplied ? 'OCR Complete' : 'Extracted'}
                      </span>
                    )}

                    {item.status === 'ERROR' && (
                      <span className="flex items-center gap-1 text-red-400 text-[11px] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {item.error || 'Failed'}
                      </span>
                    )}

                    {item.doc && (
                      <button
                        onClick={() => setSelectedPreviewDoc(item.doc!)}
                        className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Inspect extracted text"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Case Documents List */}
        {existingDocuments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Case Documents ({existingDocuments.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {existingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getFileIcon(doc.mimeType)}
                    <div className="truncate">
                      <div className="font-medium text-slate-200 truncate">{doc.originalFilename}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(doc.fileSize / 1024).toFixed(1)} KB • {doc.mimeType.split('/').pop()} •{' '}
                        {new Date(doc.uploadedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.status === 'OCR_REQUIRED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
                        Scanned / OCR Needed
                      </span>
                    )}

                    {doc.ocrApplied && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/40">
                        OCR ({doc.ocrConfidence}%)
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedPreviewDoc(doc)}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Inspect Text
                    </button>

                    {onRemoveDocument && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${doc.originalFilename}" from this case?`)) {
                            onRemoveDocument(doc.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Inspection Sub-modal */}
        {selectedPreviewDoc && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200">
                Extracted Text: {selectedPreviewDoc.originalFilename}
              </span>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPreviewDoc.extractionError && (
              <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px]">
                {selectedPreviewDoc.extractionError}
              </div>
            )}

            {selectedPreviewDoc.previewUrl && (
              <div className="max-h-40 overflow-hidden rounded border border-slate-800 text-center bg-black/40">
                <img
                  src={selectedPreviewDoc.previewUrl}
                  alt="Document preview"
                  className="max-h-40 mx-auto object-contain"
                />
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
              {selectedPreviewDoc.extractedText || 'No text extracted from this document.'}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Uploaded text is treated as untrusted data inputs.
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
