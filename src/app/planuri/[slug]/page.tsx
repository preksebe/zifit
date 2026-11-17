import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { cumpara } from "@/app/actions/comanda";
import { CopertaPlan } from "@/components/CopertaPlan";
import { DayItems } from "@/components/DayItems";
import { getCurrentProfile } from "@/lib/auth";
import { faraOrfane as T } from "@/lib/fara-orfane";
import { CULORI_CATEGORIE, ceaPrimesti, formatPret } from "@/lib/labels";
import { getDay1, getPlanBySlug } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Plan · ZiFit" };

async function Plan({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = await getPlanBySlug(slug);
  if (!plan) notFound();
  const zi1 = await getDay1(plan.id);
  const culori = CULORI_CATEGORIE[plan.category];
  const paragrafe = (plan.description ?? "").split(/\n\n+/).filter(Boolean);
  const zileBlocate = Array.from({ length: Math.max(plan.days_count - 1, 0) }, (_, i) => i + 2);

  // Are userul conectat deja planul? (comanda platita, citita sub RLS)
  const profil = await getCurrentProfile();
  let areDeja = false;
  if (profil) {
    const supabase = await createClient();
    const { data } = await supabase.from("zifit_orders").select("id").eq("plan_id", plan.id).eq("user_id", profil.id).eq("status", "platita").limit(1);
    areDeja = (data?.length ?? 0) > 0;
  }
  const butonCumpara = `mt-3 inline-block rounded-md px-5 py-3 font-medium text-on-accent ${culori.buton}`;

  return (
    <>
      <div className="grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr]">
        <CopertaPlan {...plan} />

        <div>
          {plan.is_test && (
            <p className="inline-block rounded-md border border-border bg-card px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted">
              Conținut de test
            </p>
          )}
          <h1 className="mt-2 text-4xl uppercase leading-tight sm:text-5xl">{T(plan.title)}</h1>
          <div className="mt-4 max-w-prose space-y-3">
            {paragrafe.map((p, i) => (
              <p key={i}>{T(p)}</p>
            ))}
          </div>

          <h2 className="mt-6 text-2xl uppercase">Ce primești</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {ceaPrimesti(plan.slug, plan.days_count).map((t) => (
              <li key={t}>{T(t)}</li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <p className="text-3xl font-medium">{formatPret(plan.price_cents, plan.currency)}</p>
            {plan.is_test && <p className="text-sm text-muted">preț de test</p>}
          </div>

          {areDeja ? (
            <div className="mt-3">
              <p className="font-medium">Ai deja acest plan</p>
              <Link href={`/contul-meu/planuri/${plan.slug}`} className={butonCumpara}>
                Deschide planul
              </Link>
            </div>
          ) : profil ? (
            <form action={cumpara}>
              <input type="hidden" name="slug" value={plan.slug} />
              <button type="submit" className={butonCumpara}>
                Cumpără planul
              </button>
            </form>
          ) : (
            <Link href="/autentificare" className={butonCumpara}>
              Cumpără planul
            </Link>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-3xl uppercase">Previzualizare: ziua 1</h2>
        {zi1 ? (
          <div className="mt-4 rounded-lg border border-border bg-card p-5">
            <h3 className="text-xl">{T(`Ziua 1${zi1.title ? ` · ${zi1.title}` : ""}`)}</h3>
            {zi1.notes && <p className="mt-1 text-sm text-muted">{T(zi1.notes)}</p>}
            <DayItems items={zi1.items} />
          </div>
        ) : (
          <p className="mt-3 text-muted">Previzualizarea nu e disponibilă.</p>
        )}
      </section>

      {zileBlocate.length > 0 && !areDeja && (
        <section className="mt-10">
          <h2 className="text-3xl uppercase">Restul zilelor</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {zileBlocate.map((n) => (
              <li key={n} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
                <span className="font-medium">Ziua {n}</span>
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <Lock size={14} aria-hidden /> Disponibil după cumpărare
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-muted">Se încarcă planul…</p>}>
        <Plan params={params} />
      </Suspense>
    </main>
  );
}
