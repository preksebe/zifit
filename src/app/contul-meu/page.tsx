import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { faraOrfane as T } from "@/lib/fara-orfane";
import { CATEGORII, CULORI_CATEGORIE } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Contul meu · ZiFit" };

type PlanCumparat = { id: string; slug: string; title: string; subtitle: string | null; category: "sport" | "nutritie"; days_count: number };

async function Continut() {
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");

  const supabase = await createClient();
  const [{ data: comenzi }, { data: progres }] = await Promise.all([
    supabase
      .from("zifit_orders")
      .select("created_at, zifit_plans(id, slug, title, subtitle, category, days_count)")
      .eq("user_id", profil.id)
      .eq("status", "platita")
      .order("created_at", { ascending: false }),
    supabase.from("zifit_progress").select("plan_id").eq("user_id", profil.id),
  ]);

  // Un plan apare o singura data, chiar daca are mai multe comenzi platite.
  const planuri = new Map<string, PlanCumparat>();
  for (const c of comenzi ?? []) {
    const p = c.zifit_plans as unknown as PlanCumparat | null;
    if (p && !planuri.has(p.id)) planuri.set(p.id, p);
  }
  const facute = new Map<string, number>();
  for (const r of progres ?? []) facute.set(r.plan_id, (facute.get(r.plan_id) ?? 0) + 1);

  return (
    <>
      <p className="mt-3 text-muted">{profil.email}</p>

      <h2 className="mt-8 text-3xl uppercase">Planurile mele</h2>
      {planuri.size === 0 ? (
        <p className="mt-3 max-w-prose">
          {T("Nu ai cumpărat niciun plan încă.")}{" "}
          <Link href="/planuri" className="font-medium text-sport underline">
            Vezi planurile
          </Link>
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {[...planuri.values()].map((p) => {
            const n = Math.min(facute.get(p.id) ?? 0, p.days_count);
            const culori = CULORI_CATEGORIE[p.category];
            return (
              <li key={p.id} className="rounded-lg border border-border bg-card p-5">
                <p className={`text-xs font-medium uppercase tracking-wider ${culori.text}`}>{CATEGORII[p.category]}</p>
                <h3 className="mt-1 text-2xl uppercase">{T(p.title)}</h3>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={p.days_count}
                  aria-valuenow={n}
                  aria-label={`Progres: ${n} din ${p.days_count} zile`}
                >
                  <div className={`h-full ${culori.banda}`} style={{ width: `${(n / p.days_count) * 100}%` }} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {n} din {p.days_count} zile
                </p>
                <Link href={`/contul-meu/planuri/${p.slug}`} className={`mt-3 inline-block rounded-md px-4 py-2 text-sm font-medium text-on-accent ${culori.buton}`}>
                  {n === 0 ? "Începe planul" : "Continuă planul"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-4xl uppercase sm:text-5xl">Contul meu</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Se încarcă…</p>}>
        <Continut />
      </Suspense>
    </main>
  );
}
