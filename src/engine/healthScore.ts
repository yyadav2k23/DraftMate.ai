import { Finding, HealthScoreBreakdown } from '../types';

export const HEALTH_SCORE_DISCLAIMER =
  'Document quality indicators only. This score does not establish legal compliance or guarantee an outcome. All legal documents require professional review by an advocate enrolled with the Bar Council of India.';

/**
 * Calculates a transparent, deterministic Health Score based on finding severity.
 * 
 * Formula:
 * - Base Score: 100
 * - Critical finding penalty: -25 points
 * - Warning finding penalty: -10 points
 * - Info finding penalty: -4 points
 * - Citation mismatch / unverified penalty: -15 points
 * - Minimum score: 0, Maximum: 100
 * - Resolved or dismissed findings incur 0 penalty.
 * - Any unresolved CRITICAL finding elevates risk grade to CRITICAL_RISK.
 */
export function calculateHealthScore(findings: Finding[]): HealthScoreBreakdown {
  const activeFindings = findings.filter(
    (f) => f.status === 'OPEN' || f.status === 'NEEDS_HUMAN_REVIEW'
  );

  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let citationPenaltyCount = 0;

  for (const f of activeFindings) {
    if (f.category === 'CITATION_CHECK' && f.severity === 'CRITICAL') {
      citationPenaltyCount++;
    } else if (f.severity === 'CRITICAL') {
      criticalCount++;
    } else if (f.severity === 'WARNING') {
      warningCount++;
    } else if (f.severity === 'INFO') {
      infoCount++;
    }
  }

  const criticalPenalties = criticalCount * 25;
  const warningPenalties = warningCount * 10;
  const infoPenalties = infoCount * 4;
  const citationPenalties = citationPenaltyCount * 15;

  const totalDeductions =
    criticalPenalties + warningPenalties + infoPenalties + citationPenalties;

  const finalScore = Math.max(0, Math.min(100, 100 - totalDeductions));

  let grade: HealthScoreBreakdown['grade'] = 'EXCELLENT';
  let summary = 'Document satisfies structural and factual consistency checks.';

  // If there are any critical factual contradictions or critical statutory issues,
  // the risk level is CRITICAL_RISK regardless of minor point total.
  if (criticalCount > 0 || citationPenaltyCount > 0 || finalScore < 50) {
    grade = 'CRITICAL_RISK';
    summary =
      'Critical factual contradictions or invalid legal assertions detected. Significant legal risk.';
  } else if (finalScore >= 85) {
    grade = 'EXCELLENT';
    summary = 'High factual and structural consistency with minimal minor advisories.';
  } else if (finalScore >= 65) {
    grade = 'ADEQUATE';
    summary = 'Moderate quality; contains ambiguous clauses or incomplete secondary fields.';
  } else {
    grade = 'NEEDS_ATTENTION';
    summary = 'Multiple warnings or unverified citations identified. Careful review recommended.';
  }

  return {
    baseScore: 100,
    criticalPenalties,
    warningPenalties,
    infoPenalties,
    citationPenalties,
    finalScore,
    grade,
    summary,
    disclaimer: HEALTH_SCORE_DISCLAIMER,
  };
}
