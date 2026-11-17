import type { PaymentProvider } from "./types";

// Plata de test: nu se percep bani. Clientul ajunge pe o pagina proprie cu butoane de simulare.
export const mockProvider: PaymentProvider = {
  name: "mock",
  async createCheckout(order) {
    return { redirectUrl: `/plata/${order.id}` };
  },
};
