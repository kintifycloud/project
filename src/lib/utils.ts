import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type MockVerisigInput = {
  host: string;
  claim?: string;
  region?: string;
  issuer?: string;
};

export type MockVerisigOutput = {
  host: string;
  claim: string;
  token: string;
  dnsTxt: string;
  httpHeader: string;
  verifiedAt: string;
  score: string;
  endpoint: string;
  issuer: string;
  region: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function normalizeHost(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");

  return normalized || "kintify.cloud";
}

function compactText(value: string, fallback: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized || fallback;
}

function hashToken(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

export function mockVerisigGenerator(input: MockVerisigInput): MockVerisigOutput {
  const host = normalizeHost(input.host);
  const claim = compactText(
    input.claim ?? "instant cryptographic cloud trust",
    "instant cryptographic cloud trust",
  );
  const region = compactText(input.region ?? "global-edge", "global-edge");
  const issuer = compactText(input.issuer ?? "Kintify VeriKernel", "Kintify VeriKernel");
  const primaryHash = hashToken(`${host}:${claim}:${region}:${issuer}`);
  const secondaryHash = hashToken(`${claim}:${host}`);
  const token = `vk_${primaryHash}_${secondaryHash}`.slice(0, 26);
  const scoreValue = (Math.abs(Number.parseInt(primaryHash, 36)) % 89999) + 10000;
  const score = `0.${scoreValue.toString().padStart(5, "0")}`;

  return {
    host,
    claim,
    token,
    dnsTxt: `v=verisig1; token=${token}; claim="${claim}"; issuer="${issuer}"`,
    httpHeader: `x-verikernel-proof: ${token}; claim="${claim}"; region="${region}"`,
    verifiedAt: new Date().toISOString(),
    score,
    endpoint: `https://${host}/.well-known/verikernel.json`,
    issuer,
    region,
  };
}
