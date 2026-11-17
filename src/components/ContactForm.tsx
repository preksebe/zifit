"use client";

import { useActionState } from "react";
import { trimiteMesaj, type ContactState } from "@/app/actions/contact";
import { faraOrfane as T } from "@/lib/fara-orfane";

const CAMP = "mt-1 w-full rounded-md border border-border bg-card px-3 py-2";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(trimiteMesaj, undefined);

  if (state?.trimis) {
    return (
      <p role="status" className="max-w-prose rounded-lg border border-border bg-card p-5">
        {T("Mesaj primit. Îți răspundem cât de repede putem.")}
      </p>
    );
  }

  return (
    <form action={action} className="max-w-lg space-y-4">
      <div>
        <label htmlFor="nume" className="text-sm font-medium">
          Nume
        </label>
        <input id="nume" name="nume" type="text" required maxLength={100} autoComplete="name" className={CAMP} />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={CAMP} />
      </div>
      <div>
        <label htmlFor="mesaj" className="text-sm font-medium">
          Mesaj
        </label>
        <textarea id="mesaj" name="mesaj" required maxLength={2000} rows={5} className={CAMP} />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-md border border-red-700 bg-card px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sport px-5 py-3 font-medium text-on-accent disabled:opacity-60"
      >
        Trimite mesajul
      </button>
    </form>
  );
}
