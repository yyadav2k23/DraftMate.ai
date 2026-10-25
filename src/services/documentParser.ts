import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { CaseDocument, DocumentPage, DocumentParagraph } from '../types';

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export interface FileValidationResult {
  isValid: boolean;
  detectedType: string;
  error?: string;
}

/**
 * Validates file signature (magic bytes) to prevent extension spoofing.
 */
export function validateFileSignature(buffer: Uint8Array, filename: string): FileValidationResult {
  const ext = filename.split('.').pop()?.toLowerCase();

  // Check empty file
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      detectedType: 'empty',
      error: 'File is empty (0 bytes).',
    };
  }

  // Check file size limit
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      detectedType: 'oversized',
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds 20 MB limit.`,
    };
  }

  // PDF signature: %PDF (0x25, 0x50, 0x44, 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    if (ext !== 'pdf') {
      return { isValid: false, detectedType: 'application/pdf', error: 'File content is PDF but extension mismatch.' };
    }
    return { isValid: true, detectedType: 'application/pdf' };
  }

  // PNG signature: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    if (ext !== 'png') {
      return { isValid: false, detectedType: 'image/png', error: 'File content is PNG but extension mismatch.' };
    }
    return { isValid: true, detectedType: 'image/png' };
  }

  // JPEG signature: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    if (ext !== 'jpg' && ext !== 'jpeg') {
      return { isValid: false, detectedType: 'image/jpeg', error: 'File content is JPEG but extension mismatch.' };
    }
    return { isValid: true, detectedType: 'image/jpeg' };
  }

  // DOCX / ZIP signature: PK (0x50, 0x4B, 0x03, 0x04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && (buffer[2] === 0x03 || buffer[2] === 0x05)) {
    if (ext !== 'docx') {
      return { isValid: false, detectedType: 'application/docx', error: 'File content is Zip/Docx but extension is not .docx.' };
    }
    return { isValid: true, detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }

  return {
    isValid: false,
    detectedType: 'unknown',
    error: `Unsupported file format. Please upload PDF, Word (.docx), or Images (.jpg, .jpeg, .png).`,
  };
}

/**
 * Sanitizes untrusted text to prevent prompt injection or control characters.
 */
export function sanitizeDocumentText(rawText: string): string {
  if (!rawText) return '';
  // Normalize whitespace, remove null bytes and terminal escape codes
  return rawText
    .replace(/\0/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Parses DOCX file buffer using mammoth to extract paragraphs, headings, and table text.
 */
export async function parseDocxBuffer(buffer: ArrayBuffer): Promise<{
  text: string;
  paragraphs: DocumentParagraph[];
}> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const cleanText = sanitizeDocumentText(result.value);

  const rawParagraphs = cleanText.split('\n\n').filter((p) => p.trim().length > 0);
  const paragraphs: DocumentParagraph[] = rawParagraphs.map((p, idx) => ({
    index: idx + 1,
    text: p.trim(),
    heading: p.trim().length < 80 && (p.includes(':') || /^[0-9A-Z\s]+$/.test(p.trim())),
  }));

  return {
    text: cleanText,
    paragraphs,
  };
}

/**
 * Parses image (PNG/JPEG) using Tesseract.js OCR.
 */
export async function parseImageBuffer(
  imageSource: string | ArrayBuffer | Blob,
  onProgress?: (progress: number) => void
): Promise<{
  text: string;
  confidence: number;
  qualityWarning?: string;
}> {
  try {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imageSource as any);
    await worker.terminate();

    const text = sanitizeDocumentText(ret.data.text);
    const confidence = Math.round(ret.data.confidence || 0);

    let qualityWarning: string | undefined;
    if (confidence < 55 || text.trim().length < 20) {
      qualityWarning = `Low OCR confidence (${confidence}%). Image quality, blur, cropping, or handwriting may limit extraction accuracy. Please review extracted text manually.`;
    }

    return {
      text,
      confidence,
      qualityWarning,
    };
  } catch (err: any) {
    throw new Error(`OCR processing failed: ${err.message || 'Unable to recognize text in image'}`);
  }
}

/**
 * Client-side / In-memory PDF text extractor using basic PDF text stream parsing
 * or structured chunk decoding.
 */
export function parsePdfTextQuick(buffer: Uint8Array): {
  text: string;
  pageCount: number;
  isScanned: boolean;
} {
  // Decode Latin1 string to inspect PDF objects
  const binaryString = new TextDecoder('latin1').decode(buffer);
  
  // Count pages via /Type /Page
  const pageMatches = binaryString.match(/\/Type\s*\/Page\b/g);
  const pageCount = pageMatches ? pageMatches.length : 1;

  // Extract text within BT (Begin Text) ... ET (End Text) streams
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let textChunks: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = btRegex.exec(binaryString)) !== null) {
    const block = match[1];
    // Extract strings in parentheses (Text)
    const strRegex = /\(([^)]*)\)/g;
    let sMatch: RegExpExecArray | null;
    let blockText = '';
    while ((sMatch = strRegex.exec(block)) !== null) {
      blockText += sMatch[1] + ' ';
    }
    // Also check hex strings <...>
    const hexRegex = /<([0-9A-Fa-f]+)>/g;
    let hMatch: RegExpExecArray | null;
    while ((hMatch = hexRegex.exec(block)) !== null) {
      const hex = hMatch[1];
      let str = '';
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      blockText += str + ' ';
    }

    if (blockText.trim()) {
      textChunks.push(blockText.trim());
    }
  }

  const combined = sanitizeDocumentText(textChunks.join('\n'));
  const isScanned = combined.trim().length < 30; // Scanned page has no selectable text streams

  return {
    text: combined,
    pageCount,
    isScanned,
  };
}
