import { PROMPTS } from "./constants/groqPrompts";
import { ModelName } from "./conversionRate";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Token estimation factors per encoding type
const ENCODING_FACTORS: Record<string, number> = {
  cl100k_base: 0.25, // ~4 chars per token
  r50k_base: 0.3, // ~3.3 chars per token
};

const MODEL_ENCODINGS: Record<string, string> = {
  "openai/gpt-oss-120b": "cl100k_base",
  "openai/gpt-oss-20b": "cl100k_base",
  "llama-3.3-70b-versatile": "r50k_base",
  "qwen/qwen3-32b": "r50k_base",
};

const REQUEST_OVERHEAD: Record<ModelName, number> = {
  "openai/gpt-oss-120b": 70,
  "openai/gpt-oss-20b": 70,
  "llama-3.3-70b-versatile": 60,
  "qwen/qwen3-32b": 65,
};

const COMPLETION_BUFFER: Record<ModelName, number> = {
  "openai/gpt-oss-120b": 500,
  "openai/gpt-oss-20b": 500,
  "llama-3.3-70b-versatile": 800,
  "qwen/qwen3-32b": 900,
};

/**
 * Estimates token count using character-based approximation
 * This is a conservative estimate that works well for credit management
 */
function estimateTokensFromText(text: string, encodingType: string): number {
  const factor = ENCODING_FACTORS[encodingType] || 0.25;

  // Count characters, accounting for spaces and punctuation
  const baseTokens = Math.ceil(text.length * factor);

  // Add extra tokens for special characters and formatting
  const specialChars = (text.match(/[^\w\s]/g) || []).length;
  const formatTokens = Math.ceil(specialChars * 0.5);

  return baseTokens + formatTokens;
}

/**
 * Count tokens for a single text string with a specific model
 */
export function countTokens(text: string, model: ModelName): number {
  const messages: ChatMessage[] = [
    { role: "system", content: PROMPTS[model] },
    { role: "user", content: text },
  ];

  const estimated = estimateChatTokens(messages, model);
  console.log("Estimated tokens:", estimated);
  return estimated;
}

/**
 * Estimate total tokens for a chat conversation
 */
export function estimateChatTokens(
  messages: ChatMessage[],
  model: ModelName
): number {
  const encodingType = MODEL_ENCODINGS[model];
  if (!encodingType) {
    throw new Error(`Unsupported model: ${model}`);
  }

  // Calculate content tokens
  let contentTokens = 0;

  for (const message of messages) {
    // Role tokens (approximately 4 tokens per message for role formatting)
    contentTokens += 4;

    // Content tokens
    contentTokens += estimateTokensFromText(message.content, encodingType);
  }

  // Add message formatting overhead (start/end tokens)
  contentTokens += 3; // conversation start tokens

  // Add model-specific overhead and buffer
  const totalTokens =
    contentTokens + REQUEST_OVERHEAD[model] + COMPLETION_BUFFER[model];

  console.log(`Token breakdown for ${model}:`, {
    contentTokens,
    overhead: REQUEST_OVERHEAD[model],
    buffer: COMPLETION_BUFFER[model],
    total: totalTokens,
  });

  return totalTokens;
}

/**
 * Quick token estimate for UI display (without buffers)
 */
export function quickTokenEstimate(text: string): number {
  // Use cl100k_base as default (most common)
  return estimateTokensFromText(text, "cl100k_base");
}
