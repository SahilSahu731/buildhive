"use client";
import { useResource } from "@/lib/use-resource";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Download,
  Github,
  KeyRound,
  LogOut,
  Mail,
  MessageSquare,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { api, mutate, Me, Usage, date, duration } from "@/lib/hive";
import {
  Badge,
  Button,
  CheckLine,
  Confirm,
  Empty,
  Loading,
  Notice,
  PageHead,
} from "./ui";
import { Stat } from "./dashboard";
export function SettingsTabs({ tab }: { tab: string }) {
  return (
    <nav className="tabs" aria-label="Account settings">
      {["profile", "notifications", "security", "billing", "feedback"].map(
        (t) => (
          <Link
            href={`/dashboard/settings/${t}`}
            className={tab === t ? "active" : ""}
            key={t}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </Link>
        ),
      )}
    </nav>
  );
}
export function AccountSettings({
  me,
  tab,
  onSaved,
}: {
  me: Me;
  tab: string;
  onSaved: () => Promise<void>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [deletion, setDeletion] = useState("");
  const perform = async (
    key: string,
    fn: () => Promise<unknown>,
    success: string,
  ) => {
    setBusy(key);
    try {
      await fn();
      setMessage(success);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <PageHead
        eyebrow="MAKE YOURSELF AT HOME"
        title="Settings"
        description="Your profile, preferences, and account controls."
      />
      <SettingsTabs tab={tab} />
      {message && <Notice message={message} onClose={() => setMessage("")} />}
      <div className="settings-content">
        {tab === "profile" ? (
          <form
            className="panel form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void perform(
                "profile",
                async () => {
                  await mutate("/me", "PATCH", Object.fromEntries(form));
                  await onSaved();
                },
                "Your profile was saved.",
              );
            }}
          >
            <div className="form-section">
              <div className="section-title">
                <User size={19} />
                <h2>Personal profile</h2>
              </div>
              <label>
                Display name
                <input
                  name="name"
                  defaultValue={me.user.name}
                  required
                  maxLength={80}
                />
              </label>
              <label>
                Profile image URL
                <input
                  name="image"
                  defaultValue={me.user.image || ""}
                  type="url"
                  placeholder="https://…"
                />
                <small>Use a public HTTPS image URL.</small>
              </label>
              <label>
                Email address
                <input value={me.user.email} disabled />
                <small>Your email is managed by your login provider.</small>
              </label>
            </div>
            <div className="form-actions">
              <Button
                type="submit"
                className="primary"
                busy={busy === "profile"}
              >
                Save profile
              </Button>
            </div>
          </form>
        ) : tab === "notifications" ? (
          <>
            <form
              className="panel form-panel"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void perform(
                  "notifications",
                  async () => {
                    await mutate("/me", "PATCH", {
                      emailAlerts: f.has("emailAlerts"),
                      recoveryAlerts: f.has("recoveryAlerts"),
                    });
                    await onSaved();
                  },
                  "Notification preferences saved.",
                );
              }}
            >
              <div className="form-section">
                <div className="section-title">
                  <Mail size={19} />
                  <h2>Email notifications</h2>
                </div>
                <p>
                  Alerts go to {me.user.email}. Repeated unresolved failures are
                  suppressed.
                </p>
                <label className="setting-check">
                  <input
                    type="checkbox"
                    name="emailAlerts"
                    defaultChecked={me.workspace.emailAlerts}
                  />
                  <span>
                    <b>New failure alerts</b>
                    <small>
                      Get notified when a previously healthy workflow fails.
                    </small>
                  </span>
                </label>
                <label className="setting-check">
                  <input
                    type="checkbox"
                    name="recoveryAlerts"
                    defaultChecked={me.workspace.recoveryAlerts}
                  />
                  <span>
                    <b>Recovery alerts</b>
                    <small>
                      Know when a failing workflow starts passing again.
                    </small>
                  </span>
                </label>
              </div>
              <div className="form-actions">
                <Button
                  busy={busy === "test-email"}
                  onClick={() =>
                    perform(
                      "test-email",
                      () => mutate("/notifications/test", "POST"),
                      "Test notification sent. Check your inbox.",
                    )
                  }
                >
                  Send test email
                </Button>
                <Button
                  className="primary"
                  type="submit"
                  busy={busy === "notifications"}
                >
                  Save preferences
                </Button>
              </div>
            </form>
          </>
        ) : tab === "security" ? (
          <>
            <section className="panel form-section">
              <div className="section-title">
                <KeyRound size={19} />
                <h2>Connected login providers</h2>
              </div>
              <p>
                To connect another provider, sign in with the same verified
                email. BuildHive does not request repository access.
              </p>
              <div className="provider-row">
                <Github size={20} />
                <b>GitHub</b>
                <Badge
                  status={me.user.github ? "connected" : "not connected"}
                />
              </div>
              <div className="provider-row">
                <b className="google-g">G</b>
                <b>Google</b>
                <Badge
                  status={me.user.google ? "connected" : "not connected"}
                />
              </div>
            </section>
            <section className="panel form-section">
              <h2>Active sessions</h2>
              <p>
                End all other sessions while keeping this browser signed in.
              </p>
              <Button
                busy={busy === "revoke"}
                onClick={() =>
                  perform(
                    "revoke",
                    () => mutate("/me/sessions/revoke", "POST"),
                    "Other sessions were signed out.",
                  )
                }
              >
                <LogOut size={15} /> Sign out other sessions
              </Button>
            </section>
            <section className="panel form-section">
              <h2>Export your data</h2>
              <p>
                Download your projects, saved test versions, reports and
                variable names. Secret values and signing credentials are
                excluded.
              </p>
              <Button
                busy={busy === "export"}
                onClick={() =>
                  perform(
                    "export",
                    async () => {
                      const data = await api("/me/export");
                      const url = URL.createObjectURL(
                        new Blob([JSON.stringify(data, null, 2)], {
                          type: "application/json",
                        }),
                      );
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "buildhive-export.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    },
                    "Account export downloaded.",
                  )
                }
              >
                <Download size={15} /> Export account data
              </Button>
            </section>
            <section className="panel form-section danger-zone vertical">
              <h2>Delete your account</h2>
              <p>
                Cancel any paid subscription and active runs first. Account
                deletion removes projects, tests, run history and stored
                artifacts.
              </p>
              <label>
                Type DELETE MY ACCOUNT
                <input
                  value={deletion}
                  onChange={(e) => setDeletion(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <Button
                className="danger"
                disabled={deletion !== "DELETE MY ACCOUNT"}
                onClick={() => setConfirm(true)}
              >
                <Trash2 size={15} /> Delete account
              </Button>
            </section>
          </>
        ) : tab === "feedback" ? (
          <form
            className="panel form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const f = new FormData(form);
              void perform(
                "feedback",
                async () => {
                  await mutate("/feedback", "POST", Object.fromEntries(f));
                  form.reset();
                },
                "Thanks—your feedback has been recorded.",
              );
            }}
          >
            <div className="form-section">
              <div className="section-title">
                <MessageSquare size={19} />
                <h2>Help shape BuildHive</h2>
              </div>
              <p>
                Tell us what worked, what broke, or what you’d like to see next.
              </p>
              <label>
                Category
                <select name="type">
                  <option value="FEEDBACK">General feedback</option>
                  <option value="BUG">Bug report</option>
                  <option value="FEATURE_REQUEST">Feature request</option>
                </select>
              </label>
              <label>
                Subject
                <input name="title" required minLength={3} maxLength={100} />
              </label>
              <label>
                Details
                <textarea
                  name="description"
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={6}
                  placeholder="Include steps to reproduce and a run ID if relevant. Please do not include credentials."
                />
              </label>
            </div>
            <div className="form-actions">
              <Button
                type="submit"
                className="primary"
                busy={busy === "feedback"}
              >
                Send feedback
              </Button>
            </div>
          </form>
        ) : (
          <Empty
            title="Setting not found"
            description="Choose a settings tab above."
          />
        )}
      </div>
      {confirm && (
        <Confirm
          title="Permanently delete your account?"
          description="Your workspace, reports and private artifacts will be removed. This cannot be undone."
          confirm="Delete my account"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            await mutate("/me", "DELETE", { confirmation: deletion });
            router.push("/");
          }}
        />
      )}
    </>
  );
}
export function Billing() {
  const { data: usage, error } = useResource<Usage>("/usage");
  const { data: sub, refresh } = useResource<{
    plan: string;
    status: string;
    periodEnd?: string;
    configured: boolean;
  }>("/subscription");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [cancel, setCancel] = useState(false);
  if (!usage) return error ? <Notice message={error} /> : <Loading />;
  return (
    <>
      <PageHead
        eyebrow="ROOM TO GROW"
        title="Billing & plan"
        description="Predictable allowances for a predictable testing workflow."
      />
      <SettingsTabs tab="billing" />
      {message && <Notice message={message} />}
      <div className="usage-banner">
        <Zap size={26} />
        <div>
          <h2>{usage.limits.name} plan</h2>
          <p>
            {sub?.status || "Free"}
            {sub?.periodEnd
              ? ` · Current period ends ${date(sub.periodEnd)}`
              : " · No payment method required"}
          </p>
        </div>
        {sub?.plan !== "FREE" && sub?.status !== "cancelled" && (
          <Button onClick={() => setCancel(true)}>Cancel subscription</Button>
        )}
      </div>
      {sub && !sub.configured && (
        <Notice message="Paid plans are not configured yet. Your free workspace remains available." />
      )}
      <div className="pricing-grid dashboard-pricing">
        {[
          {
            key: "FREE",
            name: "Free",
            price: 0,
            items: [
              "1 project · 2 tests",
              "20 runs / month",
              "5 AI requests",
              "Daily monitoring",
              "7-day artifact retention",
            ],
          },
          {
            key: "STARTER",
            name: "Starter",
            price: 19,
            items: [
              "3 projects · 15 tests",
              "300 runs / month",
              "50 AI requests",
              "6-hour monitoring",
              "Deployment hooks",
              "30-day artifact retention",
            ],
          },
          {
            key: "GROWTH",
            name: "Growth",
            price: 49,
            items: [
              "10 projects · 100 tests",
              "1,500 runs / month",
              "200 AI requests",
              "Hourly monitoring",
              "Deployment hooks",
              "90-day artifact retention",
            ],
          },
        ].map((p) => (
          <section
            className={`pricing-card ${usage.plan === p.key ? "featured" : ""}`}
            key={p.key}
          >
            <h3>{p.name}</h3>
            <div className="price">
              ${p.price}
              <span>/ month</span>
            </div>
            {p.items.map((i) => (
              <CheckLine key={i}>{i}</CheckLine>
            ))}
            <Button
              className={p.key === "STARTER" ? "primary" : ""}
              disabled={
                p.key === "FREE" || usage.plan === p.key || !sub?.configured
              }
              busy={busy === p.key}
              onClick={async () => {
                setBusy(p.key);
                try {
                  const result = await mutate<{ url: string }>(
                    "/billing/checkout",
                    "POST",
                    { plan: p.key },
                  );
                  location.assign(result.url);
                } catch (e) {
                  setMessage((e as Error).message);
                } finally {
                  setBusy("");
                }
              }}
            >
              {usage.plan === p.key
                ? "Current plan"
                : p.key === "FREE"
                  ? "Free forever"
                  : `Choose ${p.name}`}
              <ArrowUpRight size={14} />
            </Button>
          </section>
        ))}
      </div>
      <p className="muted">
        Checkout is hosted by Razorpay. Billing currency and applicable taxes
        appear before payment. Changing plans requires cancelling the current
        subscription first.
      </p>
      {cancel && (
        <Confirm
          title="Cancel your subscription?"
          description="Paid access continues through the prepaid period. New runs will follow Free limits after that."
          confirm="Cancel subscription"
          onClose={() => setCancel(false)}
          onConfirm={async () => {
            await mutate("/billing/cancel", "POST");
            await refresh();
            setMessage(
              "Cancellation scheduled. Paid access remains until the current period ends.",
            );
          }}
        />
      )}
    </>
  );
}
interface AdminStats {
  users: number;
  subscriptions: number;
  jobs: { status: string; _count: number }[];
  storageBytes: number;
  aiRequests: number;
  notifications: { status: string; _count: number }[];
  workers: {
    id: string;
    lastSeenAt: string;
    healthy: boolean;
    metadata: Record<string, number>;
  }[];
  aiMetering: { kind: string; _sum: { units: number } }[];
  feedbackCount: number;
}
interface AdminUser {
  id: string;
  name: string;
  plan: string;
  suspended: boolean;
  owner: { name: string; email: string };
  createdAt: string;
}
interface AdminJob {
  id: string;
  status: string;
  createdAt: string;
  heartbeatAt?: string;
  attempt: number;
  durationMs?: number;
}
export function AdminPanel({
  allowed,
  tab,
}: {
  allowed: boolean;
  tab: string;
}) {
  if (!allowed) return <Notice message="Administrator access is required." />;
  return (
    <>
      <PageHead
        eyebrow="INTERNAL OPERATIONS"
        title="Administration"
        description="Sanitized operational metadata. Customer secrets are never displayed."
      />
      <nav className="tabs">
        {["overview", "users", "jobs", "feedback"].map((t) => (
          <Link
            key={t}
            href={`/dashboard/admin/${t}`}
            className={tab === t ? "active" : ""}
          >
            {t}
          </Link>
        ))}
      </nav>
      {tab === "users" ? (
        <AdminUsers />
      ) : tab === "jobs" ? (
        <AdminJobs />
      ) : tab === "feedback" ? (
        <AdminFeedback />
      ) : (
        <AdminOverview />
      )}
    </>
  );
}
function AdminOverview() {
  const { data, error } = useResource<AdminStats>("/admin/overview", 10000);
  if (!data) return error ? <Notice message={error} /> : <Loading />;
  return (
    <>
      <div className="stat-grid">
        <Stat
          label="Users"
          value={data.users}
          note="Registered accounts"
          icon={<User size={18} />}
        />
        <Stat
          label="Paid workspaces"
          value={data.subscriptions}
          note="Within subscription period"
          icon={<Zap size={18} />}
        />
        <Stat
          label="Stored artifacts"
          value={`${(data.storageBytes / 1024 / 1024).toFixed(1)} MB`}
          note="Before retention cleanup"
          icon={<Download size={18} />}
        />
        <Stat
          label="AI requests"
          value={data.aiRequests}
          note="All-time provider requests"
          icon={<MessageSquare size={18} />}
        />
      </div>
      <section className="panel form-section">
        <h2>Worker health</h2>
        {data.workers.length ? (
          data.workers.map((w) => (
            <div className="provider-row" key={w.id}>
              <code>{w.id.slice(0, 20)}</code>
              <Badge
                status={
                  w.healthy
                    ? "active"
                    : "offline"
                }
              />
              <small>
                Last heartbeat {date(w.lastSeenAt)} · {w.metadata.waiting || 0}{" "}
                waiting · {w.metadata.active || 0} active
              </small>
            </div>
          ))
        ) : (
          <Notice message="No worker heartbeat has been received. Start the worker service to execute queued tests." />
        )}
        <h3>AI metering</h3>
        {data.aiMetering.map((m) => (
          <div className="provider-row" key={m.kind}>
            <span>{m.kind.replaceAll("_", " ")}</span>
            <b>
              {m.kind === "ai_cost_micro_usd"
                ? `$${(m._sum.units / 1000000).toFixed(4)}`
                : m._sum.units.toLocaleString()}
            </b>
          </div>
        ))}
        <p className="muted">
          Costs are estimates only when operator-supplied per-token rates are
          configured.
        </p>
        <p>
          <Link href="/dashboard/admin/feedback">
            {data.feedbackCount} open feedback requests →
          </Link>
        </p>
        <h2>Execution health</h2>
        {data.jobs.map((j) => (
          <div className="provider-row" key={j.status}>
            <Badge status={j.status} />
            <b>{j._count}</b>
          </div>
        ))}
        <h3>Email delivery</h3>
        {data.notifications.map((n) => (
          <div className="provider-row" key={n.status}>
            <span>{n.status}</span>
            <b>{n._count}</b>
          </div>
        ))}
      </section>
    </>
  );
}
function AdminUsers() {
  const [page, setPage] = useState(0);
  const { data, error, refresh } = useResource<AdminUser[]>(
    `/admin/users?page=${page}`,
  );
  const [target, setTarget] = useState<AdminUser>();
  return (
    <>
      {error && <Notice message={error} />}
      <section className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.owner.name}
                  <small>{u.owner.email}</small>
                </td>
                <td>{u.plan}</td>
                <td>
                  <Badge status={u.suspended ? "suspended" : "active"} />
                </td>
                <td>
                  <Button className="small" onClick={() => setTarget(u)}>
                    {u.suspended ? "Restore" : "Suspend"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="pagination">
        <Button disabled={!page} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button
          disabled={(data?.length || 0) < 25}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
      {target && (
        <Confirm
          title={`${target.suspended ? "Restore" : "Suspend"} this workspace?`}
          description="This changes whether the workspace may access the API and run browser tests."
          onClose={() => setTarget(undefined)}
          onConfirm={async () => {
            await mutate(`/admin/users/${target.id}`, "PATCH", {
              suspended: !target.suspended,
            });
            await refresh();
          }}
        />
      )}
    </>
  );
}
function AdminJobs() {
  const { data, error, refresh } = useResource<AdminJob[]>(
    "/admin/jobs",
    10000,
  );
  const [message, setMessage] = useState("");
  return (
    <>
      {(error || message) && <Notice message={error || message} />}
      <section className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Run</th>
              <th>Status</th>
              <th>Heartbeat</th>
              <th>Duration</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.map((j) => (
              <tr key={j.id}>
                <td className="mono">{j.id.slice(0, 8)}</td>
                <td>
                  <Badge status={j.status} />
                </td>
                <td>{j.heartbeatAt ? date(j.heartbeatAt) : "—"}</td>
                <td>{duration(j.durationMs)}</td>
                <td>
                  {j.status === "infrastructure_error" && (
                    <Button
                      className="small"
                      onClick={async () => {
                        try {
                          await mutate(`/admin/jobs/${j.id}/retry`, "POST");
                          setMessage("Retry queued.");
                          await refresh();
                        } catch (e) {
                          setMessage((e as Error).message);
                        }
                      }}
                    >
                      Retry
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function AdminFeedback() {
  const [page, setPage] = useState(0);
  const { data, error, refresh } = useResource<
    {
      id: string;
      title: string;
      description: string;
      type: string;
      status: string;
      createdAt: string;
      user?: { name: string; email: string };
    }[]
  >(`/admin/feedback?page=${page}`);
  const [message, setMessage] = useState("");
  return (
    <>
      {(error || message) && <Notice message={error || message} />}
      <section className="panel form-section">
        <h2>Customer feedback</h2>
        {data?.length ? (
          data.map((f) => (
            <article key={f.id} className="feedback-item">
              <div className="section-title">
                <h3>{f.title}</h3>
                <Badge status={f.status.toLowerCase()} />
              </div>
              <p>{f.description}</p>
              <small>
                {f.user?.email || "Deleted account"} · {f.type} ·{" "}
                {date(f.createdAt)}
              </small>
              <label>
                Status
                <select
                  value={f.status}
                  onChange={async (e) => {
                    try {
                      await mutate(`/admin/feedback/${f.id}`, "PATCH", {
                        status: e.target.value,
                      });
                      await refresh();
                    } catch (e) {
                      setMessage((e as Error).message);
                    }
                  }}
                >
                  {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </article>
          ))
        ) : (
          <Empty
            title="No feedback yet"
            description="Submitted feedback and bug reports will appear here."
          />
        )}
      </section>
      <div className="pagination">
        <Button disabled={!page} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button
          disabled={(data?.length || 0) < 25}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </>
  );
}
