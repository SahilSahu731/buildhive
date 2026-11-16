import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { getWorkspace, mutateWorkspace } from "@/lib/server/workspace";
import { mutationSchema } from "@/lib/validation";
import { isSameOrigin } from "@/lib/request-origin";

export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
async function authenticate() {
  if (!supabaseConfigured)
    return {
      response: NextResponse.json(
        { error: "Connect Supabase to use the live workspace." },
        { status: 503, headers },
      ),
    };
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    return {
      response: NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401, headers },
      ),
    };
  return { client, userId: data.user.id };
}
export async function GET() {
  try {
    const auth = await authenticate();
    if (auth.response) return auth.response;
    const data = await getWorkspace(auth.client!, auth.userId!);
    return NextResponse.json({ data, meId: auth.userId }, { headers });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Workspace unavailable." },
      { status: 503, headers },
    );
  }
}
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json(
      { error: "Expected JSON." },
      { status: 415, headers },
    );
  try {
    const auth = await authenticate();
    if (auth.response) return auth.response;
    // Stream-limited reads prevent oversized JSON bodies from exhausting server memory.
    const reader = request.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "Request body required." },
        { status: 400, headers },
      );
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 32768) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Request too large." },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON." },
        { status: 400, headers },
      );
    }
    const parsed = mutationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Check your input." },
        { status: 400, headers },
      );
    // Production identifiers are UUIDs; preview IDs never reach the database.
    const identifiers =
      "id" in parsed.data
        ? [parsed.data.id]
        : "profileId" in parsed.data
          ? [parsed.data.profileId]
          : "projectId" in parsed.data && parsed.data.projectId
            ? [parsed.data.projectId]
            : [];
    if (
      identifiers.some(
        (id) =>
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            id,
          ),
      )
    )
      return NextResponse.json(
        { error: "Invalid record identifier." },
        { status: 400, headers },
      );
    await mutateWorkspace(auth.client!, auth.userId!, parsed.data);
    return NextResponse.json({ ok: true }, { headers });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save that change." },
      { status: 400, headers },
    );
  }
}
