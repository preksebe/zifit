import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { faraOrfane as T } from "@/lib/fara-orfane";

export const metadata: Metadata = { title: "Contact · ZiFit" };

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-4xl uppercase sm:text-5xl">Scrie-ne</h1>
      <p className="mt-3 mb-6 max-w-prose text-lg">{T("Ai o întrebare despre un plan sau despre site? Lasă-ne un mesaj.")}</p>
      <ContactForm />
    </main>
  );
}
