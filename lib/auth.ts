import crypto from "node:crypto";

const COOKIE_NAME = "syntra_admin";

function getSecret() {
  return process.env.SESSION_SECRET || "change-this-in-production";
}

export function createAdminToken() {
  const issuedAt = Date.now().toString();
  const signature = crypto.createHmac("sha256", getSecret()).update(issuedAt).digest("hex");
  return `${issuedAt}.${signature}`;
}

export function verifyAdminToken(value?: string | null) {
  if (!value) return false;
  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature) return false;
  const expected = crypto.createHmac("sha256", getSecret()).update(issuedAt).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const age = Date.now() - Number(issuedAt);
  return Number.isFinite(age) && age >= 0 && age < 1000 * 60 * 60 * 12;
}

export { COOKIE_NAME };
