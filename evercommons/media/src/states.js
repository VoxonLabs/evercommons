export const STATES = Object.freeze([
  "uploaded",
  "validating",
  "quarantined",
  "processing",
  "ready_private",
  "pending_review",
  "published",
  "reported",
  "restricted",
  "blocked",
  "appealed",
  "deleted",
  "purged",
]);

export const TRANSITIONS = Object.freeze({
  uploaded: ["validating", "deleted"],
  validating: ["quarantined", "processing", "blocked", "deleted"],
  quarantined: ["processing", "blocked", "deleted"],
  processing: ["ready_private", "blocked", "deleted"],
  ready_private: ["pending_review", "deleted"],
  pending_review: ["published", "restricted", "blocked", "deleted"],
  published: ["reported", "restricted", "blocked", "deleted"],
  reported: ["restricted", "blocked", "published", "deleted"],
  restricted: ["published", "blocked", "deleted"],
  blocked: ["appealed", "deleted"],
  appealed: ["published", "blocked", "deleted"],
  deleted: ["purged"],
  purged: [],
});

export const CDN_ALLOWED = new Set(["published"]);

export function canTransition(from, to) {
  return Boolean(TRANSITIONS[from]?.includes(to));
}
