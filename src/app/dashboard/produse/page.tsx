import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import { BTN, BTN_SECOND } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { CATEGORII, formatPret } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { comutaPublicat, stergePlan } from "../actions";

export const metadata: Metadata = { title: "Produse · Dashboard · ZiFit" };

export default async function Page({ searchParams }: { searchParams: Promise<{ eroare?: string }> }) {
  await requireAdmin();
  const { eroare } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("zifit_plans")
    .select("id, slug, title, category, price_cents, currency, published, is_test, days_count")
    .order("created_at");
  const planuri = data ?? [];

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl uppercase tracking-wide">Produse</h1>
        <Link href="/dashboard/produse/nou" className={BTN}>
          Adaugă plan
        </Link>
      </div>

      {eroare === "plan-cu-comenzi" && (
        <p role="alert" className="mt-4 rounded-md border border-red-700 bg-card px-3 py-2 text-sm text-red-700">
          Planul are comenzi și nu poate fi șters. Ascunde-l, ca să dispară din magazin.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-border bg-sidebar">
            <tr>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Categorie</th>
              <th className="px-3 py-2">Zile</th>
              <th className="px-3 py-2">Preț</th>
              <th className="px-3 py-2">Stare</th>
              <th className="px-3 py-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {planuri.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2 font-medium">
                  {p.title}
                  <span className="block text-xs font-normal text-muted">/{p.slug}</span>
                </td>
                <td className="px-3 py-2">{CATEGORII[p.category as keyof typeof CATEGORII]}</td>
                <td className="px-3 py-2">{p.days_count}</td>
                <td className="px-3 py-2">{formatPret(p.price_cents, p.currency)}</td>
                <td className="px-3 py-2">{p.published ? "Publicat" : "Ascuns"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap items-start gap-2">
                    <Link href={`/dashboard/produse/${p.id}`} className={BTN_SECOND}>
                      Editează
                    </Link>
                    <form action={comutaPublicat}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="publicat" value={String(!p.published)} />
                      <button type="submit" className={BTN_SECOND}>
                        {p.published ? "Ascunde" : "Publică"}
                      </button>
                    </form>
                    <ConfirmAction
                      action={stergePlan}
                      fields={{ id: p.id }}
                      label="Șterge"
                      question={`Ștergi planul „${p.title}”? Nu se poate anula.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {planuri.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-muted">
                  Nu există planuri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
