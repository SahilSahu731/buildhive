import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const raw = readFileSync(resolve("server/.env"), "utf8");
const values = {
  ...Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter((l) => l.trim() && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [
          l.slice(0, i).trim(),
          l
            .slice(i + 1)
            .trim()
            .replace(/^['"]|['"]$/g, ""),
        ];
      }),
  ),
  ...process.env,
};
const groups = {
  Core: [
    "DATABASE_URL",
    "DIRECT_URL",
    "SESSION_SECRET",
    "FRONTEND_URL",
    "SERVER_URL",
  ],
  OAuth: [
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ],
  Execution: ["REDIS_URL", "SECRETS_ENCRYPTION_KEY", "RUNNER_EGRESS_PROXY"],
  Artifacts: [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_STORAGE_BUCKET",
  ],
  AI: ["GEMINI_API_KEY"],
  Billing: [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "RAZORPAY_STARTER_PLAN_ID",
    "RAZORPAY_GROWTH_PLAN_ID",
  ],
  Email: values.SMTP_HOST
    ? ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM"]
    : ["EMAIL_USER", "EMAIL_PASS"],
};
for (const [group, keys] of Object.entries(groups)) {
  console.log(`\n${group}`);
  for (const key of keys) {
    const value = values[key];
    const valid =
      value &&
      !/your[_-]|replace[_-]|xxxxx|USER:PASSWORD|placeholder/i.test(value);
    console.log(`  ${valid ? "present" : "MISSING / placeholder"}  ${key}`);
  }
}
console.log(
  "\nOnly variable presence is checked. No credential values are displayed, and no remote service is contacted.",
);
