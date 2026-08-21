export class MediaError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "MediaError";
    this.code = code;
  }
}

const JPEG = Buffer.from([0xff, 0xd8, 0xff]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export const ALLOWED_KINDS = Object.freeze({
  jpeg: { maxBytes: 8 * 1024 * 1024, maxDurationSeconds: 0 },
  png: { maxBytes: 8 * 1024 * 1024, maxDurationSeconds: 0 },
  webp: { maxBytes: 8 * 1024 * 1024, maxDurationSeconds: 0 },
  mp4: { maxBytes: 32 * 1024 * 1024, maxDurationSeconds: 60 },
});

export function sniffKind(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 12) {
    return null;
  }
  if (bytes.subarray(0, 3).equals(JPEG)) {
    return "jpeg";
  }
  if (bytes.subarray(0, 8).equals(PNG)) {
    return "png";
  }
  if (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  if (bytes.subarray(4, 8).toString("ascii") === "ftyp") {
    return "mp4";
  }
  return null;
}
