"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Folder,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
  CheckCheck,
  Play,
  RefreshCw,
} from "lucide-react";
import {
  api,
  mutate,
  ApiError,
  Me,
  DashboardData,
  Project,
  Run,
  Usage,
  date,
  duration,
} from "@/lib/hive";
import {
  Logo,
  ThemeToggle,
  Badge,
  Button,
  Empty,
  Loading,
  Notice,
  PageHead,
} from "./ui";
import { useResource } from "@/lib/use-resource";
import { ProjectDetail, ProjectForm, TestEditor, RunReport } from "./projects";
import { AccountSettings, AdminPanel, Billing } from "./settings";
const nav = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Projects", "/dashboard/projects", Folder],
  ["Activity", "/dashboard/activity", Activity],
  ["Usage", "/dashboard/usage", BarChart3],
  ["Settings", "/dashboard/settings/profile", Settings],
] as const;
export default function Dashboard() {
  const path = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me>();
  const [authError, setAuthError] = useState("");
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    api<Me>("/me")
      .then(setMe)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace("/login");
        else setAuthError(e.message);
      });
  }, [router]);
  const refreshMe = async () => setMe(await api<Me>("/me"));
  if (authError)
    return (
      <main className="standalone">
        <Logo />
        <h1>Your workspace is unavailable.</h1>
        <Notice message={authError} />
        <p>Check the API connection and database setup, then try again.</p>
        <Button onClick={() => location.reload()}>Retry connection</Button>
        <Link href="/" className="text-link">
          Back to home
        </Link>
      </main>
    );
  if (!me) return <Loading />;
  const parts = path.split("/").filter(Boolean).slice(1);
  let content: ReactNode;
  if (parts[0] === "projects" && parts[1] === "new")
    content = <ProjectForm onSaved={refreshMe} />;
  else if (parts[0] === "projects" && parts[1]) {
    const id = parts[1];
    if (parts[2] === "tests" && parts[3])
      content = (
        <TestEditor
          projectId={id}
          testId={parts[3] === "new" ? undefined : parts[3]}
        />
      );
    else if (parts[2] === "runs" && parts[3])
      content = <RunReport projectId={id} runId={parts[3]} />;
    else
      content = <ProjectDetail projectId={id} tab={parts[2] || "overview"} />;
  } else if (parts[0] === "projects") content = <Projects />;
  else if (parts[0] === "activity") content = <History />;
  else if (parts[0] === "usage") content = <UsagePage />;
  else if (parts[0] === "settings" && parts[1] === "billing")
    content = <Billing />;
  else if (parts[0] === "settings")
    content = (
      <AccountSettings
        me={me}
        tab={parts[1] || "profile"}
        onSaved={refreshMe}
      />
    );
  else if (parts[0] === "admin")
    content = (
      <AdminPanel
        allowed={me.user.role === "admin"}
        tab={parts[1] || "overview"}
      />
    );
  else if (parts.length === 0) content = <Overview name={me.user.name} />;
  else
    content = (
      <Empty
        title="Page not found"
        description="This workspace page does not exist."
        href="/dashboard"
        label="Back to overview"
      />
    );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {menu && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <Logo />
        <div className="workspace-switch">
          <span className="workspace-avatar">
            {me.user.name?.[0]?.toUpperCase() || "B"}
          </span>
          <div>
            <b>{me.workspace.name}</b>
            <small>Personal workspace</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <span className="sidebar-caption">WORKSPACE</span>
        <nav aria-label="Workspace navigation">
          {nav.map(([name, href, Icon]) => (
            <Link
              onClick={() => setMenu(false)}
              className={
                (
                  href === "/dashboard"
                    ? path === href
                    : path.startsWith(href.split("/profile")[0])
                )
                  ? "active"
                  : ""
              }
              href={href}
              key={name}
            >
              <Icon size={18} />
              {name}
              {name === "Projects" && (
                <span className="nav-count">{me.usage.projects}</span>
              )}
            </Link>
          ))}
          {me.user.role === "admin" && (
            <Link href="/dashboard/admin" onClick={() => setMenu(false)}>
              <ShieldCheck size={18} /> Administration
            </Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-mini">
            <div>
              <span>
                <Zap size={14} /> {me.usage.limits.name} plan
              </span>
              <Link href="/dashboard/settings/billing">
                Upgrade <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="meter">
              <i
                style={{
                  width: `${Math.min(100, (me.usage.runs / me.usage.limits.runs) * 100)}%`,
                }}
              />
            </div>
            <small>
              {me.usage.runs} of {me.usage.limits.runs} runs used
            </small>
          </div>
          <Link className="sidebar-help" href="/docs">
            <BookOpen size={17} /> Documentation <ArrowUpRight size={14} />
          </Link>
          <div className="sidebar-user">
            <div className="user-avatar">
              {me.user.name?.slice(0, 2).toUpperCase() || "BH"}
            </div>
            <div>
              <b>{me.user.name || "Developer"}</b>
              <small>{me.user.email}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={async () => {
                try {
                  await mutate("/auth/logout", "POST");
                  router.push("/login");
                } catch (e) {
                  setAuthError((e as Error).message);
                }
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-header">
          <div>
            <button
              className="icon-button mobile-only"
              onClick={() => setMenu(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={14} />
            <b>
              {parts[0]
                ? parts[0][0].toUpperCase() + parts[0].slice(1)
                : "Overview"}
            </b>
          </div>
          <div>
            <Link className="header-help" href="/dashboard/settings/feedback">
              Give feedback <ArrowUpRight size={13} />
            </Link>
            <span className="header-separator" />
            <ThemeToggle />
            <div className="user-avatar tiny">
              {me.user.name?.[0]?.toUpperCase() || "B"}
            </div>
          </div>
        </header>
        <main id="main-content" className="dashboard-content" key={path}>
          {content}
        </main>
        <footer className="app-footer">
          <span>Built for your next release.</span>
          <Link href="/docs">
            Help & documentation <ArrowUpRight size={12} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
function Overview({ name }: { name: string }) {
  const [days, setDays] = useState(7);
  const { data, error, loading, refresh } = useResource<DashboardData>(
    `/dashboard?days=${days}`,
    10000,
  );
  if (loading) return <Loading />;
  if (!data) return <Notice message={error} />;
  const passed = data.groups.find((g) => g.status === "passed")?._count || 0;
  const failed = data.groups
    .filter((g) => ["failed", "timed_out"].includes(g.status))
    .reduce((n, g) => n + g._count, 0);
  const total = data.groups.reduce((n, g) => n + g._count, 0);
  const rate =
    passed + failed
      ? `${((passed / (passed + failed)) * 100).toFixed(1)}%`
      : "—";
  return (
    <>
      <PageHead
        eyebrow="LET’S KEEP THINGS RUNNING."
        title={`Welcome back${name ? `, ${name.split(" ")[0]}` : ""}.`}
        description="A clear view of your projects and the journeys that matter."
      >
        <select
          aria-label="Dashboard time period"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        <Link className="button primary" href="/dashboard/projects/new">
          <Plus size={16} /> New project
        </Link>
      </PageHead>
      {error && <Notice message={error} />}
      <div className="stat-grid">
        <Stat
          label="Active projects"
          value={data.projects.filter((p) => p.status === "active").length}
          note={`${data.projects.length} projects in your workspace`}
          icon={<Folder size={18} />}
        />
        <Stat
          label="Browser runs"
          value={total}
          note={`Across the last ${days} days`}
          icon={<Play size={18} />}
        />
        <Stat
          label="Test pass rate"
          value={rate}
          note="Completed assertions, excluding infra errors"
          icon={<CheckCheck size={18} />}
        />
        <Stat
          label="Failed runs"
          value={failed}
          note={
            failed
              ? "Open a report to investigate"
              : "No failing workflows in this period"
          }
          icon={<Activity size={18} />}
          danger={failed > 0}
        />
      </div>
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Test activity</h2>
              <p>Your saved journeys, checked over time.</p>
            </div>
            <div className="chart-legend">
              <span>
                <i />
                Passed
              </span>
              <span>
                <i />
                Failed
              </span>
            </div>
          </div>
          <ActivityChart data={data.daily} days={days} />
        </section>
        <section className="panel next-runs">
          <div className="panel-head">
            <div>
              <h2>On the schedule</h2>
              <p>Good habits, on autopilot.</p>
            </div>
            <Clock size={18} />
          </div>
          {data.schedules.length ? (
            data.schedules.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/projects/${s.test?.projectId}/monitoring`}
                className="schedule-item"
              >
                <span className="schedule-icon">
                  <Clock size={16} />
                </span>
                <div>
                  <b>{s.test?.name}</b>
                  <small>{date(s.nextRunAt)}</small>
                </div>
                <ChevronRight size={14} />
              </Link>
            ))
          ) : (
            <div className="mini-empty">
              <Clock size={27} />
              <h3>Make confidence a habit.</h3>
              <p>Add a test, then schedule your first recurring check.</p>
              <Link href="/dashboard/projects">
                Explore projects <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>
      </div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>
              Your projects{" "}
              <span className="count-chip">{data.projects.length}</span>
            </h2>
            <p>Every application. One place to check in.</p>
          </div>
          <Link className="text-link" href="/dashboard/projects">
            View all projects <ArrowUpRight size={15} />
          </Link>
        </div>
        {data.projects.length ? (
          <div className="project-grid compact">
            {data.projects.slice(0, 3).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <Empty
            title="Your first project starts here."
            description="Connect a website, verify the domain, and give your next release a second look."
            href="/dashboard/projects/new"
            label="Connect a website"
            icon={<Globe size={27} />}
          />
        )}
      </section>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Recent runs</h2>
            <p>The latest results from your workspace.</p>
          </div>
          <Button className="subtle small" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
        <RunTable runs={data.recent} />
      </section>
      {!data.projects.length && (
        <div className="onboarding-note">
          <Sparkles size={20} />
          <div>
            <h3>Not sure where to start?</h3>
            <p>
              A homepage heading or pricing-page link makes a great first check.
            </p>
          </div>
          <Link className="button" href="/demo">
            Explore a sample report <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </>
  );
}
export function Stat({
  label,
  value,
  note,
  icon,
  danger = false,
}: {
  label: string;
  value: ReactNode;
  note: string;
  icon: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`stat-card ${danger ? "danger-stat" : ""}`}>
      <div>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function ActivityChart({
  data,
  days,
}: {
  data: { createdAt: string; status: string }[];
  days: number;
}) {
  const buckets = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (Math.min(days, 30) - 1 - i));
    const key = date.toISOString().slice(0, 10);
    const runs = data.filter((r) => r.createdAt.slice(0, 10) === key);
    return {
      key,
      passed: runs.filter((r) => r.status === "passed").length,
      failed: runs.filter((r) => ["failed", "timed_out"].includes(r.status))
        .length,
    };
  });
  const max = Math.max(1, ...buckets.map((b) => b.passed + b.failed));
  return (
    <div className="activity-chart">
      <div className="chart-scale">
        <span>{max}</span>
        <span>{Math.round(max / 2)}</span>
        <span>0</span>
      </div>
      <div className="chart-plot">
        <div className="chart-grid-lines">
          <i />
          <i />
          <i />
        </div>
        <div className="chart-bars">
          {buckets.map((b) => (
            <div
              className="chart-bar-slot"
              key={b.key}
              title={`${b.key}: ${b.passed} passed, ${b.failed} failed`}
            >
              <div
                className="chart-bar"
                style={{ height: `${((b.passed + b.failed) / max) * 100}%` }}
              >
                <i className="bar-failed" style={{ flex: b.failed }} />
                <i className="bar-passed" style={{ flex: b.passed }} />
              </div>
            </div>
          ))}
        </div>
        {!data.length && (
          <div className="chart-zero">
            Your activity will appear after your first run.
          </div>
        )}
        <div className="chart-dates">
          <span>{buckets[0].key.slice(5)}</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
export function ProjectCard({ project: p }: { project: Project }) {
  return (
    <Link className="project-card" href={`/dashboard/projects/${p.id}`}>
      <div className="project-card-top">
        <div className={`project-letter color-${p.name.length % 4}`}>
          {p.name[0]?.toUpperCase()}
        </div>
        <Badge status={p.status} />
      </div>
      <h3>
        {p.name}
        <ArrowUpRight size={17} />
      </h3>
      <p>{new URL(p.url).hostname}</p>
      <div className="project-card-bottom">
        <span>
          <LayersIcon />
          {p._count?.tests ?? p.tests?.length ?? 0} tests
        </span>
        <span>{p.environment}</span>
        {p.runs?.[0] ? (
          <Badge status={p.runs[0].status} />
        ) : (
          <small>No runs yet</small>
        )}
      </div>
    </Link>
  );
}
function LayersIcon() {
  return <CheckCheck size={13} />;
}
function Projects() {
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const { data, error, loading } = useResource<Project[]>(
    `/projects?archived=${archived}`,
  );
  return (
    <>
      <PageHead
        eyebrow="YOUR APPLICATIONS"
        title="Projects"
        description="One home for every user journey you want to protect."
      >
        <Link className="button primary" href="/dashboard/projects/new">
          <Plus size={16} /> New project
        </Link>
      </PageHead>
      <div className="filter-bar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search projects"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />{" "}
          Show archived
        </label>
      </div>
      {error && <Notice message={error} />}{" "}
      {loading ? (
        <Loading />
      ) : data?.length ? (
        <div className="project-grid">
          {data
            .filter((p) =>
              `${p.name} ${p.url}`.toLowerCase().includes(search.toLowerCase()),
            )
            .map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
        </div>
      ) : (
        <section className="panel">
          <Empty
            title="Something worth checking?"
            description="Add your first website and start with a journey your customers rely on."
            href="/dashboard/projects/new"
            label="Create project"
          />
        </section>
      )}
    </>
  );
}
export function RunTable({ runs }: { runs: Run[] }) {
  return runs.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Test / run</th>
            <th>Status</th>
            <th>Environment</th>
            <th>Duration</th>
            <th>Trigger</th>
            <th>Started</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id}>
              <td>
                <Link
                  className="table-main"
                  href={`/dashboard/projects/${r.projectId}/runs/${r.id}`}
                >
                  {r.testName}
                  <small>{r.project?.name || `#${r.id.slice(0, 8)}`}</small>
                </Link>
              </td>
              <td>
                <Badge status={r.status} />
              </td>
              <td>
                <span className="environment">
                  <i />
                  {r.environment}
                </span>
              </td>
              <td className="mono">{duration(r.durationMs)}</td>
              <td className="muted">{r.trigger}</td>
              <td className="muted nowrap">{date(r.createdAt)}</td>
              <td>
                <Link
                  aria-label={`View ${r.testName} run`}
                  href={`/dashboard/projects/${r.projectId}/runs/${r.id}`}
                >
                  <ArrowUpRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="A clean slate."
      description="Your browser runs and their results will appear here."
      icon={<Terminal size={25} />}
    />
  );
}
export function History({ projectId }: { projectId?: string }) {
  const [status, setStatus] = useState("");
  const [trigger, setTrigger] = useState("");
  const [environment, setEnvironment] = useState("");
  const [from, setFrom] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const query = new URLSearchParams({ page: String(page) });
  if (status) query.set("status", status);
  if (trigger) query.set("trigger", trigger);
  if (environment) query.set("environment", environment);
  if (from) query.set("from", new Date(from).toISOString());
  if (search) query.set("q", search);
  const { data, error, loading } = useResource<{ items: Run[]; total: number }>(
    `${projectId ? `/projects/${projectId}` : ""}/runs?${query}`,
    10000,
  );
  const change = (fn: () => void) => {
    fn();
    setPage(0);
  };
  return (
    <>
      {!projectId && (
        <PageHead
          eyebrow="EVERY RUN HAS A STORY"
          title="Activity"
          description="Find a failure, spot a recovery, and follow what changed."
        />
      )}
      <div className="filter-bar">
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search test names"
            value={search}
            onChange={(e) => change(() => setSearch(e.target.value))}
            placeholder="Search test names…"
          />
        </div>
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => change(() => setStatus(e.target.value))}
        >
          <option value="">All results</option>
          {[
            "passed",
            "failed",
            "queued",
            "running",
            "timed_out",
            "cancelled",
            "infrastructure_error",
          ].map((s) => (
            <option value={s} key={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter trigger"
          value={trigger}
          onChange={(e) => change(() => setTrigger(e.target.value))}
        >
          <option value="">All triggers</option>
          {["manual", "schedule", "deployment", "retry"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Filter environment"
          value={environment}
          onChange={(e) => change(() => setEnvironment(e.target.value))}
        >
          <option value="">All environments</option>
          <option>production</option>
          <option>staging</option>
        </select>
        <input
          type="date"
          aria-label="Runs after date"
          value={from}
          onChange={(e) => change(() => setFrom(e.target.value))}
        />
      </div>
      {error && <Notice message={error} />}
      <section className="panel">
        {loading ? <Loading /> : <RunTable runs={data?.items || []} />}
      </section>
      <div className="pagination">
        <span>
          {data?.total || 0} runs · Page {page + 1}
        </span>
        <Button disabled={!page} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button
          disabled={(page + 1) * 25 >= (data?.total || 0)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </>
  );
}
export function UsagePage() {
  const { data, error, loading } = useResource<Usage>("/usage");
  if (loading) return <Loading />;
  if (!data) return <Notice message={error} />;
  return (
    <>
      <PageHead
        eyebrow="NO SURPRISES"
        title="Usage & limits"
        description="Know exactly where you stand, before your next run."
      >
        <Link className="button primary" href="/dashboard/settings/billing">
          Manage plan <ArrowUpRight size={16} />
        </Link>
      </PageHead>
      <div className="usage-banner">
        <span className="feature-icon">
          <Zap />
        </span>
        <div>
          <h2>{data.limits.name} plan</h2>
          <p>Monthly usage resets on the first day of each UTC month.</p>
        </div>
        <Badge status="active" />
      </div>
      <div className="usage-grid">
        {(["projects", "tests", "runs", "ai"] as const).map((key) => (
          <section className="panel usage-card" key={key}>
            <h3>
              {
                {
                  projects: "Projects",
                  tests: "Saved tests",
                  runs: "Browser runs",
                  ai: "AI requests",
                }[key]
              }
            </h3>
            <strong>
              {data[key]} <span>/ {data.limits[key]}</span>
            </strong>
            <div className="meter">
              <i
                style={{
                  width: `${Math.min(100, (data[key] / data.limits[key]) * 100)}%`,
                }}
              />
            </div>
            <p>
              {Math.max(0, data.limits[key] - data[key])} remaining{" "}
              {key === "runs" || key === "ai" ? "this month" : ""}
            </p>
          </section>
        ))}
      </div>
      <div className="info-callout">
        <ShieldCheck />
        <div>
          <h3>You’re always in control.</h3>
          <p>
            Runs stop at your allowance. No automatic overages. Browser time
            consumed this month: {duration(data.browserMs)}. Artifacts are
            retained for {data.limits.retention} days.
          </p>
        </div>
      </div>
    </>
  );
}
