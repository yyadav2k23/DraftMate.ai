import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { CURATED_LEGAL_SOURCES } from '../src/data/legalSourcesData';
import { extractCaseFacts } from '../src/engine/factExtractor';
import { detectCrossDocumentContradictions } from '../src/engine/crossDocumentContradiction';
import type { CaseDocument, LegalCase } from '../src/types';

export const apiRouter = Router();

// Configure Multer with Memory Storage & 20MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB limit
  },
});

/**
 * Validates magic bytes / file signatures server-side
 */
function checkServerFileSignature(buffer: Buffer, originalname: string): { isValid: boolean; mimeType: string; error?: string } {
  const ext = originalname.split('.').pop()?.toLowerCase();

  // PDF signature: %PDF (0x25, 0x50, 0x44, 0x46)
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    if (ext !== 'pdf') return { isValid: false, mimeType: 'application/pdf', error: 'PDF content detected with mismatched file extension.' };
    return { isValid: true, mimeType: 'application/pdf' };
  }

  // PNG signature: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    if (ext !== 'png') return { isValid: false, mimeType: 'image/png', error: 'PNG content detected with mismatched file extension.' };
    return { isValid: true, mimeType: 'image/png' };
  }

  // JPEG signature: 0xFF, 0xD8, 0xFF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    if (ext !== 'jpg' && ext !== 'jpeg') return { isValid: false, mimeType: 'image/jpeg', error: 'JPEG content detected with mismatched file extension.' };
    return { isValid: true, mimeType: 'image/jpeg' };
  }

  // DOCX (Zip archive): 0x50, 0x4B, 0x03, 0x04
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    if (ext !== 'docx') return { isValid: false, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', error: 'DOCX archive detected with invalid extension.' };
    return { isValid: true, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }

  return {
    isValid: false,
    mimeType: 'unknown',
    error: 'Unsupported file format or invalid file signature. Only PDF, DOCX, JPG, and PNG are permitted.',
  };
}

/**
 * Sanitizes untrusted document text to prevent control character exploitation
 * and treats instructions inside documents strictly as untrusted content.
 */
function sanitizeServerText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\0/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * POST /api/documents/upload
 * Handles document upload, server-side signature validation, and text extraction.
 */
apiRouter.post('/documents/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const caseId = (req.body.caseId as string) || `case-${Date.now()}`;

    if (!file) {
      res.status(400).json({ error: 'No file received in request.' });
      return;
    }

    // 1. Validate file size and signature
    const validation = checkServerFileSignature(file.buffer, file.originalname);
    if (!validation.isValid) {
      res.status(400).json({
        error: validation.error,
        filename: file.originalname,
        detectedType: validation.mimeType,
      });
      return;
    }

    const safeDocId = `doc-${crypto.randomUUID()}`;
    let extractedText = '';
    let pageCount = 1;
    let status: CaseDocument['status'] = 'EXTRACTED';
    let ocrApplied = false;
    let ocrConfidence: number | undefined;
    let extractionError: string | undefined;
    let paragraphs: CaseDocument['paragraphs'] = [];

    // 2. Perform Extraction based on verified MIME type
    if (validation.mimeType === 'application/pdf') {
      try {
        let rawText = '';
        if (typeof pdfModule === 'function') {
          const parsed = await pdfModule(file.buffer);
          rawText = parsed.text || '';
          pageCount = parsed.numpages || 1;
        } else if (pdfModule && pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse({ data: file.buffer });
          try {
            await parser.load();
            const result = await parser.getText();
            rawText = result.text || '';
            pageCount = result.total || result.pages?.length || 1;
          } finally {
            await parser.destroy();
          }
        } else {
          throw new Error('PDF parsing engine not initialized.');
        }

        extractedText = sanitizeServerText(rawText);

        if (extractedText.length < 40) {
          // Detected scanned or image-only PDF
          status = 'OCR_REQUIRED';
          extractionError = 'Document contains scanned or image-only pages with no selectable text. OCR or a text-searchable PDF is required.';
        } else {
          status = 'EXTRACTED';
          paragraphs = extractedText
            .split('\n\n')
            .filter((p) => p.trim().length > 0)
            .map((p, idx) => ({ index: idx + 1, text: p.trim() }));
        }
      } catch (pdfErr: any) {
        status = 'FAILED';
        extractionError = `Failed to parse PDF document: ${pdfErr.message}`;
      }
    } else if (validation.mimeType.includes('wordprocessingml')) {
      try {
        const parsed = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = sanitizeServerText(parsed.value);
        status = 'EXTRACTED';
        paragraphs = extractedText
          .split('\n\n')
          .filter((p) => p.trim().length > 0)
          .map((p, idx) => ({
            index: idx + 1,
            text: p.trim(),
            heading: p.trim().length < 80 && /^[A-Z0-9\s:._-]+$/.test(p.trim()),
          }));
      } catch (docxErr: any) {
        status = 'FAILED';
        extractionError = `Failed to parse DOCX: ${docxErr.message}`;
      }
    } else if (validation.mimeType.startsWith('image/')) {
      try {
        ocrApplied = true;
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file.buffer);
        await worker.terminate();

        extractedText = sanitizeServerText(ret.data.text);
        ocrConfidence = Math.round(ret.data.confidence || 0);
        status = 'OCR_APPLIED';

        if (ocrConfidence < 50 || extractedText.length < 15) {
          extractionError = `Low OCR confidence (${ocrConfidence}%). Image resolution, blur, or rotation limits extraction certainty.`;
        }

        paragraphs = extractedText
          .split('\n')
          .filter((p) => p.trim().length > 0)
          .map((p, idx) => ({ index: idx + 1, text: p.trim() }));
      } catch (imgErr: any) {
        status = 'FAILED';
        extractionError = `OCR image extraction failed: ${imgErr.message}`;
      }
    }

    // Build preview data URL for images and small files
    let previewUrl: string | undefined;
    if (validation.mimeType.startsWith('image/')) {
      previewUrl = `data:${validation.mimeType};base64,${file.buffer.toString('base64')}`;
    }

    const caseDoc: CaseDocument = {
      id: safeDocId,
      caseId,
      originalFilename: file.originalname,
      fileSize: file.size,
      mimeType: validation.mimeType,
      uploadedAt: new Date().toISOString(),
      status,
      extractedText,
      pageCount,
      paragraphs,
      ocrApplied,
      ocrEngine: ocrApplied ? 'Tesseract.js v7 OCR Engine' : undefined,
      ocrConfidence,
      extractionError,
      previewUrl,
      securityValidation: {
        isValidSignature: true,
        detectedType: validation.mimeType,
        fileSizeOk: true,
        sanitized: true,
      },
    };

    res.status(200).json({ success: true, document: caseDoc });
  } catch (err: any) {
    res.status(500).json({ error: `Server upload handler error: ${err.message}` });
  }
});

/**
 * POST /api/cases/:caseId/extract-facts
 * Structured Fact Extraction across case documents.
 */
apiRouter.post('/cases/:caseId/extract-facts', (req: Request, res: Response) => {
  try {
    const caseId = req.params.caseId as string;
    const documents: CaseDocument[] = req.body.documents || [];

    const facts = extractCaseFacts(documents, caseId);
    res.status(200).json({ success: true, facts });
  } catch (err: any) {
    res.status(500).json({ error: `Fact extraction failed: ${err.message}` });
  }
});

/**
 * POST /api/cases/:caseId/detect-contradictions
 * Cross-document contradiction detection.
 */
apiRouter.post('/cases/:caseId/detect-contradictions', (req: Request, res: Response) => {
  try {
    const legalCase: LegalCase = req.body.legalCase;
    if (!legalCase) {
      res.status(400).json({ error: 'Missing legalCase payload.' });
      return;
    }

    const findings = detectCrossDocumentContradictions(legalCase);
    res.status(200).json({ success: true, findings });
  } catch (err: any) {
    res.status(500).json({ error: `Contradiction detection failed: ${err.message}` });
  }
});

/**
 * GET /api/legal-sources/search
 * Searches curated primary Indian legal sources (Constitution + India Code).
 */
apiRouter.get('/legal-sources/search', (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').toLowerCase().trim();
  const category = (req.query.category as string) || 'ALL';

  let results = CURATED_LEGAL_SOURCES;
  if (category !== 'ALL') {
    results = results.filter((s) => s.category === category);
  }

  if (query) {
    results = results.filter(
      (s) =>
        s.shortTitle.toLowerCase().includes(query) ||
        s.provision.toLowerCase().includes(query) ||
        s.subject.toLowerCase().includes(query) ||
        s.statutoryText.toLowerCase().includes(query)
    );
  }

  res.status(200).json({ success: true, count: results.length, results });
});

/**
 * POST /api/legal-sources/probe
 * Tests live reachability of official government legal portals.
 */
apiRouter.post('/legal-sources/probe', async (req: Request, res: Response) => {
  const url = (req.body.url as string) || '';
  if (!url || !url.startsWith('http')) {
    res.status(400).json({ error: 'Valid URL is required.' });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const probeResp = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    res.status(200).json({
      url,
      isReachable: probeResp.status < 500,
      httpStatus: probeResp.status,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(200).json({
      url,
      isReachable: false,
      httpStatus: 0,
      error: err.message,
      checkedAt: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/security/info
 * Transparent disclosure of application security controls and limitations.
 */
apiRouter.get('/security/info', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ACTIVE',
    storageMode: 'Local Browser Sandboxed + Ephemeral Server In-Memory Processing',
    secretsManagement: 'Server-side isolation. API keys are never bundled in client code.',
    fileSignatureVerification: 'Enabled for PDF (%PDF), PNG, JPEG, and DOCX (PK ZIP).',
    promptInjectionProtection:
      'Document contents are treated strictly as untrusted data inputs and cannot override system prompts.',
    malwareScanningStatus:
      'Malware/antivirus scanning is NOT currently implemented. Do not upload untrusted executable binaries.',
    attorneyClientPrivilege:
      'None. DraftMate.ai is an automated informational workspace, not a law firm or legal representative.',
  });
});
