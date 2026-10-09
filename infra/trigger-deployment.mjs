import { createHmac } from "node:crypto";
const {
  BUILDHIVE_WEBHOOK_URL,
  BUILDHIVE_WEBHOOK_SECRET,
  DEPLOYMENT_ID,
  DEPLOYMENT_LABEL,
} = process.env;
if (!BUILDHIVE_WEBHOOK_URL || !BUILDHIVE_WEBHOOK_SECRET || !DEPLOYMENT_ID)
  throw new Error(
    "Set BUILDHIVE_WEBHOOK_URL, BUILDHIVE_WEBHOOK_SECRET and a unique DEPLOYMENT_ID",
  );
const body = JSON.stringify({
  eventId: DEPLOYMENT_ID,
  label: DEPLOYMENT_LABEL || DEPLOYMENT_ID,
});
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = createHmac("sha256", BUILDHIVE_WEBHOOK_SECRET)
  .update(`${timestamp}.${body}`)
  .digest("hex");
const response = await fetch(BUILDHIVE_WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-BuildHive-Timestamp": timestamp,
    "X-BuildHive-Signature": signature,
  },
  body,
  signal: AbortSignal.timeout(30000),
});
console.log(`BuildHive: ${response.status}`);
if (!response.ok)
  throw new Error(
    "Deployment trigger failed. Check webhook credentials, domain verification and plan limits.",
  );
