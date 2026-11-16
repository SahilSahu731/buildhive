import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { isSameOrigin } from "@/lib/request-origin";
import { feedbackSchema } from "@/lib/validation";

const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const failure = (error: string, status: number) =>
  NextResponse.json({ error }, { status, headers });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return failure("Invalid request origin.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return failure("Expected JSON.", 415);
  if (!supabaseConfigured)
    return failure("Feedback is unavailable. Please try again later.", 503);
  try {
    const client = await createClient();
    const { data, error: authError } = await client.auth.getUser();
    if (authError || !data.user)
      return failure("Please sign in to send feedback.", 401);
    const reader = request.body?.getReader();
    if (!reader) return failure("Please include your feedback.", 400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16384) {
        await reader.cancel();
        return failure("Feedback is too long.", 413);
      }
      chunks.push(value);
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return failure("Invalid JSON.", 400);
    }
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success)
      return failure(
        parsed.error.issues[0]?.message || "Please check your feedback.",
        400,
      );
    const { error } = await client
      .from("feedback")
      .insert({ user_id: data.user.id, ...parsed.data });
    if (error)
      return failure(
        error.code === "P0001"
          ? "Please wait a minute before sending more feedback."
          : "Couldn't save your feedback. Please try again later.",
        error.code === "P0001" ? 429 : 503,
      );
    return NextResponse.json({ ok: true }, { status: 201, headers });
  } catch {
    return failure("Couldn't send your feedback. Please try again later.", 503);
  }
}
