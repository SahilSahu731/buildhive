"use client";
import { useEffect, useState } from "react";
import {
  PiCaretRight as ChevronRight,
  PiCaretUp as ChevronUp,
  PiPlus as Plus,
  PiMagnifyingGlass as Search,
  PiPencilSimple as Pencil,
  PiTrash as Trash2,
} from "react-icons/pi";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { safeUrl } from "@/lib/utils";
import { projectSchema } from "@/lib/validation";
import type { Project } from "@/lib/types";

const categories = [
  "All projects",
  "Developer tools",
  "AI & ML",
  "Design",
  "Productivity",
  "Community",
  "Other",
];
export function Explore({ initialProject }: { initialProject?: string }) {
  const {
    data,
    me,
    createProject,
    updateProject,
    deleteProject,
    upvoteProject,
  } = useWorkspace();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All projects");
  const [sort, setSort] = useState("popular");
  const [selectedId, setSelectedId] = useState<string>();
  const [launching, setLaunching] = useState(false);
  const [editingProject, setEditingProject] = useState<Project>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  function openLaunch() {
    setEditingProject(undefined);
    setCover("violet");
    setError("");
    setLaunching(true);
  }
  useEffect(() => {
    if (initialProject) setSelectedId(initialProject);
  }, [initialProject]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cover, setCover] = useState<Project["cover"]>("violet");
  const projects = data.projects
    .filter(
      (p) =>
        (category === "All projects" || p.category === category) &&
        `${p.name} ${p.tagline} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "popular"
        ? b.upvotes - a.upvotes
        : sort === "az"
          ? a.name.localeCompare(b.name)
          : data.projects.indexOf(a) - data.projects.indexOf(b),
    );
  const selected = data.projects.find((p) => p.id === selectedId);
  const maker = data.profiles.find((p) => p.id === selected?.ownerId);
  async function launch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = projectSchema.safeParse({
      name: form.get("name"),
      tagline: form.get("tagline"),
      description: form.get("description"),
      url: form.get("url"),
      category: form.get("category"),
      stage: form.get("stage"),
      cover,
      tags: [
        ...new Set(
          String(form.get("tags"))
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ].slice(0, 5),
    });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message || "Check your product details.",
      );
      return;
    }
    setError("");
    setSaving(true);
    const ok = editingProject
      ? await updateProject(editingProject.id, parsed.data)
      : await createProject(parsed.data);
    setSaving(false);
    if (ok) {
      setLaunching(false);
      setSort("newest");
      setCategory("All projects");
      setQuery("");
    }
  }
  return (
    <div className="animate-[content-reveal_0.4s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none max-w-240 my-0 mx-auto">
      <div
        data-ui="page-header"
        className="flex items-start justify-between gap-5.5 mb-7 [&_h1]:text-[31px] [&_h1]:font-medium [&_h1]:leading-[1.3] [&_h1]:tracking-[-1.15px] [&_h1]:mt-0 [&_h1]:mx-0 [&_h1]:mb-2.25 [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:text-muted [&_p]:m-0 [&_p]:max-w-135 max-[760px]:gap-3.75 max-[760px]:mb-6 max-[760px]:[&_h1]:text-[27px] max-[760px]:[&_h1]:tracking-[-1px] max-[760px]:[&_p]:text-[14px] max-[760px]:*:data-[ui~=button]:text-[12px] max-[760px]:*:data-[ui~=button]:py-2.5 max-[760px]:*:data-[ui~=button]:px-3 max-[760px]:*:data-[ui~=button]:min-h-10.5"
      >
        <div>
          <h1>Projects</h1>
          <p>What the community is building.</p>
        </div>
        <button
          data-ui="button button-primary"
          className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
          onClick={openLaunch}
        >
          <Plus size={16} />
          New project
        </button>
      </div>
      <div className="flex items-center gap-4 mb-5 max-[760px]:gap-3 max-[760px]:flex-wrap max-[760px]:mb-4.25">
        <label className="flex items-center gap-2.75 flex-1 min-w-0 py-0 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-muted [&_input]:w-full [&_input]:min-w-0 [&_input]:py-3 [&_input]:px-0 [&_input]:bg-transparent [&_input]:border-0 [&_input]:[outline:0] [&_input]:text-ink [&_input]:text-[15px] [&_input:focus]:[outline:0] focus-within:[outline:2px_solid_var(--color-focus)] focus-within:outline-offset-2 [&_input::placeholder]:text-faint max-[760px]:min-h-11 max-[760px]:basis-50">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            aria-label="Search products"
          />
        </label>
        <select
          data-ui="input feature-select"
          className="w-auto min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[13px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7] max-w-42.5 max-[760px]:min-h-11 max-[760px]:text-[12px] max-[760px]:p-2.5 max-[760px]:max-w-37.5"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort projects"
        >
          <option value="popular">Most upvoted</option>
          <option value="newest">Recently added</option>
          <option value="az">A to Z</option>
        </select>
      </div>
      <div
        className="flex gap-2 flex-wrap mb-7.5 max-[760px]:gap-1.25 max-[760px]:mb-6.25"
        aria-label="Project categories"
      >
        {categories.map((c) => (
          <button
            key={c}
            data-ui={`filter-pill ${category === c ? "active" : ""}`}
            className="min-h-10 py-2 px-3 text-[13px] text-muted bg-transparent border border-transparent rounded-md hover:text-ink hover:bg-surface-hover data-[ui~=active]:text-ink data-[ui~=active]:bg-surface-hover data-[ui~=active]:border-border-strong max-[760px]:text-[13px] max-[760px]:py-2 max-[760px]:px-2.5 max-[760px]:min-h-10"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3.75 mt-0 mx-0 mb-3 [&_h2]:text-[16px] [&_h2]:tracking-[-0.3px] [&_h2]:font-medium [&_h2]:m-0 [&_>_span]:text-[12px] [&_>_span]:text-muted max-[760px]:[&_h2]:text-[15px] max-[760px]:[&_>_span]:text-[11px]">
        <h2>{category === "All projects" ? "All projects" : category}</h2>
        <span>{projects.length} projects</span>
      </div>
      <div className="grid gap-0">
        {projects.map((p) => (
          <article
            className="bg-transparent border-0 rounded-none flex items-center gap-5.5 [border-bottom:1px_solid_var(--color-border)] py-6.25 px-0 [transition:background_0.15s] max-[760px]:gap-3.75 max-[760px]:py-5.5 max-[760px]:px-0 max-[760px]:items-start"
            key={p.id}
          >
            <button
              className="bg-transparent p-0 shrink-0 rounded-[9px] **:data-[ui~=project-monogram]:w-15.5 **:data-[ui~=project-monogram]:h-15.5 **:data-[ui~=project-monogram]:rounded-xl **:data-[ui~=project-monogram]:text-[26px] **:data-[ui~=project-monogram]:bg-surface **:data-[ui~=project-monogram]:border **:data-[ui~=project-monogram]:border-border max-[760px]:mt-1 max-[760px]:**:data-[ui~=project-monogram]:w-12 max-[760px]:**:data-[ui~=project-monogram]:h-12 max-[760px]:**:data-[ui~=project-monogram]:text-[23px] max-[760px]:**:data-[ui~=project-monogram]:rounded-[9px]"
              onClick={() => setSelectedId(p.id)}
              aria-label={`View ${p.name}`}
            >
              <span
                data-ui="project-monogram"
                className="grid place-items-center w-10.5 h-10.5 rounded-lg bg-surface-hover text-ink font-medium text-[22px] shrink-0"
              >
                {p.name.slice(0, 1)}
              </span>
            </button>
            <div className="min-w-0 flex-1 [&_>_p]:text-[16px] [&_>_p]:leading-[1.7] [&_>_p]:text-text [&_>_p]:mt-2 [&_>_p]:mx-0 [&_>_p]:mb-3.25 [&_>_p]:max-w-150 max-[760px]:[&_>_p]:text-[16px] max-[760px]:[&_>_p]:mt-1.25 max-[760px]:[&_>_p]:mx-0 max-[760px]:[&_>_p]:mb-2.75 max-[760px]:**:data-[ui~=badge]:text-[10px] max-[760px]:**:data-[ui~=badge]:py-1 max-[760px]:**:data-[ui~=badge]:px-1.75">
              <div className="flex items-center justify-between gap-3.5 [&_>_button:first-child]:bg-transparent [&_>_button:first-child]:p-0 [&_>_button:first-child]:text-left [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:tracking-[-0.6px] [&_h3]:flex [&_h3]:items-center [&_h3]:gap-1.5 [&_h3]:m-0 [&_h3_>_svg]:opacity-0 [&_h3_>_svg]:text-muted [&_h3_>_svg]:[transition:opacity_0.15s] [&_>_button:hover_h3_>_svg]:opacity-100 max-[760px]:[&_h3]:text-[19px]">
                <button onClick={() => setSelectedId(p.id)}>
                  <h3>
                    {p.name}
                    <ChevronRight size={13} />
                  </h3>
                </button>
                <button
                  data-ui={`project-upvote ${p.upvoted ? "active" : ""}`}
                  className="flex flex-col items-center justify-center gap-0 w-12.25 min-h-13.25 bg-surface border border-border-strong rounded-lg text-[12px] text-muted shrink-0 hover:border-brand-border hover:bg-brand-soft hover:text-brand-text data-[ui~=active]:border-brand data-[ui~=active]:bg-brand data-[ui~=active]:text-brand-ink data-[ui~=active]:font-semibold max-[760px]:w-10.75 max-[760px]:min-h-12.25"
                  aria-label={`Upvote ${p.name}`}
                  aria-pressed={p.upvoted}
                  onClick={() => void upvoteProject(p.id)}
                >
                  <ChevronUp size={16} />
                  <span>{p.upvotes}</span>
                </button>
              </div>
              <p>{p.tagline}</p>
              <div className="flex gap-1.75 flex-wrap">
                <span
                  data-ui="badge"
                  className="inline-flex items-center gap-1.25 py-1.25 px-2.25 bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3] "
                >
                  {p.category}
                </span>
                {p.tags
                  .filter((t) => t !== p.category)
                  .slice(0, 1)
                  .map((t) => (
                    <span
                      data-ui="badge"
                      className="inline-flex items-center gap-1.25 py-1.25 px-2.25 bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3] "
                      key={t}
                    >
                      {t}
                    </span>
                  ))}
              </div>
              <div className="flex items-center gap-4.5 mt-3.5 text-muted text-[13px] [&_>_span:first-child]:flex [&_>_span:first-child]:items-center [&_>_span:first-child]:gap-1.75 max-[760px]:gap-3.25 max-[760px]:text-[11px] max-[760px]:mt-3.25">
                <span>
                  <Avatar
                    profile={data.profiles.find((o) => o.id === p.ownerId)}
                    size={23}
                  />
                  {data.profiles
                    .find((o) => o.id === p.ownerId)
                    ?.name.split(" ")[0] || "A builder"}
                </span>
                <span className="flex items-center gap-1.25 [&_i]:hidden">
                  <i />
                  {p.stage}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!projects.length && (
        <div className="bg-surface border border-border rounded-xl flex flex-col items-center text-center py-13.75 px-7 text-muted [&_h3]:text-ink [&_h3]:text-[21px] [&_h3]:font-medium [&_h3]:mt-4.25 [&_h3]:mx-0 [&_h3]:mb-2.25 [&_h2]:text-ink [&_h2]:text-[21px] [&_h2]:font-medium [&_h2]:mt-4.25 [&_h2]:mx-0 [&_h2]:mb-2.25 [&_p]:text-muted [&_p]:text-[15px] [&_p]:leading-[1.7] [&_p]:max-w-90 [&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-5.5 data-[ui~=compact]:py-6.25 data-[ui~=compact]:px-2.5">
          <Search size={30} />
          <h3>No products found.</h3>
          <p>Try another idea, skill, or category.</p>
          <button
            data-ui="button button-secondary"
            className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
            onClick={() => {
              setQuery("");
              setCategory("All projects");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <Modal
        open={!!selected}
        onClose={() => setSelectedId(undefined)}
        title={selected?.name || "Product"}
        wide
      >
        {selected && (
          <div className="">
            <div className="flex items-start justify-between gap-6.25 [&_h2]:text-[29px] [&_h2]:font-medium [&_h2]:mt-4.5 [&_h2]:mx-0 [&_h2]:mb-2 [&_h2]:tracking-[-1px] [&_p]:text-[17px] [&_p]:leading-[1.7] [&_p]:text-text [&_p]:m-0 *:data-[ui~=button]:mt-1.25 max-[760px]:flex-col max-[760px]:gap-4.5 max-[760px]:[&_h2]:text-[27px] max-[760px]:[&_p]:text-[16px]">
              <div>
                <span
                  data-ui="badge"
                  className="inline-flex items-center gap-1.25 py-1.25 px-2.25 bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3] "
                >
                  {selected.category}
                </span>
                <h2>{selected.name}</h2>
                <p>{selected.tagline}</p>
              </div>
              <button
                data-ui={`button ${selected.upvoted ? "button-secondary" : "button-primary"}`}
                className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] data-[ui~=button-primary]:bg-primary data-[ui~=button-primary]:text-primary-ink [&[data-ui~=button-primary]:hover:not(:disabled)]:bg-primary-hover data-[ui~=button-secondary]:bg-surface data-[ui~=button-secondary]:border-border-strong data-[ui~=button-secondary]:text-ink [&[data-ui~=button-secondary]:hover:not(:disabled)]:bg-surface-hover [&[data-ui~=button-secondary]:hover:not(:disabled)]:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                onClick={() => void upvoteProject(selected.id)}
                aria-pressed={selected.upvoted}
              >
                <ChevronUp size={17} />
                {selected.upvoted ? "Upvoted" : "Upvote"} · {selected.upvotes}
              </button>
            </div>
            <p className="text-[16px] leading-[1.9] text-text whitespace-pre-line my-6.5 mx-0 max-[760px]:text-[15px]">
              {selected.description}
            </p>
            <div className="flex gap-1.75 flex-wrap">
              {selected.tags.map((t) => (
                <span
                  data-ui="badge"
                  className="inline-flex items-center gap-1.25 py-1.25 px-2.25 bg-surface-raised border border-border rounded-[5px] text-muted text-[12px] font-normal leading-[1.3] "
                  key={t}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center gap-4.5 [border-top:1px_solid_var(--color-border)] pt-6 mt-6.5 [&_>_span]:flex [&_>_span]:items-center [&_>_span]:gap-3 [&_strong]:text-[14px] [&_strong]:font-medium [&_strong]:block [&_small]:text-[12px] [&_small]:text-muted [&_small]:block [&_small]:mt-0.75 max-[760px]:items-start max-[760px]:flex-wrap">
              <span>
                <Avatar profile={maker} size={38} />
                <span>
                  <strong>{maker?.name || "A builder"}</strong>
                  <small>Maker · {selected.stage}</small>
                </span>
              </span>
              {safeUrl(selected.url) && (
                <a
                  href={safeUrl(selected.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ui="button button-secondary"
                  className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                >
                  Visit product
                  <ChevronRight size={16} />
                </a>
              )}
            </div>
            {selected.ownerId === me.id && (
              <div className="flex gap-2.5 mt-6 pt-5 [border-top:1px_solid_var(--color-border)] max-[760px]:flex-wrap">
                <button
                  data-ui="button button-secondary"
                  className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                  onClick={() => {
                    setEditingProject(selected);
                    setCover(selected.cover);
                    setError("");
                    setSelectedId(undefined);
                    setLaunching(true);
                  }}
                >
                  <Pencil size={14} />
                  Edit product
                </button>
                <button
                  data-ui="button button-ghost"
                  className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-transparent text-muted enabled:hover:bg-surface enabled:hover:text-ink enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} />
                  Delete product
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={launching}
        onClose={() => !saving && setLaunching(false)}
        title={editingProject ? "Edit project" : "Share a project"}
        description="Show the community what you're building."
        wide
      >
        <form
          className="grid gap-5"
          onSubmit={launch}
          key={editingProject?.id || "new"}
        >
          <div className="grid grid-cols-[1fr_1fr] gap-4.5 max-[760px]:grid-cols-[1fr] max-[760px]:gap-5">
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Product name
              <input
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
                name="name"
                defaultValue={editingProject?.name}
                required
                maxLength={80}
                placeholder="Project name"
              />
            </label>
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Website (optional)
              <input
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
                name="url"
                defaultValue={editingProject?.url}
                type="url"
                maxLength={2048}
                placeholder="https://your-product.com"
              />
            </label>
          </div>
          <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
            One-line pitch
            <input
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
              name="tagline"
              defaultValue={editingProject?.tagline}
              required
              maxLength={180}
              placeholder="What does it do, and who is it for?"
            />
          </label>
          <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
            Description
            <textarea
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
              name="description"
              defaultValue={editingProject?.description}
              rows={4}
              maxLength={6000}
              placeholder="Tell us what you're building and what feedback you'd love."
            />
          </label>
          <div className="grid grid-cols-[1fr_1fr] gap-4.5 max-[760px]:grid-cols-[1fr] max-[760px]:gap-5">
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Category
              <select
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
                name="category"
                defaultValue={editingProject?.category}
              >
                {categories.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
              Stage
              <select
                data-ui="input"
                className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
                name="stage"
                defaultValue={editingProject?.stage}
              >
                <option>Building</option>
                <option>Idea</option>
                <option>Beta</option>
                <option>Launched</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-[14px] font-medium [&_>_span]:text-[13px] [&_>_span]:text-muted [&_>_span]:font-normal">
            Tags (up to 5, separated by commas)
            <input
              data-ui="input"
              className="w-full min-w-0 py-3 px-3.5 min-h-11.5 bg-surface border border-border-strong rounded-lg text-[16px] text-ink placeholder:text-faint [textarea]:resize-y [textarea]:leading-[1.7]"
              name="tags"
              defaultValue={editingProject?.tags.join(", ")}
              maxLength={200}
              placeholder="Open source, SaaS, Weekend project"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="text-danger-text text-[14px] leading-[1.6] m-0"
            >
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-2.5">
            <button
              type="submit"
              data-ui="button button-primary"
              className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-primary text-primary-ink enabled:hover:bg-primary-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : editingProject
                  ? "Save changes"
                  : "Publish project"}
              <ChevronRight size={15} />
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={confirmDelete}
        onClose={() => !saving && setConfirmDelete(false)}
        title="Delete this product?"
        description="The product and its upvotes will be removed. Your community updates will stay, without the attachment."
      >
        <div className="flex items-center justify-end gap-3 pt-2.5">
          <button
            data-ui="button button-secondary"
            className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-surface text-ink enabled:hover:bg-surface-hover enabled:hover:border-faint enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
            disabled={saving}
            onClick={() => setConfirmDelete(false)}
          >
            Keep it
          </button>
          <button
            data-ui="button button-danger"
            className="inline-flex items-center justify-center gap-2.25 min-h-11 py-2.5 px-4.5 border border-transparent rounded-lg text-[14px] font-medium leading-[1.4] whitespace-nowrap [transition:background_0.18s,color_0.18s,border-color_0.18s,transform_0.18s] bg-danger-bg text-danger-text enabled:hover:bg-danger-hover enabled:hover:transform-[translateY(-1px)] enabled:active:transform-[translateY(0)] motion-reduce:enabled:hover:transform-none"
            disabled={saving}
            onClick={async () => {
              if (!selected) return;
              setSaving(true);
              const ok = await deleteProject(selected.id);
              setSaving(false);
              if (ok) {
                setConfirmDelete(false);
                setSelectedId(undefined);
              }
            }}
          >
            {saving ? "Deleting…" : "Delete product"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
