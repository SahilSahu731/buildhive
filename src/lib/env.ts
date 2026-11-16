import { z } from "zod";
const result = z.object({ url: z.url(), key: z.string().min(1) }).safeParse({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
  key:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "",
});
export const supabaseConfigured = result.success;
export function getSupabaseEnv() {
  if (!result.success)
    throw new Error(
      "Connect Supabase using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  return result.data;
}
