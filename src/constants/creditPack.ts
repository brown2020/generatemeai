/**
 * The only credit pack the server will sell. The client displays this pack;
 * PaymentIntent amount and the credit grant both come from here.
 */
export const CREDIT_PACK = {
  amountCents: 9999,
  credits: 10000,
  displayDollars: 99.99,
} as const;

/**
 * Returns the credit grant for a Stripe amount, or null when the amount
 * is not the published pack.
 */
export function creditsForCatalogAmount(amountCents: number): number | null {
  return amountCents === CREDIT_PACK.amountCents ? CREDIT_PACK.credits : null;
}
