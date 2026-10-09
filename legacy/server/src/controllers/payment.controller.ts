
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import prisma from '../lib/prisma.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const PLAN_DETAILS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    amountInrMonthly: 0,
    dailyWorkflowActions: 5,
    features: ['Starter workflow library', 'Basic prompt packs', 'Community support'],
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    amountInrMonthly: 99,
    dailyWorkflowActions: 50,
    features: ['Full workflow library', 'Advanced prompt packs', 'Email support'],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    amountInrMonthly: 299,
    dailyWorkflowActions: 1000,
    features: ['Highest daily limits', 'Priority queue', 'Priority support'],
  },
} as const;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

export const createSubscriptionOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { plan } = req.body;

    if (!['PREMIUM', 'PRO'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const priceMap = {
      PREMIUM: 9900, // INR 99.00
      PRO: 29900,     // INR 299.00
    };

    const amount = priceMap[plan as keyof typeof priceMap];

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now().toString().slice(-10)}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        userId,
        plan,
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment successful, update user
      // Set valid for 30 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: plan as any, // 'PREMIUM' or 'PRO'
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate,
        }
      });

      res.json({ success: true, message: "Payment verified and subscription activated" });
    } else {
      res.status(400).json({ error: "Invalid payment signature" });
    }

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export const getPlanComparison = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const trialEligible = user.plan === 'FREE' && accountAgeDays <= 14;

    res.status(200).json({
      currentPlan: user.plan,
      trialEligible,
      plans: [PLAN_DETAILS.FREE, PLAN_DETAILS.PREMIUM, PLAN_DETAILS.PRO],
    });
  } catch (error) {
    console.error('Get plan comparison error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const manageSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const action = String(req.body?.action || '').toUpperCase();
    const targetPlan = req.body?.targetPlan ? String(req.body.targetPlan).toUpperCase() : undefined;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, plan: true, subscriptionStatus: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!['UPGRADE', 'DOWNGRADE', 'CANCEL', 'RESUME'].includes(action)) {
      res.status(400).json({ message: 'Invalid action' });
      return;
    }

    if ((action === 'UPGRADE' || action === 'DOWNGRADE') && !targetPlan) {
      res.status(400).json({ message: 'targetPlan is required' });
      return;
    }

    if (targetPlan && !['FREE', 'PREMIUM', 'PRO'].includes(targetPlan)) {
      res.status(400).json({ message: 'Invalid target plan' });
      return;
    }

    if (action === 'UPGRADE' && targetPlan === 'FREE') {
      res.status(400).json({ message: 'UPGRADE requires PREMIUM or PRO targetPlan' });
      return;
    }

    if (action === 'DOWNGRADE' && targetPlan === 'PRO') {
      res.status(400).json({ message: 'DOWNGRADE cannot target a higher plan' });
      return;
    }

    if ((action === 'UPGRADE' || action === 'DOWNGRADE') && targetPlan === user.plan) {
      res.status(400).json({ message: 'You are already on this plan' });
      return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    if (action === 'CANCEL') {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          plan: 'FREE',
          subscriptionStatus: 'canceled',
          subscriptionEndDate: null,
        },
        select: { plan: true, subscriptionStatus: true, subscriptionEndDate: true },
      });

      res.status(200).json({ message: 'Subscription canceled', subscription: updated });
      return;
    }

    if (action === 'RESUME') {
      if (user.plan === 'FREE') {
        res.status(400).json({ message: 'No paid subscription to resume' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate,
        },
        select: { plan: true, subscriptionStatus: true, subscriptionEndDate: true },
      });

      res.status(200).json({ message: 'Subscription resumed', subscription: updated });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: targetPlan as any,
        subscriptionStatus: targetPlan === 'FREE' ? null : 'active',
        subscriptionEndDate: targetPlan === 'FREE' ? null : endDate,
      },
      select: { plan: true, subscriptionStatus: true, subscriptionEndDate: true },
    });

    res.status(200).json({
      message: action === 'UPGRADE' ? 'Plan upgraded' : 'Plan downgraded',
      subscription: updated,
    });
  } catch (error) {
    console.error('Manage subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
