import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { repetaProgramul, terminaZiua } from "@/app/actions/plan";
import { ConfirmAction } from "@/components/ConfirmAction";
import { DayItems } from "@/components/DayItems";
import { getCurrentProfile } from "@/lib/auth";
import { faraOrfane as T } from "@/lib/fara-orfane";
import { CULORI_CATEGORIE } from "@/lib/labels";
import type { DayItem } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Planul meu · ZiFit" };

type Zi = { day_number: number; title: string | null; notes: string | null; zifit_day_items: (DayItem & { id: string })[] };

async function PlanCumparat({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ zi?: string; plata?: string }> }) {
  const { slug } = await params;
  const { zi: ziParam, plata } = await searchParams;
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");

  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("zifit_plans")
    .select("id, slug, title, category, days_count")
    .eq("slug", slug)
    .maybeSingle();
  if (!plan) notFound();

  // Fara comanda platita nu se vede planul: trimitem la pagina publica (ziua 1 + zilele blocate).
  const { data: platit } = await supabase
    .from("zifit_orders")
    .select("id")
    .eq("plan_id", plan.id)
    .eq("user_id", profil.id)
    .eq("status", "platita")
    .limit(1);
  if (!platit || platit.length === 0) redirect(`/planuri/${slug}`);

  const [{ data: zileRaw }, { data: progres }] = await Promise.all([
    supabase
      .from("zifit_plan_days")
      .select("day_number, title, notes, zifit_day_items(id, position, kind, name, sets, reps, rest_seconds, details)")
      .eq("plan_id", plan.id)
      .order("day_number"),
    supabase.from("zifit_progress").select("day_number").eq("plan_id", plan.id).eq("user_id", profil.id),
  ]);
  const zile = (zileRaw ?? []) as unknown as Zi[];
  const facute = new Set((progres ?? []).map((r) => r.day_number));
  const total = zile.length;
  const nFacute = zile.filter((z) => facute.has(z.day_number)).length;
  const toateFacute = total > 0 && nFacute === total;

  // Ziua curenta: cea din adresa (?zi=), altfel prima nefacuta, altfel ultima.
  const cerut = Number(ziParam);
  const prima = zile.find((z) => !facute.has(z.day_number));
  const curenta = zile.find((z) => z.day_number === cerut) ?? prima ?? zile[zile.length - 1];
  const culori = CULORI_CATEGORIE[plan.category as "sport" | "nutritie"];

  return (
    <>
      <Link href="/contul-meu" className="text-sm text-muted underline">
        ← Contul meu
      </Link>
      <h1 className="mt-2 text-4xl uppercase leading-tight sm:text-5xl">{T(plan.title)}</h1>

      {plata === "reusita" && (
        <p role="status" className="mt-4 max-w-prose rounded-md border border-border bg-card px-4 py-3">
          {T("Plata de test a reușit. Nu s-a încasat nimic. Planul a fost adăugat în contul tău.")}
        </p>
      )}

      <div
        className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={nFacute}
        aria-label={`Progres: ${nFacute} din ${total} zile`}
      >
        <div className={`h-full ${culori.banda}`} style={{ width: total ? `${(nFacute / total) * 100}%` : "0%" }} />
      </div>
      <p className="mt-1 text-sm text-muted">
        {nFacute} din {total} zile
      </p>
      {toateFacute && <p className="mt-2 font-medium">{T("Ai terminat planul. Îl poți repeta de la ziua 1.")}</p>}

      <div className="mt-8 grid gap-8 md:grid-cols-[14rem_1fr]">
        <nav aria-label="Zilele planului">
          <h2 className="text-xl uppercase">Zilele</h2>
          <ol className="mt-3 grid grid-cols-5 gap-2 md:grid-cols-3">
            {zile.map((z) => {
              const gata = facute.has(z.day_number);
              const activ = curenta?.day_number === z.day_number;
              return (
                <li key={z.day_number}>
                  <Link
                    href={`/contul-meu/planuri/${slug}?zi=${z.day_number}`}
                    aria-current={activ ? "step" : undefined}
                    aria-label={`Ziua ${z.day_number}${gata ? ", terminată" : ""}`}
                    className={`flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-sm font-medium ${
                      activ ? `border-transparent text-on-accent ${culori.buton}` : gata ? "border-border bg-sidebar" : "border-border bg-card"
                    }`}
                  >
                    {z.day_number}
                    {gata && <Check size={14} aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        {curenta && (
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-2xl">{T(`Ziua ${curenta.day_number}${curenta.title ? ` · ${curenta.title}` : ""}`)}</h2>
            {curenta.notes && <p className="mt-1 text-sm text-muted">{T(curenta.notes)}</p>}
            <DayItems items={[...curenta.zifit_day_items].sort((a, b) => a.position - b.position)} />

            <div className="mt-5 flex flex-wrap items-start gap-3">
              {facute.has(curenta.day_number) ? (
                <p className="flex items-center gap-1.5 font-medium">
                  <Check size={16} aria-hidden /> Ziua e terminată
                </p>
              ) : (
                <form action={terminaZiua}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="zi" value={curenta.day_number} />
                  <button type="submit" className={`rounded-md px-5 py-3 font-medium text-on-accent ${culori.buton}`}>
                    Am terminat ziua
                  </button>
                </form>
              )}
              <ConfirmAction
                action={repetaProgramul}
                fields={{ slug }}
                label="Repetă programul"
                question="Repeți programul? Se șterge progresul pentru acest plan și începi de la ziua 1."
                confirmLabel="Da, repet"
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ zi?: string; plata?: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-muted">Se încarcă planul…</p>}>
        <PlanCumparat params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
