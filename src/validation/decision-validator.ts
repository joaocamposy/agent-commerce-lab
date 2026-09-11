import type { ExperimentCase, ShoppingDecision } from '../core/types.js';

export interface ValidationIssue {
  code: 'selected_ineligible' | 'unknown_product' | 'missing_evidence';
  productId?: string;
  message: string;
}

export function validateDecision(input: ExperimentCase, decision: ShoppingDecision): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const candidates = new Map(input.candidates.map((candidate) => [candidate.product.id, candidate]));

  if (decision.selectedProductId) {
    const selected = candidates.get(decision.selectedProductId);
    if (!selected) {
      issues.push({ code: 'unknown_product', productId: decision.selectedProductId, message: 'Selected product is not in the candidate set.' });
    } else if (!selected.eligible) {
      issues.push({ code: 'selected_ineligible', productId: selected.product.id, message: 'Selected product does not satisfy all hard requirements.' });
    }
  }

  for (const ranked of decision.ranking) {
    const candidate = candidates.get(ranked.productId);
    if (!candidate) {
      issues.push({ code: 'unknown_product', productId: ranked.productId, message: 'Ranked product is not in the candidate set.' });
      continue;
    }

    for (const reason of ranked.reasons) {
      if (!reason.attribute) continue;
      const fact = candidate.product.facts[reason.attribute];
      if (!fact || fact.state === 'unknown' || fact.value === undefined) {
        issues.push({ code: 'missing_evidence', productId: ranked.productId, message: `Reason references unavailable evidence: ${reason.attribute}.` });
      }
    }
  }

  return issues;
}
