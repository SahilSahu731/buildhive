import { describe, expect, it } from "vitest";
import { getNotifications } from "@/lib/notifications";
import { makeDemoData, DEMO_USER_ID } from "@/lib/demo-data";

describe("personal notification activity", () => {
  it("groups incoming messages and ignores unrelated conversations and outgoing requests", () => {
    const data = makeDemoData();
    data.conversations.push({
      id: "private",
      memberIds: ["maya", "nina"],
      messages: [
        {
          id: "secret",
          senderId: "maya",
          content: "Private conversation",
          createdAt: new Date().toISOString(),
        },
      ],
    });
    data.connections.push({
      id: "outgoing",
      senderId: DEMO_USER_ID,
      recipientId: "arjun",
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    const items = getNotifications(data, DEMO_USER_ID);
    expect(items.filter((item) => item.kind === "message")).toHaveLength(1);
    expect(items.find((item) => item.kind === "message")).toMatchObject({
      id: "message:m3",
      href: "/messages?conversation=convo-maya",
    });
    expect(
      items.some(
        (item) => item.id.includes("secret") || item.id.includes("outgoing"),
      ),
    ).toBe(false);
    expect(
      items.some((item) => item.id === "connection:conn-nina:pending"),
    ).toBe(true);
    data.conversations[0].messages.forEach((message) => {
      message.readAt = new Date().toISOString();
    });
    expect(
      getNotifications(data, DEMO_USER_ID).find(
        (item) => item.kind === "message",
      )?.read,
    ).toBe(true);
  });

  it("includes replies and individual reactions on your work, excluding your own activity", () => {
    const data = makeDemoData(),
      now = new Date().toISOString();
    data.posts[0].authorId = DEMO_USER_ID;
    data.posts[0].comments.push({
      id: "self",
      authorId: DEMO_USER_ID,
      content: "My reply",
      createdAt: now,
    });
    data.reactions = [
      {
        kind: "like",
        targetId: data.posts[0].id,
        actorId: "arjun",
        createdAt: now,
      },
      {
        kind: "upvote",
        targetId: data.projects[0].id,
        actorId: "nina",
        createdAt: now,
      },
      {
        kind: "like",
        targetId: data.posts[0].id,
        actorId: DEMO_USER_ID,
        createdAt: now,
      },
    ];
    const items = getNotifications(data, DEMO_USER_ID);
    expect(items.filter((item) => item.kind === "comment")).toHaveLength(2);
    expect(items.filter((item) => item.kind === "like")).toHaveLength(1);
    expect(items.find((item) => item.kind === "upvote")?.href).toBe(
      `/explore?project=${data.projects[0].id}`,
    );
    expect(items.some((item) => item.id === "comment:self")).toBe(false);
    expect(items.every((item) => item.actorId !== DEMO_USER_ID)).toBe(true);
    expect(items.map((item) => item.createdAt)).toEqual(
      items
        .map((item) => item.createdAt)
        .sort()
        .reverse(),
    );
  });

  it("announces an accepted outgoing request as a distinct event at its updated time", () => {
    const data = makeDemoData(),
      now = new Date().toISOString();
    data.connections = [
      {
        id: "request",
        senderId: DEMO_USER_ID,
        recipientId: "maya",
        status: "accepted",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: now,
      },
    ];
    expect(
      getNotifications(data, DEMO_USER_ID).find(
        (item) => item.kind === "connection",
      ),
    ).toMatchObject({ id: "connection:request:accepted", createdAt: now });
  });
});
