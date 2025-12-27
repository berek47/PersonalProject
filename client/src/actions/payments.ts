"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { log } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { headers } from "next/headers";

/**
 * Create a Stripe checkout session for course purchase
 */
export async function createCheckoutSession(courseId: string) {
  const user = await requireAuth();
  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

  // Get course details
  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED" },
  });

  if (!course) {
    throw new Error("Course not found or not available");
  }

  const price = Number(course.price);
  if (price <= 0) {
    throw new Error("This is a free course. Please enroll directly.");
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    throw new Error("You are already enrolled in this course");
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description.slice(0, 500),
            images: course.thumbnail ? [course.thumbnail] : undefined,
          },
          unit_amount: formatAmountForStripe(price),
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      userId: user.id,
      courseSlug: course.slug,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/courses/${course.slug}?canceled=true`,
    customer_email: user.email,
  });

  log.payment("checkout_created", user.id, courseId, {
    sessionId: session.id,
    amount: price,
  });

  return { url: session.url };
}

/**
 * Verify checkout session and create enrollment
 */
export async function verifyCheckoutSession(sessionId: string) {
  const user = await requireAuth();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session) {
    throw new Error("Invalid checkout session");
  }

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }

  const courseId = session.metadata?.courseId;
  const userId = session.metadata?.userId;

  if (!courseId || userId !== user.id) {
    throw new Error("Invalid session data");
  }

  // Check if enrollment already exists (webhook might have created it)
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
    include: {
      course: {
        select: { slug: true, title: true },
      },
    },
  });

  if (existingEnrollment) {
    return {
      success: true,
      courseSlug: existingEnrollment.course.slug,
      courseTitle: existingEnrollment.course.title,
      alreadyEnrolled: true,
    };
  }

  // Create enrollment
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true, title: true },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId,
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: user.id,
      courseId,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || "usd",
      status: "COMPLETED",
      stripePaymentId: session.payment_intent as string,
      stripeSessionId: session.id,
    },
  });

  log.enrollment("enrolled", user.id, courseId, {
    paymentMethod: "stripe",
    sessionId: session.id,
  });

  return {
    success: true,
    courseSlug: course.slug,
    courseTitle: course.title,
    alreadyEnrolled: false,
  };
}
