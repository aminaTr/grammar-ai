import { PROMPTS } from "./constants/groqPrompts";

export async function callLLM(text: string, model: "openai/gpt-oss-120b") {
  const SYSTEM_PROMPT = PROMPTS[model];
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0,
      }),
    }
  );
  const data = await response.json();
  const tokensUsed = data.usage?.total_tokens ?? 0;
  console.log(
    data.usage.prompt_tokens,
    data.usage.completion_tokens,
    data.usage.total_tokens
  );
  const rawContent = data.choices[0].message.content;

  return {
    result: extractJsonFromLLM(rawContent),
    usedTokens: tokensUsed,
  };
}

function extractJsonFromLLM(content: string) {
  // Remove <think>...</think> blocks (multiline safe)
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Optional: safeguard against extra text before/after JSON
  const jsonMatch = cleaned.match(/\{[\s\S]*\}$/);

  if (!jsonMatch) {
    throw new Error("No valid JSON found in LLM response");
  }

  return JSON.parse(jsonMatch[0]);
}
