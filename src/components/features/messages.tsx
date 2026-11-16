"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PiArrowLeft as ArrowLeft,
  PiArrowRight as ArrowRight,
  PiChatCircle as MessageCircle,
  PiMagnifyingGlass as Search,
  PiPaperPlaneTilt as Send,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/utils";
export function Messages() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedConversation = searchParams.get("conversation");
  const { data, me, sendMessage } = useWorkspace();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [mobile, setMobile] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const conversations = data.conversations
    .filter((c) => c.memberIds.includes(me.id))
    .sort((a, b) =>
      (b.messages.at(-1)?.createdAt || "").localeCompare(
        a.messages.at(-1)?.createdAt || "",
      ),
    );
  const selected =
    conversations.find((c) => c.id === requestedConversation) ||
    conversations[0];
  const peer = data.profiles.find(
    (p) => p.id === selected?.memberIds.find((id) => id !== me.id),
  );
  useEffect(() => {
    if (requestedConversation) {
      setMobile(true);
      setDraft("");
    }
  }, [requestedConversation]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [selected?.id, selected?.messages.length]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    const ok = await sendMessage(selected.id, draft);
    if (ok) setDraft("");
    setSending(false);
  }
  return (
    <div className="animate-[content-reveal_0.4s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none max-w-240 my-0 mx-auto max-[760px]:**:data-[ui~=page-header]:mb-5">
      <div
        data-ui="page-header"
        className="flex items-start justify-between gap-5.5 mb-7 [&_h1]:text-[31px] [&_h1]:font-medium [&_h1]:leading-[1.3] [&_h1]:tracking-[-1.15px] [&_h1]:mt-0 [&_h1]:mx-0 [&_h1]:mb-2.25 [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:text-muted [&_p]:m-0 [&_p]:max-w-135 max-[760px]:gap-3.75 max-[760px]:mb-6 max-[760px]:[&_h1]:text-[27px] max-[760px]:[&_h1]:tracking-[-1px] max-[760px]:[&_p]:text-[14px] max-[760px]:*:data-[ui~=button]:text-[12px] max-[760px]:*:data-[ui~=button]:py-2.5 max-[760px]:*:data-[ui~=button]:px-3 max-[760px]:*:data-[ui~=button]:min-h-10.5"
      >
        <div>
          <h1>Messages</h1>
        </div>
        <Link
          href="/cofounders"
          data-ui="button button-secondary"
          className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
        >
          Meet builders
          <ArrowRight size={15} />
        </Link>
      </div>
      <div
        data-ui={`messages-shell ${mobile ? "show-conversation" : ""}`}
        className="grid grid-cols-[290px_minmax(0,1fr)] border border-border rounded-xl h-[calc(100svh-225px)] min-h-120 max-h-197.5 overflow-hidden bg-canvas max-[1200px]:grid-cols-[250px_minmax(0,1fr)] max-[1000px]:grid-cols-[210px_minmax(0,1fr)] max-[760px]:block max-[760px]:relative max-[760px]:h-[calc(100svh-220px)] max-[760px]:min-h-110 max-[760px]:rounded-[9px] max-[760px]:[&[data-ui~=show-conversation]_[data-ui~=conversation-sidebar]]:hidden max-[760px]:[&[data-ui~=show-conversation]_[data-ui~=conversation-main]]:flex max-[760px]:[&[data-ui~=show-conversation]_[data-ui~=conversation-main]]:h-full"
      >
        <aside
          data-ui="conversation-sidebar"
          className="[border-right:1px_solid_var(--color-border)] flex flex-col min-h-0 bg-surface max-[760px]:h-full max-[760px]:[border-right:0]"
        >
          <div className="flex justify-between items-center pt-5.75 px-5 pb-4.75 [&_h2]:text-[16px] [&_h2]:tracking-[-0.3px] [&_h2]:font-medium [&_h2]:m-0 max-[760px]:p-5">
            <h2>Messages</h2>
            <span className="inline-flex items-center justify-center min-w-5.5 h-5.5 rounded-[5px] bg-surface-hover text-muted text-[11px]">
              {conversations.length}
            </span>
          </div>
          <label className="flex items-center gap-2.75 flex-[0_0_auto] min-w-0 py-0 px-2.5 min-h-10 bg-surface border border-border-strong rounded-lg text-muted [&_input]:w-full [&_input]:min-w-0 [&_input]:py-2.75 [&_input]:px-0 [&_input]:bg-transparent [&_input]:border-0 [&_input]:[outline:0] [&_input]:text-ink [&_input]:text-[12px] [&_input:focus]:[outline:0] focus-within:[outline:2px_solid_var(--color-focus)] focus-within:outline-offset-2 [&_input::placeholder]:text-faint mt-0 mx-4 mb-3.5 max-[760px]:min-h-11 max-[760px]:basis-50 max-[760px]:mx-4.5">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
          </label>
          <div className="overflow-y-auto min-h-0">
            {conversations
              .filter((c) => {
                const p = data.profiles.find(
                  (p) => p.id === c.memberIds.find((id) => id !== me.id),
                );
                return `${p?.name} ${c.messages.map((m) => m.content).join(" ")}`
                  .toLowerCase()
                  .includes(query.toLowerCase());
              })
              .map((c) => {
                const p = data.profiles.find(
                  (p) => p.id === c.memberIds.find((id) => id !== me.id),
                );
                const last = c.messages.at(-1);
                return (
                  <button
                    data-ui={`conversation-item ${selected?.id === c.id ? "selected" : ""}`}
                    className="flex items-center gap-2.75 bg-transparent text-left w-full py-4.5 px-4.25 [border-left:2px_solid_transparent] hover:bg-surface-hover data-[ui~=selected]:bg-surface-hover data-[ui~=selected]:border-l-brand [&_>_span:nth-child(2)]:flex-1 [&_>_span:nth-child(2)]:min-w-0 [&_strong]:flex [&_strong]:items-center [&_strong]:justify-between [&_strong]:gap-1.25 [&_strong]:text-[14px] [&_strong]:font-medium [&_strong]:whitespace-nowrap [&_strong_small]:text-[11px] [&_strong_small]:text-muted [&_strong_small]:font-normal [&_p]:overflow-hidden [&_p]:text-ellipsis [&_p]:whitespace-nowrap [&_p]:text-muted [&_p]:text-[13px] [&_p]:leading-[1.6] [&_p]:mt-1.25 [&_p]:mx-0 [&_p]:mb-0 max-[1200px]:py-4.25 max-[1200px]:px-3 max-[1200px]:gap-2.25 max-[1200px]:[&_strong]:text-[14px] max-[1200px]:[&_strong_small]:text-[11px] max-[1000px]:[&_strong]:flex-wrap max-[1000px]:[&_strong]:text-[14px] max-[760px]:py-4.5 max-[760px]:px-5 max-[760px]:gap-3 max-[760px]:[&_strong]:text-[14px] max-[760px]:[&_strong]:flex-nowrap max-[760px]:[&_strong_small]:text-[11px] max-[760px]:[&_p]:text-[13px]"
                    key={c.id}
                    onClick={() => {
                      router.replace(
                        `/messages?conversation=${encodeURIComponent(c.id)}`,
                        { scroll: false },
                      );
                      setDraft("");
                      setMobile(true);
                    }}
                  >
                    <Avatar profile={p} size={43} />
                    <span>
                      <strong>
                        {p?.name || "Builder"}
                        <small>
                          {last ? relativeTime(last.createdAt) : ""}
                        </small>
                      </strong>
                      <p>
                        {last
                          ? `${last.senderId === me.id ? "You: " : ""}${last.content}`
                          : "Say hello and start building."}
                      </p>
                    </span>
                  </button>
                );
              })}
            {!conversations.length && (
              <div className="text-muted py-5 px-0 text-center [&_p]:text-[13px] [&_p]:mt-1.25 [&_p]:mx-0 [&_p]:mb-0 [&_p]:leading-[1.7]">
                <MessageCircle size={27} />
                <p>Your conversations will appear here.</p>
              </div>
            )}
          </div>
        </aside>
        {selected ? (
          <section
            data-ui="conversation-main"
            className="flex flex-col min-w-0 min-h-0 max-[760px]:hidden"
            aria-label={`Conversation with ${peer?.name}`}
          >
            <header className="flex items-center gap-2.75 min-h-20.5 py-4.5 px-6.25 [border-bottom:1px_solid_var(--color-border)] [&_>_div]:flex-1 [&_>_div]:min-w-0 [&_h2]:text-[15px] [&_h2]:tracking-[-0.3px] [&_h2]:font-medium [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-0.75 [&_p]:text-[12px] [&_p]:text-muted [&_p]:m-0 [&_p]:whitespace-nowrap [&_p]:overflow-hidden [&_p]:text-ellipsis max-[1000px]:p-4.25 max-[760px]:min-h-19 max-[760px]:py-3.5 max-[760px]:px-4.5 max-[760px]:gap-2.5 max-[760px]:[&_h2]:text-[14px] max-[760px]:[&_p]:text-[11px]">
              <button
                data-ui="icon-button conversation-back"
                className="hidden items-center justify-center w-10.5 h-10.5 p-2 rounded-lg bg-transparent text-muted hover:bg-surface-hover hover:text-ink max-[760px]:w-10 max-[760px]:h-10 max-[760px]:flex max-[760px]:-ml-1.5"
                onClick={() => setMobile(false)}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={19} />
              </button>
              <Avatar profile={peer} size={40} />
              <div>
                <h2>{peer?.name || "Builder"}</h2>
                <p>{peer?.role || "Builder"}</p>
              </div>
            </header>
            <div
              className="flex-1 min-h-0 overflow-y-auto p-6 max-[1000px]:p-4.25 max-[760px]:py-5 max-[760px]:px-4"
              role="log"
              aria-live="polite"
              aria-label="Messages"
            >
              {!selected.messages.length && (
                <div className="py-6.5 px-2.5 text-muted text-center text-[14px] [&_p]:m-0">
                  <p>
                    Say hello to{" "}
                    {peer?.name.split(" ")[0] || "your new connection"}.
                  </p>
                </div>
              )}
              {selected.messages.map((m, i) => (
                <div key={m.id}>
                  {(i === 0 ||
                    new Date(m.createdAt).toDateString() !==
                      new Date(
                        selected.messages[i - 1].createdAt,
                      ).toDateString()) && (
                    <div className="flex items-center justify-center mt-3 mx-0 mb-6 text-[11px] text-muted">
                      <span>
                        {new Date(m.createdAt).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <div
                    data-ui={`message-row ${m.senderId === me.id ? "mine" : ""}`}
                    className="flex items-end gap-2.25 mt-0 mx-0 mb-4.25 data-[ui~=mine]:justify-end [&[data-ui~=mine]_[data-ui~=message-bubble]]:bg-surface-active [&[data-ui~=mine]_[data-ui~=message-bubble]]:text-ink [&[data-ui~=mine]_[data-ui~=message-bubble]]:border-border-strong [&[data-ui~=mine]_[data-ui~=message-bubble]]:rounded-[10px_10px_2px_10px] [&[data-ui~=mine]_[data-ui~=message-stack]_time]:text-right"
                  >
                    {m.senderId !== me.id && (
                      <Avatar profile={peer} size={27} />
                    )}
                    <div
                      data-ui="message-stack"
                      className="max-w-[85%] min-w-0 [&_time]:block [&_time]:mt-1.25 [&_time]:text-muted [&_time]:text-[11px] max-[1000px]:max-w-[90%]"
                    >
                      <div
                        data-ui="message-bubble"
                        className="py-3 px-3.75 border border-border rounded-[10px_10px_10px_2px] bg-surface-raised text-text text-[15px] leading-[1.75] whitespace-pre-wrap wrap-anywhere max-[1200px]:text-[15px] max-[760px]:text-[15px]"
                      >
                        {m.content}
                      </div>
                      <time suppressHydrationWarning>
                        {new Date(m.createdAt).toLocaleTimeString("en", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottom} />
            </div>
            <form
              className="pt-4.25 px-5.5 pb-3.25 [border-top:1px_solid_var(--color-border)] [&_>_div]:flex [&_>_div]:items-end [&_>_div]:gap-3 [&_>_div]:bg-surface [&_>_div]:border [&_>_div]:border-border-strong [&_>_div]:rounded-[9px] [&_>_div]:py-2.25 [&_>_div]:pr-2.5 [&_>_div]:pl-3.25 [&_textarea]:flex-1 [&_textarea]:min-w-0 [&_textarea]:resize-y [&_textarea]:border-0 [&_textarea]:[outline:0] [&_textarea]:bg-transparent [&_textarea]:text-[16px] [&_textarea]:leading-[1.7] [&_textarea]:max-h-27.5 [&_textarea]:min-h-8.5 [&_textarea]:py-1.25 [&_textarea]:px-0 [&_textarea]:text-ink [&_textarea:focus]:[outline:0] [&_button]:w-10 [&_button]:h-10 [&_button]:grid [&_button]:place-items-center [&_button]:bg-brand [&_button]:text-brand-ink [&_button]:rounded-md [&_button]:shrink-0 [&_>_p]:flex [&_>_p]:justify-between [&_>_p]:gap-2 [&_>_p]:text-muted [&_>_p]:text-[11px] [&_>_p]:mt-2 [&_>_p]:mx-0 [&_>_p]:mb-0 [&_>_div:focus-within]:border-focus max-[1000px]:p-3.25 max-[1000px]:[&_>_p_span:first-child]:hidden max-[760px]:p-3.5"
              onSubmit={submit}
            >
              <div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={4000}
                  rows={1}
                  aria-label="Message"
                  placeholder={`Message ${peer?.name.split(" ")[0] || "your connection"}…`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              </div>
              <p>
                <span>Enter to send · Shift + Enter for a new line</span>
                <span>{draft.length}/4000</span>
              </p>
            </form>
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center p-8.75 text-center text-muted [&_h2]:text-[23px] [&_h2]:font-medium [&_h2]:leading-[1.4] [&_h2]:text-text [&_h2]:mt-5 [&_h2]:mx-0 [&_h2]:mb-3 [&_p]:text-[14px] [&_p]:leading-[1.8] [&_p]:max-w-75 [&_p]:mb-6 max-[760px]:hidden">
            <MessageCircle size={35} />
            <h2>Start a conversation</h2>
            <p>Connect with another builder to send a message.</p>
            <Link
              href="/cofounders"
              data-ui="button button-primary"
              className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
            >
              Discover builders
              <ArrowRight size={15} />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
