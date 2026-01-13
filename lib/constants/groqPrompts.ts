import { MODELS } from "./plans";
import { MODEL_RULES } from "./modelRules";
import { BASE_PROMPT } from "./base_prompt";

export const PROMPTS: Record<string, string> = Object.fromEntries(
  MODELS.map((model) => [model, BASE_PROMPT(MODEL_RULES[model] ?? "")])
);
