import { randomUUID } from "node:crypto";
import { ALLOWED_KINDS, MediaError, sniffKind } from "./signatures.js";
import { CDN_ALLOWED, canTransition } from "./states.js";
import { PUBLIC_ZONES, RAW_ZONES, ZONES } from "./zones.js";

const DEFAULT_LIMITS = {
  perUserDailyUploads: 3,
  projectDailyUploads: 20,
  maxDecodedBytes: 40 * 1024 * 1024,
};

function dayKey(now) {
  return now.toISOString().slice(0, 10);
}

function emptyZones() {
  return Object.fromEntries(ZONES.map((zone) => [zone, new Map()]));
}

export class MediaPipeline {
  constructor({
    uploadsEnabled = false,
    now = () => new Date(),
    limits = DEFAULT_LIMITS,
  } = {}) {
    this.uploadsEnabled = uploadsEnabled;
    this.now = now;
    this.limits = limits;
    this.objects = new Map();
    this.zones = emptyZones();
    this.quota = new Map();
    this.purgeLog = [];
  }

  setKillSwitch(enabled) {
    this.uploadsEnabled = enabled;
  }

  requestSlot({ userId, claimedType, claimedSize, claimedDuration = 0, role = "user" }) {
    if (!this.uploadsEnabled) {
      throw new MediaError("KILL_SWITCH", "Uploads are disabled. Kill switch is on.");
    }
    if (!userId) {
      throw new MediaError("UNAUTHORIZED", "An authenticated local user is required.");
    }
    if (role !== "user" && role !== "moderator") {
      throw new MediaError("UNAUTHORIZED", "Unknown role.");
    }
    const kind = claimedType;
    if (!ALLOWED_KINDS[kind]) {
      throw new MediaError("TYPE_DENIED", "File type is not allowed.");
    }
    if (!Number.isInteger(claimedSize) || claimedSize < 1 || claimedSize > ALLOWED_KINDS[kind].maxBytes) {
      throw new MediaError("SIZE_DENIED", "File size is outside the local stub limits.");
    }
    if (claimedDuration > ALLOWED_KINDS[kind].maxDurationSeconds) {
      throw new MediaError("DURATION_DENIED", "Claimed duration exceeds the local stub limit.");
    }

    const key = `${dayKey(this.now())}:${userId}`;
    const used = this.quota.get(key) ?? 0;
    const projectUsed = this.quota.get(`${dayKey(this.now())}:*`) ?? 0;
    if (used >= this.limits.perUserDailyUploads) {
      throw new MediaError("QUOTA", "Per-user daily upload quota reached.");
    }
    if (projectUsed >= this.limits.projectDailyUploads) {
      throw new MediaError("COST_CAP", "Project daily upload cap reached.");
    }

    return {
      slotId: randomUUID(),
      objectId: randomUUID(),
      userId,
      claimedType: kind,
      claimedSize,
      expiresAt: this.now().getTime() + 60_000,
      oneTime: true,
    };
  }

  completeIntake({ slot, bytes, filename }) {
    if (!slot || slot.expiresAt <= this.now().getTime()) {
      throw new MediaError("SLOT_EXPIRED", "Upload slot expired.");
    }
    if (bytes.length !== slot.claimedSize) {
      throw new MediaError("SIZE_DENIED", "Byte length does not match the slot.");
    }
    if (bytes.length > this.limits.maxDecodedBytes) {
      throw new MediaError("SIZE_DENIED", "Decoded size exceeds the local stub limit.");
    }

    const sniffed = sniffKind(bytes);
    if (sniffed !== slot.claimedType) {
      throw new MediaError("TYPE_DENIED", "Magic-number sniff does not match the claimed type.");
    }

    const record = {
      id: slot.objectId,
      userId: slot.userId,
      state: "uploaded",
      kind: sniffed,
      filenameIgnored: Boolean(filename),
      originalNameStored: false,
      rawZone: "intake-private",
      derivatives: [],
      createdAt: this.now().toISOString(),
    };
    this.objects.set(record.id, record);
    this.zones["intake-private"].set(record.id, {
      kind: "raw",
      bytes,
      public: false,
    });
    this.bumpQuota(slot.userId);
    this.transition(record.id, "validating", { role: "system" });
    return record;
  }

  validate(objectId) {
    const record = this.require(objectId);
    const blob = this.zones["intake-private"].get(objectId);
    if (!blob || blob.kind !== "raw") {
      this.transition(objectId, "quarantined", { role: "system" });
      throw new MediaError("QUARANTINE", "Raw object missing from private intake.");
    }
    this.transition(objectId, "processing", { role: "system" });
    this.zones["processing-private"].set(objectId, {
      kind: "raw",
      bytes: blob.bytes,
      public: false,
    });
    return record;
  }

  process(objectId) {
    const record = this.require(objectId);
    const raw = this.zones["processing-private"].get(objectId);
    if (!raw) {
      throw new MediaError("QUARANTINE", "No private processing copy.");
    }
    const derivativeId = `${record.id}:feed`;
    const derivative = {
      id: derivativeId,
      kind: "derivative",
      variant: "feed",
      metadataStripped: true,
      sourceRaw: false,
      bytes: Buffer.from(`derivative:${record.kind}:${record.id}`),
      public: false,
    };
    record.derivatives = [derivativeId];
    this.zones["media-restricted"].set(derivativeId, derivative);
    this.transition(objectId, "ready_private", { role: "system" });
    this.transition(objectId, "pending_review", { role: "system" });
    return record;
  }

  publish(objectId, { role }) {
    if (role !== "moderator") {
      throw new MediaError("UNAUTHORIZED", "Only a moderator can publish.");
    }
    const record = this.require(objectId);
    const derivativeId = record.derivatives[0];
    const derivative = this.zones["media-restricted"].get(derivativeId);
    if (!derivative || derivative.kind !== "derivative") {
      throw new MediaError("NO_DERIVATIVE", "Public zones may only receive processed derivatives.");
    }
    this.zones["media-public"].set(derivativeId, {
      ...derivative,
      public: true,
      bytes: derivative.bytes,
    });
    this.transition(objectId, "published", { role: "moderator" });
    return this.publicView(objectId);
  }

  report(objectId, { role = "user" } = {}) {
    this.transition(objectId, "reported", { role });
    this.zones["moderation-private"].set(`${objectId}:report`, {
      kind: "evidence",
      public: false,
      bytes: Buffer.from("report-evidence"),
    });
    return this.require(objectId);
  }

  restrict(objectId, { role }) {
    if (role !== "moderator") {
      throw new MediaError("UNAUTHORIZED", "Only a moderator can restrict.");
    }
    const record = this.transition(objectId, "restricted", { role });
    this.removePublic(record);
    return record;
  }

  block(objectId, { role }) {
    if (role !== "moderator") {
      throw new MediaError("UNAUTHORIZED", "Only a moderator can block.");
    }
    const record = this.transition(objectId, "blocked", { role });
    this.removePublic(record);
    return record;
  }

  appeal(objectId, { role = "user" } = {}) {
    return this.transition(objectId, "appealed", { role });
  }

  deleteObject(objectId, { role, reason = "user deletion" }) {
    if (role !== "user" && role !== "moderator" && role !== "system") {
      throw new MediaError("UNAUTHORIZED", "Deletion is not allowed.");
    }
    const record = this.require(objectId);
    this.transition(objectId, "deleted", { role });
    this.removePublic(record);
    for (const zone of RAW_ZONES) {
      this.zones[zone].delete(objectId);
    }
    for (const derivativeId of record.derivatives) {
      this.zones["media-restricted"].delete(derivativeId);
    }
    this.purge(record, reason);
    this.transition(objectId, "purged", { role: "system" });
    return this.require(objectId);
  }

  publicView(objectId) {
    const record = this.require(objectId);
    if (!CDN_ALLOWED.has(record.state)) {
      throw new MediaError("NOT_PUBLIC", "CDN delivery is not allowed in this state.");
    }
    const derivativeId = record.derivatives[0];
    const published = this.zones["media-public"].get(derivativeId);
    if (record.state === "published" && (!published || published.kind !== "derivative")) {
      throw new MediaError("NOT_PUBLIC", "Raw media is not publicly addressable.");
    }
    return {
      objectId: record.id,
      state: record.state,
      url: `https://media.evercommons.voxonlabs.com/d/${derivativeId}`,
      derivative: true,
      raw: false,
    };
  }

  assertNoRawInPublic() {
    for (const zoneName of PUBLIC_ZONES) {
      for (const object of this.zones[zoneName].values()) {
        if (object.kind === "raw") {
          throw new MediaError("RAW_PUBLIC", "Raw upload leaked into a public zone.");
        }
      }
    }
  }

  require(objectId) {
    const record = this.objects.get(objectId);
    if (!record) {
      throw new MediaError("NOT_FOUND", "Unknown media object.");
    }
    return record;
  }

  transition(objectId, to, { role }) {
    const record = this.require(objectId);
    if (!canTransition(record.state, to)) {
      throw new MediaError(
        "ILLEGAL_STATE",
        `Cannot move from ${record.state} to ${to}.`,
      );
    }
    if (to === "published" && role !== "moderator" && role !== "system") {
      throw new MediaError("UNAUTHORIZED", "Publish is a moderator action.");
    }
    record.state = to;
    record.updatedAt = this.now().toISOString();
    return record;
  }

  bumpQuota(userId) {
    const day = dayKey(this.now());
    const userKey = `${day}:${userId}`;
    const projectKey = `${day}:*`;
    this.quota.set(userKey, (this.quota.get(userKey) ?? 0) + 1);
    this.quota.set(projectKey, (this.quota.get(projectKey) ?? 0) + 1);
  }

  removePublic(record) {
    for (const derivativeId of record.derivatives) {
      this.zones["media-public"].delete(derivativeId);
    }
  }

  purge(record, reason) {
    const keys = [
      record.id,
      ...record.derivatives,
      `https://media.evercommons.voxonlabs.com/d/${record.derivatives[0] ?? record.id}`,
    ];
    this.purgeLog.push({
      objectId: record.id,
      reason,
      keys,
      at: this.now().toISOString(),
    });
  }
}

export function fakeJpeg(size = 64) {
  const bytes = Buffer.alloc(size, 0x00);
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]).copy(bytes);
  return bytes;
}

export function fakePng(size = 64) {
  const bytes = Buffer.alloc(size, 0x00);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
  return bytes;
}

export function fakeMp4(size = 64) {
  const bytes = Buffer.alloc(size, 0x00);
  bytes.write("xxxxftypisom", 0, "ascii");
  return bytes;
}
