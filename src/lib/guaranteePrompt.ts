export type GuaranteeRequest = {
  action: string;
};

export type GuaranteeResponse = {
  rollbackPlan: string;
  failureImpact: string;
  protectionLevel: "basic" | "safe" | "strong";
};

export function buildGuaranteePrompt(action: string): string {
  return `You are a senior SRE ensuring production safety.

For the given action, define:

1. Rollback plan if it fails
2. Potential failure impact
3. Protection level (basic, safe, strong)

Action to secure:
"${action}"

Rules:
- Be concise and realistic
- Assume production environment
- Prioritize safety and recovery
- Never say "fully safe" or guarantee zero risk
- Always acknowledge failure possibility
- Show clear recovery path
- Protection levels:
  - basic: minimal safeguards, rollback available
  - safe: good safeguards, tested rollback path
  - strong: multiple safeguards, automated rollback, monitoring

Respond in JSON format with these exact keys:
{
  "rollbackPlan": "clear rollback instruction",
  "failureImpact": "what happens if it fails",
  "protectionLevel": "basic|safe|strong"
}`;
}
