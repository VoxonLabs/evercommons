#!/usr/bin/env node
import { EVERCOMMONS_ALPHA_ADULT_POLICY } from "./constants.js";
import { ShieldError } from "./errors.js";
import { issueAssertion } from "./issuer.js";
import { createKeyring } from "./keys.js";
import { verifyAssertion } from "./verifier.js";

const eligibleClaims = {
  verified_human: true,
  age_over_18: true,
  account_eligible: true,
};

async function demo() {
  const keyring = await createKeyring();
  const issued = await issueAssertion({
    keyring,
    audience: "evercommons",
    localAccountId: "local-account-demo-001",
    claims: eligibleClaims,
  });

  const verified = await verifyAssertion({
    assertion: issued.assertion,
    audience: "evercommons",
    keyring,
    policy: EVERCOMMONS_ALPHA_ADULT_POLICY,
  });

  const datingIssued = await issueAssertion({
    keyring,
    audience: "dating",
    localAccountId: "local-account-demo-001",
    claims: eligibleClaims,
  });

  let crossAppRejected = false;
  try {
    await verifyAssertion({
      assertion: datingIssued.assertion,
      audience: "evercommons",
      keyring,
    });
  } catch (error) {
    if (error instanceof ShieldError && error.code === "INVALID_AUDIENCE") {
      crossAppRejected = true;
    } else {
      throw error;
    }
  }

  console.log("Voxon Shield local proof (mock-only)");
  console.log("issuer:", verified.payload.iss);
  console.log("audience:", verified.payload.aud);
  console.log("subject:", verified.subject);
  console.log("claims:", JSON.stringify(verified.claims));
  console.log("payload keys:", Object.keys(verified.payload).join(", "));
  console.log(
    "identity fields present:",
    ["name", "date_of_birth", "address", "selfie", "provider_packet"].filter((key) =>
      Object.hasOwn(verified.payload, key),
    ),
  );
  console.log("pairwise subjects differ across apps:", issued.subject !== datingIssued.subject);
  console.log("cross-app assertion rejected:", crossAppRejected);
}

const command = process.argv[2] ?? "demo";
if (command !== "demo") {
  console.error("Usage: node src/cli.js demo");
  process.exit(1);
}

demo().catch((error) => {
  console.error(error);
  process.exit(1);
});
