import type { WorkspaceData } from "./types";

export type Notification = {
  read: any;
  id: string;
  kind: "connection" | "message" | "comment" | "like" | "upvote";
  actorId: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  read?: boolean;
};

/** Build personal activity from actual workspace records, never from anonymous totals. */
export function getNotifications(
  data: WorkspaceData,
  userId: string,
): Notification[] {
  const items: Notification[] = [];
  const name = (id: string) =>
    data.profiles.find((profile) => profile.id === id)?.name || "A builder";
  for (const connection of data.connections) {
    if (connection.status === "pending" && connection.recipientId === userId) {
      items.push({
        id: `connection:${connection.id}:pending`,
        kind: "connection",
        actorId: connection.senderId,
        title: `${name(connection.senderId)} wants to connect`,
        description: "Meet your next collaborator.",
        href: "/cofounders",
        createdAt: connection.createdAt,
      });
    } else if (
      connection.status === "accepted" &&
      connection.senderId === userId
    ) {
      items.push({
        id: `connection:${connection.id}:accepted`,
        kind: "connection",
        actorId: connection.recipientId,
        title: `You're connected with ${name(connection.recipientId)}`,
        description: "Say hello and start building together.",
        href: "/messages",
        createdAt: connection.updatedAt || connection.createdAt,
      });
    }
  }
  for (const conversation of data.conversations) {
    if (!conversation.memberIds.includes(userId)) continue;
    // One entry per conversation keeps busy chats from overwhelming other activity.
    const message = conversation.messages
      .filter((item) => item.senderId !== userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    if (!message) continue;
    items.push({
      id: `message:${message.id}`,
      kind: "message",
      actorId: message.senderId,
      title: `${name(message.senderId)} sent you a message`,
      description: message.content,
      href: `/messages?conversation=${encodeURIComponent(conversation.id)}`,
      createdAt: message.createdAt,
      read: conversation.messages
        .filter((item) => item.senderId !== userId)
        .every((item) => !!item.readAt),
    });
  }
  for (const post of data.posts) {
    if (post.authorId !== userId) continue;
    for (const comment of post.comments) {
      if (comment.authorId === userId) continue;
      items.push({
        id: `comment:${comment.id}`,
        kind: "comment",
        actorId: comment.authorId,
        title: `${name(comment.authorId)} replied to your post`,
        description: comment.content,
        href: `/#post-${encodeURIComponent(post.id)}`,
        createdAt: comment.createdAt,
      });
    }
  }
  for (const reaction of data.reactions || []) {
    if (reaction.actorId === userId) continue;
    const project =
      reaction.kind === "upvote"
        ? data.projects.find((item) => item.id === reaction.targetId)
        : undefined;
    items.push({
      id: `${reaction.kind}:${reaction.targetId}:${reaction.actorId}:${reaction.createdAt}`,
      kind: reaction.kind,
      actorId: reaction.actorId,
      title: `${name(reaction.actorId)} ${reaction.kind === "like" ? "liked your post" : `upvoted ${project?.name || "your project"}`}`,
      description:
        reaction.kind === "like"
          ? "Your update resonated with a builder."
          : "Your project is getting noticed.",
      href:
        reaction.kind === "like"
          ? `/#post-${encodeURIComponent(reaction.targetId)}`
          : `/explore?project=${encodeURIComponent(reaction.targetId)}`,
      createdAt: reaction.createdAt,
    });
  }
  return items
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 100);
}
