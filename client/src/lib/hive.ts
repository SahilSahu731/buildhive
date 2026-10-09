export interface Usage {
  plan: string;
  limits: {
    name: string;
    price: number;
    projects: number;
    tests: number;
    runs: number;
    ai: number;
    retention: number;
    frequencies: string[];
    webhooks: boolean;
  };
  projects: number;
  tests: number;
  runs: number;
  ai: number;
  browserMs: number;
  renewsAt: string;
}
export interface Me {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    github: boolean;
    google: boolean;
  };
  workspace: {
    id: string;
    name: string;
    plan: string;
    emailAlerts: boolean;
    recoveryAlerts: boolean;
  };
  usage: Usage;
}
export interface Step {
  action: string;
  locator?: string;
  value?: string;
  secret?: string;
  label?: string;
}
export interface Definition {
  startPath: string;
  viewport: "desktop" | "mobile";
  timeout: number;
  stepTimeout: number;
  steps: Step[];
}
export interface Schedule {
  id: string;
  testId: string;
  enabled: boolean;
  frequency: string;
  hour: number;
  timezone: string;
  nextRunAt: string;
  lastError?: string;
  test?: { name: string; projectId: string };
}
export interface Test {
  id: string;
  name: string;
  description: string;
  status: string;
  tags: string[];
  currentVersion: number;
  projectId: string;
  deploymentEnabled: boolean;
  definition?: Definition;
  schedule?: Schedule;
  runs?: Run[];
  project?: { id: string; name: string; url: string };
}
export interface RunStep {
  position: number;
  action: string;
  status: string;
  durationMs: number;
  expected?: string;
  actual?: string;
  error?: string;
}
export interface Artifact {
  id: string;
  kind: string;
  size: number;
  expiresAt: string;
}
export interface Explanation {
  observed: string;
  evidence: string[];
  possibleCauses: string[];
  nextSteps: string[];
}
export interface Run {
  id: string;
  projectId: string;
  testId: string;
  testName: string;
  status: string;
  trigger: string;
  environment: string;
  targetUrl: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  error?: string;
  attempt: number;
  retryOf?: string;
  deploymentId?: string;
  steps?: RunStep[];
  artifacts?: Artifact[];
  consoleErrors?: string[];
  networkErrors?: string[];
  version?: { number: number; definition: Definition };
  project?: { name: string };
  previous?: Run;
  explanation?: Explanation;
}
export interface Project {
  id: string;
  name: string;
  url: string;
  environment: string;
  status: string;
  verifiedAt?: string;
  verificationToken: string;
  verificationExpiresAt: string;
  tests?: Test[];
  runs?: Run[];
  secrets?: { id: string; name: string; updatedAt: string }[];
  webhookConfigured?: boolean;
  deployments?: {
    id: string;
    label?: string;
    eventId: string;
    createdAt: string;
  }[];
  _count?: { tests: number; runs: number };
}
export interface DashboardData {
  projects: Project[];
  groups: { status: string; _count: number }[];
  recent: Run[];
  schedules: Schedule[];
  daily: { createdAt: string; status: string }[];
  usage: Usage;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await response.json().catch(() => ({
    message: "The API is unavailable. Check that the backend is running.",
  }));
  if (!response.ok) {
    const detail = body.issues
      ?.map(
        (i: { path: string[]; message: string }) =>
          `${i.path.join(".")}: ${i.message}`,
      )
      .join(" · ");
    throw new ApiError(
      response.status,
      detail || body.message || "Something went wrong",
    );
  }
  return body;
}
export const mutate = <T>(path: string, method: string, body?: unknown) =>
  api<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
export const date = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
export const duration = (value?: number) =>
  value === undefined || value === null
    ? "—"
    : value < 1000
      ? `${value} ms`
      : `${(value / 1000).toFixed(1)} s`;
export const actionNames: Record<string, string> = {
  navigate: "Navigate",
  click: "Click",
  fill: "Fill field",
  select: "Select option",
  check: "Check checkbox",
  press: "Press key",
  assertVisible: "Assert visible",
  assertText: "Assert text",
  assertUrl: "Assert URL",
  assertState: "Assert element state",
  assertTitle: "Assert title",
  waitFor: "Wait for visible",
};
