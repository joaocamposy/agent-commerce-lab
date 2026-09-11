import { readFile } from 'node:fs/promises';
import type { Product, PurchaseIntent } from '../core/types.js';
import { buildCandidateSet } from '../eligibility/evaluator.js';

async function loadJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

const products = await loadJson<Product[]>('datasets/monitors/products.json');
const intents = await loadJson<PurchaseIntent[]>('datasets/monitors/intents.json');

const cases = intents.map((intent) => ({
  intent,
  candidates: buildCandidateSet(products, intent),
}));

console.log(`Run 003 baseline: ${products.length} products x ${intents.length} intents`);
for (const experiment of cases) {
  const eligible = experiment.candidates.filter((candidate) => candidate.eligible);
  const uncertain = experiment.candidates.filter((candidate) => candidate.unknownRequirements.length > 0);
  console.log(`\n${experiment.intent.id}`);
  console.log(`  eligible: ${eligible.map((candidate) => candidate.product.id).join(', ') || 'none'}`);
  console.log(`  uncertain: ${uncertain.map((candidate) => candidate.product.id).join(', ') || 'none'}`);
}
