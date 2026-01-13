export const MODELS = {
  "openai/gpt-oss-120b": {
    creditsPer1kTokens: 10,
  },
  "llama-3.3-70b-versatile": {
    creditsPer1kTokens: 3,
  },
  "qwen/qwen3-32b": {
    creditsPer1kTokens: 4,
  },
  "openai/gpt-oss-20b": {
    creditsPer1kTokens: 2,
  },
} as const;
export type ModelName = keyof typeof MODELS;

export function calculateCredits(model: ModelName, tokensUsed: number): number {
  const rate = MODELS[model].creditsPer1kTokens;
  return Math.ceil((tokensUsed / 1000) * rate);
}
