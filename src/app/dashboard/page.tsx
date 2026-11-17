import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard · ZiFit" };

export default async function Page() {
  await requireAdmin();
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;

  const [produse, useri, comenzi, mesaje] = await Promise.all([
    supabase.from("zifit_plans").select("id", head),
    supabase.from("zifit_profiles").select("id", head),
    supabase.from("zifit_orders").select("id", head),
    supabase.from("zifit_mesaje").select("id", head).eq("is_read", false),
  ]);

  const carduri = [
    ["Produse", produse.count ?? 0],
    ["Utilizatori", useri.count ?? 0],
    ["Comenzi", comenzi.count ?? 0],
    ["Mesaje necitite", mesaje.count ?? 0],
  ] as const;

  return (
    <main>
      <h1 className="text-4xl uppercase tracking-wide">Dashboard</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {carduri.map(([titlu, n]) => (
          <li key={titlu} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted">{titlu}</p>
            <p className="mt-1 font-display text-4xl">{n}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
