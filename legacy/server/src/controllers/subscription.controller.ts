
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../lib/prisma.js';
import { calculateUsagePercent, normalizeQuotaDate, resolvePlanLimit } from '../lib/usage-quota.js';

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // 1. Get User Plan
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
            plan: true, 
            subscriptionStatus: true, 
          subscriptionEndDate: true,
          createdAt: true,
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
    const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const trialWindowDays = 14;
    const trialEligible = plan === 'FREE' && accountAgeDays <= trialWindowDays;
    const trialDaysLeft = trialEligible ? Math.max(0, trialWindowDays - accountAgeDays) : 0;

    const isPaidPlan = plan === 'PREMIUM' || plan === 'PRO';
    const canUpgrade = plan !== 'PRO';
    const canDowngrade = plan !== 'FREE';
    const canCancel = isPaidPlan && user.subscriptionStatus !== 'canceled';
    const canResume = isPaidPlan && user.subscriptionStatus === 'canceled';

    let conversionPrompt: { variant: 'NONE' | 'TRIAL' | 'UPGRADE'; title: string; message: string } = {
      variant: 'NONE',
      title: '',
      message: '',
    };

    if (trialEligible) {
      conversionPrompt = {
        variant: 'TRIAL',
        title: 'Trial window active',
        message: `You have ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in your early trial window. Upgrade now to keep momentum.`,
      };
    } else if (plan === 'FREE' && percentUsed >= 80) {
      conversionPrompt = {
        variant: 'UPGRADE',
        title: 'Near your free limit',
        message: `You used ${usage}/${limit} actions today. Upgrade to avoid blocking your daily flow.`,
      };
    }

    res.json({
        plan,
        usage,
        limit,
        percentUsed,
        resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Reset at midnight
        status: user.subscriptionStatus,
        endDate: user.subscriptionEndDate,
        trialEligible,
        trialDaysLeft,
        conversionPrompt,
        canUpgrade,
        canDowngrade,
        canCancel,
        canResume,
    });

  } catch (error) {
    console.error("Get subscription status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
