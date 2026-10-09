"use client";
import { useResource } from "@/lib/use-resource";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  CheckCheck,
  Clock,
  Copy,
  Download,
  FileCode,
  GitBranch,
  KeyRound,
  Lock,
  Plus,
  Play,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import {
  api,
  mutate,
  Project,
  Test,
  Run,
  Definition,
  Step,
  Explanation,
  date,
  duration,
  actionNames,
} from "@/lib/hive";
import { Badge, Button, Confirm, Empty, Loading, Notice, PageHead } from "./ui";
import { RunTable, History, Stat } from "./dashboard";
export function ProjectForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const p = await mutate<Project>(
        "/projects",
        "POST",
        Object.fromEntries(form),
      );
      await onSaved();
      router.push(`/dashboard/projects/${p.id}/settings`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" href="/dashboard/projects">
        <ArrowLeft size={15} /> All projects
      </Link>
      <PageHead
        eyebrow="A GOOD PLACE TO START"
        title="Connect your website"
        description="Add your application, then verify that it belongs to you."
      />
      <div className="form-layout">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="form-section">
            <h2>Project details</h2>
            <p>A project represents one website and environment.</p>
            <label>
              Project name
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                placeholder="e.g. Acme Dashboard"
              />
            </label>
            <label>
              Website URL
              <input
                name="url"
                type="url"
                required
                placeholder="https://app.example.com"
              />
              <small>
                Use the HTTPS origin. Test routes are configured in each test.
              </small>
            </label>
            <label>
              Environment
              <select name="environment">
                <option value="production">Production</option>
                <option value="staging">Staging</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" required /> I own this website or have
              permission to test it.
            </label>
            {error && <Notice message={error} />}
          </div>
          <div className="form-actions">
            <Link className="button" href="/dashboard/projects">
              Cancel
            </Link>
            <Button className="primary" type="submit" busy={busy}>
              Create project <ArrowRight size={16} />
            </Button>
          </div>
        </form>
        <aside className="form-aside">
          <div className="feature-icon">
            <ShieldCheck />
          </div>
          <h3>Your website. Your permission.</h3>
          <p>
            Before your first browser run, we’ll ask you to add a DNS TXT record
            or a small verification file.
          </p>
          <hr />
          <CheckLine text="Only verified domains can run tests" />
          <CheckLine text="Separate production and staging projects" />
          <CheckLine text="No code changes or SDK installation" />
          <Link className="text-link" href="/docs#verification">
            About verification <ArrowUpRight size={14} />
          </Link>
        </aside>
      </div>
    </>
  );
}
function CheckLine({ text }: { text: string }) {
  return (
    <p className="check-line">
      <Check size={15} />
      {text}
    </p>
  );
}
export function ProjectDetail({
  projectId,
  tab,
}: {
  projectId: string;
  tab: string;
}) {
  const {
    data: p,
    error,
    loading,
    refresh,
  } = useResource<Project>(`/projects/${projectId}`, 10000);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");
  const router = useRouter();
  const root = `/dashboard/projects/${projectId}`;
  async function run(t: Test) {
    setBusy(t.id);
    try {
      const r = await mutate<Run>(`/tests/${t.id}/runs`, "POST");
      router.push(`${root}/runs/${r.id}`);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  if (loading) return <Loading />;
  if (!p) return <Notice message={error} />;
  const tests = p.tests || [];
  return (
    <>
      <Link className="back-link" href="/dashboard/projects">
        <ArrowLeft size={15} /> All projects
      </Link>
      <PageHead title={p.name} description={p.url}>
        <Badge status={p.status} />
        <Link className="button primary" href={`${root}/tests/new`}>
          <Plus size={16} /> Create test
        </Link>
      </PageHead>
      <nav className="tabs" aria-label="Project sections">
        {["overview", "tests", "runs", "monitoring", "settings"].map((t) => (
          <Link
            key={t}
            className={tab === t ? "active" : ""}
            href={`${root}/${t}`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </nav>
      {(error || actionError) && (
        <Notice
          message={error || actionError}
          onClose={() => setActionError("")}
        />
      )}{" "}
      {!p.verifiedAt && tab !== "settings" && (
        <div className="verification-banner">
          <ShieldCheck size={21} />
          <div>
            <b>One quick check before your first run.</b>
            <p>
              Verify your domain so we know you’re authorized to test this
              website.
            </p>
          </div>
          <Link className="button" href={`${root}/settings`}>
            Verify domain <ArrowRight size={14} />
          </Link>
        </div>
      )}
      {tab === "settings" ? (
        <ProjectSettings project={p} refresh={refresh} />
      ) : tab === "monitoring" ? (
        <Monitoring tests={tests} refresh={refresh} />
      ) : tab === "runs" ? (
        <History projectId={p.id} />
      ) : (
        <>
          {tab === "overview" && (
            <div className="stat-grid three">
              <Stat
                label="Saved tests"
                value={tests.length}
                note={`${tests.filter((t) => t.status === "active").length} active tests`}
                icon={<CheckCheck size={18} />}
              />
              <Stat
                label="Latest run"
                value={
                  p.runs?.[0] ? (
                    <Badge status={p.runs[0].status} />
                  ) : (
                    <span className="muted">No runs</span>
                  )
                }
                note={
                  p.runs?.[0]
                    ? date(p.runs[0].createdAt)
                    : "Create and run your first test"
                }
                icon={<Play size={18} />}
              />
              <Stat
                label="Scheduled checks"
                value={tests.filter((t) => t.schedule?.enabled).length}
                note="Enabled monitoring schedules"
                icon={<Clock size={18} />}
              />
            </div>
          )}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Saved tests</h2>
                <p>Repeatable checks for your most important journeys.</p>
              </div>
              <span className="count-chip">{tests.length}</span>
            </div>
            {tests.length ? (
              <div className="test-list">
                {tests.map((t) => (
                  <div className="test-row" key={t.id}>
                    <div className="test-icon">
                      <CheckCheck size={20} />
                    </div>
                    <Link href={`${root}/tests/${t.id}/edit`}>
                      <b>{t.name}</b>
                      <small>
                        {t.description ||
                          `${t.tags.join(" · ") || "Chromium"} · Version ${t.currentVersion}`}
                      </small>
                    </Link>
                    <Badge status={t.status} />
                    {t.runs?.[0] && (
                      <Link href={`${root}/runs/${t.runs[0].id}`}>
                        <Badge status={t.runs[0].status} />
                      </Link>
                    )}
                    <Button
                      className="small"
                      disabled={p.status !== "active" || t.status !== "active"}
                      busy={busy === t.id}
                      onClick={() => run(t)}
                    >
                      <Play size={13} /> Run test
                    </Button>
                    <Link
                      aria-label={`Edit ${t.name}`}
                      href={`${root}/tests/${t.id}/edit`}
                      className="icon-button"
                    >
                      <Settings size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title="What should always work?"
                description="Start with a homepage check, a login flow, or your most important form."
                href={`${root}/tests/new`}
                label="Create your first test"
              />
            )}
          </section>
          {tab === "overview" && (
            <section className="panel">
              <div className="panel-head">
                <h2>Recent runs</h2>
                <Link className="text-link" href={`${root}/runs`}>
                  View history <ArrowUpRight size={14} />
                </Link>
              </div>
              <RunTable runs={p.runs || []} />
            </section>
          )}
        </>
      )}
    </>
  );
}
function ProjectSettings({
  project: p,
  refresh,
}: {
  project: Project;
  refresh: () => Promise<void>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [webhook, setWebhook] = useState<{ secret: string; url: string }>();
  const perform = async (
    key: string,
    work: () => Promise<unknown>,
    success: string,
  ) => {
    setBusy(key);
    setMessage("");
    try {
      await work();
      await refresh();
      setMessage(success);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="settings-stack">
      {message && <Notice message={message} onClose={() => setMessage("")} />}
      <section className="panel form-panel">
        <div className="form-section">
          <div className="section-title">
            <ShieldCheck size={20} />
            <h2>Domain verification</h2>
            <Badge status={p.verifiedAt ? "verified" : "unverified"} />
          </div>
          {p.verifiedAt ? (
            <p>
              Verified on {date(p.verifiedAt)}. Changing the URL requires
              verification again.
            </p>
          ) : (
            <>
              <p>
                Publish either record below, then click its verification button.
                This challenge expires {date(p.verificationExpiresAt)}.
              </p>
              <div className="verification-options">
                <div>
                  <h3>01 / DNS TXT record</h3>
                  <label>
                    Record name
                    <code className="copy-value">
                      _buildhive.{new URL(p.url).hostname}
                    </code>
                  </label>
                  <label>
                    Record value
                    <code className="copy-value">
                      buildhive-verification={p.verificationToken}
                    </code>
                  </label>
                  <Button
                    busy={busy === "dns"}
                    onClick={() =>
                      perform(
                        "dns",
                        () =>
                          mutate(`/projects/${p.id}/verify`, "POST", {
                            method: "dns",
                          }),
                        "Domain verified. You’re ready to run tests.",
                      )
                    }
                  >
                    <ShieldCheck size={15} /> Verify DNS
                  </Button>
                </div>
                <div>
                  <h3>02 / Verification file</h3>
                  <p>Serve the exact record value as a text file:</p>
                  <code className="copy-value">
                    {p.url}/.well-known/buildhive-verification.txt
                  </code>
                  <Button
                    busy={busy === "file"}
                    onClick={() =>
                      perform(
                        "file",
                        () =>
                          mutate(`/projects/${p.id}/verify`, "POST", {
                            method: "file",
                          }),
                        "Domain verified. You’re ready to run tests.",
                      )
                    }
                  >
                    <FileCode size={15} /> Verify file
                  </Button>
                </div>
              </div>
              <Button
                className="subtle small"
                onClick={() =>
                  perform(
                    "renew",
                    () =>
                      mutate(`/projects/${p.id}/verify`, "POST", {
                        method: "renew",
                      }),
                    "New verification challenge generated.",
                  )
                }
                busy={busy === "renew"}
              >
                <RefreshCw size={13} /> Renew expired challenge
              </Button>
            </>
          )}
        </div>
      </section>
      <form
        className="panel form-panel"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void perform(
            "project",
            () => mutate(`/projects/${p.id}`, "PATCH", Object.fromEntries(f)),
            "Project updated.",
          );
        }}
      >
        <div className="form-section">
          <h2>Project settings</h2>
          <div className="form-grid">
            <label>
              Project name
              <input name="name" defaultValue={p.name} required minLength={2} />
            </label>
            <label>
              Website URL
              <input name="url" defaultValue={p.url} type="url" required />
            </label>
            <label>
              Environment
              <select name="environment" defaultValue={p.environment}>
                <option>production</option>
                <option>staging</option>
              </select>
            </label>
            <label>
              Status
              <select
                name="status"
                defaultValue={p.status === "unverified" ? "paused" : p.status}
              >
                <option value="active" disabled={!p.verifiedAt}>
                  Active
                </option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
        </div>
        <div className="form-actions">
          <Button className="primary" type="submit" busy={busy === "project"}>
            Save changes
          </Button>
        </div>
      </form>
      <section className="panel form-panel">
        <div className="form-section">
          <div className="section-title">
            <KeyRound size={20} />
            <h2>Encrypted variables</h2>
          </div>
          <p>
            Use dedicated test accounts. Values are encrypted and never
            displayed again. Secret-bearing tests disable screenshots and traces
            and only contact this origin.
          </p>
          {p.secrets?.map((s) => (
            <div className="secret-row" key={s.id}>
              <Lock size={14} />
              <code>{s.name}</code>
              <span>Updated {date(s.updatedAt)}</span>
              <Button
                className="subtle small"
                aria-label={`Delete ${s.name}`}
                onClick={() =>
                  perform(
                    s.id,
                    () =>
                      mutate(`/projects/${p.id}/secrets/${s.name}`, "DELETE"),
                    "Variable removed.",
                  )
                }
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              void perform(
                "secret",
                async () => {
                  await mutate(
                    `/projects/${p.id}/secrets`,
                    "PUT",
                    Object.fromEntries(f),
                  );
                  form.reset();
                },
                "Variable stored securely.",
              );
            }}
          >
            <div className="form-grid">
              <label>
                Variable name
                <input
                  name="name"
                  placeholder="TEST_PASSWORD"
                  required
                  pattern="[A-Z][A-Z0-9_]{1,63}"
                />
              </label>
              <label>
                Secret value
                <input
                  name="value"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Encrypted at rest"
                />
              </label>
            </div>
            <Button type="submit" busy={busy === "secret"}>
              <Plus size={15} /> Save variable
            </Button>
          </form>
        </div>
      </section>
      <section className="panel form-panel">
        <div className="form-section">
          <div className="section-title">
            <GitBranch size={20} />
            <h2>Deployment webhook</h2>
          </div>
          <p>
            Available on Starter and Growth. Generate a signing secret, store it
            in your CI secrets, and enable deployment triggers on selected
            tests.
          </p>
          <Button
            busy={busy === "webhook"}
            onClick={() =>
              perform(
                "webhook",
                async () =>
                  setWebhook(await mutate(`/projects/${p.id}/webhook`, "POST")),
                "Signing secret generated. Copy it now; it won’t be shown again.",
              )
            }
          >
            {p.webhookConfigured
              ? "Rotate signing secret"
              : "Generate signing secret"}
          </Button>
          {webhook && (
            <div className="webhook-result">
              <label>
                Endpoint<code className="copy-value">{webhook.url}</code>
              </label>
              <label>
                Signing secret · shown once
                <code className="copy-value">{webhook.secret}</code>
              </label>
              <Button
                className="small"
                onClick={() =>
                  navigator.clipboard
                    .writeText(webhook.secret)
                    .then(() => setMessage("Copied signing secret."))
                    .catch(() =>
                      setMessage("Select and copy the secret manually."),
                    )
                }
              >
                <Copy size={14} /> Copy secret
              </Button>
            </div>
          )}
          <Link className="text-link" href="/docs#deployments">
            Signing and CI instructions <ArrowUpRight size={14} />
          </Link>
          {!!p.deployments?.length && (
            <>
              <h3>Recent deployment events</h3>
              {p.deployments.map((d) => (
                <div className="secret-row" key={d.id}>
                  <GitBranch size={14} />
                  <code>{d.label || d.eventId}</code>
                  <span>{date(d.createdAt)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
      <section className="panel danger-zone">
        <div>
          <h3>Delete project</h3>
          <p>
            Permanently remove this project, its tests, history and artifacts.
          </p>
        </div>
        <Button className="danger" onClick={() => setConfirm(true)}>
          Delete project
        </Button>
      </section>
      {confirm && (
        <Confirm
          title={`Delete ${p.name}?`}
          description="This removes every saved test, result and artifact in this project. This cannot be undone."
          confirm="Delete project"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            await mutate(`/projects/${p.id}`, "DELETE", {
              confirmation: p.name,
            });
            router.push("/dashboard/projects");
          }}
        />
      )}
    </div>
  );
}
const initialDefinition: Definition = {
  startPath: "/",
  viewport: "desktop",
  timeout: 60,
  stepTimeout: 10,
  steps: [
    {
      action: "assertVisible",
      locator: "role=heading|Your page heading",
      label: "Verify the page heading",
    },
  ],
};
export function TestEditor({
  projectId,
  testId,
}: {
  projectId: string;
  testId?: string;
}) {
  const router = useRouter();
  const { data: project, error: projectError } = useResource<Project>(
    `/projects/${projectId}`,
  );
  const [test, setTest] = useState<Test>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [definition, setDefinition] = useState<Definition>(initialDefinition);
  const [status, setStatus] = useState("active");
  const [tags, setTags] = useState("");
  const [deploymentEnabled, setDeploymentEnabled] = useState(false);
  const [mode, setMode] = useState("manual");
  const [prompt, setPrompt] = useState("");
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (testId)
      api<Test>(`/tests/${testId}`)
        .then((t) => {
          if (t.projectId !== projectId)
            throw new Error("This test belongs to another project");
          setTest(t);
          setName(t.name);
          setDescription(t.description);
          setDefinition(t.definition!);
          setStatus(t.status);
          setTags(t.tags.join(", "));
          setDeploymentEnabled(t.deploymentEnabled);
        })
        .catch((e) => setError(e.message));
  }, [testId, projectId]);
  const update = (i: number, step: Partial<Step>) =>
    setDefinition((d) => ({
      ...d,
      steps: d.steps.map((s, n) => (n === i ? { ...s, ...step } : s)),
    }));
  const move = (i: number, offset: number) =>
    setDefinition((d) => {
      const steps = [...d.steps];
      [steps[i], steps[i + offset]] = [steps[i + offset], steps[i]];
      return { ...d, steps };
    });
  async function generate() {
    setBusy("ai");
    setError("");
    try {
      const draft = await mutate<{
        name: string;
        description: string;
        definition: Definition;
        missingInformation: string[];
      }>("/ai/generate-test", "POST", { projectId, prompt });
      setName(draft.name);
      setDescription(draft.description);
      setDefinition(draft.definition);
      setAssumptions(draft.missingInformation);
      setGenerated(true);
      setReviewed(false);
      setMode("manual");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!definition.steps.some((s) => s.action.startsWith("assert"))) {
      setError("Add at least one assertion that proves the journey worked.");
      return;
    }
    if (generated && !reviewed) {
      setError("Review the generated plan and confirm the review checkbox.");
      return;
    }
    setBusy("save");
    setError("");
    try {
      await mutate(
        testId ? `/tests/${testId}` : `/projects/${projectId}/tests`,
        testId ? "PATCH" : "POST",
        {
          name,
          description,
          status,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          deploymentEnabled,
          definition,
          ...(test ? { expectedVersion: test.currentVersion } : {}),
        },
      );
      router.push(`/dashboard/projects/${projectId}/tests`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  if (!project)
    return projectError ? <Notice message={projectError} /> : <Loading />;
  return (
    <>
      <Link
        className="back-link"
        href={`/dashboard/projects/${projectId}/tests`}
      >
        <ArrowLeft size={15} /> {project.name} / Tests
      </Link>
      <PageHead
        eyebrow={
          test
            ? `EDITING VERSION ${test.currentVersion}`
            : "DEFINE WHAT SHOULD WORK"
        }
        title={test ? "Edit test" : "Create a new test"}
        description="A good test tells a simple story—and proves the ending."
      />
      {error && <Notice message={error} onClose={() => setError("")} />}
      <div className="editor-modes">
        <button
          className={mode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
        >
          <Terminal size={17} /> Build manually
          <span>Choose actions and assertions</span>
        </button>
        <button
          className={mode === "ai" ? "active" : ""}
          onClick={() => setMode("ai")}
        >
          <Sparkles size={17} /> Describe with AI
          <span>Draft a plan, then review it</span>
        </button>
      </div>
      {mode === "ai" && (
        <section className="panel ai-builder">
          <span className="eyebrow">
            <Sparkles size={13} /> YOUR WORDS. A TESTABLE PLAN.
          </span>
          <h2>What should your website do?</h2>
          <textarea
            aria-label="Describe the test journey"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Open /pricing, click the Get started button, and confirm the signup form is visible. The button has test ID pricing-cta."
          />
          <div>
            <small>
              Include a clear expected result and known locators. Reference
              variable names; never paste credentials.
            </small>
            <Button
              className="primary"
              disabled={prompt.length < 15}
              busy={busy === "ai"}
              onClick={generate}
            >
              <Sparkles size={15} /> Generate draft
            </Button>
          </div>
        </section>
      )}
      <form onSubmit={save} className="editor-layout">
        <div className="editor-main">
          <section className="panel form-panel">
            <div className="form-section">
              <h2>Test details</h2>
              <label>
                Test name
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sign in and reach the dashboard"
                />
              </label>
              <label>
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="What user journey does this protect?"
                />
              </label>
              <div className="form-grid">
                <label>
                  Starting route
                  <input
                    value={definition.startPath}
                    onChange={(e) =>
                      setDefinition({
                        ...definition,
                        startPath: e.target.value,
                      })
                    }
                    required
                    placeholder="/login"
                  />
                </label>
                <label>
                  Tags
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="auth, critical, smoke"
                  />
                </label>
              </div>
            </div>
          </section>
          <section className="panel steps-panel">
            <div className="panel-head">
              <div>
                <h2>
                  Browser steps{" "}
                  <span className="count-chip">{definition.steps.length}</span>
                </h2>
                <p>
                  Executed in order. Assertions decide whether the test passes.
                </p>
              </div>
              <span className="mono">MAX 40</span>
            </div>
            {assumptions.length > 0 && (
              <div className="review-notice">
                <b>Review these assumptions</b>
                <ul>
                  {assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="step-editor-list">
              {definition.steps.map((s, i) => (
                <div
                  className={`step-editor ${s.action.startsWith("assert") ? "assertion" : ""}`}
                  key={i}
                >
                  <div className="step-editor-top">
                    <span className="step-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <select
                      aria-label={`Step ${i + 1} action`}
                      value={s.action}
                      onChange={(e) =>
                        update(i, {
                          action: e.target.value,
                          secret: undefined,
                          value: undefined,
                          locator: undefined,
                        })
                      }
                    >
                      {Object.entries(actionNames).map(([value, label]) => (
                        <option value={value} key={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {s.action.startsWith("assert") && (
                      <span className="assertion-label">ASSERTION</span>
                    )}
                    <div className="step-controls">
                      <button
                        type="button"
                        aria-label={`Move step ${i + 1} up`}
                        disabled={!i}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move step ${i + 1} down`}
                        disabled={i === definition.steps.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove step ${i + 1}`}
                        onClick={() =>
                          setDefinition({
                            ...definition,
                            steps: definition.steps.filter((_, n) => i !== n),
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="step-fields">
                    <label>
                      Step label <small>optional</small>
                      <input
                        value={s.label || ""}
                        onChange={(e) => update(i, { label: e.target.value })}
                        placeholder="Describe this step"
                      />
                    </label>
                    {!["navigate", "assertUrl", "assertTitle"].includes(
                      s.action,
                    ) && (
                      <label>
                        Locator
                        <input
                          required
                          value={s.locator || ""}
                          onChange={(e) =>
                            update(i, { locator: e.target.value })
                          }
                          placeholder="role=button|Sign in"
                        />
                      </label>
                    )}
                    {s.action === "fill" && (
                      <label>
                        Input source
                        <select
                          value={s.secret !== undefined ? "secret" : "literal"}
                          onChange={(e) =>
                            update(i, {
                              secret:
                                e.target.value === "secret" ? "" : undefined,
                              value: undefined,
                            })
                          }
                        >
                          <option value="literal">Literal value</option>
                          <option value="secret">Secret variable</option>
                        </select>
                      </label>
                    )}
                    {s.secret !== undefined ? (
                      <label>
                        Variable name
                        <select
                          required
                          value={s.secret}
                          onChange={(e) =>
                            update(i, { secret: e.target.value })
                          }
                        >
                          <option value="">Choose a variable</option>
                          {project.secrets?.map((v) => (
                            <option key={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      [
                        "navigate",
                        "fill",
                        "select",
                        "press",
                        "assertText",
                        "assertUrl",
                        "assertTitle",
                        "assertState",
                      ].includes(s.action) && (
                        <label>
                          {s.action.startsWith("assert")
                            ? "Expected value"
                            : "Value"}
                          {s.action === "assertState" ? (
                            <select
                              required
                              value={s.value || ""}
                              onChange={(e) =>
                                update(i, { value: e.target.value })
                              }
                            >
                              <option value="">Choose state</option>
                              {[
                                "enabled",
                                "disabled",
                                "checked",
                                "unchecked",
                                "hidden",
                                "editable",
                              ].map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              required
                              value={s.value || ""}
                              onChange={(e) =>
                                update(i, { value: e.target.value })
                              }
                              placeholder={
                                s.action === "navigate"
                                  ? "/pricing"
                                  : s.action === "assertUrl"
                                    ? "/dashboard"
                                    : "Expected value or input"
                              }
                            />
                          )}
                        </label>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="add-step"
              type="button"
              disabled={definition.steps.length >= 40}
              onClick={() =>
                setDefinition({
                  ...definition,
                  steps: [
                    ...definition.steps,
                    { action: "click", locator: "" },
                  ],
                })
              }
            >
              <Plus size={16} /> Add a step
            </button>
          </section>
          {generated && (
            <label className="review-check">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
              />{" "}
              I reviewed the AI draft, corrected locators and resolved missing
              information.
            </label>
          )}
          <label className="review-check">
            <input
              type="checkbox"
              required
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
            />{" "}
            I approve these actions on my authorized test site. Any payments use
            a sandbox and any data-changing actions are intentional.
          </label>
          <div className="editor-save">
            <Link
              className="button"
              href={`/dashboard/projects/${projectId}/tests`}
            >
              Cancel
            </Link>
            <Button
              className="primary"
              type="submit"
              busy={busy === "save"}
              disabled={!!testId && !test}
            >
              <Save size={16} /> {test ? "Save new version" : "Save test"}
            </Button>
          </div>
        </div>
        <aside className="editor-aside">
          <section className="panel form-section">
            <h3>Run settings</h3>
            <label>
              Viewport
              <select
                value={definition.viewport}
                onChange={(e) =>
                  setDefinition({
                    ...definition,
                    viewport: e.target.value as "desktop" | "mobile",
                  })
                }
              >
                <option value="desktop">Desktop · 1440 × 900</option>
                <option value="mobile">Mobile · 390 × 844</option>
              </select>
            </label>
            <label>
              Overall timeout (seconds)
              <input
                type="number"
                min={5}
                max={120}
                value={definition.timeout}
                onChange={(e) =>
                  setDefinition({
                    ...definition,
                    timeout: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Step timeout (seconds)
              <input
                type="number"
                min={1}
                max={30}
                value={definition.stepTimeout}
                onChange={(e) =>
                  setDefinition({
                    ...definition,
                    stepTimeout: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={deploymentEnabled}
                onChange={(e) => setDeploymentEnabled(e.target.checked)}
              />{" "}
              Run on deployment
            </label>
          </section>
          <div className="editor-tip">
            <ShieldCheck size={20} />
            <h3>Make the result meaningful.</h3>
            <p>
              At least one assertion is required. Check what the user expects to
              happen, not just that a page loaded.
            </p>
            <Link href="/docs#test-actions">
              Locator guide <ArrowUpRight size={13} />
            </Link>
          </div>
          {test && (
            <div className="editor-management">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const t = await mutate<Test>(
                      `/tests/${test.id}/duplicate`,
                      "POST",
                    );
                    router.push(
                      `/dashboard/projects/${projectId}/tests/${t.id}/edit`,
                    );
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <Copy size={15} /> Duplicate test
              </Button>
              <Button
                type="button"
                className="danger"
                onClick={() => setConfirm(true)}
              >
                <Trash2 size={15} /> Delete test
              </Button>
            </div>
          )}
        </aside>
      </form>
      {confirm && test && (
        <Confirm
          title="Delete this test?"
          description="This permanently removes the test and its historical reports."
          confirm="Delete test"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            await mutate(`/tests/${test.id}`, "DELETE");
            router.push(`/dashboard/projects/${projectId}/tests`);
          }}
        />
      )}
    </>
  );
}
function Monitoring({
  tests,
  refresh,
}: {
  tests: Test[];
  refresh: () => Promise<void>;
}) {
  return (
    <>
      <div className="info-callout">
        <Clock />
        <div>
          <h3>Confidence, on a schedule.</h3>
          <p>
            Runs use your monthly allowance and never overlap the same test.
            Choose the timezone for your daily run hour.
          </p>
        </div>
      </div>
      {tests.length ? (
        tests.map((t) => <ScheduleForm key={t.id} test={t} refresh={refresh} />)
      ) : (
        <Empty
          title="Create a test first"
          description="Your saved tests will appear here with scheduling controls."
        />
      )}
    </>
  );
}
function ScheduleForm({
  test: t,
  refresh,
}: {
  test: Test;
  refresh: () => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(t.schedule?.enabled || false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="panel schedule-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        try {
          await mutate(`/tests/${t.id}/schedule`, "PUT", {
            enabled,
            frequency: f.get("frequency"),
            hour: Number(f.get("hour")),
            timezone: f.get("timezone"),
          });
          await refresh();
          setError("Schedule saved.");
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="section-title">
        <h3>{t.name}</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />{" "}
          Monitoring enabled
        </label>
      </div>
      <div className="form-grid schedule-fields">
        <label>
          Frequency
          <select
            name="frequency"
            defaultValue={t.schedule?.frequency || "daily"}
          >
            <option value="daily">Daily · All plans</option>
            <option value="six-hourly">Every 6 hours · Starter</option>
            <option value="hourly">Hourly · Growth</option>
          </select>
        </label>
        <label>
          Local hour (0–23)
          <input
            name="hour"
            type="number"
            min={0}
            max={23}
            defaultValue={t.schedule?.hour ?? 9}
          />
        </label>
        <label>
          Timezone
          <input
            name="timezone"
            required
            defaultValue={
              t.schedule?.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone ||
              "UTC"
            }
            placeholder="Asia/Kolkata"
          />
        </label>
      </div>
      <div className="schedule-footer">
        <span>
          {t.schedule?.enabled
            ? `Next: ${date(t.schedule.nextRunAt)}`
            : "Monitoring is off"}
          {t.schedule?.lastError && (
            <small className="error-text">{t.schedule.lastError}</small>
          )}
        </span>
        <Button type="submit" busy={busy}>
          Save schedule
        </Button>
      </div>
      {error && <Notice message={error} />}
    </form>
  );
}
export function RunReport({
  projectId,
  runId,
}: {
  projectId: string;
  runId: string;
}) {
  const {
    data: r,
    error,
    loading,
    refresh,
    setData,
  } = useResource<Run>(`/runs/${runId}`, 3000);
  const [selected, setSelected] = useState<number>();
  const [busy, setBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const router = useRouter();
  if (loading) return <Loading />;
  if (!r) return <Notice message={error} />;
  if (r.projectId !== projectId)
    return <Notice message="This run belongs to another project." />;
  const active = ["queued", "preparing", "running"].includes(r.status);
  const step = r.steps?.find(
    (s) =>
      s.position ===
      (selected ?? r.steps?.find((s) => s.status === "failed")?.position ?? 0),
  );
  const doAction = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const artifact = async (id: string) => {
    const result = await api<{ url: string }>(`/artifacts/${id}`);
    window.open(result.url, "_blank", "noopener,noreferrer");
  };
  return (
    <>
      <Link
        className="back-link"
        href={`/dashboard/projects/${projectId}/runs`}
      >
        <ArrowLeft size={15} /> {r.project?.name} / Run history
      </Link>
      <PageHead
        eyebrow={`RUN #${r.id.slice(0, 8).toUpperCase()}`}
        title={r.testName}
        description={`${r.environment} · ${date(r.createdAt)} · Test version ${r.version?.number}`}
      >
        <Badge status={r.status} />
        {active ? (
          <Button
            busy={busy === "cancel"}
            onClick={() =>
              doAction("cancel", async () => {
                await mutate(`/runs/${r.id}/cancel`, "POST");
                await refresh();
              })
            }
          >
            <X size={15} /> Cancel run
          </Button>
        ) : (
          <Button
            busy={busy === "retry"}
            onClick={() =>
              doAction("retry", async () => {
                const next = await mutate<Run>(`/runs/${r.id}/retry`, "POST");
                router.push(`/dashboard/projects/${projectId}/runs/${next.id}`);
              })
            }
          >
            <RefreshCw size={15} /> Run again
          </Button>
        )}
      </PageHead>
      {(error || actionError) && <Notice message={error || actionError} />}
      <div className="run-summary">
        <div>
          <span>DURATION</span>
          <b>{duration(r.durationMs)}</b>
        </div>
        <div>
          <span>STEPS PASSED</span>
          <b>
            {r.steps?.filter((s) => s.status === "passed").length || 0}{" "}
            <small>/ {r.version?.definition.steps.length || 0}</small>
          </b>
        </div>
        <div>
          <span>BROWSER</span>
          <b>
            Chromium <small>{r.version?.definition.viewport}</small>
          </b>
        </div>
        <div>
          <span>TRIGGER</span>
          <b>{r.trigger}</b>
        </div>
      </div>
      {active && (
        <div className="info-callout">
          <RefreshCw className="spin" />
          <div>
            <h3>
              {r.status === "queued"
                ? "Waiting for an available worker…"
                : "Your browser test is running…"}
            </h3>
            <p>
              This report updates automatically. You can leave this page and
              return later.
            </p>
          </div>
        </div>
      )}
      {r.error && (
        <div className="failure-banner">
          <X size={20} />
          <div>
            <b>
              {r.status === "infrastructure_error"
                ? "Execution infrastructure error"
                : "The journey did not complete as expected."}
            </b>
            <pre>{r.error}</pre>
          </div>
        </div>
      )}
      <div className="report-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Execution timeline</h2>
            <span className="mono">{r.steps?.length || 0} STEPS</span>
          </div>
          {r.version?.definition.steps.map((s, i) => {
            const result = r.steps?.find((step) => step.position === i);
            return (
              <button
                key={i}
                className={`report-step ${step?.position === i ? "selected" : ""}`}
                onClick={() => setSelected(i)}
              >
                <span className={`step-dot ${result?.status || "queued"}`}>
                  {result?.status === "passed" ? (
                    <Check size={12} />
                  ) : result?.status === "failed" ? (
                    <X size={12} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span>
                  <b>{s.label || actionNames[s.action]}</b>
                  <small>
                    {s.secret
                      ? `Secret: ${s.secret}`
                      : s.locator || s.value || actionNames[s.action]}
                  </small>
                </span>
                <code>{duration(result?.durationMs)}</code>
              </button>
            );
          })}
        </section>
        <section className="panel step-detail">
          <div className="panel-head">
            <h2>Step details</h2>
            {step && <Badge status={step.status} />}
          </div>
          {step ? (
            <div className="form-section">
              <h3>{actionNames[step.action]}</h3>
              <label>
                Expected
                <code className="copy-value">{step.expected || "—"}</code>
              </label>
              <label>
                Observed URL
                <code className="copy-value">
                  {step.actual || "Not executed"}
                </code>
              </label>
              {step.error && <pre className="error-log">{step.error}</pre>}
            </div>
          ) : (
            <Empty
              title={active ? "Waiting for evidence" : "Step not executed"}
              description="Select a completed step to inspect the observed result."
            />
          )}
        </section>
      </div>
      <div className="report-grid">
        <section className="panel form-section">
          <h2>Browser evidence</h2>
          <p>
            Artifacts are private and download links expire after 60 seconds.
          </p>
          {r.artifacts?.length ? (
            <div className="artifact-list">
              {r.artifacts.map((a) => (
                <Button
                  key={a.id}
                  onClick={() => doAction(a.id, () => artifact(a.id))}
                  busy={busy === a.id}
                  disabled={new Date(a.expiresAt) < new Date()}
                >
                  <Download size={16} />
                  {a.kind} <small>{(a.size / 1024).toFixed(0)} KB</small>
                </Button>
              ))}
            </div>
          ) : (
            <p className="muted">
              {r.version?.definition.steps.some((s) => s.secret)
                ? "Visual artifacts are disabled for tests that use secrets."
                : "No artifacts are available for this run."}
            </p>
          )}
          <h3>Console errors</h3>
          <pre className="diagnostic-log">
            {r.consoleErrors?.join("\n") || "No console errors recorded."}
          </pre>
          <h3>Failed network requests</h3>
          <pre className="diagnostic-log">
            {r.networkErrors?.join("\n") || "No failed requests recorded."}
          </pre>
        </section>
        <section className="panel form-section ai-explanation">
          <div className="section-title">
            <Sparkles size={19} />
            <h2>Make sense of the failure</h2>
          </div>
          <p>
            AI separates recorded evidence from possible causes. It doesn’t
            change your test or its result.
          </p>
          {r.explanation ? (
            <ExplanationView explanation={r.explanation} />
          ) : (
            <Button
              disabled={
                !["failed", "timed_out", "infrastructure_error"].includes(
                  r.status,
                )
              }
              busy={busy === "explain"}
              onClick={() =>
                doAction("explain", async () => {
                  const explanation = await mutate<Explanation>(
                    `/runs/${r.id}/explain`,
                    "POST",
                  );
                  setData({ ...r, explanation });
                })
              }
            >
              <Sparkles size={15} /> Explain this failure
            </Button>
          )}
        </section>
      </div>
      <section className="panel form-section">
        <h2>Compare with the last passing run</h2>
        {r.previous ? (
          <>
            <div className="comparison">
              <div>
                <span className="eyebrow">PREVIOUS PASS</span>
                <h3>{date(r.previous.createdAt)}</h3>
                <Badge status="passed" />
                <p>
                  {duration(r.previous.durationMs)} ·{" "}
                  {
                    r.previous.steps?.filter((s) => s.status === "passed")
                      .length
                  }{" "}
                  passed steps
                </p>
                <Link
                  className="text-link"
                  href={`/dashboard/projects/${projectId}/runs/${r.previous.id}`}
                >
                  Open previous report <ArrowUpRight size={14} />
                </Link>
                <ScreenshotPreview run={r.previous} />
              </div>
              <div>
                <span className="eyebrow">THIS RUN</span>
                <h3>{date(r.createdAt)}</h3>
                <Badge status={r.status} />
                <p>
                  {duration(r.durationMs)} ·{" "}
                  {r.steps?.filter((s) => s.status === "passed").length} passed
                  steps
                </p>
                <ScreenshotPreview run={r} />
              </div>
            </div>
            <div className="comparison-steps">
              {r.steps?.map((s) => (
                <div key={s.position}>
                  <span>
                    Step {s.position + 1} · {actionNames[s.action]}
                  </span>
                  <Badge
                    status={
                      r.previous?.steps?.find((p) => p.position === s.position)
                        ?.status || "not present"
                    }
                  />
                  <ArrowRight size={13} />
                  <Badge status={s.status} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">
            There isn’t an earlier passing run for this test yet.
          </p>
        )}
        {r.retryOf && (
          <p>
            This is a retry of{" "}
            <Link href={`/dashboard/projects/${projectId}/runs/${r.retryOf}`}>
              run {r.retryOf.slice(0, 8)}
            </Link>
            . It uses the latest saved test version.
          </p>
        )}
      </section>
    </>
  );
}
function ExplanationView({ explanation: e }: { explanation: Explanation }) {
  return (
    <div className="explanation">
      <h3>Observed issue</h3>
      <p>{e.observed}</p>
      {[
        ["Evidence", e.evidence],
        ["Possible causes · hypotheses", e.possibleCauses],
        ["Suggested investigation", e.nextSteps],
      ].map(([title, items]) => (
        <div key={title as string}>
          <h3>{title as string}</h3>
          <ul>
            {(items as string[]).map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ScreenshotPreview({run}: {run: Run}) {
  const shot = run.artifacts?.find((item) => item.kind === "screenshot");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!shot) return <p className="muted">No screenshot available.</p>;
  return <div className="screenshot-preview">
    {url ? <Image src={url} width={1280} height={800} unoptimized alt={`Browser screenshot from ${run.status} run ${run.id.slice(0,8)}`} onError={() => {setUrl("");setError("The image link expired or could not load. Try again.");}} /> : <Button busy={busy} onClick={async () => {setBusy(true);setError("");try {const result = await api<{url:string}>(`/artifacts/${shot.id}?preview=1`);setUrl(result.url);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>View screenshot</Button>}
    {error && <Notice message={error} />}
  </div>;
}
