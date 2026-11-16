/** Canonical redirects and CSRF checks must use the public host, not the server's bind address. */
export function getRequestOrigin(request: Request) {
  const configured = process.env.APP_URL?.trim();
  if (configured) {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol))
      throw new Error("APP_URL must use HTTP or HTTPS.");
    return url.origin;
  }
  const host = request.headers.get("host");
  if (!host || !/^[a-zA-Z0-9.:[\]-]+$/.test(host))
    throw new Error("Invalid request host.");
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol || new URL(request.url).protocol.slice(0, -1);
  if (protocol !== "http" && protocol !== "https")
    throw new Error("Invalid request protocol.");
  return new URL(`${protocol}://${host}`).origin;
}

export function isSameOrigin(request: Request) {
  try {
    return request.headers.get("origin") === getRequestOrigin(request);
  } catch {
    return false;
  }
}
