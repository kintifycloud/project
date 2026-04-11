export type RegressionRisk = "Low" | "Medium" | "High";
export type GuaranteeLevel = "Strong Guarantee" | "Moderate Guarantee" | "Weak Guarantee";

export type GuaranteeResult = {
  successProbability: number;
  regressionRisk: RegressionRisk;
  stabilityWindow: string;
  level: GuaranteeLevel;
};

export function calculateRegressionRisk(score: number): RegressionRisk {
  if (score > 85) return "Low";
  if (score >= 60) return "Medium";
  return "High";
}

export function calculateGuaranteeLevel(score: number): GuaranteeLevel {
  if (score > 85) return "Strong Guarantee";
  if (score >= 65) return "Moderate Guarantee";
  return "Weak Guarantee";
}

export function getRiskColor(risk: RegressionRisk): string {
  switch (risk) {
    case "Low":
      return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
    case "Medium":
      return "bg-amber-400/10 border-amber-400/30 text-amber-300";
    case "High":
      return "bg-red-400/10 border-red-400/30 text-red-300";
  }
}

export function getLevelColor(level: GuaranteeLevel): string {
  switch (level) {
    case "Strong Guarantee":
      return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
    case "Moderate Guarantee":
      return "bg-amber-400/10 border-amber-400/30 text-amber-300";
    case "Weak Guarantee":
      return "bg-red-400/10 border-red-400/30 text-red-300";
  }
}

export function isGuaranteeResult(data: unknown): data is GuaranteeResult {
  if (!data || typeof data !== "object") return false;

  const d = data as GuaranteeResult;

  return (
    typeof d.successProbability === "number" &&
    typeof d.regressionRisk === "string" &&
    typeof d.stabilityWindow === "string" &&
    typeof d.level === "string"
  );
}

export function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
