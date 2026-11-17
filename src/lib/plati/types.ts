export type CheckoutOrder = {
  id: string;
  planSlug: string;
  amountCents: number;
  currency: string;
};

// Interfata comuna pentru furnizorii de plata.
export interface PaymentProvider {
  // Numele salvat in zifit_orders.provider ("mock" sau "stripe").
  name: "mock" | "stripe";
  // Dupa ce comanda a fost creata (in_asteptare), intoarce adresa unde e dus clientul ca sa plateasca
  // si, daca furnizorul are o referinta externa (ex. sesiunea Stripe), o intoarce in providerRef.
  createCheckout(order: CheckoutOrder): Promise<{ redirectUrl: string; providerRef?: string }>;
}
