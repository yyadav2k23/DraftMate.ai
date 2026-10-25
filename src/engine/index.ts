import { AuditReport, Finding, LegalDocument } from '../types';
import { auditLegalCitations } from './citationVerifier';
import { checkCompletenessAndQuality } from './completenessChecker';
import { detectContradictions } from './contradictionDetector';
import { calculateHealthScore } from './healthScore';

/**
 * Runs the full legal verification audit suite on a document.
 * 
 * Order of execution:
 * 1. Deterministic Contradiction Detection (Payment records, Amount discrepancies, Chronological inversions)
 * 2. Completeness & Drafting Quality Checks (Missing parties, dates, signatures, placeholders, ambiguous terms)
 * 3. Statutory Citation & Legal Accuracy Checks (Section 73, Order XXXVII, 15-day non-statutory check, BSA vs IEA)
 * 4. Transparent Health Score Calculation
 */
export function runDocumentAudit(doc: LegalDocument): AuditReport {
  // 1. Contradictions
  const contradictionFindings = detectContradictions(doc);

  // 2. Completeness & Quality
  const completenessFindings = checkCompletenessAndQuality(doc);

  // 3. Citations
  const citationAudit = auditLegalCitations(doc);

  // Combine and sort findings by severity
  const allFindings: Finding[] = [
    ...contradictionFindings,
    ...completenessFindings,
    ...citationAudit.findings,
  ];

  // Prioritize findings: CRITICAL -> WARNING -> INFO
  const severityRank = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  allFindings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  // Calculate Health Score
  const healthScore = calculateHealthScore(allFindings);

  const criticalCount = allFindings.filter((f) => f.severity === 'CRITICAL').length;
  const warningCount = allFindings.filter((f) => f.severity === 'WARNING').length;
  const infoCount = allFindings.filter((f) => f.severity === 'INFO').length;
  const resolvedCount = allFindings.filter((f) => f.status === 'RESOLVED').length;
  const openCount = allFindings.filter((f) => f.status === 'OPEN').length;

  return {
    id: `audit-${doc.id}-${Date.now()}`,
    documentId: doc.id,
    documentTitle: doc.title,
    generatedAt: new Date().toISOString(),
    healthScore,
    findings: allFindings,
    summary: {
      criticalCount,
      warningCount,
      infoCount,
      resolvedCount,
      openCount,
    },
    verifiedCitations: citationAudit.records,
    disclaimer: healthScore.disclaimer,
  };
}

export * from './citationVerifier';
export * from './completenessChecker';
export * from './contradictionDetector';
export * from './healthScore';
