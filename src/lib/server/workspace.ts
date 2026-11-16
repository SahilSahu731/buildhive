import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceData, Profile, Project, Mutation } from "@/lib/types";

type ProfileRow = {
  id: string;
  username: string;
  name: string;
  role: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  skills: string[];
  looking_for: string[];
  availability: string;
  website: string | null;
  github: string | null;
};
type CommentRow = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
};
type PostRow = {
  id: string;
  author_id: string;
  content: string;
  kind: "update" | "launch" | "looking";
  project_id: string | null;
  created_at: string;
  post_likes: { count: number }[];
  comments: CommentRow[];
  author: ProfileRow;
};
type ProjectRow = {
  id: string;
  owner_id: string;
  name: string;
  tagline: string;
  description: string;
  url: string | null;
  category: string;
  tags: string[];
  cover: Project["cover"];
  stage: string;
  project_upvotes: { count: number }[];
  owner: ProfileRow;
};
type ConversationRow = {
  id: string;
  conversation_members: { user_id: string }[];
  messages: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
  }[];
};

function profileFromRow(p: ProfileRow): Profile {
  return {
    id: p.id,
    name: p.name,
    username: p.username,
    role: p.role,
    bio: p.bio,
    location: p.location,
    avatar: p.avatar_url || "",
    skills: p.skills,
    lookingFor: p.looking_for,
    availability: p.availability === "open" ? "open" : "busy",
    website: p.website || "",
    github: p.github || "",
  };
}
export async function getWorkspace(
  client: SupabaseClient,
  userId: string,
): Promise<WorkspaceData> {
  const results = await Promise.all([
    client
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    client.from("profiles").select("*").eq("id", userId).single(),
    client
      .from("posts")
      .select(
        "*,post_likes(count),comments(*),author:profiles!posts_author_id_fkey(*)",
      )
      .order("created_at", { ascending: false })
      .limit(100)
      .limit(30, { referencedTable: "comments" }),
    client
      .from("projects")
      .select(
        "*,project_upvotes(count),owner:profiles!projects_owner_id_fkey(*)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId)
      .limit(1000),
    client
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", userId)
      .limit(1000),
    client
      .from("project_upvotes")
      .select("project_id")
      .eq("user_id", userId)
      .limit(1000),
    client
      .from("connections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    client
      .from("conversations")
      .select("id,conversation_members(user_id),messages(*)")
      .order("created_at", { ascending: false })
      .limit(50)
      .order("created_at", { referencedTable: "messages", ascending: false })
      .limit(100, { referencedTable: "messages" }),
    client.from("post_likes")
      .select("post_id,user_id,created_at,posts!inner(author_id)")
      .eq("posts.author_id", userId).neq("user_id", userId)
      .order("created_at", { ascending: false }).limit(50),
    client.from("project_upvotes")
      .select("project_id,user_id,created_at,projects!inner(owner_id)")
      .eq("projects.owner_id", userId).neq("user_id", userId)
      .order("created_at", { ascending: false }).limit(50),
  ]);
  for (const result of results)
    if (result.error)
      throw new Error(
        "Workspace data is unavailable. Check that the database migration has been applied.",
      );
  const [
    profilesResult,
    ownResult,
    postsResult,
    projectsResult,
    likes,
    bookmarks,
    votes,
    connectionsResult,
    conversationsResult,
    receivedLikes,
    receivedVotes,
  ] = results;
  const reactions = [
    ...(receivedLikes.data as unknown as {post_id: string; user_id: string; created_at: string}[]).map(row => ({
      kind: "like" as const, targetId: row.post_id, actorId: row.user_id, createdAt: row.created_at,
    })),
    ...(receivedVotes.data as unknown as {project_id: string; user_id: string; created_at: string}[]).map(row => ({
      kind: "upvote" as const, targetId: row.project_id, actorId: row.user_id, createdAt: row.created_at,
    })),
  ];
  const posts = postsResult.data as unknown as PostRow[];
  const projects = projectsResult.data as unknown as ProjectRow[];
  const profiles = new Map<string, Profile>();
  for (const row of [
    ...(profilesResult.data as unknown as ProfileRow[]),
    ownResult.data as unknown as ProfileRow,
    ...posts.map((p) => p.author),
    ...projects.map((p) => p.owner),
  ]) {
    if (row) profiles.set(row.id, profileFromRow(row));
  }
  // The public directory is bounded, so fetch referenced peers/authors missing from it.
  const peerIds = new Set<string>();
  reactions.forEach(reaction => peerIds.add(reaction.actorId));
  const conversationRows =
    conversationsResult.data as unknown as ConversationRow[];
  conversationRows.forEach((c) =>
    c.conversation_members.forEach((m) => peerIds.add(m.user_id)),
  );
  posts.forEach((p) => p.comments.forEach((c) => peerIds.add(c.author_id)));
  const connectionRows = connectionsResult.data as unknown as {
    id: string;
    sender_id: string;
    recipient_id: string;
    status: "pending" | "accepted" | "declined";
    created_at: string;
  }[];
  connectionRows.forEach((c) => {
    peerIds.add(c.sender_id);
    peerIds.add(c.recipient_id);
  });
  const missing = [...peerIds].filter((id) => !profiles.has(id));
  if (missing.length) {
    const { data: rows, error } = await client
      .from("profiles")
      .select("*")
      .in("id", missing);
    if (error) throw new Error("Could not load conversation participants.");
    (rows as ProfileRow[]).forEach((row) =>
      profiles.set(row.id, profileFromRow(row)),
    );
  }
  const liked = new Set(
    (likes.data as unknown as { post_id: string }[]).map((r) => r.post_id),
  );
  const saved = new Set(
    (bookmarks.data as unknown as { post_id: string }[]).map((r) => r.post_id),
  );
  const upvoted = new Set(
    (votes.data as unknown as { project_id: string }[]).map(
      (r) => r.project_id,
    ),
  );
  return {
    reactions,
    profiles: [...profiles.values()],
    posts: posts.map((p) => ({
      id: p.id,
      authorId: p.author_id,
      content: p.content,
      kind: p.kind,
      projectId: p.project_id || undefined,
      createdAt: p.created_at,
      likes: p.post_likes[0]?.count || 0,
      liked: liked.has(p.id),
      bookmarked: saved.has(p.id),
      comments: p.comments
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((c) => ({
          id: c.id,
          authorId: c.author_id,
          content: c.content,
          createdAt: c.created_at,
        })),
    })),
    projects: projects.map((p) => ({
      id: p.id,
      ownerId: p.owner_id,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      url: p.url || "",
      category: p.category,
      tags: p.tags,
      cover: p.cover,
      stage:
        {
          idea: "Idea",
          building: "Building",
          beta: "Beta",
          launched: "Launched",
        }[p.stage] || "Building",
      upvotes: p.project_upvotes[0]?.count || 0,
      upvoted: upvoted.has(p.id),
    })),
    connections: connectionRows.map((c) => ({
      id: c.id,
      senderId: c.sender_id,
      recipientId: c.recipient_id,
      status: c.status,
      createdAt: c.created_at,
    })),
    conversations: conversationRows.map((c) => ({
      id: c.id,
      memberIds: c.conversation_members.map((m) => m.user_id),
      messages: [...c.messages]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((m) => ({
          id: m.id,
          senderId: m.sender_id,
          content: m.content,
          createdAt: m.created_at,
          readAt: m.read_at || undefined,
        })),
    })),
  };
}

export async function mutateWorkspace(
  client: SupabaseClient,
  userId: string,
  mutation: Mutation,
) {
  const check = (result: {
    error: { code?: string; message?: string } | null;
  }) => {
    if (result.error) {
      if (result.error.code === "23505")
        throw new Error("That username is already in use. Try another one.");
      if (result.error.code === "P0001")
        throw new Error(
          "You're moving fast. Please wait a minute and try again.",
        );
      throw new Error(
        "That change couldn't be saved. Check your access and try again.",
      );
    }
  };
  const toggle = async (table: string, column: string, id: string) => {
    const existing = await client
      .from(table)
      .select(column)
      .eq(column, id)
      .eq("user_id", userId)
      .maybeSingle();
    check(existing);
    const result = existing.data
      ? await client.from(table).delete().eq(column, id).eq("user_id", userId)
      : await client
          .from(table)
          .upsert(
            { [column]: id, user_id: userId },
            { ignoreDuplicates: true, onConflict: `${column},user_id` },
          );
    check(result);
  };
  switch (mutation.action) {
    case "updatePost":
      check(
        await client
          .from("posts")
          .update({ content: mutation.content })
          .eq("id", mutation.id)
          .eq("author_id", userId)
          .select("id")
          .single(),
      );
      break;
    case "deletePost":
      check(
        await client
          .from("posts")
          .delete()
          .eq("id", mutation.id)
          .eq("author_id", userId)
          .select("id")
          .single(),
      );
      break;
    case "updateProject": {
      const p = mutation.project;
      check(
        await client
          .from("projects")
          .update({
            name: p.name,
            tagline: p.tagline,
            description: p.description,
            url: p.url || null,
            category: p.category,
            tags: p.tags,
            cover: p.cover,
            stage: p.stage.toLowerCase(),
          })
          .eq("id", mutation.id)
          .eq("owner_id", userId)
          .select("id")
          .single(),
      );
      break;
    }
    case "deleteProject":
      check(
        await client
          .from("projects")
          .delete()
          .eq("id", mutation.id)
          .eq("owner_id", userId)
          .select("id")
          .single(),
      );
      break;
    case "createPost":
      check(
        await client.from("posts").insert({
          author_id: userId,
          content: mutation.content,
          kind: mutation.kind,
          project_id: mutation.projectId || null,
        }),
      );
      break;
    case "toggleLike":
      await toggle("post_likes", "post_id", mutation.id);
      break;
    case "toggleBookmark":
      await toggle("bookmarks", "post_id", mutation.id);
      break;
    case "upvoteProject":
      await toggle("project_upvotes", "project_id", mutation.id);
      break;
    case "addComment":
      check(
        await client.from("comments").insert({
          post_id: mutation.id,
          author_id: userId,
          content: mutation.content,
        }),
      );
      break;
    case "createProject": {
      const p = mutation.project;
      check(
        await client.from("projects").insert({
          owner_id: userId,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          url: p.url || null,
          category: p.category,
          tags: p.tags,
          cover: p.cover,
          stage: p.stage.toLowerCase(),
        }),
      );
      break;
    }
    case "requestConnection": {
      const result = await client.rpc("request_connection", {
        target: mutation.profileId,
      });
      check(result);
      if (result.data?.status === "declined")
        throw new Error(
          "That request was declined. Try saying hello to another builder.",
        );
      break;
    }
    case "respondConnection":
      check(
        await client.rpc(
          mutation.accept ? "accept_connection" : "decline_connection",
          { request_id: mutation.id },
        ),
      );
      break;
    case "sendMessage":
      check(
        await client.from("messages").insert({
          conversation_id: mutation.id,
          sender_id: userId,
          content: mutation.content,
        }),
      );
      break;
    case "updateProfile": {
      const p = mutation.profile;
      const update = Object.fromEntries(
        Object.entries({
          name: p.name,
          username: p.username,
          role: p.role,
          bio: p.bio,
          location: p.location,
          skills: p.skills,
          looking_for: p.lookingFor,
          availability: p.availability,
          website: p.website === "" ? null : p.website,
          github: p.github === "" ? null : p.github,
          onboarding_completed: true,
        }).filter(([, v]) => v !== undefined),
      );
      check(await client.from("profiles").update(update).eq("id", userId));
      break;
    }
  }
}
