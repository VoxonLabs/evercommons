export const RP_NAME = "Voxon Shield local proof";
export const RP_ID = "localhost";
export const DEFAULT_PORT = 8787;
export const SESSION_TTL_SECONDS = 900;
export const CHALLENGE_TTL_SECONDS = 300;
export const SESSION_COOKIE = "shield_session";
export const CSRF_COOKIE = "shield_csrf";
export const CSRF_HEADER = "x-csrf-token";

export function defaultOrigin(port = DEFAULT_PORT) {
  return `http://localhost:${port}`;
}
