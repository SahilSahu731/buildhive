import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
let client: ReturnType<typeof createBrowserClient> | undefined;
export function createClient() {
  const { url, key } = getSupabaseEnv();
  client ??= createBrowserClient(url, key);
  return client;
}
