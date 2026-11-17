import { createClient } from "@/lib/supabase/server";

export type Plan = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: "sport" | "nutritie";
  type: string | null;
  difficulty: "usor" | "mediu" | "avansat" | null;
  equipment: string | null;
  days_count: number;
  description: string | null;
  price_cents: number;
  currency: string;
  is_test: boolean;
};

export type DayItem = {
  position: number;
  kind: "exercitiu" | "masa";
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  details: string | null;
};

export type Day = { day_number: number; title: string | null; notes: string | null; items: DayItem[] };

const COLUMNS =
  "id, slug, title, subtitle, category, type, difficulty, equipment, days_count, description, price_cents, currency, is_test";

export type Filtre = { categorie?: string; tip?: string; dificultate?: string };

// Citirile sunt facute cu cheia publica, sub RLS: anonimul vede doar planurile publicate.
export async function getPlans(filtre: Filtre = {}): Promise<Plan[]> {
  const supabase = await createClient();
  let q = supabase.from("zifit_plans").select(COLUMNS).eq("published", true).order("created_at").order("title");
  if (filtre.categorie) q = q.eq("category", filtre.categorie);
  if (filtre.tip) q = q.eq("type", filtre.tip);
  if (filtre.dificultate) q = q.eq("difficulty", filtre.dificultate);
  const { data } = await q;
  return (data ?? []) as Plan[];
}

export async function getPlanTypes(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("zifit_plans").select("type").eq("published", true);
  return [...new Set((data ?? []).map((r) => r.type).filter((t): t is string => !!t))].sort((a, b) => a.localeCompare(b, "ro"));
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("zifit_plans").select(COLUMNS).eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Plan) ?? null;
}

// Ziua 1 e publica (previzualizare). Zilele 2+ nu se citesc de aici: RLS le ascunde necumparatorilor.
export async function getDay1(planId: string): Promise<Day | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("zifit_plan_days")
    .select("day_number, title, notes, zifit_day_items(position, kind, name, sets, reps, rest_seconds, details)")
    .eq("plan_id", planId)
    .eq("day_number", 1)
    .maybeSingle();
  if (!data) return null;
  const items = ([...(data.zifit_day_items ?? [])] as DayItem[]).sort((a, b) => a.position - b.position);
  return { day_number: data.day_number, title: data.title, notes: data.notes, items };
}
