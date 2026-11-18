"use client";

import { useActionState } from "react";
import { salveazaPlan, type PlanFormState } from "@/app/dashboard/actions";
import { BTN, INPUT, LABEL } from "@/components/ui";
import { faraOrfane as T } from "@/lib/fara-orfane";

export type PlanInitial = {
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  type: string;
  difficulty: string;
  equipment: string;
  description: string;
  price: string;
  published: boolean;
  cover_url?: string | null;
};

export function PlanForm({ initial }: { initial: PlanInitial }) {
  const [state, action, pending] = useActionState<PlanFormState, FormData>(salveazaPlan, undefined);
  const v = (k: keyof PlanInitial) => state?.values?.[k as string] ?? (initial[k] as string);
  const publicat = state?.values ? state.values.published === "on" : initial.published;

  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-lg border border-border bg-card p-5">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label htmlFor="title" className={LABEL}>
          Titlu
        </label>
        <input id="title" name="title" required maxLength={120} defaultValue={v("title")} className={INPUT} />
      </div>
      <div>
        <label htmlFor="slug" className={LABEL}>
          Slug (adresa planului)
        </label>
        <input id="slug" name="slug" required maxLength={80} defaultValue={v("slug")} className={INPUT} placeholder="ex. forta-acasa" />
      </div>
      <div>
        <label htmlFor="subtitle" className={LABEL}>
          Subtitlu
        </label>
        <input id="subtitle" name="subtitle" maxLength={120} defaultValue={v("subtitle")} className={INPUT} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="category" className={LABEL}>
            Categorie
          </label>
          <select id="category" name="category" defaultValue={v("category")} className={INPUT}>
            <option value="sport">Sport</option>
            <option value="nutritie">Nutriție</option>
          </select>
        </div>
        <div>
          <label htmlFor="type" className={LABEL}>
            Tip
          </label>
          <input id="type" name="type" maxLength={40} defaultValue={v("type")} className={INPUT} placeholder="ex. cardio" />
        </div>
        <div>
          <label htmlFor="difficulty" className={LABEL}>
            Dificultate
          </label>
          <select id="difficulty" name="difficulty" defaultValue={v("difficulty")} className={INPUT}>
            <option value="">Fără</option>
            <option value="usor">Ușor</option>
            <option value="mediu">Mediu</option>
            <option value="avansat">Avansat</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="equipment" className={LABEL}>
            Echipament
          </label>
          <input id="equipment" name="equipment" maxLength={80} defaultValue={v("equipment")} className={INPUT} />
        </div>
        <div>
          <label htmlFor="price" className={LABEL}>
            Preț (RON, de test)
          </label>
          <input id="price" name="price" required inputMode="decimal" defaultValue={v("price")} className={INPUT} />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={LABEL}>
          {T("Descriere (paragrafele se separă printr-un rând gol)")}
        </label>
        <textarea id="description" name="description" rows={7} maxLength={3000} defaultValue={v("description")} className={INPUT} />
      </div>

      <div>
        <label htmlFor="cover" className={LABEL}>
          {T("Copertă (PNG, JPG sau WebP, maximum 2 MB)")}
        </label>
        {initial.cover_url && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={initial.cover_url} alt="Coperta curentă" className="h-20 w-20 rounded-md border border-border object-cover" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="sterge_cover" /> Șterge coperta
            </label>
          </div>
        )}
        <input id="cover" name="cover" type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block text-sm" />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="published" defaultChecked={publicat} /> Publicat (vizibil în magazin)
      </label>

      {state?.error && (
        <p role="alert" className="rounded-md border border-red-700 bg-background px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          Salvat.
        </p>
      )}

      <button type="submit" disabled={pending} className={`${BTN} disabled:opacity-60`}>
        {pending ? "Se salvează…" : initial.id ? "Salvează planul" : "Creează planul"}
      </button>
    </form>
  );
}
