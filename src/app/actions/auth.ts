"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function citesteCampuri(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parola = String(formData.get("parola") ?? "");
  return { email, parola };
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const { email, parola } = citesteCampuri(formData);
  if (!EMAIL_RE.test(email) || !parola) {
    return { error: "Scrie emailul și parola." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parola });
  if (error || !data.user) {
    return { error: "Email sau parolă greșită." };
  }

  // Conturile blocate nu intra.
  const { data: profil } = await supabase.from("zifit_profiles").select("blocked").eq("id", data.user.id).single();
  if (profil?.blocked) {
    await supabase.auth.signOut();
    return { error: "Contul este blocat." };
  }

  redirect("/");
}

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const { email, parola } = citesteCampuri(formData);
  if (!EMAIL_RE.test(email)) {
    return { error: "Scrie un email valid." };
  }
  if (parola.length < 8) {
    return { error: "Parola trebuie să aibă minimum 8 caractere." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password: parola });
  if (error) {
    if (/already registered|already been registered/i.test(error.message)) {
      return { error: "Există deja un cont cu acest email." };
    }
    return { error: "Contul nu a putut fi creat. Verifică emailul și parola." };
  }
  if (!data.session) {
    // Confirmarea pe email e pornita in proiect: nu avem sesiune imediat.
    return { error: "Contul a fost creat, dar trebuie confirmat pe email înainte de autentificare." };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
