export function parseCookies(header) {
  const cookies = {};
  if (!header) {
    return cookies;
  }
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) {
      continue;
    }
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export function cookieHeader(name, value, { httpOnly, maxAge, path = "/" } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, "SameSite=Lax"];
  if (httpOnly) {
    parts.push("HttpOnly");
  }
  if (Number.isInteger(maxAge)) {
    parts.push(`Max-Age=${maxAge}`);
  }
  return parts.join("; ");
}

export function originAllowed(requestOrigin, expectedOrigin) {
  return typeof requestOrigin === "string" && requestOrigin === expectedOrigin;
}
