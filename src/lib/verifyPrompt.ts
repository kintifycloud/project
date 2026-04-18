export type VerifyRequest = {
  action: string;
};

export type VerifyResponse = {
  riskLevel: "low" | "medium" | "high";
  impact: string;
  safeToExecute: boolean;
  precaution: string;
};

export function buildVerifyPrompt(action: string): string {
  return `You are a senior SRE verifying a production action.

Analyze the following action and determine:

1. Risk level (low, medium, high)
2. Potential impact
3. Whether it is safe to execute immediately
4. Required precautions

Action to verify:
"${action}"

Rules:
- Be concise and realistic
- Be production-aware
- No fluff or marketing language
- Always bias toward caution
- Always consider rollback paths
- Always consider system stability
- Never say "completely safe"
- Always include potential downsides

Respond in JSON format with these exact keys:
{
  "riskLevel": "low|medium|high",
  "impact": "one-line explanation of what could happen",
  "safeToExecute": true/false,
  "precaution": "what to do before running this action"
}`;
}
