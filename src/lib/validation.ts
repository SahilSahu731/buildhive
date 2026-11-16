import { z } from "zod";
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalUrl = z.union([
  z.literal(""),
  z
    .url()
    .max(2048)
    .refine((u) => /^https?:\/\//i.test(u), "Use an http or https URL."),
]);
export const profileSchema = z.object({
  name: text(80),
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,40}$/,
      "Use 3–40 lowercase letters, numbers or underscores.",
    ),
  role: z.string().trim().max(100),
  bio: z.string().trim().max(1200),
  location: z.string().trim().max(100),
  skills: z.array(text(40)).max(20),
  lookingFor: z.array(text(60)).max(10),
  availability: z.enum(["open", "busy"]),
  website: optionalUrl,
  github: optionalUrl,
});
export const projectSchema = z.object({
  name: text(80),
  tagline: text(180),
  description: z.string().trim().max(6000),
  url: optionalUrl,
  category: text(60),
  tags: z.array(text(40)).max(10),
  cover: z.enum(["violet", "mint", "peach", "blue"]),
  stage: z.enum(["Idea", "Building", "Beta", "Launched"]),
});
const id = z.string().min(1).max(100);
export const mutationSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createPost"),
    content: text(3000),
    kind: z.enum(["update", "launch", "looking"]),
    projectId: id.optional(),
  }),
  z.object({ action: z.literal("toggleLike"), id }),
  z.object({ action: z.literal("toggleBookmark"), id }),
  z.object({ action: z.literal("upvoteProject"), id }),
  z.object({ action: z.literal("addComment"), id, content: text(1200) }),
  z.object({ action: z.literal("updatePost"), id, content: text(3000) }),
  z.object({ action: z.literal("deletePost"), id }),
  z.object({ action: z.literal("deleteProject"), id }),
  z.object({ action: z.literal("createProject"), project: projectSchema }),
  z.object({ action: z.literal("updateProject"), id, project: projectSchema }),
  z.object({ action: z.literal("requestConnection"), profileId: id }),
  z.object({ action: z.literal("respondConnection"), id, accept: z.boolean() }),
  z.object({ action: z.literal("sendMessage"), id, content: text(4000) }),
  z.object({
    action: z.literal("updateProfile"),
    profile: profileSchema.partial(),
  }),
]);

// Validate persisted previews as untrusted input, including nested records.
const storedProfile = profileSchema.extend({
  id,
  avatar: z.string().max(2048),
});
const storedProject = projectSchema.extend({
  id,
  ownerId: id,
  upvotes: z.number().nonnegative(),
  upvoted: z.boolean(),
});
const storedComment = z.object({
  id,
  authorId: id,
  content: text(1200),
  createdAt: z.iso.datetime(),
});
export const workspaceSchema = z.object({
  reactions: z.array(z.object({
    kind: z.enum(["like", "upvote"]),
    targetId: id,
    actorId: id,
    createdAt: z.iso.datetime(),
  })).max(200).optional(),
  profiles: z.array(storedProfile).max(500),
  projects: z.array(storedProject).max(500),
  posts: z
    .array(
      z.object({
        id,
        authorId: id,
        content: text(3000),
        kind: z.enum(["update", "launch", "looking"]),
        projectId: id.optional(),
        createdAt: z.iso.datetime(),
        likes: z.number().nonnegative(),
        liked: z.boolean(),
        bookmarked: z.boolean(),
        comments: z.array(storedComment).max(200),
      }),
    )
    .max(500),
  connections: z
    .array(
      z.object({
        id,
        senderId: id,
        recipientId: id,
        status: z.enum(["pending", "accepted", "declined"]),
        createdAt: z.iso.datetime(),
      }),
    )
    .max(500),
  conversations: z
    .array(
      z.object({
        id,
        memberIds: z.array(id).length(2),
        messages: z
          .array(
            z.object({
              id,
              senderId: id,
              content: text(4000),
              createdAt: z.iso.datetime(),
              readAt: z.iso.datetime().optional(),
            }),
          )
          .max(1000),
      }),
    )
    .max(200),
});

export const feedbackSchema = z.object({
  category: z.enum(["idea", "bug", "other"]),
  message: z.string().trim().min(10, "Please include at least 10 characters.").max(3000),
  path: z.string().max(500).startsWith("/").refine(value => !value.startsWith("//")),
});
