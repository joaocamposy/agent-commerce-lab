# Agent Instructions

## Mission

This repository is a research lab for testing whether AI shopping-agent product preferences are reproducible, explainable, and causally sensitive to product representation.

## Scope discipline

During the spike, do not introduce:

- web UI
- authentication
- billing
- ecommerce integrations
- queues
- production database infrastructure
- multi-tenancy
- speculative abstractions not required by an experiment

## Methodological invariants

1. Product facts, derived attributes, and model judgments are separate layers.
2. `unknown` is a first-class evidence state and must never silently become `false`.
3. Hard requirements are evaluated before semantic preference whenever possible.
4. Model outputs must be structured and evidence-backed.
5. Candidate order must be persisted for every run.
6. Prompts and schemas are versioned.
7. Every run must be auditable and reproducible enough to compare with later runs.
8. Ties and near-ties are valid outcomes.
9. Never interpret simulated selection lift as real-world sales lift.

## Coding style

- TypeScript strict mode.
- Prefer small pure functions and explicit domain types.
- Avoid framework dependencies unless an experiment requires them.
- Keep providers behind interfaces.
- Persist raw model output alongside normalized output once providers are introduced.
- Add tests for deterministic logic before adding more model calls.

## Decision rule

A feature belongs in the lab only if it helps answer a current experimental question.
