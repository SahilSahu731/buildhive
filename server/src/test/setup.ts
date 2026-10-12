// Run before imports: Prisma must never pick up the developer's Supabase URL in tests.
const testUrl =
  process.env.TEST_DATABASE_URL ||
  "postgresql://unused:unused@127.0.0.1:1/buildhive_test";
if (!new URL(testUrl).pathname.includes("test"))
  throw new Error("TEST_DATABASE_URL must name an isolated test database");
process.env.DATABASE_URL = testUrl;
process.env.DIRECT_URL = testUrl;
process.env.SESSION_SECRET = "test-only-session-secret-at-least-32-characters";
process.env.SECRETS_ENCRYPTION_KEY = "a".repeat(64);
process.env.GEMINI_API_KEY = "";
process.env.RAZORPAY_KEY_ID = "";
process.env.RAZORPAY_KEY_SECRET = "";
process.env.RAZORPAY_WEBHOOK_SECRET = "test-only-webhook-key";
process.env.EMAIL_USER = "";
process.env.EMAIL_PASS = "";
process.env.SUPABASE_SERVICE_ROLE_KEY = "";

// Never send real provider credentials from fixtures.
for (const provider of ["GOOGLE", "GITHUB"]) {
  process.env[`${provider}_CLIENT_ID`] = "test-client-id";
  process.env[`${provider}_CLIENT_SECRET`] = "test-client-secret";
  process.env[`${provider}_CALLBACK_URL`] =
    `http://localhost:5000/api/auth/${provider.toLowerCase()}/callback`;
}
