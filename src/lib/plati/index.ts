import "server-only";
import { mockProvider } from "./mock";
import type { PaymentProvider } from "./types";

export type { PaymentProvider, CheckoutOrder } from "./types";

// Furnizorul de plata se alege din PAYMENT_PROVIDER. Azi: "mock". Maine: se adauga "stripe" aici,
// cu aceeasi interfata, fara sa se schimbe restul aplicatiei.
const FURNIZORI: Record<string, PaymentProvider> = {
  mock: mockProvider,
};

export function getPaymentProvider(): PaymentProvider {
  const nume = process.env.PAYMENT_PROVIDER || "mock";
  const furnizor = FURNIZORI[nume];
  if (!furnizor) throw new Error(`Furnizor de plată necunoscut: ${nume}`);
  return furnizor;
}
