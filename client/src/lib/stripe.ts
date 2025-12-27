import Stripe from "stripe";

function getStripeInstance(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Please add your Stripe secret key to .env"
    );
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

// Lazy initialization to avoid errors during build
let stripeInstance: Stripe | null = null;

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!stripeInstance) {
      stripeInstance = getStripeInstance();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (stripeInstance as any)[prop];
  },
});

export function formatAmountForStripe(amount: number): number {
  // Stripe expects amounts in cents
  return Math.round(amount * 100);
}
