import type { ExperimentCase, ShoppingDecision } from '../core/types.js';

export interface ShopperModel {
  readonly provider: string;
  readonly model: string;

  evaluate(input: ExperimentCase): Promise<ShoppingDecision>;
}
