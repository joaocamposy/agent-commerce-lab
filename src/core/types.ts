export type EvidenceState = 'known' | 'unknown';

export interface ProductFact<T = string | number | boolean> {
  value?: T;
  state: EvidenceState;
  source?: string;
}

export interface Product {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  facts: Record<string, ProductFact>;
}

export interface PurchaseIntent {
  id: string;
  rawText: string;
  goal: string;
  requirements: string[];
  preferences: string[];
  dealBreakers: string[];
  budgetMax?: number;
}

export interface Candidate {
  product: Product;
  eligible: boolean;
  failedRequirements: string[];
  unknownRequirements: string[];
}

export interface DecisionReason {
  type: string;
  attribute?: string;
  importance: 'low' | 'medium' | 'high';
  evidence?: string;
}

export interface ShoppingDecision {
  selectedProductId: string | null;
  confidence: number;
  ranking: Array<{
    productId: string;
    score?: number;
    reasons: DecisionReason[];
  }>;
}

export interface ExperimentCase {
  intent: PurchaseIntent;
  candidates: Candidate[];
}

export interface ModelRunMetadata {
  provider: string;
  model: string;
  runId: string;
  promptVersion: string;
  candidateOrder: string[];
  startedAt: string;
}

export interface ExperimentRun {
  metadata: ModelRunMetadata;
  experiment: ExperimentCase;
  decision: ShoppingDecision;
}
