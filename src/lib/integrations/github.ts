/**
 * GitHub Integration - PR comments and automated fix suggestions
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { GitHubIntegration, FixResult } from "./types";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Sign webhook payload for GitHub App verification
 */
export function verifyGitHubWebhook(
  secret: string,
  payload: string,
  signature: string
): boolean {
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Parse GitHub webhook event
 */
export function parseGitHubEvent(
  eventType: string,
  body: Record<string, unknown>
): GitHubEvent | null {
  switch (eventType) {
    case "pull_request":
      return parsePullRequestEvent(body);
    case "issue_comment":
      return parseIssueCommentEvent(body);
    case "pull_request_review_comment":
      return parseReviewCommentEvent(body);
    default:
      return null;
  }
}

interface GitHubEvent {
  type: "pull_request" | "comment";
  action: string;
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  sender: {
    login: string;
    id: number;
  };
  pr?: {
    number: number;
    title: string;
    body: string;
    state: string;
  };
  comment?: {
    id: number;
    body: string;
    path: string | undefined;
    line: number | undefined;
  };
  issue?: {
    number: number;
  };
}

function parsePullRequestEvent(body: Record<string, unknown>): GitHubEvent | null {
  const action = body.action as string;
  const pr = body.pull_request as Record<string, unknown> | undefined;
  const repo = body.repository as Record<string, unknown> | undefined;

  if (!pr || !repo) return null;

  return {
    type: "pull_request",
    action,
    repository: {
      owner: (repo.owner as Record<string, string>)?.login || "",
      name: (repo.name as string) || "",
      fullName: (repo.full_name as string) || "",
    },
    sender: {
      login: (body.sender as Record<string, string>)?.login || "",
      id: (body.sender as Record<string, number>)?.id || 0,
    },
    pr: {
      number: (pr.number as number) || 0,
      title: (pr.title as string) || "",
      body: (pr.body as string) || "",
      state: (pr.state as string) || "",
    },
  };
}

function parseIssueCommentEvent(body: Record<string, unknown>): GitHubEvent | null {
  const action = body.action as string;
  const issue = body.issue as Record<string, unknown> | undefined;
  const comment = body.comment as Record<string, unknown> | undefined;
  const repo = body.repository as Record<string, unknown> | undefined;

  if (!issue || !comment || !repo) return null;

  // Only process PR comments, not regular issues
  if (!issue.pull_request) return null;

  return {
    type: "comment",
    action,
    repository: {
      owner: (repo.owner as Record<string, string>)?.login || "",
      name: (repo.name as string) || "",
      fullName: (repo.full_name as string) || "",
    },
    sender: {
      login: (body.sender as Record<string, string>)?.login || "",
      id: (body.sender as Record<string, number>)?.id || 0,
    },
    issue: {
      number: (issue.number as number) || 0,
    },
    comment: {
      id: (comment.id as number) || 0,
      body: (comment.body as string) || "",
      path: undefined,
      line: 0,
    },
  };
}

function parseReviewCommentEvent(body: Record<string, unknown>): GitHubEvent | null {
  const action = body.action as string;
  const pr = body.pull_request as Record<string, unknown> | undefined;
  const comment = body.comment as Record<string, unknown> | undefined;
  const repo = body.repository as Record<string, unknown> | undefined;

  if (!pr || !comment || !repo) return null;

  return {
    type: "comment",
    action,
    repository: {
      owner: (repo.owner as Record<string, string>)?.login || "",
      name: (repo.name as string) || "",
      fullName: (repo.full_name as string) || "",
    },
    sender: {
      login: (body.sender as Record<string, string>)?.login || "",
      id: (body.sender as Record<string, number>)?.id || 0,
    },
    pr: {
      number: (pr.number as number) || 0,
      title: (pr.title as string) || "",
      body: (pr.body as string) || "",
      state: (pr.state as string) || "",
    },
    comment: {
      id: (comment.id as number) || 0,
      body: (comment.body as string) || "",
      path: (comment.path as string | undefined),
      line: (comment.line as number | undefined),
    },
  };
}

/**
 * Check if comment contains /fix command
 */
export function containsFixCommand(text: string): { hasCommand: boolean; issue: string } {
  const match = text.match(/\/fix\s+(.+)/i);
  if (match?.[1]) {
    return { hasCommand: true, issue: match[1].trim() };
  }
  return { hasCommand: false, issue: "" };
}

/**
 * Post comment on PR
 */
export async function postPRComment(
  integration: GitHubIntegration,
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const token = await getInstallationToken(integration);
  if (!token) {
    return { ok: false, error: "Failed to get installation token" };
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return { ok: false, error };
  }

  return { ok: true };
}

/**
 * Build formatted comment body for fix result
 */
export function buildFixComment(result: FixResult, issue: string): string {
  const sections: string[] = [
    "## 🔧 Kintify Fix",
    "",
    `**Issue:** ${issue}`,
    "",
    "### Analysis",
    result.answer,
  ];

  if (result.trace) {
    sections.push("", "### Context", result.trace);
  }

  sections.push(
    "",
    "---",
    "*Generated by [Kintify](https://kintify.cloud) - SRE-grade incident response*"
  );

  return sections.join("\n");
}

/**
 * Get installation access token
 */
async function getInstallationToken(integration: GitHubIntegration): Promise<string | null> {
  // In production, this would use JWT + installation token exchange
  // For now, return a placeholder - actual implementation requires
  // GitHub App private key signing
  try {
    // This is a simplified version - full implementation needs JWT generation
    const appToken = generateJWT(integration);

    const response = await fetch(
      `${GITHUB_API_BASE}/app/installations/${integration.settings.installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.token as string;
  } catch {
    return null;
  }
}

/**
 * Generate JWT for GitHub App authentication
 */
function generateJWT(integration: GitHubIntegration): string {
  // Simplified JWT generation - production needs proper signing
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 600,
    iss: integration.settings.appId,
  };

  // Note: Actual signing requires the private key
  // This is a placeholder for the full implementation
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  // Production: Use Node.js crypto.createSign for JWT
  // const signature = createSign('RSA-SHA256');
  // signature.update(`${encodedHeader}.${encodedPayload}`);
  // signature.end();

  return `${encodedHeader}.${encodedPayload}.SIGNATURE_PLACEHOLDER`;
}

/**
 * Validate GitHub integration configuration
 */
export function validateGitHubConfig(integration: GitHubIntegration): { valid: boolean; error?: string } {
  if (!integration.settings.appId) {
    return { valid: false, error: "Missing App ID" };
  }

  if (!integration.settings.privateKey) {
    return { valid: false, error: "Missing private key" };
  }

  return { valid: true };
}

