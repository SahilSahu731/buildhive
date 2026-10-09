export function normalizeQuotaDate(input = new Date()): Date {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function calculateUsagePercent(used: number, limit: number): number {
  if (limit <= 0) return 100;
  return Math.min(Math.round((used / limit) * 100), 100);
}

export function resolvePlanLimit(plan: string): number {
  const limits: Record<string, number> = {
    FREE: 5,
    PREMIUM: 50,
    PRO: 1000,
  };

  return limits[plan] || limits.FREE;
}
