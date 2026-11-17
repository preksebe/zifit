"use server";

// Toate actiunile de aici verifica rolul de admin pe server (requireAdmin) inainte sa faca orice.
// Scrierile merg prin clientul utilizatorului (RLS cere admin); service role se foloseste doar la stergerea de conturi.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlanFormState = {
  error?: string;
  ok?: boolean;
  values?: Record<string, string>;
} | undefined;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORII = ["sport", "nutritie"];
const DIFICULTATI = ["usor", "mediu", "avansat"];
const TIPURI_IMAGINE = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGINE = 2 * 1024 * 1024;

const txt = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const intOpt = (fd: FormData, k: string, max = 10000) => {
  const v = txt(fd, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : NaN;
};

async function sincronizeazaZile(planId: string) {
  const supabase = await createClient();
  const { count } = await supabase.from("zifit_plan_days").select("id", { count: "exact", head: true }).eq("plan_id", planId);
  await supabase.from("zifit_plans").update({ days_count: Math.max(count ?? 0, 1) }).eq("id", planId);
}

function reimprospateaza(planId?: string) {
  revalidatePath("/dashboard", "layout");
  if (planId) revalidatePath(`/dashboard/produse/${planId}`);
}

// ---------- Produse ----------
export async function salveazaPlan(_: PlanFormState, fd: FormData): Promise<PlanFormState> {
  await requireAdmin();
  const id = txt(fd, "id");
  const values = Object.fromEntries(["title", "slug", "subtitle", "category", "type", "difficulty", "equipment", "description", "price"].map((k) => [k, txt(fd, k)]));
  const published = fd.get("published") === "on";
  const esec = (error: string): PlanFormState => ({ error, values: { ...values, published: published ? "on" : "" } });

  if (!values.title || values.title.length > 120) return esec("Titlul e obligatoriu (maximum 120 de caractere).");
  if (!SLUG_RE.test(values.slug) || values.slug.length > 80) return esec("Slug-ul poate avea doar litere mici, cifre și cratime (ex. forta-acasa).");
  if (values.subtitle.length > 120) return esec("Subtitlul are maximum 120 de caractere.");
  if (!CATEGORII.includes(values.category)) return esec("Alege categoria.");
  if (values.type.length > 40) return esec("Tipul are maximum 40 de caractere.");
  if (values.difficulty && !DIFICULTATI.includes(values.difficulty)) return esec("Dificultate necunoscută.");
  if (values.equipment.length > 80) return esec("Echipamentul are maximum 80 de caractere.");
  if (values.description.length > 3000) return esec("Descrierea are maximum 3000 de caractere.");
  const pret = Number(values.price.replace(",", "."));
  if (!values.price || !Number.isFinite(pret) || pret < 0 || pret > 100000) return esec("Prețul trebuie să fie un număr între 0 și 100000.");

  const supabase = await createClient();
  const date = {
    slug: values.slug,
    title: values.title,
    subtitle: values.subtitle || null,
    category: values.category,
    type: values.type || null,
    difficulty: values.difficulty || null,
    equipment: values.equipment || null,
    description: values.description || null,
    price_cents: Math.round(pret * 100),
    published,
  };

  let planId = id;
  if (id) {
    const { error } = await supabase.from("zifit_plans").update(date).eq("id", id);
    if (error) return esec(error.code === "23505" ? "Slug-ul e deja folosit de alt plan." : "Planul nu a putut fi salvat.");
  } else {
    const { data, error } = await supabase.from("zifit_plans").insert({ ...date, is_test: true }).select("id").single();
    if (error || !data) return esec(error?.code === "23505" ? "Slug-ul e deja folosit de alt plan." : "Planul nu a putut fi creat.");
    planId = data.id;
    await supabase.from("zifit_plan_days").insert({ plan_id: planId, day_number: 1, title: null });
  }

  // Coperta (optionala): se incarca in bucket-ul zifit-covers, unde scrie doar adminul.
  const fisier = fd.get("cover");
  if (fisier instanceof File && fisier.size > 0) {
    if (!TIPURI_IMAGINE.includes(fisier.type)) return esec("Coperta trebuie să fie imagine PNG, JPG sau WebP.");
    if (fisier.size > MAX_IMAGINE) return esec("Coperta are peste 2 MB.");
    const ext = fisier.type === "image/png" ? "png" : fisier.type === "image/webp" ? "webp" : "jpg";
    const cale = `${planId}/${Date.now()}.${ext}`;
    const { error: eUp } = await supabase.storage.from("zifit-covers").upload(cale, fisier, { contentType: fisier.type });
    if (eUp) return esec("Coperta nu a putut fi încărcată.");
    const { data: pub } = supabase.storage.from("zifit-covers").getPublicUrl(cale);
    await supabase.from("zifit_plans").update({ cover_url: pub.publicUrl }).eq("id", planId);
  }
  if (fd.get("sterge_cover") === "on" && id) await supabase.from("zifit_plans").update({ cover_url: null }).eq("id", id);

  reimprospateaza(planId);
  if (!id) redirect(`/dashboard/produse/${planId}`);
  return { ok: true, values: { ...values, published: published ? "on" : "" } };
}

export async function comutaPublicat(fd: FormData) {
  await requireAdmin();
  const id = txt(fd, "id");
  const publicat = txt(fd, "publicat") === "true";
  const supabase = await createClient();
  await supabase.from("zifit_plans").update({ published: publicat }).eq("id", id);
  reimprospateaza(id);
}

export async function stergePlan(fd: FormData) {
  await requireAdmin();
  const id = txt(fd, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("zifit_plans").delete().eq("id", id);
  // Planurile cu comenzi nu se pot sterge (comenzile raman ca istoric): se ascund.
  if (error) redirect("/dashboard/produse?eroare=plan-cu-comenzi");
  reimprospateaza();
  redirect("/dashboard/produse");
}

// ---------- Zile ----------
export async function adaugaZi(fd: FormData) {
  await requireAdmin();
  const planId = txt(fd, "plan_id");
  const supabase = await createClient();
  const { data } = await supabase.from("zifit_plan_days").select("day_number").eq("plan_id", planId).order("day_number", { ascending: false }).limit(1);
  const urmatoarea = (data?.[0]?.day_number ?? 0) + 1;
  await supabase.from("zifit_plan_days").insert({ plan_id: planId, day_number: urmatoarea });
  await sincronizeazaZile(planId);
  reimprospateaza(planId);
}

export async function salveazaZi(fd: FormData) {
  await requireAdmin();
  const planId = txt(fd, "plan_id");
  const title = txt(fd, "title").slice(0, 120);
  const notes = txt(fd, "notes").slice(0, 1000);
  const supabase = await createClient();
  await supabase.from("zifit_plan_days").update({ title: title || null, notes: notes || null }).eq("id", txt(fd, "day_id"));
  reimprospateaza(planId);
}

export async function mutaZi(fd: FormData) {
  await requireAdmin();
  const planId = txt(fd, "plan_id");
  const dayId = txt(fd, "day_id");
  const sus = txt(fd, "directie") === "sus";
  const supabase = await createClient();
  const { data: zile } = await supabase.from("zifit_plan_days").select("id, day_number").eq("plan_id", planId).order("day_number");
  const lista = zile ?? [];
  const i = lista.findIndex((z) => z.id === dayId);
  const j = sus ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= lista.length) return;
  const a = lista[i];
  const b = lista[j];
  // Schimb de numere cu un numar temporar, ca sa nu lovim unicitatea (plan_id, day_number).
  await supabase.from("zifit_plan_days").update({ day_number: 1000000 }).eq("id", a.id);
  await supabase.from("zifit_plan_days").update({ day_number: a.day_number }).eq("id", b.id);
  await supabase.from("zifit_plan_days").update({ day_number: b.day_number }).eq("id", a.id);
  reimprospateaza(planId);
}

export async function stergeZi(fd: FormData) {
  await requireAdmin();
  const planId = txt(fd, "plan_id");
  const supabase = await createClient();
  await supabase.from("zifit_plan_days").delete().eq("id", txt(fd, "day_id"));
  // Renumerotam zilele ramase ca sa nu ramana goluri (1, 2, 3...).
  const { data: zile } = await supabase.from("zifit_plan_days").select("id, day_number").eq("plan_id", planId).order("day_number");
  for (const [idx, z] of (zile ?? []).entries()) {
    if (z.day_number !== idx + 1) await supabase.from("zifit_plan_days").update({ day_number: idx + 1 }).eq("id", z.id);
  }
  await sincronizeazaZile(planId);
  reimprospateaza(planId);
}

// ---------- Elemente (exercitii / mese) ----------
function citesteElement(fd: FormData) {
  const kind = txt(fd, "kind");
  const name = txt(fd, "name");
  if (!["exercitiu", "masa"].includes(kind) || !name || name.length > 150) return null;
  const sets = intOpt(fd, "sets", 100);
  const rest = intOpt(fd, "rest_seconds", 3600);
  const reps = txt(fd, "reps").slice(0, 60);
  const details = txt(fd, "details").slice(0, 1000);
  if (Number.isNaN(sets) || Number.isNaN(rest)) return null;
  return {
    kind,
    name,
    sets: kind === "exercitiu" ? sets : null,
    reps: kind === "exercitiu" ? reps || null : null,
    rest_seconds: kind === "exercitiu" ? rest : null,
    details: details || null,
  };
}

export async function adaugaElement(fd: FormData) {
  await requireAdmin();
  const planId = txt(fd, "plan_id");
  const dayId = txt(fd, "day_id");
  const date = citesteElement(fd);
  if (!date) return;
  const supabase = await createClient();
  const { data } = await supabase.from("zifit_day_items").select("position").eq("day_id", dayId).order("position", { ascending: false }).limit(1);
  await supabase.from("zifit_day_items").insert({ ...date, day_id: dayId, position: (data?.[0]?.position ?? 0) + 1 });
  reimprospateaza(planId);
}

export async function salveazaElement(fd: FormData) {
  await requireAdmin();
  const planId = txt(fd, "plan_id");
  const date = citesteElement(fd);
  if (!date) return;
  const supabase = await createClient();
  await supabase.from("zifit_day_items").update(date).eq("id", txt(fd, "item_id"));
  reimprospateaza(planId);
}

export async function mutaElement(fd: FormData) {
  await requireAdmin();
  const planId = txt(fd, "plan_id");
  const dayId = txt(fd, "day_id");
  const itemId = txt(fd, "item_id");
  const sus = txt(fd, "directie") === "sus";
  const supabase = await createClient();
  const { data } = await supabase.from("zifit_day_items").select("id, position").eq("day_id", dayId).order("position").order("id");
  const lista = data ?? [];
  const i = lista.findIndex((x) => x.id === itemId);
  const j = sus ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= lista.length) return;
  // Renumerotam 1..n si schimbam locurile, ca pozitiile egale sa nu strice ordinea.
  const ordine = lista.map((x) => x.id);
  [ordine[i], ordine[j]] = [ordine[j], ordine[i]];
  for (const [idx, id] of ordine.entries()) {
    await supabase.from("zifit_day_items").update({ position: idx + 1 }).eq("id", id);
  }
  reimprospateaza(planId);
}

export async function stergeElement(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("zifit_day_items").delete().eq("id", txt(fd, "item_id"));
  reimprospateaza(txt(fd, "plan_id"));
}

// ---------- Utilizatori ----------
export async function seteazaRol(fd: FormData) {
  const eu = await requireAdmin();
  const userId = txt(fd, "user_id");
  const rol = txt(fd, "rol");
  if (userId === eu.id) redirect("/dashboard/utilizatori?eroare=propriul-cont"); // adminul nu se scoate singur din admin
  if (!["client", "admin"].includes(rol)) return;
  const supabase = await createClient();
  await supabase.from("zifit_profiles").update({ role: rol }).eq("id", userId);
  reimprospateaza();
}

export async function seteazaBlocat(fd: FormData) {
  const eu = await requireAdmin();
  const userId = txt(fd, "user_id");
  const blocat = txt(fd, "blocat") === "true";
  if (userId === eu.id) redirect("/dashboard/utilizatori?eroare=propriul-cont"); // adminul nu se blocheaza singur
  const supabase = await createClient();
  await supabase.from("zifit_profiles").update({ blocked: blocat }).eq("id", userId);
  reimprospateaza();
}

export async function stergeUtilizator(fd: FormData) {
  const eu = await requireAdmin();
  const userId = txt(fd, "user_id");
  if (userId === eu.id) redirect("/dashboard/utilizatori?eroare=propriul-cont"); // adminul nu se sterge singur
  // Stergerea contului din Auth necesita service role; profilul, comenzile si progresul se sterg in cascada.
  await createAdminClient().auth.admin.deleteUser(userId);
  reimprospateaza();
}

// ---------- Mesaje ----------
export async function marcheazaCitit(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("zifit_mesaje").update({ is_read: txt(fd, "citit") !== "false" }).eq("id", txt(fd, "id"));
  reimprospateaza();
}

export async function stergeMesaj(fd: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("zifit_mesaje").delete().eq("id", txt(fd, "id"));
  reimprospateaza();
}
