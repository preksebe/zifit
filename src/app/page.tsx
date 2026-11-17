import Link from "next/link";
import { Suspense } from "react";
import { PlanCard } from "@/components/PlanCard";
import { faraOrfane as T } from "@/lib/fara-orfane";
import { getPlans } from "@/lib/plans";

const BUTON = "inline-block rounded-md bg-sport px-5 py-3 font-medium text-on-accent";

const PASI = [
  ["1. Alegi planul", "Răsfoiești planurile de sport și de nutriție și îl alegi pe cel care ți se potrivește."],
  ["2. Îl cumperi", "Plătești o singură dată, iar planul apare în contul tău."],
  ["3. Îl urmezi zi cu zi", "Fiecare zi are programul ei. Când termini, bifezi ziua, iar progresul rămâne salvat."],
] as const;

async function PlanuriRecomandate() {
  const planuri = await getPlans();
  if (planuri.length === 0) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {planuri.map((p) => (
        <li key={p.id}>
          <PlanCard plan={p} />
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h1 className="max-w-2xl text-5xl uppercase leading-tight sm:text-6xl">{T("O zi, un antrenament")}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          {T("Planuri de sport și de nutriție împărțite pe zile. Deschizi planul, vezi ce ai de făcut azi și bifezi.")}
        </p>
        <Link href="/planuri" className={`${BUTON} mt-6`}>
          Vezi planurile
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="text-3xl uppercase">Planurile ZiFit</h2>
        <div className="mt-5">
          <Suspense fallback={<p className="text-muted">Se încarcă planurile…</p>}>
            <PlanuriRecomandate />
          </Suspense>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-3xl uppercase">Cum funcționează</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {PASI.map(([titlu, text]) => (
              <li key={titlu}>
                <h3 className="text-xl">{T(titlu)}</h3>
                <p className="mt-2 text-muted">{T(text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="max-w-xl text-3xl uppercase">{T("Mișcare și mese, în același loc")}</h2>
        <p className="mt-4 max-w-prose text-muted">
          {T(
            "Planurile de sport te duc prin antrenamente, o zi pe rând. Planul de nutriție îți spune ce mănânci în fiecare zi: 3 mese și 2 gustări. Le poți lua separat sau împreună.",
          )}
        </p>
        <p className="mt-8 text-xl font-medium">{T("Începe cu prima zi. Restul vine după ea.")}</p>
        <Link href="/planuri" className={`${BUTON} mt-4`}>
          Vezi planurile
        </Link>
      </section>
    </main>
  );
}
