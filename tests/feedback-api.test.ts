import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/feedback/route";

const client = vi.hoisted(() => ({
  getUser: vi.fn(),
  insert: vi.fn(),
  from: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: client.getUser },
    from: client.from,
  }),
}));
vi.mock("@/lib/env", () => ({ supabaseConfigured: true }));
beforeEach(() => {
  vi.stubEnv("APP_URL", "https://build.example");
  client.getUser.mockResolvedValue({
    data: { user: { id: "signed-in-user" } },
    error: null,
  });
  client.from.mockReturnValue({ insert: client.insert });
  client.insert.mockResolvedValue({ error: null });
  vi.clearAllMocks();
});
const valid = {
  category: "idea",
  message: "Make project filters easier to use.",
  path: "/explore",
};
const request = (body: unknown = valid, origin = "https://build.example") =>
  new NextRequest("https://build.example/api/feedback", {
    method: "POST",
    headers: {
      host: "build.example",
      origin,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

describe("feedback API", () => {
  it("stores the authenticated identity and ignores a forged body identity", async () => {
    expect((await POST(request({ ...valid, user_id: "forged" }))).status).toBe(
      201,
    );
    expect(client.from).toHaveBeenCalledWith("feedback");
    expect(client.insert).toHaveBeenCalledWith({
      ...valid,
      user_id: "signed-in-user",
    });
  });
  it("rejects cross-origin and unauthenticated submissions", async () => {
    expect((await POST(request(valid, "https://other.example"))).status).toBe(
      403,
    );
    expect(client.getUser).not.toHaveBeenCalled();
    client.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await POST(request())).status).toBe(401);
    expect(client.insert).not.toHaveBeenCalled();
  });
  it("validates input and enforces the streamed body limit", async () => {
    expect((await POST(request({ ...valid, message: "short" }))).status).toBe(
      400,
    );
    expect(
      (await POST(request({ ...valid, path: "//other.example" }))).status,
    ).toBe(400);
    expect(
      (await POST(request({ ...valid, message: "x".repeat(17000) }))).status,
    ).toBe(413);
    expect(client.insert).not.toHaveBeenCalled();
  });
  it("returns safe storage errors and rate-limit responses", async () => {
    client.insert.mockResolvedValue({
      error: { code: "42P01", message: "Private database detail" },
    });
    const failed = await POST(request());
    expect(failed.status).toBe(503);
    expect(JSON.stringify(await failed.json())).not.toContain(
      "Private database detail",
    );
    client.insert.mockResolvedValue({ error: { code: "P0001" } });
    expect((await POST(request())).status).toBe(429);
  });
});
