"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  Github,
  Globe,
  HeartHandshake,
  MapPin,
  Pencil,
  Plus,
  Rocket,
} from "@/components/ui/icons";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { safeUrl } from "@/lib/utils";
import { profileSchema } from "@/lib/validation";
export function Profile() {
  const { data, me, updateProfile } = useWorkspace();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("products");
  const projects = data.projects.filter((p) => p.ownerId === me.id);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const list = (key: string) =>
      [
        ...new Set(
          String(f.get(key) || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ].slice(0, 10);
    const p = profileSchema.safeParse({
      name: f.get("name"),
      username: String(f.get("username")).trim().toLowerCase(),
      role: f.get("role"),
      bio: f.get("bio"),
      location: f.get("location"),
      skills: list("skills"),
      lookingFor: list("lookingFor"),
      availability: f.get("availability"),
      website: f.get("website"),
      github: f.get("github"),
    });
    if (!p.success) {
      setError(p.error.issues[0]?.message || "Check your profile.");
      return;
    }
    setSaving(true);
    setError("");
    const ok = await updateProfile(p.data);
    setSaving(false);
    if (ok) setEditing(false);
  }
  return (
    <div className="animate-[content-reveal_0.4s_cubic-bezier(0.22,_1,_0.36,_1)_both] motion-reduce:animate-none max-w-240 my-0 mx-auto">
      <div
        data-ui="page-header"
        className="flex items-start justify-between gap-5.5 mb-7 [&_h1]:text-[31px] [&_h1]:font-medium [&_h1]:leading-[1.3] [&_h1]:tracking-[-1.15px] [&_h1]:mt-0 [&_h1]:mx-0 [&_h1]:mb-[9px] [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:text-muted [&_p]:m-0 [&_p]:max-w-135 max-[760px]:gap-[15px] max-[760px]:mb-6 max-[760px]:[&_h1]:text-[27px] max-[760px]:[&_h1]:tracking-[-1px] max-[760px]:[&_p]:text-[14px] max-[760px]:[&_>_[data-ui~=button]]:text-[12px] max-[760px]:[&_>_[data-ui~=button]]:py-2.5 max-[760px]:[&_>_[data-ui~=button]]:px-3 max-[760px]:[&_>_[data-ui~=button]]:min-h-10.5"
      >
        <div>
          <h1>Your profile</h1>
        </div>
        <button
          data-ui="button button-secondary"
          className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-surface border-border-strong text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
          onClick={() => setEditing(true)}
        >
          <Pencil size={14} />
          Edit profile
        </button>
      </div>
      <section className="bg-transparent border-0 rounded-none [border-bottom:1px_solid_var(--color-border)] mb-6.5">
        <div className="pt-[5px] px-0 pb-[29px] max-[760px]:pt-1">
          <div className="flex items-center justify-between gap-4.5 mb-6 max-[760px]:mb-[23px] max-[760px]:[&_>_[data-ui~=avatar]]:w-19! max-[760px]:[&_>_[data-ui~=avatar]]:h-19!">
            <Avatar profile={me} size={90} />
            <span
              data-ui={`availability-badge ${me.availability === "open" ? "open" : ""}`}
              className="inline-flex items-center gap-[7px] text-[12px] text-muted [&_i]:w-[5px] [&_i]:h-[5px] [&_i]:block [&_i]:bg-faint [&_i]:rounded-full [&[data-ui~=open]_i]:bg-brand max-[760px]:text-[12px]"
            >
              <i />
              {me.availability === "open"
                ? "Open to collaborate"
                : "Heads down building"}
            </span>
          </div>
          <div className="flex items-center gap-4.5 [&_h2]:text-[30px] [&_h2]:tracking-[-1px] [&_h2]:font-medium [&_h2]:mt-0 [&_h2]:mx-0 [&_h2]:mb-[7px] [&_h2_small]:text-[13px] [&_h2_small]:text-muted [&_h2_small]:font-normal [&_h2_small]:tracking-[0] [&_h2_small]:ml-3.5 [&_p]:text-[16px] [&_p]:text-text [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[15px] max-[760px]:[&_h2]:text-[28px] max-[760px]:[&_h2_small]:block max-[760px]:[&_h2_small]:mt-1.5 max-[760px]:[&_h2_small]:mx-0 max-[760px]:[&_h2_small]:mb-0 max-[760px]:[&_h2_small]:text-[12px] max-[760px]:[&_p]:text-[15px]">
            <div>
              <h2>
                {me.name}
                <small>@{me.username}</small>
              </h2>
              <p>{me.role || "Builder of things"}</p>
            </div>
          </div>
          <p className="text-[17px] leading-[1.85] [white-space:pre-line] [overflow-wrap:anywhere] text-text max-w-175 mt-0 mx-0 mb-[23px] max-[760px]:text-[16px]">
            {me.bio || "Add a short bio to introduce yourself."}
          </p>
          <div className="flex items-center gap-[23px] flex-wrap text-muted text-[12px] [&_span]:flex [&_span]:items-center [&_span]:gap-[7px] [&_a]:flex [&_a]:items-center [&_a]:gap-[7px] [&_a:hover]:text-brand-text max-[760px]:gap-[17px] max-[760px]:text-[11px]">
            {me.location && (
              <span>
                <MapPin size={14} />
                {me.location}
              </span>
            )}
            {safeUrl(me.website) && (
              <a
                href={safeUrl(me.website)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={14} />
                Personal website
                <ChevronRight size={12} />
              </a>
            )}
            {safeUrl(me.github) && (
              <a
                href={safeUrl(me.github)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={14} />
                GitHub
                <ChevronRight size={12} />
              </a>
            )}
          </div>
        </div>
      </section>
      <div className="max-w-190">
        <div>
          <div
            className='flex gap-7.5 [border-bottom:1px_solid_var(--color-border)] mb-[5px] [&_button]:relative [&_button]:flex [&_button]:items-center [&_button]:gap-2 [&_button]:bg-transparent [&_button]:text-[14px] [&_button]:text-muted [&_button]:pt-0 [&_button]:px-0 [&_button]:pb-[17px] [&_button]:min-h-10.5 [&_button[data-ui~=active]]:text-ink [&_button[data-ui~=active]]:font-medium [&_button[data-ui~=active]:after]:[content:""] [&_button[data-ui~=active]:after]:absolute [&_button[data-ui~=active]:after]:left-0 [&_button[data-ui~=active]:after]:right-0 [&_button[data-ui~=active]:after]:bottom-[-1px] [&_button[data-ui~=active]:after]:h-[3px] [&_button[data-ui~=active]:after]:bg-brand [&_button[data-ui~=active]:after]:rounded-[3px] [&_button_>_span]:text-[11px] [&_button_>_span]:ml-[3px] [&_button_>_span]:text-muted max-[760px]:gap-[27px] max-[760px]:[&_button]:text-[13px]'
            role="tablist"
            aria-label="Profile sections"
          >
            <button
              role="tab"
              aria-selected={tab === "products"}
              data-ui={tab === "products" ? "active" : ""}
              className=""
              onClick={() => setTab("products")}
            >
              <Rocket size={15} />
              Projects<span>{projects.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={tab === "about"}
              data-ui={tab === "about" ? "active" : ""}
              className=""
              onClick={() => setTab("about")}
            >
              <HeartHandshake size={15} />
              About
            </button>
          </div>
          {tab === "products" ? (
            projects.length ? (
              <div className="">
                {projects.map((p) => (
                  <Link
                    href={`/explore?project=${p.id}`}
                    className="bg-transparent border-0 rounded-none flex items-center gap-[19px] [border-bottom:1px_solid_var(--color-border)] py-[25px] px-0 [&_[data-ui~=project-monogram]]:w-14 [&_[data-ui~=project-monogram]]:h-14 [&_[data-ui~=project-monogram]]:shrink-0 [&_>_div]:flex-1 [&_>_div]:min-w-0 [&_[data-ui~=eyebrow]]:text-[11px] [&_[data-ui~=eyebrow]]:mt-0 [&_[data-ui~=eyebrow]]:mx-0 [&_[data-ui~=eyebrow]]:mb-1 [&_h3]:text-[20px] [&_h3]:font-medium [&_h3]:tracking-[-0.5px] [&_h3]:mt-0 [&_h3]:mx-0 [&_h3]:mb-[5px] [&_p]:text-[14px] [&_p]:text-muted [&_p]:leading-[1.7] [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[7px] [&_small]:flex [&_small]:justify-between [&_small]:text-muted [&_small]:text-[11px] [&:hover_h3]:text-brand-text max-[760px]:gap-[15px] max-[760px]:[&_[data-ui~=project-monogram]]:w-11.5 max-[760px]:[&_[data-ui~=project-monogram]]:h-11.5 max-[760px]:[&_h3]:text-[19px] max-[760px]:[&_p]:text-[13px]"
                    key={p.id}
                  >
                    <span
                      data-ui="project-monogram"
                      className="grid place-items-center w-10.5 h-10.5 rounded-lg bg-surface-hover text-ink font-medium text-[22px] shrink-0"
                    >
                      {p.name.slice(0, 1)}
                    </span>
                    <div>
                      <span
                        data-ui="eyebrow"
                        className="text-[12px] text-muted font-medium tracking-[0] mb-2.5 flex gap-1.5 items-center"
                      >
                        {p.category}
                      </span>
                      <h3>{p.name}</h3>
                      <p>{p.tagline}</p>
                      <small>
                        {p.stage}
                        <ChevronRight size={16} />
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl flex flex-col items-center text-center py-[55px] px-7 text-muted [&_h3]:text-ink [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:mt-[17px] [&_h3]:mx-0 [&_h3]:mb-[9px] [&_h2]:text-ink [&_h2]:text-[21px] [&_h2]:font-medium [&_h2]:mt-[17px] [&_h2]:mx-0 [&_h2]:mb-[9px] [&_p]:text-muted [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:max-w-90 [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-5.5 [&[data-ui~=compact]]:py-[25px] [&[data-ui~=compact]]:px-2.5">
                <span className="text-muted">
                  <Rocket size={27} />
                </span>
                <h3>No projects yet.</h3>
                <p>Share your first project with the community.</p>
                <Link
                  href="/explore"
                  data-ui="button button-primary"
                  className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
                >
                  <Plus size={15} />
                  Share a project
                </Link>
              </div>
            )
          ) : (
            <section className="bg-transparent border-0 rounded-none py-6 px-0 [&_h3]:text-[16px] [&_h3]:font-medium [&_h3]:tracking-[-0.2px] [&_h3]:mt-6.5 [&_h3]:mx-0 [&_h3]:mb-3 [&_h3:first-child]:mt-0 [&_p]:text-[16px] [&_p]:leading-[1.8] [&_p]:text-text [&_p]:[white-space:pre-line] [&_p]:[overflow-wrap:anywhere] [&_>_[data-ui~=button]]:mt-[15px] max-[1200px]:p-[17px] max-[760px]:[&_p]:text-[16px]">
              <h3>About</h3>
              <p>{me.bio || "Tell your story in your profile."}</p>
              <h3>Skills</h3>
              <div className="flex gap-[7px] flex-wrap">
                {me.skills.map((s) => (
                  <span
                    data-ui="badge"
                    className="inline-flex items-center gap-[5px] py-[5px] px-[9px] bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3] border-border"
                    key={s}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <h3>Looking for</h3>
              <p>
                {me.lookingFor.join(" · ") ||
                  "Add what you're looking for to your profile."}
              </p>
              <button
                data-ui="button button-secondary"
                className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-surface border-border-strong text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
                onClick={() => setEditing(true)}
              >
                <Pencil size={14} />
                Edit profile
              </button>
            </section>
          )}
        </div>
      </div>
      <Modal
        open={editing}
        onClose={() => !saving && setEditing(false)}
        title="Edit profile"
        description="Let other builders know who you are."
        wide
      >
        <form className="grid gap-5" onSubmit={save}>
          <div className="grid [grid-template-columns:1fr_1fr] gap-4.5 max-[760px]:[grid-template-columns:1fr] max-[760px]:gap-5">
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Full name
              <input
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
                name="name"
                defaultValue={me.name}
                required
                maxLength={80}
              />
            </label>
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Username
              <input
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
                name="username"
                defaultValue={me.username}
                pattern="[a-z0-9_]{3,40}"
                required
                maxLength={40}
              />
            </label>
          </div>
          <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
            What do you do?
            <input
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
              name="role"
              defaultValue={me.role}
              maxLength={100}
              placeholder="Full-stack developer"
            />
          </label>
          <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
            Bio
            <textarea
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
              name="bio"
              defaultValue={me.bio}
              rows={4}
              maxLength={1200}
            />
          </label>
          <div className="grid [grid-template-columns:1fr_1fr] gap-4.5 max-[760px]:[grid-template-columns:1fr] max-[760px]:gap-5">
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Based in
              <input
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
                name="location"
                defaultValue={me.location}
                maxLength={100}
              />
            </label>
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Availability
              <select
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
                name="availability"
                defaultValue={me.availability}
              >
                <option value="open">Open to collaborate</option>
                <option value="busy">Heads down building</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
            Skills (separated by commas)
            <input
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
              name="skills"
              defaultValue={me.skills.join(", ")}
              maxLength={300}
            />
          </label>
          <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
            Who would you love to meet? (separated by commas)
            <input
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
              name="lookingFor"
              defaultValue={me.lookingFor.join(", ")}
              maxLength={300}
            />
          </label>
          <div className="grid [grid-template-columns:1fr_1fr] gap-4.5 max-[760px]:[grid-template-columns:1fr] max-[760px]:gap-5">
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Personal website
              <input
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
                name="website"
                type="url"
                defaultValue={me.website}
                maxLength={2048}
                placeholder="https://your-site.com"
              />
            </label>
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              GitHub
              <input
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink [&::placeholder]:text-faint [&:is(textarea)]:resize-y [&:is(textarea)]:leading-[1.7]"
                name="github"
                type="url"
                defaultValue={me.github}
                maxLength={2048}
                placeholder="https://github.com/you"
              />
            </label>
          </div>
          {error && (
            <p
              className="text-danger-text text-[14px] leading-[1.6] m-0"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-2.5">
            <button
              data-ui="button button-secondary"
              className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-surface border-border-strong text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              data-ui="button button-primary"
              className="inline-flex items-center justify-center gap-[9px] min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,_color_0.18s,_border-color_0.18s,_transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:[transform:translateY(-1px)] enabled:active:[transform:translateY(0)] motion-reduce:enabled:hover:transform-none"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save profile"}
              <Check size={15} />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
