import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyDemoMutation } from "@/lib/demo-reducer";
import { makeDemoData, DEMO_USER_ID as me } from "@/lib/demo-data";
import {
  mutationSchema,
  projectSchema,
  workspaceSchema,
} from "@/lib/validation";
import { safeNext } from "@/lib/auth-redirect";
import { safeUrl } from "@/lib/utils";
import { getRequestOrigin, isSameOrigin } from "@/lib/request-origin";

describe("preview social interactions", () => {
  it("accepts a complete preview and rejects a corrupted persisted record", () => {
    const initial = makeDemoData();
    expect(workspaceSchema.safeParse(initial).success).toBe(true);
    expect(
      workspaceSchema.safeParse({ ...initial, profiles: [{ id: me }] }).success,
    ).toBe(false);
  });
  it("allows only an update's owner to edit or delete it", () => {
    const initial = makeDemoData();
    expect(
      applyDemoMutation(initial, me, {
        action: "deletePost",
        id: initial.posts[0].id,
      }).posts,
    ).toHaveLength(initial.posts.length);
    const edited = applyDemoMutation(initial, "maya", {
      action: "updatePost",
      id: initial.posts[0].id,
      content: "A thoughtful revision",
    });
    expect(edited.posts[0].content).toBe("A thoughtful revision");
    expect(
      applyDemoMutation(edited, "maya", {
        action: "deletePost",
        id: initial.posts[0].id,
      }).posts,
    ).toHaveLength(initial.posts.length - 1);
  });
  it("removes a deleted product attachment while preserving the community post", () => {
    const initial = makeDemoData();
    const next = applyDemoMutation(initial, "maya", {
      action: "deleteProject",
      id: "folio",
    });
    expect(next.projects.some((p) => p.id === "folio")).toBe(false);
    expect(next.posts[0].content).toBe(initial.posts[0].content);
    expect(next.posts[0].projectId).toBeUndefined();
  });
  it("reverses a like without changing the original snapshot", () => {
    const initial = makeDemoData();
    const post = initial.posts[0];
    const liked = applyDemoMutation(initial, me, {
      action: "toggleLike",
      id: post.id,
    });
    expect(liked.posts[0].likes).toBe(post.likes + 1);
    expect(initial.posts[0].liked).toBe(false);
    expect(
      applyDemoMutation(liked, me, { action: "toggleLike", id: post.id })
        .posts[0],
    ).toEqual(post);
  });
  it("stores bookmarks independently of public likes", () => {
    const initial = makeDemoData();
    const saved = applyDemoMutation(initial, me, {
      action: "toggleBookmark",
      id: initial.posts[0].id,
    });
    expect(saved.posts[0].bookmarked).toBe(true);
    expect(saved.posts[0].likes).toBe(initial.posts[0].likes);
  });
  it("adds a comment with the current author and a server-shaped timestamp", () => {
    const initial = makeDemoData();
    const next = applyDemoMutation(
      initial,
      me,
      {
        action: "addComment",
        id: initial.posts[0].id,
        content: "Love the detail!",
      },
      "comment-id",
      "2026-11-16T12:00:00Z",
    );
    expect(next.posts[0].comments.at(-1)).toEqual({
      id: "comment-id",
      authorId: me,
      content: "Love the detail!",
      createdAt: "2026-11-16T12:00:00Z",
    });
  });
  it("creates a project owned by the current builder with no fabricated upvotes", () => {
    const initial = makeDemoData();
    const { id, ownerId, upvotes, upvoted, ...project } = initial.projects[0];
    const next = applyDemoMutation(
      initial,
      me,
      { action: "createProject", project },
      "new-project",
    );
    expect(next.projects[0]).toMatchObject({
      id: "new-project",
      ownerId: me,
      upvotes: 0,
      upvoted: false,
    });
  });
  it("cannot overwrite profile identity with supplied fields", () => {
    const next = applyDemoMutation(makeDemoData(), me, {
      action: "updateProfile",
      profile: { id: "another-user", name: "New name" },
    });
    expect(next.profiles.find((p) => p.name === "New name")?.id).toBe(me);
  });
});

describe("connection authorization and lifecycle", () => {
  it("rejects self-connection", () => {
    const data = makeDemoData();
    expect(
      applyDemoMutation(data, me, {
        action: "requestConnection",
        profileId: me,
      }),
    ).toBe(data);
  });
  it("rejects unknown builders", () => {
    const data = makeDemoData();
    expect(
      applyDemoMutation(data, me, {
        action: "requestConnection",
        profileId: "missing",
      }),
    ).toBe(data);
  });
  it("does not duplicate requests in either direction", () => {
    const data = applyDemoMutation(
      makeDemoData(),
      me,
      { action: "requestConnection", profileId: "arjun" },
      "connection",
    );
    expect(
      applyDemoMutation(data, "arjun", {
        action: "requestConnection",
        profileId: me,
      }).connections,
    ).toHaveLength(data.connections.length);
  });
  it("only the recipient can accept", () => {
    const data = makeDemoData();
    const next = applyDemoMutation(data, "nina", {
      action: "respondConnection",
      id: "conn-nina",
      accept: true,
    });
    expect(next).toBe(data);
  });
  it("accepts once and opens one conversation with exactly the two participants", () => {
    const data = applyDemoMutation(
      makeDemoData(),
      me,
      { action: "respondConnection", id: "conn-nina", accept: true },
      "new-conversation",
    );
    expect(data.connections.find((c) => c.id === "conn-nina")?.status).toBe(
      "accepted",
    );
    expect(
      data.conversations.find((c) => c.id === "new-conversation")?.memberIds,
    ).toEqual(["nina", me]);
    expect(
      applyDemoMutation(data, me, {
        action: "respondConnection",
        id: "conn-nina",
        accept: true,
      }).conversations,
    ).toHaveLength(2);
  });
  it("does not create a conversation when declined", () => {
    const data = applyDemoMutation(makeDemoData(), me, {
      action: "respondConnection",
      id: "conn-nina",
      accept: false,
    });
    expect(data.connections.find((c) => c.id === "conn-nina")?.status).toBe(
      "declined",
    );
    expect(data.conversations).toHaveLength(1);
  });
  it("blocks a nonmember from sending into another pair's conversation", () => {
    const data = makeDemoData();
    const next = applyDemoMutation(data, "leo", {
      action: "sendMessage",
      id: "convo-maya",
      content: "Unauthorized",
    });
    expect(next.conversations[0].messages).toEqual(
      data.conversations[0].messages,
    );
  });
});

describe("input and redirect boundaries", () => {
  beforeEach(() => vi.stubEnv("APP_URL", ""));
  afterEach(() => vi.unstubAllEnvs());
  it("pins production callback origins to configuration", () => {
    vi.stubEnv("APP_URL", "https://build.example.com");
    expect(
      getRequestOrigin(
        new Request("http://0.0.0.0:3001/auth/callback", {
          headers: { host: "untrusted.example.com" },
        }),
      ),
    ).toBe("https://build.example.com");
  });
  it("preserves HTTPS behind a reverse proxy", () => {
    expect(
      getRequestOrigin(
        new Request("http://0.0.0.0:3001/auth/callback", {
          headers: { host: "build.example.com", "x-forwarded-proto": "https" },
        }),
      ),
    ).toBe("https://build.example.com");
  });
  it("uses the public Host header instead of the bind address for local redirects", () => {
    const request = new Request("http://0.0.0.0:3001/auth/callback", {
      headers: { host: "localhost:3001" },
    });
    expect(getRequestOrigin(request)).toBe("http://localhost:3001");
  });
  it("accepts a same-origin browser write behind the local bind host", () => {
    expect(
      isSameOrigin(
        new Request("http://0.0.0.0:3001/api/workspace", {
          headers: { host: "localhost:3001", origin: "http://localhost:3001" },
        }),
      ),
    ).toBe(true);
  });
  it("rejects cross-origin and missing-origin writes", () => {
    expect(
      isSameOrigin(
        new Request("http://0.0.0.0:3001/api/workspace", {
          headers: { host: "localhost:3001", origin: "https://evil.test" },
        }),
      ),
    ).toBe(false);
    expect(
      isSameOrigin(
        new Request("http://0.0.0.0:3001/api/workspace", {
          headers: { host: "localhost:3001" },
        }),
      ),
    ).toBe(false);
  });
  it.each(["", "   ", "x".repeat(3001)])(
    "rejects invalid post content",
    (content) => {
      expect(
        mutationSchema.safeParse({
          action: "createPost",
          content,
          kind: "update",
        }).success,
      ).toBe(false);
    },
  );
  it("strips attempted profile ownership changes at the validation boundary", () => {
    const result = mutationSchema.parse({
      action: "updateProfile",
      profile: { id: "spoof", name: "Builder" },
    });
    expect("profile" in result && "id" in result.profile).toBe(false);
  });
  it("rejects script URLs in products", () => {
    const p = makeDemoData().projects[0];
    expect(
      projectSchema.safeParse({ ...p, url: "javascript:alert(1)" }).success,
    ).toBe(false);
  });
  it.each([
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "\\evil.test",
    "/\n/evil.test",
    "javascript:alert(1)",
  ])("rejects external auth redirect %s", (value) => {
    expect(safeNext(value, "https://build.test")).toBe("/");
  });
  it("preserves valid local auth destinations", () => {
    expect(safeNext("/messages?from=login", "https://build.test")).toBe(
      "/messages?from=login",
    );
  });
  it.each(["javascript:alert(1)", "data:text/html,test", "file:///etc/passwd"])(
    "blocks unsafe outbound URL %s",
    (url) => {
      expect(safeUrl(url)).toBe("");
    },
  );
});
