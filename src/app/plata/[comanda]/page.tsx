import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { cumpara, simuleazaPlata } from "@/app/actions/comanda";
import { BTN, BTN_SECOND } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { faraOrfane as T } from "@/lib/fara-orfane";
import { formatPret } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Plată de test · ZiFit" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function Plata({ params }: { params: Promise<{ comanda: string }> }) {
  const { comanda: comandaId } = await params;
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");
  if (!UUID_RE.test(comandaId)) notFound();

  // Comanda se citeste sub RLS: clientul o vede doar pe a lui.
  const supabase = await createClient();
  const { data: comanda } = await supabase
    .from("zifit_orders")
    .select("id, amount_cents, status, provider, zifit_plans(slug, title, currency)")
    .eq("id", comandaId)
    .eq("user_id", profil.id)
    .maybeSingle();
  if (!comanda) notFound();

  const plan = comanda.zifit_plans as unknown as { slug: string; title: string; currency: string } | null;
  if (!plan) notFound();
  if (comanda.status === "platita") redirect(`/contul-meu/planuri/${plan.slug}`);

  return (
    <>
      <p role="note" className="rounded-md border-2 border-foreground bg-card px-4 py-3 text-center font-display text-xl uppercase tracking-wide">
        PLATĂ DE TEST: nu se percep bani
      </p>

      <h1 className="mt-6 text-4xl uppercase sm:text-5xl">{T("Plata planului")}</h1>
      <div className="mt-4 max-w-md rounded-lg border border-border bg-card p-5">
        <p className="text-muted">Plan</p>
        <p className="text-xl font-medium">{T(plan.title)}</p>
        <p className="mt-3 text-muted">Sumă</p>
        <p className="text-2xl font-medium">{formatPret(comanda.amount_cents, plan.currency)}</p>
      </div>

      {comanda.status === "esuata" ? (
        <div className="mt-6 max-w-md space-y-4">
          <p role="alert" className="rounded-md border border-red-700 bg-card px-4 py-3 text-red-700">
            {T("Plata de test a eșuat. Nu s-a încasat nimic. Poți încerca din nou.")}
          </p>
          <form action={cumpara}>
            <input type="hidden" name="slug" value={plan.slug} />
            <button type="submit" className={BTN}>
              Încearcă din nou
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          {/* Fara campuri de card, ca sa nu para ca cere date reale. */}
          <form action={simuleazaPlata}>
            <input type="hidden" name="comanda" value={comanda.id} />
            <input type="hidden" name="rezultat" value="reusita" />
            <button type="submit" className={BTN}>
              Simulează plata reușită
            </button>
          </form>
          <form action={simuleazaPlata}>
            <input type="hidden" name="comanda" value={comanda.id} />
            <input type="hidden" name="rezultat" value="esuata" />
            <button type="submit" className={`${BTN_SECOND} py-2`}>
              Simulează plata eșuată
            </button>
          </form>
        </div>
      )}

      <p className="mt-8">
        <Link href={`/planuri/${plan.slug}`} className="text-sm text-muted underline">
          Înapoi la plan
        </Link>
      </p>
    </>
  );
}

export default function Page({ params }: { params: Promise<{ comanda: string }> }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-muted">Se încarcă…</p>}>
        <Plata params={params} />
      </Suspense>
    </main>
  );
}
