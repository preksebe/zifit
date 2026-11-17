import type { Metadata } from "next";
import { ConfirmAction } from "@/components/dashboard/ConfirmAction";
import { BTN_SECOND } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { seteazaBlocat, seteazaRol, stergeUtilizator } from "../actions";

export const metadata: Metadata = { title: "Utilizatori · Dashboard · ZiFit" };

const data = (iso: string) => new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });

export default async function Page({ searchParams }: { searchParams: Promise<{ eroare?: string }> }) {
  const eu = await requireAdmin();
  const { eroare } = await searchParams;
  const supabase = await createClient();

  const [{ data: profile }, { data: comenzi }] = await Promise.all([
    supabase.from("zifit_profiles").select("id, email, role, blocked, created_at").order("created_at"),
    supabase.from("zifit_orders").select("user_id, zifit_plans(title)").eq("status", "platita"),
  ]);

  // Planurile cumparate (comenzi platite) pentru fiecare utilizator
  const cumparate = new Map<string, string[]>();
  for (const c of comenzi ?? []) {
    const plan = c.zifit_plans as unknown as { title: string } | null;
    if (!plan) continue;
    cumparate.set(c.user_id, [...(cumparate.get(c.user_id) ?? []), plan.title]);
  }

  return (
    <main>
      <h1 className="text-4xl uppercase tracking-wide">Utilizatori</h1>

      {eroare === "propriul-cont" && (
        <p role="alert" className="mt-4 rounded-md border border-red-700 bg-card px-3 py-2 text-sm text-red-700">
          Nu îți poți scoate singur rolul de admin, nu te poți bloca și nu îți poți șterge contul.
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-border bg-sidebar">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Blocat</th>
              <th className="px-3 py-2">Planuri cumpărate</th>
              <th className="px-3 py-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(profile ?? []).map((p) => {
              const esteEu = p.id === eu.id;
              return (
                <tr key={p.id}>
                  <td className="px-3 py-2 font-medium">
                    {p.email}
                    {esteEu && <span className="block text-xs font-normal text-muted">(tu)</span>}
                  </td>
                  <td className="px-3 py-2">{data(p.created_at)}</td>
                  <td className="px-3 py-2">{p.role === "admin" ? "Admin" : "Client"}</td>
                  <td className="px-3 py-2">{p.blocked ? "Da" : "Nu"}</td>
                  <td className="px-3 py-2">{(cumparate.get(p.id) ?? []).join(", ") || "—"}</td>
                  <td className="px-3 py-2">
                    {esteEu ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap items-start gap-2">
                        <form action={seteazaRol}>
                          <input type="hidden" name="user_id" value={p.id} />
                          <input type="hidden" name="rol" value={p.role === "admin" ? "client" : "admin"} />
                          <button type="submit" className={BTN_SECOND}>
                            {p.role === "admin" ? "Scoate admin" : "Fă admin"}
                          </button>
                        </form>
                        <form action={seteazaBlocat}>
                          <input type="hidden" name="user_id" value={p.id} />
                          <input type="hidden" name="blocat" value={String(!p.blocked)} />
                          <button type="submit" className={BTN_SECOND}>
                            {p.blocked ? "Deblochează" : "Blochează"}
                          </button>
                        </form>
                        <ConfirmAction
                          action={stergeUtilizator}
                          fields={{ user_id: p.id }}
                          label="Șterge"
                          question={`Ștergi contul ${p.email}, cu comenzile și progresul lui? Nu se poate anula.`}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
