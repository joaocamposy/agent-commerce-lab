import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { Product, PurchaseIntent } from '../core/types.js';
import { buildCandidateSet } from '../eligibility/evaluator.js';
import { ExperimentRunner } from '../experiment/runner.js';
import { SHOPPER_PROMPT_VERSION } from '../prompts/shopper-v1.js';
import { OpenAIShopperModel } from '../providers/openai-shopper-model.js';
import { validateDecision } from '../validation/decision-validator.js';

async function loadJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

const products = await loadJson<Product[]>('datasets/monitors/products.json');
const intents = await loadJson<PurchaseIntent[]>('datasets/monitors/intents.json');
const cases = intents.map((intent) => ({ intent, candidates: buildCandidateSet(products, intent) }));

if (!process.env.OPENAI_API_KEY) {
  console.log(`Run 003 baseline: ${products.length} products x ${intents.length} intents`);
  for (const experiment of cases) {
    const eligible = experiment.candidates.filter((candidate) => candidate.eligible);
    const uncertain = experiment.candidates.filter((candidate) => candidate.unknownRequirements.length > 0);
    console.log(`\n${experiment.intent.id}`);
    console.log(`  eligible: ${eligible.map((candidate) => candidate.product.id).join(', ') || 'none'}`);
    console.log(`  uncertain: ${uncertain.map((candidate) => candidate.product.id).join(', ') || 'none'}`);
  }
  console.log('\nSet OPENAI_API_KEY to execute the shopper model.');
  process.exit(0);
}

const runner = new ExperimentRunner(new OpenAIShopperModel());
const results = [];

for (const experiment of cases) {
  const run = await runner.run(experiment, { promptVersion: SHOPPER_PROMPT_VERSION, shuffleCandidates: true });
  const validationIssues = validateDecision(run.experiment, run.decision);
  results.push({ ...run, validationIssues });
  console.log(`${experiment.intent.id}: ${run.decision.selectedProductId ?? 'none'} (${run.decision.confidence}) issues=${validationIssues.length}`);
}

await mkdir('experiments/results', { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const output = `experiments/results/run-003-openai-${stamp}.json`;
await writeFile(output, JSON.stringify(results, null, 2));
console.log(`Saved ${output}`);
