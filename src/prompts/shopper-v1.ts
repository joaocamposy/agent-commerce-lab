import type { ExperimentCase } from '../core/types.js';

export const SHOPPER_PROMPT_VERSION = 'shopper-v1';

export function buildShopperPrompt(input: ExperimentCase): string {
  const eligible = input.candidates.filter((candidate) => candidate.eligible);

  return JSON.stringify({
    task: 'Rank the eligible products for the purchase intent.',
    rules: [
      'Use only facts supplied in this payload.',
      'Do not use outside knowledge about brands or models.',
      'Do not infer an unknown fact as true or false.',
      'Hard requirements were evaluated before this stage; only eligible products are included.',
      'Preferences are trade-offs, not hard requirements.',
      'Every reason that references a product attribute must name the exact fact key in attribute.',
      'Return one selected product unless there are no eligible products.',
      'Confidence must be between 0 and 1 and should be lower for near ties.'
    ],
    intent: {
      id: input.intent.id,
      goal: input.intent.goal,
      preferences: input.intent.preferences,
      budgetMax: input.intent.budgetMax ?? null
    },
    products: eligible.map(({ product }) => ({ id: product.id, facts: product.facts }))
  });
}
