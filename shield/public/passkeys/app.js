const statusEl = document.querySelector("#status");
const sessionEl = document.querySelector("#session-view");
const outputEl = document.querySelector("#output");
const { startRegistration, startAuthentication } = window.SimpleWebAuthnBrowser;

let csrfToken = "";

function showStatus(message, kind = "ok") {
  statusEl.dataset.kind = kind;
  statusEl.textContent = message;
}

function showJson(target, value) {
  target.textContent = JSON.stringify(value, null, 2);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.payload = data;
    throw error;
  }
  return data;
}

async function refreshSession() {
  const session = await api("/api/session");
  csrfToken = session.csrfToken;
  showJson(sessionEl, session);
  if (session.authenticated) {
    showStatus(`Signed in as ${session.handle}. This is login, not age/human verification.`);
  } else {
    showStatus("No passkey session. Register or sign in on localhost.");
  }
  return session;
}

async function register() {
  const options = await api("/api/register/options", { method: "POST", body: "{}" });
  const attResp = await startRegistration({ optionsJSON: options });
  const result = await api("/api/register/verify", {
    method: "POST",
    body: JSON.stringify(attResp),
  });
  showJson(outputEl, result);
  await refreshSession();
  showStatus("Passkey registered. Request a Shield assertion separately if you need derived claims.");
}

async function login() {
  const options = await api("/api/login/options", { method: "POST", body: "{}" });
  const asseResp = await startAuthentication({ optionsJSON: options });
  const result = await api("/api/login/verify", {
    method: "POST",
    body: JSON.stringify(asseResp),
  });
  showJson(outputEl, result);
  await refreshSession();
  showStatus("Passkey login succeeded. Shield claims are still a separate request.");
}

async function requestAssertion() {
  const result = await api("/v1/assertions", { method: "POST", body: "{}" });
  showJson(outputEl, {
    payload: result.payload,
    note: result.note,
    assertion_type: result.assertion_type,
    expires_in: result.expires_in,
  });
  showStatus("Received a short-lived Shield assertion. It is not a session cookie.");
}

async function logout() {
  const result = await api("/api/logout", { method: "POST", body: "{}" });
  showJson(outputEl, result);
  await refreshSession();
  showStatus("Signed out.");
}

async function recovery() {
  const response = await fetch("/api/recovery", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
    body: "{}",
  });
  const data = await response.json();
  showJson(outputEl, data);
  showStatus(data.handoff || data.error, "error");
}

document.querySelector("#register").addEventListener("click", () => {
  register().catch((error) => {
    showJson(outputEl, error.payload || { error: error.message });
    showStatus(error.message, "error");
  });
});
document.querySelector("#login").addEventListener("click", () => {
  login().catch((error) => {
    showJson(outputEl, error.payload || { error: error.message });
    showStatus(error.message, "error");
  });
});
document.querySelector("#assert").addEventListener("click", () => {
  requestAssertion().catch((error) => {
    showJson(outputEl, error.payload || { error: error.message });
    showStatus(error.message, "error");
  });
});
document.querySelector("#logout").addEventListener("click", () => {
  logout().catch((error) => {
    showJson(outputEl, error.payload || { error: error.message });
    showStatus(error.message, "error");
  });
});
document.querySelector("#recovery").addEventListener("click", () => {
  recovery().catch((error) => {
    showJson(outputEl, { error: error.message });
    showStatus(error.message, "error");
  });
});

refreshSession().catch((error) => {
  showStatus(error.message, "error");
});
