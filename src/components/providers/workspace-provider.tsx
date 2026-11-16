"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Check, X } from "@/components/ui/icons";
import { makeDemoData, DEMO_USER_ID } from "@/lib/demo-data";
import { applyDemoMutation } from "@/lib/demo-reducer";
import { mutationSchema, workspaceSchema } from "@/lib/validation";
import { supabaseConfigured } from "@/lib/env";
import type {
  Mutation,
  NewProject,
  Post,
  Profile,
  WorkspaceData,
} from "@/lib/types";

type Workspace = {
  data: WorkspaceData;
  me: Profile;
  demo: boolean;
  loading: boolean;
  error: string | null;
  notify: (message: string) => void;
  refresh: () => Promise<void>;
  resetDemo: () => void;
  createPost: (
    content: string,
    kind?: Post["kind"],
    projectId?: string,
  ) => Promise<boolean>;
  toggleLike: (id: string) => Promise<boolean>;
  toggleBookmark: (id: string) => Promise<boolean>;
  addComment: (id: string, content: string) => Promise<boolean>;
  updatePost: (id: string, content: string) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  createProject: (project: NewProject) => Promise<boolean>;
  updateProject: (id: string, project: NewProject) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  upvoteProject: (id: string) => Promise<boolean>;
  requestConnection: (profileId: string) => Promise<boolean>;
  respondConnection: (id: string, accept: boolean) => Promise<boolean>;
  sendMessage: (id: string, content: string) => Promise<boolean>;
  updateProfile: (profile: Partial<Profile>) => Promise<boolean>;
};
const Context = createContext<Workspace | null>(null);
const STORAGE_KEY = "buildwithme:preview:v1";
const emptyData: WorkspaceData = {
  profiles: [],
  posts: [],
  projects: [],
  connections: [],
  conversations: [],
};

async function request<T>(url: string, body?: Mutation): Promise<T> {
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      result.error || "Could not reach your workspace. Please try again.",
    );
  return result as T;
}

export function WorkspaceProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: WorkspaceData;
}) {
  const [data, setData] = useState<WorkspaceData>(initialData);
  const [meId, setMeId] = useState(DEMO_USER_ID);
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const mutationQueue = useRef<Promise<boolean>>(Promise.resolve(true));
  const initialized = useRef(false);
  const generation = useRef(0);
  const refreshing = useRef(false);
  const writing = useRef(false);
  const notify = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }, []);
  const refresh = useCallback(async () => {
    if (!supabaseConfigured) return;
    if (demo) {
      window.location.reload();
      return;
    }
    if (refreshing.current || writing.current) return;
    refreshing.current = true;
    const currentGeneration = generation.current;
    try {
      const result = await request<{ data: WorkspaceData; meId: string }>(
        "/api/workspace",
      );
      if (generation.current === currentGeneration) {
        setData(result.data);
        setMeId(result.meId);
        setError(null);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Couldn't load your workspace.",
      );
    } finally {
      refreshing.current = false;
    }
  }, [demo]);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        if (supabaseConfigured) {
          const { createClient } = await import("@/lib/supabase/client");
          const { data: auth, error: authError } =
            await createClient().auth.getUser();
          if (!active) return;
          if (auth.user) {
            setDemo(false);
            setMeId(auth.user.id);
            setData(emptyData);
            const result = await request<{ data: WorkspaceData; meId: string }>(
              "/api/workspace",
            );
            if (active) {
              setData(result.data);
              setMeId(result.meId);
            }
            return;
          }
          if (authError && authError.name !== "AuthSessionMissingError")
            throw new Error(
              "Authentication is unavailable. Please refresh to try again.",
            );
        }
        let saved: string | null = null;
        try {
          saved = localStorage.getItem(STORAGE_KEY);
        } catch {
          /* In-memory preview works when browser storage is disabled. */
        }
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const validated = workspaceSchema.safeParse(parsed.data);
            if (
              parsed.version === 1 &&
              validated.success &&
              validated.data.profiles.some((p) => p.id === DEMO_USER_ID)
            )
              setData(validated.data);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          setData(makeDemoData());
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : "Couldn't load your workspace.",
          );
      } finally {
        if (active) {
          initialized.current = true;
          setLoading(false);
        }
      }
    }
    initialize();
    return () => {
      active = false;
      clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (demo && !loading && initialized.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, data }));
      } catch {
        /* Storage can be unavailable in private browser sessions. */
      }
    }
  }, [data, demo, loading]);

  useEffect(() => {
    if (demo || loading) return;
    // Refresh conversations and requests while the tab is visible, without a service-role client.
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [demo, loading, refresh]);

  const mutate = useCallback(
    async (mutation: Mutation) => {
      const parsed = mutationSchema.safeParse(mutation);
      if (!parsed.success) {
        notify(parsed.error.issues[0]?.message || "Please check your input.");
        return false;
      }
      const job = async () => {
        generation.current += 1;
        writing.current = true;
        try {
          if (demo) {
            setData((current) => applyDemoMutation(current, meId, parsed.data));
          } else {
            await request("/api/workspace", parsed.data);
            try {
              const result = await request<{
                data: WorkspaceData;
                meId: string;
              }>("/api/workspace");
              setData(result.data);
              setError(null);
            } catch {
              setError(
                "Your change was saved, but we couldn't reload the workspace. Try refreshing.",
              );
            }
          }
          const messages: Partial<Record<Mutation["action"], string>> = {
            createPost: demo
              ? "Update shared in your preview workspace"
              : "Your update is live!",
            createProject: demo
              ? "Project added to your preview workspace"
              : "Your project is live!",
            requestConnection: demo
              ? "Request saved in this preview. Real connections need sign-in."
              : "Connection request sent",
            respondConnection: "Connection request updated",
            updateProfile: "Your profile is saved",
            updatePost: "Your update is saved",
            deletePost: "Your update was deleted",
            updateProject: "Your project is saved",
            deleteProject: "Your project was deleted",
          };
          if (messages[mutation.action]) notify(messages[mutation.action]!);
          return true;
        } catch (e) {
          notify(
            e instanceof Error
              ? e.message
              : "That didn't save. Please try again.",
          );
          return false;
        } finally {
          writing.current = false;
        }
      };
      // Serialize writes so rapid interactions cannot overwrite each other's refreshed state.
      const next = mutationQueue.current.then(job, job);
      mutationQueue.current = next;
      return await next;
    },
    [demo, meId, notify],
  );

  const me = data.profiles.find((p) => p.id === meId) || {
    id: meId,
    name: "Your workspace",
    username: "builder",
    role: "Builder",
    bio: "",
    location: "",
    avatar: "",
    skills: [],
    lookingFor: [],
    availability: "open" as const,
    website: "",
    github: "",
  };
  const value: Workspace = {
    data,
    me,
    demo,
    loading,
    error,
    notify,
    refresh,
    resetDemo() {
      if (demo) {
        setData(makeDemoData());
        notify("Preview workspace reset");
      }
    },
    createPost: (content, kind = "update", projectId) =>
      mutate({ action: "createPost", content, kind, projectId }),
    toggleLike: (id) => mutate({ action: "toggleLike", id }),
    toggleBookmark: (id) => mutate({ action: "toggleBookmark", id }),
    addComment: (id, content) => mutate({ action: "addComment", id, content }),
    updatePost: (id, content) => mutate({ action: "updatePost", id, content }),
    deletePost: (id) => mutate({ action: "deletePost", id }),
    createProject: (project) => mutate({ action: "createProject", project }),
    updateProject: (id, project) =>
      mutate({ action: "updateProject", id, project }),
    deleteProject: (id) => mutate({ action: "deleteProject", id }),
    upvoteProject: (id) => mutate({ action: "upvoteProject", id }),
    requestConnection: (profileId) => {
      const declined = data.connections.some(
        (c) =>
          c.status === "declined" &&
          [c.senderId, c.recipientId].includes(meId) &&
          [c.senderId, c.recipientId].includes(profileId),
      );
      if (declined) {
        notify(
          "That request was declined. Try saying hello to another builder.",
        );
        return Promise.resolve(false);
      }
      return mutate({ action: "requestConnection", profileId });
    },
    respondConnection: (id, accept) =>
      mutate({ action: "respondConnection", id, accept }),
    sendMessage: (id, content) =>
      mutate({ action: "sendMessage", id, content }),
    updateProfile: (profile) => mutate({ action: "updateProfile", profile }),
  };
  return (
    <Context.Provider value={value}>
      {children}
      <div
        data-ui={`toast ${toast ? "toast-visible" : ""}`}
        className="flex items-center gap-2.5 fixed bottom-7 left-[calc(50%_+_120px)] [transform:translate(-50%,_20px)] opacity-0 pointer-events-none z-1000 bg-surface-raised text-ink border border-border-strong rounded-[10px] py-3.5 px-[15px] max-w-[calc(100vw_-_32px)] text-[14px] [box-shadow:0_10px_40px_var(--color-shadow-color)] [transition:opacity_0.2s,_transform_0.2s] [&[data-ui~=toast-visible]]:opacity-100 [&[data-ui~=toast-visible]]:pointer-events-auto [&[data-ui~=toast-visible]]:[transform:translate(-50%,_0)] [&_>_button]:flex [&_>_button]:items-center [&_>_button]:bg-transparent [&_>_button]:text-muted [&_>_button]:p-1 max-[760px]:left-[50%] max-[760px]:bottom-[85px] max-[760px]:text-[13px] max-[760px]:w-max max-[760px]:max-w-[calc(100vw_-_30px)]"
        role="status"
        aria-live="polite"
      >
        <Check size={17} />
        <span>{toast}</span>
        <button aria-label="Dismiss notification" onClick={() => setToast("")}>
          <X size={16} />
        </button>
      </div>
    </Context.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(Context);
  if (!context)
    throw new Error("useWorkspace must be inside WorkspaceProvider");
  return context;
}
