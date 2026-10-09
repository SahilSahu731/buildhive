import Razorpay from "razorpay";
import prisma from "../lib/prisma.js";
import { HttpError } from "./service.js";
import { validSignature } from "./security.js";
export function billingClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    throw new HttpError(503, "Billing is not configured");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
export async function handleBilling(
  body: Buffer,
  signature: string,
  eventId: string,
) {
  if (
    !process.env.RAZORPAY_WEBHOOK_SECRET ||
    !validSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET)
  )
    throw new HttpError(401, "Invalid payment signature");
  const event = JSON.parse(body.toString());
  const entity = event.payload?.subscription?.entity;
  if (!entity) return;
  if (!eventId) throw new HttpError(400, "Missing event identifier");
  const plan =
    entity.plan_id === process.env.RAZORPAY_STARTER_PLAN_ID
      ? "STARTER"
      : entity.plan_id === process.env.RAZORPAY_GROWTH_PLAN_ID
        ? "GROWTH"
        : null;
  if (!plan) return;
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${entity.id}))::text`;
    if (await tx.hiveBillingEvent.findUnique({ where: { id: eventId } }))
      return;
    const w = await tx.hiveWorkspace.findUnique({
      where: { subscriptionId: entity.id },
    });
    if (!w)
      throw new HttpError(
        409,
        "Subscription checkout has not been recorded yet. Retry this webhook.",
      );
    await tx.hiveBillingEvent.create({ data: { id: eventId } });
    const time = BigInt(event.created_at || 0);
    if (time < w.billingEventAt) return;
    // Terminal and failed states revoke access. A cancellation retains prepaid access until period end.
    const active =
      (entity.status === "active" ||
        (entity.status === "cancelled" && w.plan !== "FREE")) &&
      entity.current_end * 1000 > Date.now();
    await tx.hiveWorkspace.update({
      where: { id: w.id },
      data: {
        plan: active ? plan : "FREE",
        subscriptionStatus: entity.status,
        periodEnd: entity.current_end
          ? new Date(entity.current_end * 1000)
          : null,
        billingEventAt: time,
        customerId: entity.customer_id || null,
      },
    });
  });
}
