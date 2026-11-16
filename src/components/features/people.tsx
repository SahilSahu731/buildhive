"use client";
import { useState } from "react";
import Link from "next/link";
import {
  PiCheck as Check,
  PiHandshake as HeartHandshake,
  PiMapPin as MapPin,
  PiMagnifyingGlass as Search,
  PiX as X,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";

export function People() {
  const { data, me, requestConnection, respondConnection } = useWorkspace();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("Everyone");
  const [openOnly, setOpenOnly] = useState(true);
  const [passed, setPassed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const roleWords: Record<string, string[]> = {
    Engineering: ["engineer", "developer", "react", "python"],
    Design: ["design", "figma"],
    Product: ["founder", "product", "indie"],
    Marketing: ["marketing", "growth", "writing"],
  };
  const candidates = data.profiles.filter((p) => {
    const text =
      `${p.name} ${p.role} ${p.bio} ${p.skills.join(" ")}`.toLowerCase();
    return (
      p.id !== me.id &&
      !passed.includes(p.id) &&
      (!openOnly || p.availability === "open") &&
      text.includes(query.toLowerCase()) &&
      (role === "Everyone" || roleWords[role].some((w) => text.includes(w)))
    );
  });
  const p = candidates[0];
  const connection = data.connections.find(
    (c) =>
      c.status !== "declined" &&
      [c.senderId, c.recipientId].includes(me.id) &&
      [c.senderId, c.recipientId].includes(p?.id || ""),
  );
  const incoming = data.connections.filter(
    (c) => c.recipientId === me.id && c.status === "pending",
  );
  const outgoing = data.connections.filter(
    (c) => c.senderId === me.id && c.status === "pending",
  );
  async function connect() {
    if (!p || busy) return;
    setBusy(true);
    await requestConnection(p.id);
    setBusy(false);
  }
  return (
    <div className="animate-[content-reveal_0.4s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none max-w-240 my-0 mx-auto">
      <div
        data-ui="page-header"
        className="flex items-start justify-between gap-5.5 mb-7 [&_h1]:text-[31px] [&_h1]:font-medium [&_h1]:leading-[1.3] [&_h1]:tracking-[-1.15px] [&_h1]:mt-0 [&_h1]:mx-0 [&_h1]:mb-2.25 [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:text-muted [&_p]:m-0 [&_p]:max-w-135 max-[760px]:gap-3.75 max-[760px]:mb-6 max-[760px]:[&_h1]:text-[27px] max-[760px]:[&_h1]:tracking-[-1px] max-[760px]:[&_p]:text-[14px] max-[760px]:*:data-[ui~=button]:text-[12px] max-[760px]:*:data-[ui~=button]:py-2.5 max-[760px]:*:data-[ui~=button]:px-3 max-[760px]:*:data-[ui~=button]:min-h-10.5"
      >
        <div>
          <h1>Find a cofounder</h1>
          <p>Meet people you want to build with.</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-5 max-[760px]:gap-3 max-[760px]:flex-wrap max-[760px]:mb-4.25">
        <label className="flex items-center gap-2.75 flex-1 min-w-0 py-0 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-muted [&_input]:w-full [&_input]:min-w-0 [&_input]:py-3 [&_input]:px-0 [&_input]:bg-transparent [&_input]:border-0 [&_input]:[outline:0] [&_input]:text-ink [&_input]:text-[15px] [&_input:focus]:[outline:0] focus-within:[outline:2px_solid_var(--color-focus)] focus-within:outline-offset-2 [&_input::placeholder]:text-faint max-[760px]:min-h-11 max-[760px]:basis-50">
          <Search size={17} />
          <input
            placeholder="Find a skill, role, or builder…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search builders"
          />
        </label>
        <label className="flex items-center gap-2.25 text-[12px] text-text cursor-pointer whitespace-nowrap min-h-11 [&_input]:accent-brand-text [&_input]:w-4 [&_input]:h-4 [&_input]:m-0 [&_>_span]:hidden max-[760px]:text-[11px] max-[760px]:min-h-7.5">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          <span />
          Open to collaborate
        </label>
      </div>
      <div className="flex gap-2 flex-wrap mb-7.5 max-[760px]:gap-1.25 max-[760px]:mb-6.25">
        {["Everyone", "Engineering", "Design", "Product", "Marketing"].map(
          (r) => (
            <button
              key={r}
              data-ui={`filter-pill ${role === r ? "active" : ""}`}
              className="min-h-10 py-2 px-3 text-[13px] text-muted bg-transparent border border-transparent rounded-md hover:text-ink hover:bg-surface-hover data-[ui~=active]:text-ink data-[ui~=active]:bg-surface-hover data-[ui~=active]:border-border-strong max-[760px]:text-[13px] max-[760px]:py-2 max-[760px]:px-2.5 max-[760px]:min-h-10"
              aria-pressed={role === r}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ),
        )}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_260px] gap-7.5 [align-items:start] max-[1200px]:grid-cols-[minmax(0,1fr)_230px] max-[1200px]:gap-5.75 max-[1000px]:grid-cols-[minmax(0,1fr)]">
        <div>
          <div className="flex items-center justify-between gap-3.75 mt-0 mx-0 mb-3 [&_h2]:text-[16px] [&_h2]:tracking-[-0.3px] [&_h2]:font-medium [&_h2]:m-0 [&_>_span]:text-[12px] [&_>_span]:text-muted max-[760px]:[&_h2]:text-[15px] max-[760px]:[&_>_span]:text-[11px]">
            <h2>Discover builders</h2>
            <span>{candidates.length} to discover</span>
          </div>
          {p ? (
            <article className="bg-surface border rounded-xl border-border-strong [&_h2]:text-[29px] [&_h2]:font-medium [&_h2]:tracking-[-1px] [&_h2]:leading-[1.3] [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-1.5 max-[760px]:[&_h2]:text-[28px]">
              <div className="p-7 max-[1200px]:p-5.75 max-[760px]:p-6">
                <div className="flex items-center justify-between gap-3.75 mb-5.75 max-[760px]:gap-2">
                  <Avatar profile={p} size={72} />
                  <span
                    data-ui={`availability-badge ${p.availability === "open" ? "open" : ""}`}
                    className="inline-flex items-center gap-1.75 text-[12px] text-muted [&_i]:w-1.25 [&_i]:h-1.25 [&_i]:block [&_i]:bg-faint [&_i]:rounded-full [&[data-ui~=open]_i]:bg-brand max-[760px]:text-[12px]"
                  >
                    <i />
                    {p.availability === "open"
                      ? "Open to collaborate"
                      : "Heads down building"}
                  </span>
                </div>
                <h2>{p.name}</h2>
                <p className="text-[16px] text-muted leading-[1.6] mt-0 mx-0 mb-2.5">
                  {p.role}
                </p>
                {p.location && (
                  <p className="flex items-center gap-1.5 text-[12px] text-muted mt-0 mx-0 mb-6.25">
                    <MapPin size={13} />
                    {p.location}
                  </p>
                )}
                <p className="text-[16px] leading-[1.85] text-text mt-0 mx-0 mb-6.25 whitespace-pre-line wrap-anywhere max-[760px]:text-[16px]">
                  {p.bio || "No bio yet."}
                </p>
                <div className="text-[12px] text-muted mb-2.5">Skills</div>
                <div className="flex gap-1.75 flex-wrap">
                  {p.skills.map((s) => (
                    <span
                      data-ui="badge"
                      className="inline-flex items-center gap-1.25 py-1.25 px-2.25 bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3] "
                      key={s}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-start gap-3 my-6.75 mx-0 text-muted [&_>_svg]:mt-0.5 [&_strong]:text-[13px] [&_strong]:text-text [&_strong]:font-medium [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:text-muted [&_p]:mt-1.25 [&_p]:mx-0 [&_p]:mb-0">
                  <HeartHandshake size={19} />
                  <div>
                    <strong>Looking for</strong>
                    <p>{p.lookingFor.join(" · ") || "Open to ideas"}</p>
                  </div>
                </div>
                <div className="flex gap-2.75 mt-7.5 pt-5.75 [border-top:1px_solid_var(--color-border)] *:data-[ui~=button]:flex-1 *:data-[ui~=button]:text-[13px] max-[760px]:*:data-[ui~=button]:text-[12px] max-[760px]:*:data-[ui~=button]:py-2.5 max-[760px]:*:data-[ui~=button]:px-3">
                  <button
                    data-ui="button button-secondary"
                    className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                    onClick={() => setPassed((v) => [...v, p.id])}
                  >
                    <X size={17} />
                    Pass
                  </button>
                  {connection?.status === "accepted" ? (
                    <Link
                      href="/messages"
                      data-ui="button button-primary"
                      className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                    >
                      <Check size={17} />
                      You're connected
                    </Link>
                  ) : connection?.status === "pending" ? (
                    connection.recipientId === me.id ? (
                      <button
                        data-ui="button button-primary"
                        className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                        onClick={() =>
                          void respondConnection(connection.id, true)
                        }
                      >
                        <Check size={16} />
                        Accept request
                      </button>
                    ) : (
                      <button
                        data-ui="button button-secondary"
                        className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                        disabled
                      >
                        <Check size={16} />
                        Request sent
                      </button>
                    )
                  ) : (
                    <button
                      data-ui="button button-primary"
                      className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                      disabled={busy}
                      onClick={() => void connect()}
                    >
                      <HeartHandshake size={17} />
                      {busy ? "Connecting…" : "Connect"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ) : (
            <div className="bg-surface border border-border rounded-xl flex flex-col items-center text-center py-13.75 px-7 text-muted [&_h3]:text-ink [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:mt-4.25 [&_h3]:mx-0 [&_h3]:mb-2.25 [&_h2]:text-ink [&_h2]:text-[21px] [&_h2]:font-medium [&_h2]:mt-4.25 [&_h2]:mx-0 [&_h2]:mb-2.25 [&_p]:text-muted [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:max-w-90 [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-5.5 data-[ui~=compact]:py-6.25 data-[ui~=compact]:px-2.5">
              <HeartHandshake size={32} />
              <h3>You're all caught up.</h3>
              <p>Try another skill or revisit the builders you passed.</p>
              <button
                data-ui="button button-secondary"
                className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                onClick={() => {
                  setPassed([]);
                  setRole("Everyone");
                  setQuery("");
                  setOpenOnly(false);
                }}
              >
                Discover more builders
              </button>
            </div>
          )}
        </div>
        <aside className="grid gap-5.5 pt-0 max-[1000px]:grid max-[1000px]:grid-cols-2 max-[760px]:grid-cols-[1fr] max-[760px]:gap-5">
          <section className="bg-surface border border-border rounded-xl p-5.25 max-[1200px]:p-4.25">
            <div className="flex items-center justify-between gap-3 mb-4.5 [&_h3]:text-[14px] [&_h3]:font-medium [&_h3]:tracking-[-0.2px] [&_h3]:m-0">
              <h3>Connection requests</h3>
              <span className="inline-flex items-center justify-center min-w-5.5 h-5.5 rounded-[5px] bg-surface-hover text-muted text-[11px]">
                {incoming.length}
              </span>
            </div>
            {incoming.length ? (
              incoming.map((c) => {
                const user = data.profiles.find((p) => p.id === c.senderId);
                return (
                  <div
                    className="[border-bottom:1px_solid_var(--color-border)] py-4.25 px-0 last:pb-0 last:[border-bottom:0] [&_>_div:first-child]:flex [&_>_div:first-child]:items-center [&_>_div:first-child]:gap-2.5 [&_strong]:block [&_strong]:text-[13px] [&_strong]:font-medium [&_small]:block [&_small]:text-[11px] [&_small]:text-muted [&_small]:leading-[1.6] [&_small]:mt-0.75"
                    key={c.id}
                  >
                    <div>
                      <Avatar profile={user} size={39} />
                      <span>
                        <strong>{user?.name || "A builder"}</strong>
                        <small>{user?.role}</small>
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4 **:data-[ui~=button]:py-2 **:data-[ui~=button]:px-2.75 **:data-[ui~=button]:min-h-9 **:data-[ui~=button]:text-[11px] **:data-[ui~=button]:flex-1">
                      <button
                        data-ui="button button-secondary"
                        className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                        onClick={() => void respondConnection(c.id, false)}
                      >
                        Decline
                      </button>
                      <button
                        data-ui="button button-primary"
                        className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                        onClick={() => void respondConnection(c.id, true)}
                      >
                        Accept
                        <Check size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-muted py-5 px-0 text-center [&_p]:text-[13px] [&_p]:mt-1.25 [&_p]:mx-0 [&_p]:mb-0 [&_p]:leading-[1.7]">
                <p>No pending requests.</p>
              </div>
            )}
          </section>
          {outgoing.length > 0 && (
            <section className="bg-surface border border-border rounded-xl p-5.25 max-[1200px]:p-4.25">
              <div className="flex items-center justify-between gap-3 mb-4.5 [&_h3]:text-[14px] [&_h3]:font-medium [&_h3]:tracking-[-0.2px] [&_h3]:m-0">
                <h3>Waiting to connect</h3>
                <span className="inline-flex items-center justify-center min-w-5.5 h-5.5 rounded-[5px] bg-surface-hover text-muted text-[11px]">
                  {outgoing.length}
                </span>
              </div>
              {outgoing.map((c) => {
                const user = data.profiles.find((p) => p.id === c.recipientId);
                return (
                  <div
                    className="[&_strong]:block [&_strong]:text-[13px] [&_strong]:font-medium [&_small]:block [&_small]:text-[11px] [&_small]:text-muted [&_small]:leading-[1.6] [&_small]:mt-0.75 flex items-center gap-2.5 py-3 px-0 [&_i]:hidden"
                    key={c.id}
                  >
                    <Avatar profile={user} size={33} />
                    <span>
                      <strong>{user?.name || "Builder"}</strong>
                      <small>Request sent</small>
                    </span>
                    <i />
                  </div>
                );
              })}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
