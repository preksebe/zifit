import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CalendarCheck, Search, ShoppingBag } from "lucide-react";
import { PlanCard } from "@/components/PlanCard";
import { faraOrfane as T } from "@/lib/fara-orfane";
import { getCategoryCounts, getFeaturedPlans } from "@/lib/plans";

const BUTON = "inline-block rounded-md bg-sport px-5 py-3 font-medium text-on-accent";

const PASI = [
  { Icon: Search, titlu: "1. Alegi planul", text: "Răsfoiești planurile de sport și de nutriție și îl alegi pe cel care ți se potrivește." },
  { Icon: ShoppingBag, titlu: "2. Îl cumperi", text: "Plătești o singură dată, iar planul apare în contul tău." },
  { Icon: CalendarCheck, titlu: "3. Îl urmezi zi cu zi", text: "Fiecare zi are programul ei. Când termini, bifezi ziua, iar progresul rămâne salvat." },
] as const;

// Planurile recomandate (slug-uri); daca unul nu exista, se ia alt plan publicat.
const RECOMANDATE = ["mobilitate", "yoga-de-dimineata", "nutritie-echilibrata"];

// „1 plan”, „12 planuri”, „25 de planuri”
const planuri = (n: number) => (n === 1 ? "1 plan" : n >= 20 ? `${n} de planuri` : `${n} planuri`);

async function Categorii() {
  const n = await getCategoryCounts();
  const carduri = [
    { titlu: "Planuri de sport", numar: n.sport, href: "/planuri?categorie=sport", link: "Vezi planurile de sport", banda: "bg-sport", text: "text-sport" },
    { titlu: "Planuri de nutriție", numar: n.nutritie, href: "/planuri?categorie=nutritie", link: "Vezi planurile de nutriție", banda: "bg-nutritie", text: "text-nutritie" },
  ];
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {carduri.map((c) => (
        <li key={c.href}>
          <Link
            href={c.href}
            className="block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <div className={`h-2 ${c.banda}`} />
            <div className="p-6">
              <h3 className="text-3xl uppercase">{T(c.titlu)}</h3>
              <p className={`mt-2 text-lg font-medium ${c.text}`}>{planuri(c.numar)}</p>
              <p className={`mt-4 flex items-center gap-1.5 font-medium underline ${c.text}`}>
                {c.link} <ArrowRight size={16} aria-hidden />
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function PlanuriRecomandate() {
  const lista = await getFeaturedPlans(RECOMANDATE, 3);
  if (lista.length === 0) return null;
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lista.map((p) => (
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
      {/* 1. Hero */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <h1 className="max-w-2xl text-5xl uppercase leading-tight sm:text-6xl">{T("O zi, un antrenament")}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          {T("Planuri de sport și de nutriție împărțite pe zile. Deschizi planul, vezi ce ai de făcut azi și bifezi.")}
        </p>
        <Link href="/planuri" className={`${BUTON} mt-6`}>
          Vezi planurile
        </Link>
      </section>

      {/* 2. Cum funcționează */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-3xl uppercase">Cum funcționează</h2>
          <ol className="mt-6 grid gap-8 sm:grid-cols-3">
            {PASI.map(({ Icon, titlu, text }) => (
              <li key={titlu}>
                <span className="flex size-12 items-center justify-center rounded-full bg-sidebar text-sport">
                  <Icon size={24} aria-hidden />
                </span>
                <h3 className="mt-3 text-xl">{T(titlu)}</h3>
                <p className="mt-2 text-muted">{T(text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. Sport și nutriție */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="max-w-xl text-3xl uppercase">{T("Mișcare și mese, în același loc")}</h2>
        <p className="mt-4 max-w-prose text-muted">
          {T(
            "Planurile de sport te duc prin antrenamente, o zi pe rând. Planul de nutriție îți spune ce mănânci în fiecare zi: 3 mese și 2 gustări. Le poți lua separat sau împreună.",
          )}
        </p>
        <Suspense fallback={<p className="mt-8 text-muted">Se încarcă…</p>}>
          <Categorii />
        </Suspense>
      </section>

      {/* 4. Planuri recomandate */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <h2 className="max-w-xl text-3xl uppercase">{T("Câteva planuri cu care poți începe")}</h2>
        <Suspense fallback={<p className="mt-6 text-muted">Se încarcă planurile…</p>}>
          <PlanuriRecomandate />
        </Suspense>
        <p className="mt-6">
          <Link href="/planuri" className="inline-flex items-center gap-1.5 font-medium text-sport underline">
            Toate planurile <ArrowRight size={16} aria-hidden />
          </Link>
        </p>
      </section>

      {/* 5. Îndemn final */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <p className="max-w-xl text-3xl font-medium">{T("Începe cu prima zi. Restul vine după ea.")}</p>
          <Link href="/planuri" className={`${BUTON} mt-6`}>
            Alege un plan
          </Link>
        </div>
      </section>
    </main>
  );
}
