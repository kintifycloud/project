export type FlowRequest = {
  action: string;
};

export type FlowResponse = {
  steps: string[];
  warnings: string[];
  rollback: string;
};

export function buildFlowPrompt(action: string): string {
  return `You are a senior SRE guiding execution during a production incident.

Break down the following action into:

1. Step-by-step execution (ordered)
2. Key warnings during execution
3. Rollback instruction if something fails

Action to break down:
"${action}"

Rules:
- Steps must be short and clear
- No fluff or theory
- Production-safe language
- Be specific and actionable
- Include only essential steps
- Warnings should highlight critical risks
- Rollback should be a single clear instruction

Respond in JSON format with these exact keys:
{
  "steps": ["step 1", "step 2", "step 3"],
  "warnings": ["warning 1", "warning 2"],
  "rollback": "single rollback instruction"
}`;
}
