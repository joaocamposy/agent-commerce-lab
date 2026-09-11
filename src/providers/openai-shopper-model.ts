import OpenAI from 'openai';
import type { ExperimentCase, ShoppingDecision } from '../core/types.js';
import { buildShopperPrompt } from '../prompts/shopper-v1.js';
import type { ShopperModel } from './shopper-model.js';

const decisionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['selectedProductId', 'confidence', 'ranking'],
  properties: {
    selectedProductId: { type: ['string', 'null'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    ranking: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['productId', 'reasons'],
        properties: {
          productId: { type: 'string' },
          reasons: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['type', 'importance'],
              properties: {
                type: { type: 'string' },
                attribute: { type: 'string' },
                importance: { type: 'string', enum: ['low', 'medium', 'high'] },
                evidence: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
} as const;

export class OpenAIShopperModel implements ShopperModel {
  readonly provider = 'openai';
  readonly model: string;
  private readonly client: OpenAI;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    this.model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-5.6';
    this.client = new OpenAI({ apiKey: options.apiKey ?? process.env.OPENAI_API_KEY });
  }

  async evaluate(input: ExperimentCase): Promise<ShoppingDecision> {
    const eligible = input.candidates.filter((candidate) => candidate.eligible);
    if (eligible.length === 0) return { selectedProductId: null, confidence: 1, ranking: [] };

    const response = await this.client.responses.create({
      model: this.model,
      instructions: 'You are a controlled product preference judge. Follow the supplied evidence and never use outside product or brand knowledge.',
      input: buildShopperPrompt({ ...input, candidates: eligible }),
      text: {
        format: {
          type: 'json_schema',
          name: 'shopping_decision',
          strict: true,
          schema: decisionSchema
        }
      }
    });

    if (!response.output_text) throw new Error('OpenAI returned no structured decision.');
    return JSON.parse(response.output_text) as ShoppingDecision;
  }
}
