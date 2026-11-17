import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { formatPret } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Comenzi · Dashboard · ZiFit" };

const STATUS = { in_asteptare: "În așteptare", platita: "Plătită", esuata: "Eșuată" } as const;
const dataOra = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function Page() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: comenzi }, { data: profile }] = await Promise.all([
    supabase
      .from("zifit_orders")
      .select("id, user_id, amount_cents, status, provider, created_at, zifit_plans(title, currency)")
      .order("created_at", { ascending: false }),
    supabase.from("zifit_profiles").select("id, email"),
  ]);
  const emailuri = new Map((profile ?? []).map((p) => [p.id, p.email]));

  return (
    <main>
      <h1 className="text-4xl uppercase tracking-wide">Comenzi</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-border bg-sidebar">
            <tr>
              <th className="px-3 py-2">Utilizator</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Sumă</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Furnizor</th>
              <th className="px-3 py-2">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(comenzi ?? []).map((c) => {
              const plan = c.zifit_plans as unknown as { title: string; currency: string } | null;
              return (
                <tr key={c.id}>
                  <td className="px-3 py-2">{emailuri.get(c.user_id) ?? "—"}</td>
                  <td className="px-3 py-2 font-medium">{plan?.title ?? "—"}</td>
                  <td className="px-3 py-2">{formatPret(c.amount_cents, plan?.currency ?? "RON")}</td>
                  <td className="px-3 py-2">{STATUS[c.status as keyof typeof STATUS]}</td>
                  <td className="px-3 py-2">{c.provider}</td>
                  <td className="px-3 py-2">{dataOra(c.created_at)}</td>
                </tr>
              );
            })}
            {(comenzi ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-muted">
                  Nu există comenzi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
