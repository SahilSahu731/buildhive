import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { isSameOrigin } from "@/lib/request-origin";
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!supabaseConfigured)
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  try {
    const client = await createClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Sign-out failed. Please try again." },
      { status: 503 },
    );
  }
}
