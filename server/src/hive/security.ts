import { HttpError } from "./errors.js";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";
import { request } from "node:https";
export function publicAddress(address: string) {
  try {
    let ip = ipaddr.parse(address);
    if (ip.kind() === "ipv6" && (ip as ipaddr.IPv6).isIPv4MappedAddress())
      ip = (ip as ipaddr.IPv6).toIPv4Address();
    return ip.range() === "unicast";
  } catch {
    return false;
  }
}
export function normalizeUrl(input: string) {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    throw new HttpError(422, "Enter a valid HTTPS website URL");
  }
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    (u.port && u.port !== "443") ||
    !u.hostname.includes(".") ||
    /(?:^|\.)(localhost|local|internal|test|invalid)$/.test(u.hostname)
  )
    throw new HttpError(422, "Use a public HTTPS website on port 443");
  u.hash = "";
  u.search = "";
  return u.origin;
}
export async function resolvePublic(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "");
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new HttpError(
      422,
      "Private, reserved and internal network destinations are blocked",
    );
  return addresses;
}
// Pin the resolved address at connection time, reject redirects, cap the response.
export async function verificationFile(url: string) {
  const u = new URL(url);
  const [ip] = await resolvePublic(u.hostname);
  return new Promise<string>((resolve, reject) => {
    const req = request(
      u,
      {
        lookup: ((
          _host: string,
          _opts: unknown,
          cb: (
            error: Error | null,
            address: string | { address: string; family: number }[],
            family?: number,
          ) => void,
        ) =>
          cb(
            null,
            (_opts as { all?: boolean })?.all ? [ip] : ip.address,
            ip.family,
          )) as never,
        timeout: 8000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(
            new Error(
              "Verification file must respond with 200, without redirects",
            ),
          );
          return;
        }
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
          if (body.length > 4096) {
            req.destroy();
            reject(new Error("Verification file is too large"));
          }
        });
        res.on("end", () => resolve(body.trim()));
      },
    );
    req.on("timeout", () => req.destroy(new Error("Verification timed out")));
    req.on("error", reject);
    req.end();
  });
}
function encryptionKey() {
  const key = process.env.SECRETS_ENCRYPTION_KEY;
  if (!key || !/^[a-f0-9]{64}$/i.test(key))
    throw new Error("SECRETS_ENCRYPTION_KEY must contain 64 hex characters");
  return Buffer.from(key, "hex");
}
export function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    data.toString("base64url"),
  ].join(".");
}
export function decrypt(value: string) {
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1") throw new Error("Unsupported key version");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  cipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    cipher.update(Buffer.from(data, "base64url")),
    cipher.final(),
  ]).toString("utf8");
}
export function validSignature(
  body: Buffer | string,
  signature: string,
  secret: string,
) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    createHmac("sha256", secret).update(body).digest(),
  );
}
export function redact(input: string, values: string[] = []) {
  let result = input;
  for (const secret of [...new Set(values.flatMap((value) => [value, encodeURIComponent(value)]))]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length))
    result = result.split(secret).join("[REDACTED]");
  return result
    .replace(/(Bearer\s+)[\w.\-]+/gi, "$1[REDACTED]")
    .replace(
      /([?&](?:token|key|password|secret|code|access_token)=)[^&\s]+/gi,
      "$1[REDACTED]",
    )
    .slice(0, 3000);
}
export function safeUrl(value: string) {
  try {
    const u = new URL(value);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "[invalid URL]";
  }
}
export const token = () => randomBytes(32).toString("hex");
