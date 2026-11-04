export const SESSION_COOKIE = "coa_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { email: string; exp: number };

function base64Url(value: ArrayBuffer | string) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export function getAuthConfig() {
  const email = process.env.AUTH_EMAIL?.trim().toLowerCase();
  const password = process.env.AUTH_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!email || !password || !secret) throw new Error("AUTH_EMAIL, AUTH_PASSWORD and AUTH_SECRET must be configured.");
  return { email, password, secret };
}

export async function createSession(email: string) {
  const { secret } = getAuthConfig();
  const payload: SessionPayload = { email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encoded = base64Url(JSON.stringify(payload));
  return `${encoded}.${await sign(encoded, secret)}`;
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { secret } = getAuthConfig();
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature || (await sign(encoded, secret)) !== signature) return null;
    const payload = JSON.parse(fromBase64Url(encoded)) as SessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
