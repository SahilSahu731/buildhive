import prisma from '../lib/prisma.js';
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
        // 2. Define Limits
        const limits = {
            FREE: 5,
            PREMIUM: 50,
            PRO: 1000
        };
        const limit = limits[plan] || 5;
        // 3. Count Usage Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const usage = await prisma.codeReview.count({
            where: {
                userId,
                createdAt: { gte: today }
            }
        });
        const percentUsed = Math.min(Math.round((usage / limit) * 100), 100);
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
