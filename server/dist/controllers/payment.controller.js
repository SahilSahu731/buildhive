import prisma from '../lib/prisma.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});
export const createSubscriptionOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { plan } = req.body;
        if (!['PREMIUM', 'PRO'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }
        const priceMap = {
            PREMIUM: 9900, // INR 99.00
            PRO: 29900, // INR 299.00
        };
        const amount = priceMap[plan];
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
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};
export const verifyPayment = async (req, res) => {
    try {
        const userId = req.user.userId;
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
                    plan: plan, // 'PREMIUM' or 'PRO'
                    subscriptionStatus: 'active',
                    subscriptionEndDate: endDate,
                }
            });
            res.json({ success: true, message: "Payment verified and subscription activated" });
        }
        else {
            res.status(400).json({ error: "Invalid payment signature" });
        }
    }
    catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};
