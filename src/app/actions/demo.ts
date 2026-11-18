"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Conectare rapida (demo). Totul se intampla pe server: emailul si parola vin din variabile de mediu
// si nu ajung niciodata in browser. Butoanele se pot opri cu DEMO_LOGIN_ENABLED=false.
export async function intraDemo(fd: FormData) {
  if (process.env.DEMO_LOGIN_ENABLED !== "true") redirect("/autentificare");

  const rol = String(fd.get("rol") ?? "");
  const email = rol === "admin" ? process.env.DEMO_ADMIN_EMAIL : rol === "client" ? process.env.DEMO_CLIENT_EMAIL : undefined;
  const parola = rol === "admin" ? process.env.DEMO_ADMIN_PASSWORD : rol === "client" ? process.env.DEMO_CLIENT_PASSWORD : undefined;
  if (!email || !parola) redirect("/autentificare");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parola });
  if (error || !data.user) redirect("/autentificare?demo=eroare");

  // Cont blocat: nu intra (la fel ca la autentificarea normala).
  const { data: profil } = await supabase.from("zifit_profiles").select("blocked").eq("id", data.user.id).single();
  if (profil?.blocked) {
    await supabase.auth.signOut();
    redirect("/autentificare?demo=eroare");
  }

  redirect(rol === "admin" ? "/dashboard" : "/contul-meu");
}
