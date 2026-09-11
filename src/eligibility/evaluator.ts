import type { Candidate, Product, ProductFact, PurchaseIntent } from '../core/types.js';

type Operator = '>=' | '<=' | '=';

interface Rule {
  attribute: string;
  operator: Operator;
  expected: string;
}

function parseRule(input: string): Rule {
  const match = input.match(/^([a-z0-9_]+)(>=|<=|=)(.+)$/i);
  if (!match) throw new Error(`Invalid rule: ${input}`);
  return { attribute: match[1], operator: match[2] as Operator, expected: match[3] };
}

function coerce(expected: string, actual: unknown): unknown {
  if (typeof actual === 'number') return Number(expected);
  if (typeof actual === 'boolean') return expected === 'true';
  return expected;
}

export function evaluateRule(product: Product, expression: string): 'pass' | 'fail' | 'unknown' {
  const rule = parseRule(expression);
  const fact: ProductFact | undefined = product.facts[rule.attribute];
  if (!fact || fact.state === 'unknown' || fact.value === undefined) return 'unknown';

  const expected = coerce(rule.expected, fact.value);
  switch (rule.operator) {
    case '=': return fact.value === expected ? 'pass' : 'fail';
    case '>=': return Number(fact.value) >= Number(expected) ? 'pass' : 'fail';
    case '<=': return Number(fact.value) <= Number(expected) ? 'pass' : 'fail';
  }
}

export function evaluateEligibility(product: Product, intent: PurchaseIntent): Candidate {
  const failedRequirements: string[] = [];
  const unknownRequirements: string[] = [];

  for (const requirement of intent.requirements) {
    const result = evaluateRule(product, requirement);
    if (result === 'fail') failedRequirements.push(requirement);
    if (result === 'unknown') unknownRequirements.push(requirement);
  }

  return {
    product,
    eligible: failedRequirements.length === 0 && unknownRequirements.length === 0,
    failedRequirements,
    unknownRequirements,
  };
}

export function buildCandidateSet(products: Product[], intent: PurchaseIntent): Candidate[] {
  return products.map((product) => evaluateEligibility(product, intent));
}
