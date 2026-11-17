import type { Metadata } from "next";
import { ConfirmAction } from "@/components/ConfirmAction";
import { BTN_SECOND } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { marcheazaCitit, stergeMesaj } from "../actions";

export const metadata: Metadata = { title: "Mesaje · Dashboard · ZiFit" };

const dataOra = (iso: string) =>
  new Date(iso).toLocaleString("ro-RO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function Page() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("zifit_mesaje").select("id, name, email, message, is_read, created_at").order("created_at", { ascending: false });
  const mesaje = data ?? [];

  return (
    <main>
      <h1 className="text-4xl uppercase tracking-wide">Mesaje</h1>
      <p className="mt-1 text-sm text-muted">Mesajele trimise din pagina de contact.</p>

      <ul className="mt-6 space-y-3">
        {mesaje.map((m) => (
          <li key={m.id} className={`rounded-lg border bg-card p-4 ${m.is_read ? "border-border" : "border-sport"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {m.name} <span className="font-normal text-muted">· {m.email}</span>
                </p>
                <p className="text-xs text-muted">
                  {dataOra(m.created_at)} · {m.is_read ? "Citit" : "Necitit"}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <form action={marcheazaCitit}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="citit" value={String(!m.is_read)} />
                  <button type="submit" className={BTN_SECOND}>
                    {m.is_read ? "Marchează necitit" : "Marchează citit"}
                  </button>
                </form>
                <ConfirmAction action={stergeMesaj} fields={{ id: m.id }} label="Șterge" question="Ștergi mesajul? Nu se poate anula." />
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
          </li>
        ))}
        {mesaje.length === 0 && <li className="text-muted">Nu există mesaje.</li>}
      </ul>
    </main>
  );
}
