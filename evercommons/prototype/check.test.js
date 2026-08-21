import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

test("prototype cannot collect accounts or accept uploads", async () => {
  const html = await readFile(join(root, "index.html"), "utf8");
  const js = await readFile(join(root, "app.js"), "utf8");
  const css = await readFile(join(root, "styles.css"), "utf8");

  assert.doesNotMatch(html, /type="email"|type="password"|name="email"/i);
  assert.match(html, /type="file"[^>]*disabled/);
  assert.match(html, /No account is created/);
  assert.match(js, /preventDefault/);
  assert.match(js, /Upload blocked/);

  for (const view of [
    "onboarding",
    "feed",
    "upload",
    "profile",
    "report",
    "safety",
    "creator",
    "capacity",
  ]) {
    assert.match(html, new RegExp(`id="view-${view}"`));
  }

  assert.match(css, /min-height: 44px/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.doesNotMatch(html, /googletagmanager|analytics|facebook\.net|hotjar/i);
});
