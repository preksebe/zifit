import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ConfirmAction } from "@/components/ConfirmAction";
import { PlanForm } from "@/components/dashboard/PlanForm";
import { BTN, BTN_SECOND, INPUT_SM, LABEL } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { adaugaElement, adaugaZi, mutaElement, mutaZi, salveazaElement, salveazaZi, stergeElement, stergeZi } from "../../actions";

export const metadata: Metadata = { title: "Editor plan · Dashboard · ZiFit" };

type Item = {
  id: string;
  position: number;
  kind: "exercitiu" | "masa";
  name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  details: string | null;
};

function ButonMutare({ action, fields, directie, eticheta }: { action: (fd: FormData) => void | Promise<void>; fields: Record<string, string>; directie: "sus" | "jos"; eticheta: string }) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input type="hidden" name="directie" value={directie} />
      <button type="submit" aria-label={eticheta} title={eticheta} className={`${BTN_SECOND} px-2`}>
        {directie === "sus" ? <ArrowUp size={14} aria-hidden /> : <ArrowDown size={14} aria-hidden />}
      </button>
    </form>
  );
}

function CampuriElement({ kind, item }: { kind: "exercitiu" | "masa"; item?: Item }) {
  return (
    <>
      <input type="hidden" name="kind" value={kind} />
      <div className="min-w-48 flex-1">
        <label className={LABEL}>{kind === "masa" ? "Masa" : "Exercițiu"}</label>
        <input name="name" required maxLength={150} defaultValue={item?.name} className={INPUT_SM} />
      </div>
      {kind === "exercitiu" && (
        <>
          <div className="w-20">
            <label className={LABEL}>Serii</label>
            <input name="sets" type="number" min={0} max={100} defaultValue={item?.sets ?? ""} className={INPUT_SM} />
          </div>
          <div className="w-32">
            <label className={LABEL}>Repetări</label>
            <input name="reps" maxLength={60} defaultValue={item?.reps ?? ""} className={INPUT_SM} />
          </div>
          <div className="w-24">
            <label className={LABEL}>Pauză (s)</label>
            <input name="rest_seconds" type="number" min={0} max={3600} defaultValue={item?.rest_seconds ?? ""} className={INPUT_SM} />
          </div>
        </>
      )}
      <div className="min-w-48 flex-1">
        <label className={LABEL}>Detalii</label>
        <input name="details" maxLength={1000} defaultValue={item?.details ?? ""} className={INPUT_SM} />
      </div>
    </>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const supabase = await createClient();
  const { data: plan } = await supabase.from("zifit_plans").select("*").eq("id", id).maybeSingle();
  if (!plan) notFound();

  const { data: zileRaw } = await supabase
    .from("zifit_plan_days")
    .select("id, day_number, title, notes, zifit_day_items(id, position, kind, name, sets, reps, rest_seconds, details)")
    .eq("plan_id", id)
    .order("day_number");
  const zile = zileRaw ?? [];
  const kindImplicit = plan.category === "nutritie" ? "masa" : "exercitiu";

  return (
    <main>
      <Link href="/dashboard/produse" className="text-sm text-muted underline">
        ← Produse
      </Link>
      <h1 className="mt-2 mb-6 text-4xl uppercase tracking-wide">{plan.title}</h1>

      <PlanForm
        initial={{
          id: plan.id,
          title: plan.title,
          slug: plan.slug,
          subtitle: plan.subtitle ?? "",
          category: plan.category,
          type: plan.type ?? "",
          difficulty: plan.difficulty ?? "",
          equipment: plan.equipment ?? "",
          description: plan.description ?? "",
          price: String(plan.price_cents / 100),
          published: plan.published,
          cover_url: plan.cover_url,
        }}
      />

      <h2 className="mt-12 text-3xl uppercase">Zilele planului</h2>
      <p className="mt-1 text-sm text-muted">Număr de zile: {zile.length}. Se actualizează singur când adaugi sau ștergi zile.</p>

      <div className="mt-4 space-y-6">
        {zile.map((z, zi) => {
          const items = ([...(z.zifit_day_items ?? [])] as Item[]).sort((a, b) => a.position - b.position);
          return (
            <section key={z.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-2xl">Ziua {z.day_number}</h3>
                <div className="flex flex-wrap items-start gap-2">
                  {zi > 0 && <ButonMutare action={mutaZi} fields={{ plan_id: id, day_id: z.id }} directie="sus" eticheta={`Mută ziua ${z.day_number} mai sus`} />}
                  {zi < zile.length - 1 && <ButonMutare action={mutaZi} fields={{ plan_id: id, day_id: z.id }} directie="jos" eticheta={`Mută ziua ${z.day_number} mai jos`} />}
                  <ConfirmAction
                    action={stergeZi}
                    fields={{ plan_id: id, day_id: z.id }}
                    label="Șterge ziua"
                    question={`Ștergi ziua ${z.day_number} cu tot ce conține?`}
                  />
                </div>
              </div>

              <form action={salveazaZi} className="mt-3 flex flex-wrap items-end gap-3">
                <input type="hidden" name="plan_id" value={id} />
                <input type="hidden" name="day_id" value={z.id} />
                <div className="min-w-48 flex-1">
                  <label className={LABEL}>Titlul zilei</label>
                  <input name="title" maxLength={120} defaultValue={z.title ?? ""} className={INPUT_SM} />
                </div>
                <div className="min-w-48 flex-[2]">
                  <label className={LABEL}>Notă</label>
                  <input name="notes" maxLength={1000} defaultValue={z.notes ?? ""} className={INPUT_SM} />
                </div>
                <button type="submit" className={BTN_SECOND}>
                  Salvează ziua
                </button>
              </form>

              <ul className="mt-4 space-y-3">
                {items.map((it, ii) => (
                  <li key={it.id} className="rounded-md border border-border bg-background p-3">
                    <div className="flex flex-wrap items-end gap-2">
                      <form action={salveazaElement} className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
                        <input type="hidden" name="plan_id" value={id} />
                        <input type="hidden" name="item_id" value={it.id} />
                        <CampuriElement kind={it.kind} item={it} />
                        <button type="submit" className={BTN_SECOND}>
                          Salvează
                        </button>
                      </form>
                      <div className="flex items-start gap-2">
                        {ii > 0 && <ButonMutare action={mutaElement} fields={{ plan_id: id, day_id: z.id, item_id: it.id }} directie="sus" eticheta={`Mută „${it.name}” mai sus`} />}
                        {ii < items.length - 1 && <ButonMutare action={mutaElement} fields={{ plan_id: id, day_id: z.id, item_id: it.id }} directie="jos" eticheta={`Mută „${it.name}” mai jos`} />}
                        <ConfirmAction action={stergeElement} fields={{ plan_id: id, item_id: it.id }} label="Șterge" question={`Ștergi „${it.name}”?`} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <details className="mt-4">
                <summary className={`${BTN_SECOND} cursor-pointer list-none`}>Adaugă {kindImplicit === "masa" ? "o masă" : "un exercițiu"}</summary>
                <form action={adaugaElement} className="mt-3 flex flex-wrap items-end gap-2 rounded-md border border-border bg-background p-3">
                  <input type="hidden" name="plan_id" value={id} />
                  <input type="hidden" name="day_id" value={z.id} />
                  <CampuriElement kind={kindImplicit} />
                  <button type="submit" className={BTN}>
                    Adaugă
                  </button>
                </form>
              </details>
            </section>
          );
        })}
      </div>

      <form action={adaugaZi} className="mt-6">
        <input type="hidden" name="plan_id" value={id} />
        <button type="submit" className={BTN}>
          Adaugă o zi
        </button>
      </form>
    </main>
  );
}
