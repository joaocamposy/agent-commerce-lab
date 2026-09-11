import { randomUUID } from 'node:crypto';
import type { ExperimentCase, ExperimentRun } from '../core/types.js';
import type { ShopperModel } from '../providers/shopper-model.js';

export interface RunOptions {
  promptVersion: string;
  shuffleCandidates?: boolean;
}

export class ExperimentRunner {
  constructor(private readonly model: ShopperModel) {}

  async run(input: ExperimentCase, options: RunOptions): Promise<ExperimentRun> {
    const candidates = options.shuffleCandidates
      ? [...input.candidates].sort(() => Math.random() - 0.5)
      : [...input.candidates];

    const experiment: ExperimentCase = {
      intent: input.intent,
      candidates,
    };

    const metadata = {
      provider: this.model.provider,
      model: this.model.model,
      runId: randomUUID(),
      promptVersion: options.promptVersion,
      candidateOrder: candidates.map((candidate) => candidate.product.id),
      startedAt: new Date().toISOString(),
    };

    const decision = await this.model.evaluate(experiment);

    return {
      metadata,
      experiment,
      decision,
    };
  }
}
