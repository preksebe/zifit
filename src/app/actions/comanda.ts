"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/plati";
import { getPlanBySlug } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// „Cumpara planul”: creeaza pe server o comanda in_asteptare (suma vine din baza, nu din browser)
// si duce clientul la pagina de plata a furnizorului ales.
export async function cumpara(fd: FormData) {
  const slug = String(fd.get("slug") ?? "");
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");

  const plan = await getPlanBySlug(slug);
  if (!plan) redirect("/planuri");

  // Daca are deja planul, nu cumpara a doua oara.
  const supabase = await createClient();
  const { data: platit } = await supabase.from("zifit_orders").select("id").eq("plan_id", plan.id).eq("status", "platita").limit(1);
  if (platit && platit.length > 0) redirect(`/contul-meu/planuri/${plan.slug}`);

  // Comenzile se scriu doar de server (service role); clientul nu are drept de insert.
  const admin = createAdminClient();
  const furnizor = getPaymentProvider();
  const { data: existenta } = await admin
    .from("zifit_orders")
    .select("id")
    .eq("user_id", profil.id)
    .eq("plan_id", plan.id)
    .eq("status", "in_asteptare")
    .limit(1);

  let comandaId = existenta?.[0]?.id as string | undefined;
  if (!comandaId) {
    const { data, error } = await admin
      .from("zifit_orders")
      .insert({ user_id: profil.id, plan_id: plan.id, amount_cents: plan.price_cents, status: "in_asteptare", provider: furnizor.name })
      .select("id")
      .single();
    if (error || !data) redirect(`/planuri/${plan.slug}`);
    comandaId = data.id;
  }

  const { redirectUrl, providerRef } = await furnizor.createCheckout({
    id: comandaId!,
    planSlug: plan.slug,
    amountCents: plan.price_cents,
    currency: plan.currency,
  });
  if (providerRef) await admin.from("zifit_orders").update({ provider_ref: providerRef }).eq("id", comandaId!);
  redirect(redirectUrl);
}

// Plata de TEST: statusul il schimba doar serverul, dupa ce verifica ca
// (1) userul e conectat, (2) comanda e a lui, (3) comanda e inca in_asteptare, (4) furnizorul e „mock”.
export async function simuleazaPlata(fd: FormData) {
  const comandaId = String(fd.get("comanda") ?? "");
  const reusita = String(fd.get("rezultat") ?? "") === "reusita";
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");
  if (!UUID_RE.test(comandaId)) redirect("/contul-meu");
  if (getPaymentProvider().name !== "mock") redirect("/contul-meu");

  const admin = createAdminClient();
  const { data: comanda } = await admin
    .from("zifit_orders")
    .select("id, user_id, status, provider, zifit_plans(slug)")
    .eq("id", comandaId)
    .maybeSingle();
  if (!comanda || comanda.user_id !== profil.id) redirect("/contul-meu");
  if (comanda.provider !== "mock" || comanda.status !== "in_asteptare") redirect(`/plata/${comandaId}`);

  await admin
    .from("zifit_orders")
    .update({ status: reusita ? "platita" : "esuata", provider_ref: `mock-${Date.now()}` })
    .eq("id", comandaId)
    .eq("status", "in_asteptare");

  const plan = comanda.zifit_plans as unknown as { slug: string } | null;
  if (reusita && plan) redirect(`/contul-meu/planuri/${plan.slug}?plata=reusita`);
  redirect(`/plata/${comandaId}`);
}
