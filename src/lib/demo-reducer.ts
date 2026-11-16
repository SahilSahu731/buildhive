import type { Mutation, WorkspaceData } from "./types";

/** Local preview mutations share the same domain contract as the authenticated API. */
export function applyDemoMutation(
  data: WorkspaceData,
  me: string,
  mutation: Mutation,
  id = crypto.randomUUID(),
  now = new Date().toISOString(),
): WorkspaceData {
  switch (mutation.action) {
    case "updatePost":
      return {
        ...data,
        posts: data.posts.map((p) =>
          p.id === mutation.id && p.authorId === me
            ? { ...p, content: mutation.content }
            : p,
        ),
      };
    case "deletePost":
      return {
        ...data,
        posts: data.posts.filter(
          (p) => p.id !== mutation.id || p.authorId !== me,
        ),
      };
    case "updateProject":
      return {
        ...data,
        projects: data.projects.map((p) =>
          p.id === mutation.id && p.ownerId === me
            ? { ...p, ...mutation.project }
            : p,
        ),
      };
    case "deleteProject": {
      if (!data.projects.some((p) => p.id === mutation.id && p.ownerId === me))
        return data;
      return {
        ...data,
        projects: data.projects.filter((p) => p.id !== mutation.id),
        posts: data.posts.map((p) =>
          p.projectId === mutation.id ? { ...p, projectId: undefined } : p,
        ),
      };
    }
    case "createPost":
      return {
        ...data,
        posts: [
          {
            id,
            authorId: me,
            content: mutation.content,
            kind: mutation.kind,
            projectId: mutation.projectId,
            createdAt: now,
            likes: 0,
            liked: false,
            bookmarked: false,
            comments: [],
          },
          ...data.posts,
        ],
      };
    case "toggleLike":
      return {
        ...data,
        posts: data.posts.map((p) =>
          p.id === mutation.id
            ? {
                ...p,
                liked: !p.liked,
                likes: Math.max(0, p.likes + (p.liked ? -1 : 1)),
              }
            : p,
        ),
      };
    case "toggleBookmark":
      return {
        ...data,
        posts: data.posts.map((p) =>
          p.id === mutation.id ? { ...p, bookmarked: !p.bookmarked } : p,
        ),
      };
    case "addComment":
      return {
        ...data,
        posts: data.posts.map((p) =>
          p.id === mutation.id
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id,
                    authorId: me,
                    content: mutation.content,
                    createdAt: now,
                  },
                ],
              }
            : p,
        ),
      };
    case "createProject":
      return {
        ...data,
        projects: [
          { ...mutation.project, id, ownerId: me, upvotes: 0, upvoted: false },
          ...data.projects,
        ],
      };
    case "upvoteProject":
      return {
        ...data,
        projects: data.projects.map((p) =>
          p.id === mutation.id
            ? {
                ...p,
                upvoted: !p.upvoted,
                upvotes: Math.max(0, p.upvotes + (p.upvoted ? -1 : 1)),
              }
            : p,
        ),
      };
    case "requestConnection": {
      if (
        mutation.profileId === me ||
        !data.profiles.some((p) => p.id === mutation.profileId)
      )
        return data;
      const existing = data.connections.find(
        (c) =>
          (c.senderId === me && c.recipientId === mutation.profileId) ||
          (c.recipientId === me && c.senderId === mutation.profileId),
      );
      if (existing) return data;
      const connection = {
        id,
        senderId: me,
        recipientId: mutation.profileId,
        status: "pending" as const,
        createdAt: now,
      };
      return { ...data, connections: [...data.connections, connection] };
    }
    case "respondConnection": {
      const connection = data.connections.find(
        (c) =>
          c.id === mutation.id &&
          c.recipientId === me &&
          c.status === "pending",
      );
      if (!connection) return data;
      const memberIds = [connection.senderId, connection.recipientId];
      const exists = data.conversations.some((c) =>
        memberIds.every((id) => c.memberIds.includes(id)),
      );
      return {
        ...data,
        connections: data.connections.map((c) =>
          c.id === connection.id
            ? { ...c, status: mutation.accept ? "accepted" : "declined" }
            : c,
        ),
        conversations:
          mutation.accept && !exists
            ? [...data.conversations, { id, memberIds, messages: [] }]
            : data.conversations,
      };
    }
    case "sendMessage":
      return {
        ...data,
        conversations: data.conversations.map((c) =>
          c.id === mutation.id && c.memberIds.includes(me)
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id,
                    senderId: me,
                    content: mutation.content,
                    createdAt: now,
                  },
                ],
              }
            : c,
        ),
      };
    case "updateProfile":
      return {
        ...data,
        profiles: data.profiles.map((p) =>
          p.id === me ? { ...p, ...mutation.profile, id: me } : p,
        ),
      };
  }
}
