"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookmarkFill,
  ChevronDown,
  ChevronRight,
  Heart,
  HeartFill,
  MessageCircle,
  MoreHorizontal,
  Rocket,
  Send,
  Share2,
  Users,
} from "@/components/ui/icons";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import { ProfilePreview } from "@/components/ui/profile-preview";
import { Modal } from "@/components/ui/modal";
import { Composer } from "./composer";
import { relativeTime } from "@/lib/utils";
import type { Post, Profile } from "@/lib/types";

export function Feed({ bookmarks = false }: { bookmarks?: boolean }) {
  const { data, me } = useWorkspace();
  const [tab, setTab] = useState("For you");
  const [sort, setSort] = useState("recent");
  const [profile, setProfile] = useState<Profile>();
  const followed = data.connections
    .filter(
      (c) =>
        c.status === "accepted" && [c.senderId, c.recipientId].includes(me.id),
    )
    .flatMap((c) => [c.senderId, c.recipientId]);
  const posts = data.posts
    .filter(
      (p) =>
        (!bookmarks || p.bookmarked) &&
        (tab !== "Launches" || p.kind === "launch") &&
        (tab !== "Following" ||
          p.authorId === me.id ||
          followed.includes(p.authorId)),
    )
    .sort((a, b) =>
      sort === "popular"
        ? b.likes - a.likes
        : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  return (
    <div className="max-w-180 my-0 mx-auto min-[1600px]:max-w-190 max-[760px]:[&_[data-ui~=feed-toolbar]]:mt-[-11px] animate-[content-reveal_0.4s_cubic-bezier(0.22,_1,_0.36,_1)_both] motion-reduce:animate-none">
      <section
        className="min-w-0"
        aria-label={bookmarks ? "Saved posts" : "Community feed"}
      >
        {bookmarks && (
          <div
            data-ui="page-header"
            className="flex items-start justify-between gap-5.5 mb-7 [&_h1]:text-[31px] [&_h1]:font-medium [&_h1]:leading-[1.3] [&_h1]:tracking-[-1.15px] [&_h1]:mt-0 [&_h1]:mx-0 [&_h1]:mb-[9px] [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:text-muted [&_p]:m-0 [&_p]:max-w-135 max-[760px]:gap-[15px] max-[760px]:mb-6 max-[760px]:[&_h1]:text-[27px] max-[760px]:[&_h1]:tracking-[-1px] max-[760px]:[&_p]:text-[14px] max-[760px]:[&_>_[data-ui~=button]]:text-[12px] max-[760px]:[&_>_[data-ui~=button]]:py-2.5 max-[760px]:[&_>_[data-ui~=button]]:px-3 max-[760px]:[&_>_[data-ui~=button]]:min-h-10.5"
          >
            <div>
              <h1>Saved posts</h1>
              <p>Posts you want to keep.</p>
            </div>
          </div>
        )}
        <div
          data-ui="feed-toolbar"
          className="flex justify-between items-center [border-bottom:1px_solid_var(--color-border)] min-h-13.5"
        >
          <div
            className='flex self-stretch gap-7.5 [&_button]:relative [&_button]:flex [&_button]:items-center [&_button]:pt-3 [&_button]:px-0 [&_button]:pb-[17px] [&_button]:text-[16px] [&_button]:text-muted [&_button]:bg-transparent [&_button[data-ui~=active]]:text-ink [&_button[data-ui~=active]]:font-medium [&_button[data-ui~=active]:after]:[content:""] [&_button[data-ui~=active]:after]:absolute [&_button[data-ui~=active]:after]:bottom-[-1px] [&_button[data-ui~=active]:after]:left-0 [&_button[data-ui~=active]:after]:right-0 [&_button[data-ui~=active]:after]:h-[3px] [&_button[data-ui~=active]:after]:rounded-[3px] [&_button[data-ui~=active]:after]:bg-brand max-[760px]:gap-[27px] max-[760px]:[&_button]:text-[14px] max-[760px]:[&_button]:pb-[15px]'
            role="tablist"
            aria-label="Feed filter"
          >
            {(bookmarks ? ["Saved"] : ["For you", "Following", "Launches"]).map(
              (t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={bookmarks || tab === t}
                  data-ui={bookmarks || tab === t ? "active" : ""}
                  className=""
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          <label className="flex items-center gap-1 text-muted pb-1 [&_select]:[appearance:none] [&_select]:max-w-22.5 [&_select]:border-0 [&_select]:bg-transparent [&_select]:text-muted [&_select]:text-[13px] [&_select]:py-[9px] [&_select]:px-[3px] [&_select]:outline-offset-0 max-[760px]:[&_select]:text-[12px]">
            <span className="absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,_0,_0,_0)] whitespace-nowrap border-0">
              Sort posts
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Latest</option>
              <option value="popular">Popular</option>
            </select>
            <ChevronDown size={16} />
          </label>
        </div>
        {!bookmarks && <Composer />}
        <div className="grid gap-0">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onProfile={setProfile} />
          ))}
          {!posts.length && (
            <div className="flex flex-col items-center text-center py-[55px] px-7 text-muted [&_h3]:text-ink [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:mt-[17px] [&_h3]:mx-0 [&_h3]:mb-[9px] [&_h2]:text-ink [&_h2]:text-[21px] [&_h2]:font-medium [&_h2]:mt-[17px] [&_h2]:mx-0 [&_h2]:mb-[9px] [&_p]:text-muted [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:max-w-90 [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-5.5 [&[data-ui~=compact]]:py-[25px] [&[data-ui~=compact]]:px-2.5">
              <Bookmark size={30} />
              <h3>{bookmarks ? "Nothing saved yet." : "No posts here yet."}</h3>
              <p>
                {bookmarks
                  ? "Save a post to find it here later."
                  : "Connect with builders to see what they're sharing."}
              </p>
              <Link
                href={bookmarks ? "/" : "/cofounders"}
                data-ui="button button-secondary"
                className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-surface border-border-strong text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
              >
                {bookmarks ? "Browse the feed" : "Find builders"}
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>
      <ProfilePreview profile={profile} onClose={() => setProfile(undefined)} />
    </div>
  );
}

function PostCard({
  post,
  onProfile,
}: {
  post: Post;
  onProfile: (p: Profile) => void;
}) {
  const {
    data,
    me,
    toggleLike,
    toggleBookmark,
    addComment,
    updatePost,
    deletePost,
    notify,
  } = useWorkspace();
  const [comments, setComments] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [deleting, setDeleting] = useState(false);
  const author = data.profiles.find((p) => p.id === post.authorId);
  const project = data.projects.find((p) => p.id === post.projectId);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    const ok = await addComment(post.id, comment);
    if (ok) setComment("");
    setBusy(false);
  }
  async function share() {
    const url = `${window.location.origin}/#post-${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      notify("Link copied.");
    } catch {
      notify("You can share this post using the URL in your browser.");
    }
  }
  return (
    <article
      className="bg-transparent border-0 rounded-none [border-bottom:1px_solid_var(--color-border)] pt-7 px-0 pb-0 [scroll-margin-top:90px] animate-[content-reveal_0.4s_ease-out_both] max-[760px]:pt-5.5 [&:nth-child(2)]:[animation-delay:35ms] [&:nth-child(3)]:[animation-delay:70ms] motion-reduce:animate-none"
      id={`post-${post.id}`}
    >
      <div className="flex items-center gap-[11px] mb-[15px] max-[760px]:gap-2.5 max-[760px]:mb-3.5">
        <button
          className="flex p-0 bg-transparent rounded-full"
          aria-label={`View ${author?.name || "builder"}'s profile`}
          onClick={() => author && onProfile(author)}
        >
          <Avatar profile={author} size={42} />
        </button>
        <div className="flex-1 min-w-0 [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[7px] [&_>_div]:flex-wrap [&_>_div_>_button]:text-[16px] [&_>_div_>_button]:font-semibold [&_>_div_>_button]:text-ink [&_>_div_>_button]:p-0 [&_>_div_>_button]:bg-transparent [&_>_div_>_button:hover]:underline [&_>_span]:block [&_>_span]:text-muted [&_>_span]:text-[13px] [&_>_span]:mt-[3px] max-[760px]:[&_>_div_>_button]:text-[15px] max-[760px]:[&_>_span]:text-[12px] max-[390px]:[&_>_div]:gap-[5px] max-[390px]:[&_>_div_>_button]:text-[15px]">
          <div>
            <button onClick={() => author && onProfile(author)}>
              {author?.name || "Builder"}
            </button>
            <span className="text-[13px] text-muted whitespace-nowrap max-[1200px]:hidden">
              @{author?.username || "builder"}
            </span>
            <span
              className="text-[13px] text-muted whitespace-nowrap max-[760px]:text-[12px]"
              suppressHydrationWarning
            >
              · {relativeTime(post.createdAt)}
            </span>
          </div>
          <span>{author?.role || "Builder"}</span>
        </div>
        {post.kind === "launch" ? (
          <span className="flex items-center gap-[5px] text-muted text-[12px] whitespace-nowrap [&_>_svg]:w-3.5 [&_>_svg]:h-3.5 max-[760px]:text-[11px] max-[760px]:whitespace-normal max-[760px]:max-w-[95px] max-[760px]:leading-[1.5] max-[760px]:[&_>_svg]:hidden">
            <Rocket size={11} /> Launched
          </span>
        ) : post.kind === "looking" ? (
          <span className="flex items-center gap-[5px] text-muted text-[12px] whitespace-nowrap [&_>_svg]:w-3.5 [&_>_svg]:h-3.5 max-[760px]:text-[11px] max-[760px]:whitespace-normal max-[760px]:max-w-[95px] max-[760px]:leading-[1.5] max-[760px]:[&_>_svg]:hidden">
            <Users size={11} /> Looking for a cofounder
          </span>
        ) : null}
        {post.authorId === me.id && (
          <button
            data-ui="icon-button"
            className="inline-flex items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:w-10 max-[760px]:h-10"
            aria-label="Manage your update"
            onClick={() => {
              setDraft(post.content);
              setDeleting(false);
              setEditing(true);
            }}
          >
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>
      <div className="text-[17px] leading-[1.8] text-text [overflow-wrap:anywhere] [white-space:pre-line] [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[15px] [&_p:last-child]:mb-5 max-[760px]:text-[17px] max-[760px]:leading-[1.75]">
        {post.content.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {project && (
        <Link
          href={`/explore?project=${project.id}`}
          className="block border border-border rounded-[10px] mt-[17px] mx-0 mb-5 overflow-hidden bg-surface hover:bg-surface-raised hover:border-border-strong"
        >
          <div className="flex items-center gap-[13px] p-[17px] [&_>_span:nth-child(2)]:flex-1 [&_>_span:nth-child(2)]:min-w-0 [&_strong]:font-medium [&_strong]:text-[16px] [&_strong]:flex [&_strong]:items-center [&_strong]:gap-[5px] [&_strong_>_svg]:text-muted [&_small]:block [&_small]:text-[13px] [&_small]:text-muted [&_small]:leading-[1.6] [&_small]:mt-1 max-[760px]:p-3.5 max-[760px]:gap-2.5 max-[760px]:[&_strong]:text-[15px] max-[760px]:[&_small]:text-[12px]">
            <span
              data-ui={`project-monogram ${project.cover}`}
              className="grid place-items-center w-10.5 h-10.5 rounded-lg bg-surface-hover text-ink font-medium text-[22px] shrink-0"
            >
              {project.name[0]}
            </span>
            <span>
              <strong>
                {project.name} <ChevronRight size={13} />
              </strong>
              <small>{project.tagline}</small>
            </span>
            <span className="text-[11px] text-muted bg-surface py-[5px] px-2 rounded-sm whitespace-nowrap max-[760px]:hidden">
              {project.tags[0]}
            </span>
          </div>
        </Link>
      )}
      <div className="flex items-center gap-[29px] pt-0 px-0 pb-[19px] [&_>_button]:flex [&_>_button]:items-center [&_>_button]:gap-[7px] [&_>_button]:bg-transparent [&_>_button]:text-muted [&_>_button]:min-h-11 [&_>_button]:py-[7px] [&_>_button]:px-0 [&_>_button]:text-[13px] [&_>_button_>_svg]:w-5 [&_>_button_>_svg]:h-5 [&_>_button:hover]:text-brand-text [&_>_button[data-ui~=active]]:text-brand-text [&_>_button[data-ui~=liked]]:text-brand-text [&_>_button[data-ui~=bookmarked]]:text-brand-text [&_[data-ui~=action-label]]:text-[12px] [&_[data-ui~=post-bookmark]]:ml-auto [&_[data-ui~=post-bookmark]]:min-w-[35px] [&_[data-ui~=post-bookmark]]:justify-end max-[760px]:gap-[25px] max-[760px]:pb-4 max-[760px]:[&_[data-ui~=action-label]]:hidden max-[390px]:gap-[23px]">
        <button
          data-ui={post.liked ? "liked" : ""}
          className=""
          aria-label={`${post.liked ? "Unlike" : "Like"} post, ${post.likes} likes`}
          aria-pressed={post.liked}
          onClick={() => void toggleLike(post.id)}
        >
          {post.liked ? <HeartFill size={18} /> : <Heart size={18} />}
          <span>{post.likes}</span>
        </button>
        <button
          data-ui={comments ? "active" : ""}
          className=""
          onClick={() => setComments(!comments)}
          aria-expanded={comments}
        >
          <MessageCircle size={18} />
          <span>{post.comments.length}</span>
          <span data-ui="action-label" className="">
            Comments
          </span>
        </button>
        <button onClick={share} aria-label="Copy link to post">
          <Share2 size={17} />
          <span data-ui="action-label" className="">
            Share
          </span>
        </button>
        <button
          data-ui={`post-bookmark ${post.bookmarked ? "bookmarked" : ""}`}
          className=""
          aria-label={post.bookmarked ? "Remove bookmark" : "Bookmark post"}
          aria-pressed={post.bookmarked}
          onClick={() => void toggleBookmark(post.id)}
        >
          {post.bookmarked ? (
            <BookmarkFill size={18} />
          ) : (
            <Bookmark size={18} />
          )}
        </button>
      </div>
      <Modal
        open={editing}
        onClose={() => !busy && setEditing(false)}
        title={deleting ? "Delete this update?" : "Edit post"}
        description={
          deleting
            ? "The update and its comments will be removed. This cannot be undone."
            : "Update your post."
        }
      >
        {deleting ? (
          <div className="flex items-center justify-end gap-3 pt-2.5">
            <button
              data-ui="button button-secondary"
              className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-surface border-border-strong text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
              disabled={busy}
              onClick={() => setDeleting(false)}
            >
              Keep it
            </button>
            <button
              data-ui="button button-danger"
              className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-danger-bg text-danger-text border-danger-hover enabled:hover:bg-danger-hover enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const ok = await deletePost(post.id);
                setBusy(false);
                if (ok) setEditing(false);
              }}
            >
              {busy ? "Deleting…" : "Delete update"}
            </button>
          </div>
        ) : (
          <form
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const ok = await updatePost(post.id, draft);
              setBusy(false);
              if (ok) setEditing(false);
            }}
          >
            <textarea
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
              aria-label="Edit your update"
              rows={6}
              maxLength={3000}
              required
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="flex items-center justify-end gap-3 pt-2.5">
              <button
                data-ui="button button-ghost"
                className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-transparent text-muted enabled:hover:bg-surface enabled:hover:text-ink enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
                type="button"
                onClick={() => setDeleting(true)}
              >
                Delete update
              </button>
              <button
                data-ui="button button-primary"
                className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
                disabled={busy || !draft.trim()}
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
      {comments && (
        <div className="pt-4.5 px-0 pb-5.5 [border-top:1px_solid_var(--color-border)]">
          {post.comments.map((c) => {
            const p = data.profiles.find((p) => p.id === c.authorId);
            return (
              <div
                className="flex gap-2.5 mb-4.5 [&_>_div]:flex-1 [&_>_div]:min-w-0 [&_strong]:text-[14px] [&_strong]:font-medium [&_small]:text-[11px] [&_small]:text-muted [&_small]:ml-2.5 [&_small]:font-normal [&_p]:text-[15px] [&_p]:text-text [&_p]:leading-[1.7] [&_p]:mt-[5px] [&_p]:mx-0 [&_p]:mb-0 [&_p]:[overflow-wrap:anywhere]"
                key={c.id}
              >
                <Avatar profile={p} size={30} />
                <div>
                  <strong>
                    {p?.name || "Builder"}
                    <small suppressHydrationWarning>
                      {relativeTime(c.createdAt)}
                    </small>
                  </strong>
                  <p>{c.content}</p>
                </div>
              </div>
            );
          })}
          <form
            className="flex items-center gap-2.5 [&_[data-ui~=input]]:text-[14px] [&_[data-ui~=input]]:min-h-10.5 [&_[data-ui~=icon-button]]:shrink-0 [&_[data-ui~=input]:focus]:border-focus max-[760px]:[&_[data-ui~=input]]:text-[14px]"
            onSubmit={submit}
          >
            <Avatar profile={me} size={30} />
            <input
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
              value={comment}
              maxLength={1200}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment…"
              aria-label="Write a comment"
            />
            <button
              data-ui="icon-button"
              className="inline-flex items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:w-10 max-[760px]:h-10"
              aria-label="Send comment"
              disabled={busy || !comment.trim()}
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
