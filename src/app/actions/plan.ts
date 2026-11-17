"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Scrierile de progres merg prin clientul utilizatorului: RLS permite doar pe propriul progres
// si doar pentru planuri cu comanda platita.

export async function terminaZiua(fd: FormData) {
  const slug = String(fd.get("slug") ?? "");
  const zi = Number(fd.get("zi"));
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");

  const supabase = await createClient();
  const { data: plan } = await supabase.from("zifit_plans").select("id, days_count").eq("slug", slug).maybeSingle();
  if (!plan || !Number.isInteger(zi) || zi < 1 || zi > plan.days_count) redirect("/contul-meu");

  await supabase
    .from("zifit_progress")
    .upsert({ user_id: profil.id, plan_id: plan.id, day_number: zi }, { onConflict: "user_id,plan_id,day_number", ignoreDuplicates: true });

  // Mergem la prima zi nefacuta; daca au fost facute toate, ramanem pe ultima zi.
  const { data: facute } = await supabase.from("zifit_progress").select("day_number").eq("plan_id", plan.id).eq("user_id", profil.id);
  const set = new Set((facute ?? []).map((r) => r.day_number));
  let urmatoarea = zi;
  for (let d = 1; d <= plan.days_count; d++) {
    if (!set.has(d)) {
      urmatoarea = d;
      break;
    }
  }
  redirect(`/contul-meu/planuri/${slug}?zi=${urmatoarea}`);
}

export async function repetaProgramul(fd: FormData) {
  const slug = String(fd.get("slug") ?? "");
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");

  const supabase = await createClient();
  const { data: plan } = await supabase.from("zifit_plans").select("id").eq("slug", slug).maybeSingle();
  if (!plan) redirect("/contul-meu");

  await supabase.from("zifit_progress").delete().eq("plan_id", plan.id).eq("user_id", profil.id);
  redirect(`/contul-meu/planuri/${slug}?zi=1`);
}
