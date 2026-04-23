import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Returns a lazily-instantiated Stripe client. Throws at call-time (not
 * import-time) so routes that don't touch Stripe won't fail in environments
 * without the secret key set.
 */
export function getStripeClient(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not configured");
  }
  cached = new Stripe(key);
  return cached;
}
