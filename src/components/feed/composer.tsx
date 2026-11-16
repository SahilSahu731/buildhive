"use client";
import { useState } from "react";
import { PiPlus as Plus } from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import type { Post } from "@/lib/types";

export function Composer({
  expanded = false,
  onDone,
}: {
  expanded?: boolean;
  onDone?: () => void;
}) {
  const { me, data, createPost } = useWorkspace();
  const [content, setContent] = useState("");
  const [kind, setKind] = useState<Post["kind"]>("update");
  const [projectId, setProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(expanded);
  const projects = data.projects.filter((p) => p.ownerId === me.id);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || busy) return;
    setBusy(true);
    const ok = await createPost(content, kind, projectId || undefined);
    setBusy(false);
    if (ok) {
      setContent("");
      setKind("update");
      setProjectId("");
      setFocused(expanded);
      onDone?.();
    }
  }
  return (
    <form
      data-ui={`composer ${expanded ? "composer-expanded" : ""}`}
      className="p-5.5 [border-bottom:1px_solid_var(--color-border)] mt-5.5 mx-0 mb-1 border border-border rounded-xl bg-surface [transition:border-color_0.15s,background_0.15s] data-[ui~=composer-expanded]:border-0 data-[ui~=composer-expanded]:p-0 data-[ui~=composer-expanded]:m-0 data-[ui~=composer-expanded]:rounded-none data-[ui~=composer-expanded]:bg-transparent focus-within:border-border-strong max-[760px]:p-4.5 max-[760px]:mt-4.5 max-[760px]:mx-0 max-[760px]:mb-0.75"
      onSubmit={submit}
    >
      <div className="flex items-start gap-3.75 [&_textarea]:flex-1 [&_textarea]:min-w-0 [&_textarea]:border-0 [&_textarea]:resize-none [&_textarea]:[outline:0] [&_textarea]:bg-transparent [&_textarea]:py-2 [&_textarea]:px-0 [&_textarea]:text-ink [&_textarea]:text-[19px] [&_textarea]:leading-[1.6] [&_textarea]:min-h-19 [&_textarea::placeholder]:text-faint max-[760px]:gap-3 max-[760px]:[&_textarea]:text-[18px] max-[760px]:[&_textarea]:min-h-20.5">
        <Avatar profile={me} size={44} />
        <textarea
          aria-label="Write a community update"
          placeholder="What are you building?"
          maxLength={3000}
          value={content}
          onFocus={() => setFocused(true)}
          onChange={(e) => setContent(e.target.value)}
          rows={focused ? 4 : 2}
        />
      </div>
      <div className="flex items-center justify-between gap-3 ml-14.75 mt-3.5 *:data-[ui~=button]:min-w-21 *:data-[ui~=button]:min-h-10 *:data-[ui~=button]:py-2.25 *:data-[ui~=button]:px-3.5 *:data-[ui~=button]:text-[14px] *:data-[ui~=button]:font-semibold max-[760px]:ml-0 max-[760px]:gap-2.25 max-[760px]:*:data-[ui~=button]:min-h-10 max-[760px]:*:data-[ui~=button]:min-w-19 max-[760px]:*:data-[ui~=button]:text-[13px]">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-0 [&_select]:text-[13px] [&_select]:bg-surface-raised [&_select]:border [&_select]:border-border-strong [&_select]:text-text [&_select]:rounded-md [&_select]:max-w-37.5 [&_select]:py-1.75 [&_select]:px-2.25 [&_select]:min-h-9 max-[950px]:[&_select]:max-w-32.5 max-[950px]:[&_select]:text-[12px] max-[950px]:[&_select]:py-1.75 max-[950px]:[&_select]:px-2.25 max-[760px]:gap-2.25 max-[760px]:[&_select]:text-[12px] max-[760px]:[&_select]:max-w-28.75 max-[760px]:[&_select]:py-1.75 max-[760px]:[&_select]:px-2.25 max-[390px]:[&_select]:max-w-25.75 max-[390px]:[&_select]:text-[12px] max-[390px]:[&_select]:py-1.75 max-[390px]:[&_select]:px-2.25 max-[390px]:gap-1.25">
          <select
            aria-label="Post type"
            value={kind}
            onChange={(e) => setKind(e.target.value as Post["kind"])}
          >
            <option value="update">Update</option>
            <option value="launch">Launch</option>
            <option value="looking">Find a cofounder</option>
          </select>
          {focused && projects.length > 0 && (
            <select
              aria-label="Attach a project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Attach project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          data-ui="button button-brand"
          className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-brand text-brand-ink enabled:hover:bg-brand-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
          type="submit"
          disabled={busy || !content.trim()}
        >
          {busy ? "Posting…" : "Post"}
          <Plus size={17} />
        </button>
      </div>
    </form>
  );
}
