// Run this proxy as a separate service. Only workers may connect to it.
// Every CONNECT resolves once, rejects every non-public result, and pins the socket IP.
import { createServer } from "node:http";
import { connect, Socket } from "node:net";
import { resolvePublic } from "./security.js";
const proxy = createServer((_req, res) => {
  res.writeHead(405);
  res.end("HTTPS CONNECT only");
});
proxy.on("connect", async (req, client, head) => {
  try {
    const raw = req.url || "";
    if (!/^[a-zA-Z0-9.-]+:443$/.test(raw))
      throw new Error("Only HTTPS port 443 is allowed");
    const hostname = raw.slice(0, -4);
    const addresses = await resolvePublic(hostname);
    const upstream = connect({
      host: addresses[0].address,
      port: 443,
      family: addresses[0].family,
    });
    upstream.setTimeout(130000, () => upstream.destroy());
    (client as Socket).setTimeout(130000, () => client.destroy());
    upstream.once("connect", () => {
      client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head.length) upstream.write(head);
      client.pipe(upstream);
      upstream.pipe(client);
    });
    upstream.on("error", () => client.destroy());
    client.on("error", () => upstream.destroy());
    client.on("close", () => upstream.destroy());
    upstream.on("close", () => client.destroy());
  } catch {
    client.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
  }
});
proxy.maxConnections = 100;
proxy.headersTimeout = 10000;
proxy.requestTimeout = 10000;
proxy.listen(Number(process.env.EGRESS_PORT || 3128), "0.0.0.0", () =>
  console.log("BuildHive public HTTPS egress proxy listening"),
);
