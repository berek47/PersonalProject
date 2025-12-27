import { log } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    log.error("Stripe webhook signature verification failed", err as Error);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        log.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error("Error processing Stripe webhook", error as Error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const courseId = session.metadata?.courseId;
  const userId = session.metadata?.userId;

  if (!courseId || !userId) {
    log.error("Missing metadata in checkout session", undefined, {
      sessionId: session.id,
    });
    return;
  }

  // Check if enrollment already exists
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    log.info("Enrollment already exists, skipping", {
      userId,
      courseId,
      sessionId: session.id,
    });
    return;
  }

  // Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      courseId,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || "usd",
      status: "COMPLETED",
      stripePaymentId: session.payment_intent as string,
      stripeSessionId: session.id,
    },
  });

  log.payment("payment_success", userId, courseId, {
    sessionId: session.id,
    enrollmentId: enrollment.id,
    amount: session.amount_total ? session.amount_total / 100 : 0,
  });

  log.enrollment("enrolled", userId, courseId, {
    paymentMethod: "stripe",
    sessionId: session.id,
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const courseId = paymentIntent.metadata?.courseId;
  const userId = paymentIntent.metadata?.userId;

  if (courseId && userId) {
    log.payment("payment_failed", userId, courseId, {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
    });
  }
}
