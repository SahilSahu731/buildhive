export type Profile = {
  id: string;
  name: string;
  username: string;
  role: string;
  bio: string;
  location: string;
  avatar: string;
  skills: string[];
  lookingFor: string[];
  availability: "open" | "busy";
  website: string;
  github: string;
};
export type Project = {
  id: string;
  ownerId: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  cover: "violet" | "mint" | "peach" | "blue";
  stage: string;
  upvotes: number;
  upvoted: boolean;
};
export type Comment = {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
};
export type Post = {
  id: string;
  authorId: string;
  content: string;
  kind: "update" | "launch" | "looking";
  projectId?: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  comments: Comment[];
};
export type Connection = {
  id: string;
  senderId: string;
  recipientId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt?: string;
};
export type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
};
export type Conversation = {
  id: string;
  memberIds: string[];
  messages: Message[];
};
export type WorkspaceData = {
  profiles: Profile[];
  projects: Project[];
  posts: Post[];
  connections: Connection[];
  conversations: Conversation[];
  reactions?: {
    kind: "like" | "upvote";
    targetId: string;
    actorId: string;
    createdAt: string;
  }[];
};
export type NewProject = Omit<
  Project,
  "id" | "ownerId" | "upvotes" | "upvoted"
>;
export type Mutation =
  | {
      action: "createPost";
      content: string;
      kind: Post["kind"];
      projectId?: string;
    }
  | { action: "toggleLike" | "toggleBookmark" | "upvoteProject"; id: string }
  | { action: "addComment"; id: string; content: string }
  | { action: "updatePost"; id: string; content: string }
  | { action: "deletePost" | "deleteProject"; id: string }
  | { action: "createProject"; project: NewProject }
  | { action: "updateProject"; id: string; project: NewProject }
  | { action: "requestConnection"; profileId: string }
  | { action: "respondConnection"; id: string; accept: boolean }
  | { action: "sendMessage"; id: string; content: string }
  | { action: "updateProfile"; profile: Partial<Profile> };
