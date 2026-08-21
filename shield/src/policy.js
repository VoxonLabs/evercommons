import { ShieldError } from "./errors.js";

/**
 * @param {{ aud?: string, claims?: Record<string, boolean> }} payload
 * @param {{ id: string, audience: string, required: Record<string, boolean> }} policy
 */
export function evaluatePolicy(payload, policy) {
  if (!policy?.id || !policy.required) {
    throw new ShieldError("POLICY_DENIED", "A policy profile is required.");
  }
  if (policy.audience && payload.aud !== policy.audience) {
    throw new ShieldError(
      "POLICY_DENIED",
      `Policy ${policy.id} does not apply to audience ${payload.aud}.`,
    );
  }

  for (const [claim, expected] of Object.entries(policy.required)) {
    if (payload.claims?.[claim] !== expected) {
      throw new ShieldError(
        "POLICY_DENIED",
        `Policy ${policy.id} denied: ${claim} must be ${expected}.`,
      );
    }
  }
}
