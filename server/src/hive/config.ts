import "dotenv/config";
export const plans = {
  FREE: {
    name: "Free",
    price: 0,
    projects: 1,
    tests: 2,
    runs: 20,
    ai: 5,
    retention: 7,
    frequencies: ["daily"],
    webhooks: false,
  },
  STARTER: {
    name: "Starter",
    price: 19,
    projects: 3,
    tests: 15,
    runs: 300,
    ai: 50,
    retention: 30,
    frequencies: ["daily", "six-hourly"],
    webhooks: true,
  },
  GROWTH: {
    name: "Growth",
    price: 49,
    projects: 10,
    tests: 100,
    runs: 1500,
    ai: 200,
    retention: 90,
    frequencies: ["daily", "six-hourly", "hourly"],
    webhooks: true,
  },
} as const;
export type PlanKey = keyof typeof plans;
export const planFor = (name: string) => plans[name as PlanKey] || plans.FREE;
export const monthStart = () =>
  new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
export function effectivePlan(w: {
  plan: string;
  periodEnd: Date | null;
  subscriptionStatus: string;
}) {
  return w.plan !== "FREE" &&
    w.periodEnd &&
    w.periodEnd > new Date() &&
    ["active", "cancelled"].includes(w.subscriptionStatus)
    ? w.plan
    : "FREE";
}
export const frontend = () =>
  process.env.FRONTEND_URL || "http://localhost:3000";
