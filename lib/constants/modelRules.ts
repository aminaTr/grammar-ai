export const MODEL_RULES: Record<string, string> = {
  "openai/gpt-oss-120b": `
- Do NOT invent errors.
- Take care of context while providing corrections.
`,

  "llama-3.3-70b-versatile": `
- Prefer conservative corrections.
- The LLM must return correct startIndex / endIndex.
- Spaces also count as index.
- The corrected_segment must be exact replacement for original_segment.
- Avoid flagging ambiguous grammar unless clearly incorrect.
- Take extra care to correct punctuation of text i.e commas, period, exclamations where applicable.
`,

  "qwen/qwen3-32b": `
- Spaces, punctuation, and line breaks ALL count as characters when calculating indexes.
- original_segment MUST exactly match the substring in original_text using startIndex:endIndex.
- Do NOT guess indexes. Count characters carefully.
- Detect subtle subject–verb agreement issues.
- Take extra care to correct punctuation of text i.e commas, period, exclamations where applicable.
- Be stricter with comma splices and run-on sentences.
EXAMPLE:

Input text: "He always start the fight."

Character mapping:
0:H
1:e
2:␣
3:a
4:l
5:w
6:a
7:y
8:s
9:␣
10:s
11:t
12:a
13:r
14:t
15:␣
16:t
17:h
18:e
19:␣
20:f
21:i
22:g
23:h
24:t
25:.

Expected JSON output:
{
  "original_text": "He always start the fight",
  "corrections": [
    {
      "type": "grammar",
      "original_segment": "start",
      "corrected_segment": "starts",
      "explanation": "Subject-verb agreement with third-person singular",
      "startIndex": 10,
      "endIndex": 15
    },
    {
      "type": "grammar",
      "original_segment": "",
      "corrected_segment": ".",
      "explanation": "Added missing period",
      "startIndex": 25,
      "endIndex": 25
    }
  ]
}
`,

  "openai/gpt-oss-20b": `
- Apply the strictest punctuation validation.
- Detect edge cases in complex or compound sentences.
`,
};
