import assert from "node:assert/strict";
import test from "node:test";
import {
  MediaPipeline,
  fakeJpeg,
  fakeMp4,
  fakePng,
} from "../src/pipeline.js";
import { MediaError } from "../src/signatures.js";

function pipeline() {
  return new MediaPipeline({ uploadsEnabled: true });
}

function ingestJpeg(media, userId = "user-1") {
  const bytes = fakeJpeg(128);
  const slot = media.requestSlot({
    userId,
    claimedType: "jpeg",
    claimedSize: bytes.length,
  });
  media.completeIntake({ slot, bytes, filename: "evil.exe.jpg" });
  media.validate(slot.objectId);
  media.process(slot.objectId);
  return slot.objectId;
}

test("kill switch blocks upload slots by default", () => {
  const media = new MediaPipeline();
  assert.throws(
    () =>
      media.requestSlot({
        userId: "user-1",
        claimedType: "jpeg",
        claimedSize: 64,
      }),
    (error) => error instanceof MediaError && error.code === "KILL_SWITCH",
  );
});

test("unauthenticated users cannot request an upload slot", () => {
  const media = pipeline();
  assert.throws(
    () => media.requestSlot({ claimedType: "jpeg", claimedSize: 64 }),
    (error) => error instanceof MediaError && error.code === "UNAUTHORIZED",
  );
});

test("client filenames and mismatched magic numbers are rejected", () => {
  const media = pipeline();
  const png = fakePng(96);
  const slot = media.requestSlot({
    userId: "user-1",
    claimedType: "jpeg",
    claimedSize: png.length,
  });
  assert.throws(
    () => media.completeIntake({ slot, bytes: png, filename: "photo.jpg" }),
    (error) => error instanceof MediaError && error.code === "TYPE_DENIED",
  );
});

test("oversized files and disallowed types are rejected", () => {
  const media = pipeline();
  assert.throws(
    () =>
      media.requestSlot({
        userId: "user-1",
        claimedType: "jpeg",
        claimedSize: 9 * 1024 * 1024,
      }),
    (error) => error instanceof MediaError && error.code === "SIZE_DENIED",
  );
  assert.throws(
    () =>
      media.requestSlot({
        userId: "user-1",
        claimedType: "zip",
        claimedSize: 100,
      }),
    (error) => error instanceof MediaError && error.code === "TYPE_DENIED",
  );
  assert.throws(
    () =>
      media.requestSlot({
        userId: "user-1",
        claimedType: "mp4",
        claimedSize: 128,
        claimedDuration: 120,
      }),
    (error) => error instanceof MediaError && error.code === "DURATION_DENIED",
  );
});

test("quotas stop a fourth upload from the same user", () => {
  const media = pipeline();
  for (let i = 0; i < 3; i += 1) {
    ingestJpeg(media, "user-1");
  }
  assert.throws(
    () =>
      media.requestSlot({
        userId: "user-1",
        claimedType: "jpeg",
        claimedSize: 64,
      }),
    (error) => error instanceof MediaError && error.code === "QUOTA",
  );
});

test("raw bytes never enter the public zone; only derivatives can be published", () => {
  const media = pipeline();
  const id = ingestJpeg(media);
  assert.throws(
    () => media.publish(id, { role: "user" }),
    (error) => error instanceof MediaError && error.code === "UNAUTHORIZED",
  );
  const view = media.publish(id, { role: "moderator" });
  assert.equal(view.raw, false);
  assert.equal(view.derivative, true);
  media.assertNoRawInPublic();
  const publicObject = [...media.zones["media-public"].values()][0];
  assert.equal(publicObject.kind, "derivative");
  assert.equal(media.zones["intake-private"].get(id).kind, "raw");
});

test("CDN delivery is denied before publish", () => {
  const media = pipeline();
  const id = ingestJpeg(media);
  assert.throws(
    () => media.publicView(id),
    (error) => error instanceof MediaError && error.code === "NOT_PUBLIC",
  );
});

test("report, restrict, delete, and purge remove public delivery", () => {
  const media = pipeline();
  const id = ingestJpeg(media);
  media.publish(id, { role: "moderator" });
  media.report(id);
  media.restrict(id, { role: "moderator" });
  assert.equal(media.zones["media-public"].size, 0);
  media.deleteObject(id, { role: "user", reason: "user deletion" });
  assert.equal(media.require(id).state, "purged");
  assert.equal(media.zones["intake-private"].has(id), false);
  assert.equal(media.purgeLog.length, 1);
  assert.match(media.purgeLog[0].keys[2], /media\.evercommons\.voxonlabs\.com/);
});

test("blocked media can be appealed and is not on the CDN", () => {
  const media = pipeline();
  const id = ingestJpeg(media);
  media.publish(id, { role: "moderator" });
  media.block(id, { role: "moderator" });
  media.appeal(id);
  assert.equal(media.require(id).state, "appealed");
  assert.throws(() => media.publicView(id), (error) => error.code === "NOT_PUBLIC");
});

test("mp4 fake files are accepted privately and still not served raw", () => {
  const media = pipeline();
  const bytes = fakeMp4(256);
  const slot = media.requestSlot({
    userId: "user-2",
    claimedType: "mp4",
    claimedSize: bytes.length,
    claimedDuration: 12,
  });
  media.completeIntake({ slot, bytes, filename: "clip.mov" });
  media.validate(slot.objectId);
  media.process(slot.objectId);
  media.publish(slot.objectId, { role: "moderator" });
  media.assertNoRawInPublic();
});
