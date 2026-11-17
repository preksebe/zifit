import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  role: "client" | "admin";
  blocked: boolean;
};

// Utilizatorul curent, verificat la serverul Supabase (nu doar din cookie). O singura data pe cerere.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("zifit_profiles").select("id, email, role, blocked").eq("id", user.id).single();
  if (!data || data.blocked) return null;
  return data as Profile;
});

// Pentru orice pagina sau actiune de admin: daca nu esti admin, esti trimis la prima pagina.
export async function requireAdmin(): Promise<Profile> {
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");
  if (profil.role !== "admin") redirect("/");
  return profil;
}
