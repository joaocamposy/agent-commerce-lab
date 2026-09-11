import type { ExperimentCase } from '../core/types.js';

const experiment: ExperimentCase = {
  intent: {
    id: 'intent-placeholder',
    rawText: 'Placeholder intent for Run 003',
    goal: 'validate multi-model stability',
    requirements: [],
    preferences: [],
    dealBreakers: [],
  },
  candidates: [],
};

console.log('Run 003 scaffold ready.');
console.log(JSON.stringify(experiment, null, 2));
