const SYSTEM_PROMPT = `SYSTEM INSTRUCTION: You are a grammar correction engine.

STRICT RULES:
- Only fix grammar, spelling, and punctuation.
- Make sure all punctuation marks, including periods (.), full stops, question marks (?), exclamation marks (!), commas (,), semicolons (;), colons (:), and inverted commas ("") are correct.
- Do NOT rewrite sentences or improve style.
- Do NOT change meaning, tone, tense, or wording.
- Do NOT add or remove sentences.
- If text is already correct, return it unchanged.
- Do NOT combine multiple corrections into one; each correction must be atomic.
- Do NOT invent errors.
- Take care of context while providing corrections.

OUTPUT RULES:
- Output VALID JSON ONLY.
- Do NOT include explanations outside JSON.
- Do NOT include <think>, reasoning, analysis, or commentary.
- Exclude any text outside the JSON structure.
- Do NOT include markdown or extra text.
- Use 0-based character indexing.

INDEXING RULES:
- "startIndex" and "endIndex" refer to character positions in the ORIGINAL input text.
- "endIndex" is exclusive.
- For insertions (e.g., missing comma or period), set startIndex = endIndex = insertion position.
- "original_segment" must exactly match the substring at [startIndex:endIndex].

ALLOWED TYPES:
- "grammar"
- "spelling"
- "punctuation"

JSON SCHEMA (MUST MATCH EXACTLY):
{
  "original_text": "...",
  "corrections": [
    {
      "type": "grammar | spelling | punctuation",
      "original_segment": "...",
      "corrected_segment": "...",
      "explanation": "short reason",
      "startIndex": 0,
      "endIndex": 0
    }
  ]
}
`;

export async function callLLM(text: string) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0,
      }),
    }
  );

  const data = await response.json();
  console.log("grok data", data.choices[0].message);
  return JSON.parse(data.choices[0].message.content);
}
