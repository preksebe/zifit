import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PlanCard } from "@/components/PlanCard";
import { faraOrfane as T } from "@/lib/fara-orfane";
import { CATEGORII, DIFICULTATI } from "@/lib/labels";
import { getPlans, getPlanTypes } from "@/lib/plans";

export const metadata: Metadata = { title: "Planuri · ZiFit" };

type SearchParams = Promise<{ [cheie: string]: string | string[] | undefined }>;

const unul = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const SELECT = "mt-1 w-full rounded-md border border-border bg-card px-3 py-2";

async function Lista({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tipuri = await getPlanTypes();

  // Acceptam doar valori cunoscute din URL.
  const categorie = unul(sp.categorie);
  const dificultate = unul(sp.dificultate);
  const tip = unul(sp.tip);
  const filtre = {
    categorie: categorie && categorie in CATEGORII ? categorie : undefined,
    dificultate: dificultate && dificultate in DIFICULTATI ? dificultate : undefined,
    tip: tip && tipuri.includes(tip) ? tip : undefined,
  };
  const planuri = await getPlans(filtre);
  const activ = Boolean(filtre.categorie || filtre.dificultate || filtre.tip);

  return (
    <>
      {/* Filtre prin parametri in URL (GET): merg si fara JavaScript */}
      <form method="get" action="/planuri" className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-4 sm:items-end">
        <div>
          <label htmlFor="categorie" className="text-sm font-medium">
            Categorie
          </label>
          <select id="categorie" name="categorie" defaultValue={filtre.categorie ?? ""} className={SELECT}>
            <option value="">Toate</option>
            {Object.entries(CATEGORII).map(([v, e]) => (
              <option key={v} value={v}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tip" className="text-sm font-medium">
            Tip
          </label>
          <select id="tip" name="tip" defaultValue={filtre.tip ?? ""} className={SELECT}>
            <option value="">Toate</option>
            {tipuri.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dificultate" className="text-sm font-medium">
            Dificultate
          </label>
          <select id="dificultate" name="dificultate" defaultValue={filtre.dificultate ?? ""} className={SELECT}>
            <option value="">Toate</option>
            {Object.entries(DIFICULTATI).map(([v, e]) => (
              <option key={v} value={v}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-sport px-4 py-2 font-medium text-on-accent">
            Filtrează
          </button>
          {activ && (
            <Link href="/planuri" className="rounded-md border border-border px-4 py-2 font-medium">
              Resetează
            </Link>
          )}
        </div>
      </form>

      {planuri.length === 0 ? (
        <p className="mt-8 text-muted">{T("Niciun plan nu se potrivește filtrelor.")}</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {planuri.map((p) => (
            <li key={p.id}>
              <PlanCard plan={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-4xl uppercase sm:text-5xl">Planurile ZiFit</h1>
      <p className="mt-3 max-w-xl text-muted">
        {T("Alege un plan și vezi ce ai de făcut în fiecare zi. Poți filtra după ce te interesează.")}
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-muted">Se încarcă planurile…</p>}>
          <Lista searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
