export function normalizeQuotaDate(input = new Date()) {
    const date = new Date(input);
    date.setHours(0, 0, 0, 0);
    return date;
}
export function calculateUsagePercent(used, limit) {
    if (limit <= 0)
        return 100;
    return Math.min(Math.round((used / limit) * 100), 100);
}
export function resolvePlanLimit(plan) {
    const limits = {
        FREE: 5,
        PREMIUM: 50,
        PRO: 1000,
    };
    return limits[plan] || limits.FREE;
}
