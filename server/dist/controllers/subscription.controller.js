import prisma from '../lib/prisma.js';
import { calculateUsagePercent, normalizeQuotaDate, resolvePlanLimit } from '../lib/usage-quota.js';
export const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        // 1. Get User Plan
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                plan: true,
                subscriptionStatus: true,
                subscriptionEndDate: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const plan = user.plan || 'FREE';
        const limit = resolvePlanLimit(plan);
        const today = normalizeQuotaDate();
        const quota = await prisma.usageQuota.findUnique({
            where: {
                userId_quotaDate_actionType: {
                    userId,
                    quotaDate: today,
                    actionType: 'WORKFLOW_ACTION',
                },
            },
        });
        const usage = quota?.usedCount || 0;
        const percentUsed = calculateUsagePercent(usage, limit);
        res.json({
            plan,
            usage,
            limit,
            percentUsed,
            resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Reset at midnight
            status: user.subscriptionStatus,
            endDate: user.subscriptionEndDate
        });
    }
    catch (error) {
        console.error("Get subscription status error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
