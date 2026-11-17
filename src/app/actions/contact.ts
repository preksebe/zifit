"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type ContactState = { trimis?: boolean; error?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mesajul se salveaza pe server (service role): clientul nu are drept de scriere in zifit_mesaje.
export async function trimiteMesaj(_: ContactState, fd: FormData): Promise<ContactState> {
  const name = String(fd.get("nume") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const message = String(fd.get("mesaj") ?? "").trim();

  if (!name || !email || !message) return { error: "Completează numele, emailul și mesajul." };
  if (name.length > 100) return { error: "Numele are maximum 100 de caractere." };
  if (email.length > 200 || !EMAIL_RE.test(email)) return { error: "Scrie un email valid." };
  if (message.length > 2000) return { error: "Mesajul are maximum 2000 de caractere." };

  const { error } = await createAdminClient().from("zifit_mesaje").insert({ name, email, message });
  if (error) return { error: "Mesajul nu a putut fi trimis. Încearcă din nou." };
  return { trimis: true };
}
