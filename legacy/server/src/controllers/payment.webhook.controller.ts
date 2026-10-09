
import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { sendPremiumEmail } from '../services/email.service.js';

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '');
    // req.body should be the raw body buffer if configured correctly in server.ts
    // However, if express.json() processed it, we might need the raw buffer.
    // We will assume req.rawBody exists (we need to configure server.ts).
    
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
        console.error("No raw body found for webhook verification");
        return res.status(400).json({ error: "Webhook Error: Raw body missing" });
    }

    shasum.update(rawBody);
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body;
    console.log("Received Webhook Event:", event.event);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
        // Handle payment success
        const payment = event.payload.payment.entity;
        const notePlan = payment.notes.plan; // We sent 'plan' in notes during order creation
        const userId = payment.notes.userId;

        if (userId && notePlan) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30); // 30 days subscription

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    plan: notePlan as any,
                    subscriptionStatus: 'active',
                    subscriptionEndDate: endDate,
                }
            });
            console.log(`User ${userId} upgraded to ${notePlan}`);

            // Send Premium Email
            if (updatedUser.email) {
                await sendPremiumEmail(updatedUser.email, notePlan);
            }
        }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
