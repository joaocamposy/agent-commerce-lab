# Agent Commerce Lab

Experimental runner for measuring how AI shopping agents evaluate and select products under controlled purchase intents.

## Goal

Validate whether product preference by AI agents is reproducible, explainable, and causally sensitive to product information changes.

## Spike principles

- Keep product facts separate from derived attributes and agent judgments.
- Treat `unknown` as missing evidence, never as `false`.
- Separate deterministic eligibility from semantic preference.
- Persist every execution with enough metadata to reproduce it.
- Prefer structured outputs over free-form text.
- Do not build UI, billing, integrations, or production SaaS infrastructure during the spike.

## Planned pipeline

```text
raw purchase intent
       ↓
intent compiler
       ↓
canonical intent
       ↓
deterministic eligibility
       ↓
candidate set
       ↓
shopper model
       ↓
critic / evidence validator
       ↓
experiment result
       ↓
metrics
```

## Initial experiment

The first executable experiment targets computer monitors and will compare model agreement, ranking stability, reason stability, position bias, brand leakage, and counterfactual sensitivity.
