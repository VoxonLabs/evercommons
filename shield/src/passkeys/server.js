import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { EVERCOMMONS_ALPHA_ADULT_POLICY } from "../constants.js";
import { issueAssertion } from "../issuer.js";
import { createKeyring } from "../keys.js";
import { verifyAssertion } from "../verifier.js";
import {
  createAuthenticationOptions,
  createRegistrationOptions,
  finishAuthentication,
  finishRegistration,
} from "./ceremonies.js";
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  DEFAULT_PORT,
  RP_ID,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  defaultOrigin,
} from "./config.js";
import { cookieHeader, originAllowed, parseCookies } from "./http.js";
import { MemoryStore, safeEqual } from "./store.js";

const publicDir = new URL("../../public/passkeys/", import.meta.url);
const browserBundle = new URL(
  "../../node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js",
  import.meta.url,
);

function json(res, status, body, cookies = []) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (cookies.length > 0) {
    res.setHeader("Set-Cookie", cookies);
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) {
      throw Object.assign(new Error("Request body too large."), { code: "BODY_TOO_LARGE" });
    }
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("JSON body is invalid."), { code: "BAD_JSON" });
  }
}

function sessionCookies(session) {
  return [
    cookieHeader(SESSION_COOKIE, session.id, {
      httpOnly: true,
      maxAge: SESSION_TTL_SECONDS,
    }),
    cookieHeader(CSRF_COOKIE, session.csrfToken, {
      httpOnly: false,
      maxAge: SESSION_TTL_SECONDS,
    }),
  ];
}

function clearSessionCookies() {
  return [
    cookieHeader(SESSION_COOKIE, "", { httpOnly: true, maxAge: 0 }),
    cookieHeader(CSRF_COOKIE, "", { httpOnly: false, maxAge: 0 }),
  ];
}

export function createPasskeyHandler({
  store = new MemoryStore(),
  keyring,
  origin = defaultOrigin(),
  rpID = RP_ID,
} = {}) {
  async function ensureSession(req, now) {
    const cookies = parseCookies(req.headers.cookie);
    let session = store.getSession(cookies[SESSION_COOKIE], now);
    let fresh = false;
    if (!session) {
      session = store.createSession({ now });
      fresh = true;
    }
    return { session, cookies, fresh };
  }

  function requireSameOrigin(req) {
    if (!originAllowed(req.headers.origin, origin)) {
      const error = new Error("Origin is not this local prototype.");
      error.code = "BAD_ORIGIN";
      throw error;
    }
  }

  function requireCsrf(req, session) {
    const header = req.headers[CSRF_HEADER];
    if (!safeEqual(header, session.csrfToken)) {
      const error = new Error("CSRF token mismatch.");
      error.code = "BAD_CSRF";
      throw error;
    }
  }

  return async function handle(req, res) {
    const now = new Date();
    const url = new URL(req.url ?? "/", origin);

    try {
      if (req.method === "GET" && url.pathname === "/") {
        const html = await readFile(new URL("index.html", publicDir), "utf8");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }

      if (req.method === "GET" && url.pathname === "/app.js") {
        const js = await readFile(new URL("app.js", publicDir), "utf8");
        res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
        res.end(js);
        return;
      }

      if (req.method === "GET" && url.pathname === "/vendor/simplewebauthn-browser.js") {
        const js = await readFile(browserBundle);
        res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
        res.end(js);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/session") {
        const { session, fresh } = await ensureSession(req, now);
        const user = session.localAccountId ? store.getUser(session.localAccountId) : null;
        json(
          res,
          200,
          {
            authenticated: Boolean(user),
            handle: user?.handle ?? null,
            localAccountId: user?.localAccountId ?? null,
            csrfToken: session.csrfToken,
            sessionExpiresAt: session.expiresAt,
            mock: true,
            recoveryImplemented: false,
          },
          fresh ? sessionCookies(session) : [],
        );
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/register/options") {
        requireSameOrigin(req);
        const { session, fresh } = await ensureSession(req, now);
        requireCsrf(req, session);
        const options = await createRegistrationOptions({ rpID, store, session, now });
        json(res, 200, options, fresh ? sessionCookies(session) : []);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/register/verify") {
        requireSameOrigin(req);
        const { session } = await ensureSession(req, now);
        requireCsrf(req, session);
        const body = await readJsonBody(req);
        const result = await finishRegistration({
          rpID,
          origin,
          store,
          session,
          response: body,
          now,
        });
        json(res, 200, {
          verified: true,
          handle: result.user.handle,
          localAccountId: result.user.localAccountId,
          credentialId: result.credentialId,
          loginIsNotVerification: true,
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/login/options") {
        requireSameOrigin(req);
        const { session, fresh } = await ensureSession(req, now);
        requireCsrf(req, session);
        const options = await createAuthenticationOptions({ rpID, store, session, now });
        json(res, 200, options, fresh ? sessionCookies(session) : []);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/login/verify") {
        requireSameOrigin(req);
        const { session } = await ensureSession(req, now);
        requireCsrf(req, session);
        const body = await readJsonBody(req);
        const result = await finishAuthentication({
          rpID,
          origin,
          store,
          session,
          response: body,
          now,
        });
        json(res, 200, {
          verified: true,
          handle: result.user.handle,
          localAccountId: result.user.localAccountId,
          credentialId: result.credentialId,
          loginIsNotVerification: true,
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/logout") {
        requireSameOrigin(req);
        const { session } = await ensureSession(req, now);
        requireCsrf(req, session);
        store.deleteSession(session.id);
        json(res, 200, { ok: true }, clearSessionCookies());
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/recovery") {
        json(res, 501, {
          error: "Recovery is not implemented in this prototype.",
          code: "RECOVERY_NOT_IMPLEMENTED",
          handoff:
            "Device-loss recovery needs a high-reasoning security review. See shield/docs/PASSKEY_THREAT_MODEL.md.",
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/v1/assertions") {
        requireSameOrigin(req);
        const { session } = await ensureSession(req, now);
        requireCsrf(req, session);
        if (!session.localAccountId) {
          json(res, 401, {
            error: "Passkey login required before requesting a Shield assertion.",
            code: "LOGIN_REQUIRED",
          });
          return;
        }
        const issued = await issueAssertion({
          keyring,
          audience: EVERCOMMONS_ALPHA_ADULT_POLICY.audience,
          localAccountId: session.localAccountId,
          claims: { ...EVERCOMMONS_ALPHA_ADULT_POLICY.required },
        });
        const verified = await verifyAssertion({
          assertion: issued.assertion,
          audience: EVERCOMMONS_ALPHA_ADULT_POLICY.audience,
          keyring,
          policy: EVERCOMMONS_ALPHA_ADULT_POLICY,
        });
        json(res, 200, {
          assertion_type: issued.assertion_type,
          expires_in: issued.expires_in,
          assertion: issued.assertion,
          payload: verified.payload,
          note: "This assertion is not a login session. It is a short-lived derived yes/no token.",
        });
        return;
      }

      json(res, 404, { error: "Not found." });
    } catch (error) {
      const code = error.code;
      if (code === "BAD_ORIGIN") {
        json(res, 403, { error: error.message, code });
        return;
      }
      if (code === "BAD_CSRF") {
        json(res, 403, { error: error.message, code });
        return;
      }
      if (code === "NO_CHALLENGE" || code === "UNKNOWN_PASSKEY" || code === "NOT_VERIFIED") {
        json(res, 400, { error: error.message, code });
        return;
      }
      if (code === "BODY_TOO_LARGE") {
        json(res, 413, { error: error.message, code });
        return;
      }
      if (code === "BAD_JSON") {
        json(res, 400, { error: error.message, code });
        return;
      }
      json(res, 500, { error: "Local prototype error.", code: "INTERNAL" });
    }
  };
}

export async function startPasskeyServer({
  port = DEFAULT_PORT,
  origin,
  rpID = RP_ID,
  store = new MemoryStore(),
  keyring,
} = {}) {
  const resolvedKeyring = keyring ?? (await createKeyring());
  const state = { handler: null };
  const server = createServer((req, res) => {
    Promise.resolve(state.handler(req, res)).catch(() => {
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Local prototype error.", code: "INTERNAL" }));
      }
    });
  });
  await new Promise((ready) => server.listen(port, "127.0.0.1", ready));
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  const resolvedOrigin = origin ?? `http://localhost:${actualPort}`;
  state.handler = createPasskeyHandler({
    store,
    keyring: resolvedKeyring,
    origin: resolvedOrigin,
    rpID,
  });
  return {
    server,
    baseUrl: `http://127.0.0.1:${actualPort}`,
    origin: resolvedOrigin,
    store,
    keyring: resolvedKeyring,
    close: () =>
      new Promise((done, reject) => server.close((error) => (error ? reject(error) : done()))),
  };
}

const isMain =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  const port = Number(process.env.SHIELD_PASSKEY_PORT ?? DEFAULT_PORT);
  const started = await startPasskeyServer({ port, origin: defaultOrigin(port) });
  console.log(`Voxon Shield passkey prototype (mock-only): ${started.origin}`);
  console.log("Open that URL on localhost. Do not expose it to the internet.");
}
