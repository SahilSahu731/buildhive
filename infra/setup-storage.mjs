import dotenv from "../server/node_modules/dotenv/lib/main.js";
dotenv.config({ path: "server/.env" });
import { createClient } from "../server/node_modules/@supabase/supabase-js/dist/index.mjs";
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
const client = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const name = process.env.SUPABASE_STORAGE_BUCKET || "buildhive-artifacts";
const { data: existing } = await client.storage.getBucket(name);
const options = {
  public: false,
  fileSizeLimit: 52428800,
  allowedMimeTypes: ["image/png", "application/zip"],
};
const { error } = existing
  ? await client.storage.updateBucket(name, options)
  : await client.storage.createBucket(name, options);
if (error) throw new Error(error.message);
console.log(`Private artifact bucket configured: ${name}`);
