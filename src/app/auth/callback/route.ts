import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { safeNext } from "@/lib/auth-redirect";
import { getRequestOrigin } from "@/lib/request-origin";
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const next = safeNext(request.nextUrl.searchParams.get("next"), origin);
  const code = request.nextUrl.searchParams.get("code");
  if (
    supabaseConfigured &&
    code &&
    !request.nextUrl.searchParams.has("error")
  ) {
    try {
      const client = await createClient();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, origin));
    } catch {
      /* Report a generic authentication failure without exposing provider data. */
    }
  }
  const target = new URL("/login", origin);
  target.searchParams.set(
    "error",
    supabaseConfigured ? "oauth_failed" : "configuration",
  );
  target.searchParams.set("next", next);
  return NextResponse.redirect(target);
}
