import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
const bucket = () =>
  process.env.SUPABASE_STORAGE_BUCKET || "buildhive-artifacts";
function storage() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("Private Supabase artifact storage is not configured");
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false }, global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(10000) }) } },
  ).storage.from(bucket());
}
export async function uploadArtifact(
  path: string,
  file: string,
  contentType: string,
) {
  const bytes = await readFile(file);
  const { error } = await storage().upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return bytes.length;
}
export async function signedArtifact(path: string, download = true) {
  const { data, error } = await storage().createSignedUrl(path, 60, {
    download,
  });
  if (error) throw error;
  return data.signedUrl;
}
export async function removeArtifacts(paths: string[]) {
  if (!paths.length) return;
  const { error } = await storage().remove(paths);
  if (error) throw error;
}
