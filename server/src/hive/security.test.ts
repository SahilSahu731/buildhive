import { describe, it, expect, beforeEach } from "vitest";
import { createHmac } from "node:crypto";
import {
  publicAddress,
  normalizeUrl,
  encrypt,
  decrypt,
  redact,
  validSignature,
} from "./security.js";
beforeEach(() => {
  process.env.SECRETS_ENCRYPTION_KEY = "a".repeat(64);
});
describe("public network boundary", () => {
  it.each([
    "127.0.0.1",
    "0.0.0.0",
    "10.2.3.4",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "224.0.0.1",
    "255.255.255.255",
    "::1",
    "::",
    "fc00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "192.0.2.1",
    "2001:db8::1",
  ])("blocks %s", (ip) => expect(publicAddress(ip)).toBe(false));
  it.each(["1.1.1.1", "8.8.8.8", "2606:4700:4700::1111"])(
    "accepts public %s",
    (ip) => expect(publicAddress(ip)).toBe(true),
  );
  it.each([
    "http://example.com",
    "https://u:p@example.com",
    "https://example.com:444",
    "https://localhost",
    "https://host.internal",
    "file:///etc/passwd",
  ])("rejects unsafe URL %s", (url) =>
    expect(() => normalizeUrl(url)).toThrow(),
  );
  it("normalizes a valid project to its origin", () =>
    expect(normalizeUrl("https://app.example.com/path?token=x#hash")).toBe(
      "https://app.example.com",
    ));
});
describe("secrets and signatures", () => {
  it("round trips authenticated encryption without exposing plaintext", () => {
    const cipher = encrypt("correct horse");
    expect(cipher).not.toContain("correct");
    expect(decrypt(cipher)).toBe("correct horse");
  });
  it("uses distinct random nonces and detects tampering", () => {
    expect(encrypt("same")).not.toBe(encrypt("same"));
    const value = encrypt("secret").split(".");
    value[3] = Buffer.from("tampered").toString("base64url");
    expect(() => decrypt(value.join("."))).toThrow();
  });
  it("requires a real encryption key", () => {
    delete process.env.SECRETS_ENCRYPTION_KEY;
    expect(() => encrypt("secret")).toThrow();
  });
  it("redacts known secrets, bearer tokens and sensitive query values", () => {
    expect(
      redact("password=cats https://a.test?token=abc Bearer xyz", ["cats"]),
    ).not.toMatch(/cats|abc|xyz/);
  });
  it("compares exact signed bytes and rejects malformed signatures", () => {
    const body = '123.{"eventId":"abc"}';
    const sig = createHmac("sha256", "secret").update(body).digest("hex");
    expect(validSignature(body, sig, "secret")).toBe(true);
    expect(validSignature(`${body} `, sig, "secret")).toBe(false);
    expect(validSignature(body, "zz", "secret")).toBe(false);
  });
});
