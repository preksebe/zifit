"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type FormState } from "@/app/actions/auth";

const TEXTE = {
  login: {
    titlu: "Autentificare",
    buton: "Autentifică-te",
    alt: "Nu ai cont?",
    altLink: "Înregistrare",
    altHref: "/inregistrare",
    autocomplete: "current-password",
  },
  signup: {
    titlu: "Înregistrare",
    buton: "Creează contul",
    alt: "Ai deja cont?",
    altLink: "Autentificare",
    altHref: "/autentificare",
    autocomplete: "new-password",
  },
} as const;

export function AuthForm({ mod }: { mod: "login" | "signup" }) {
  const t = TEXTE[mod];
  const [state, action, pending] = useActionState<FormState, FormData>(mod === "login" ? login : signup, undefined);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-2 bg-sport" />
      <form action={action} className="space-y-4 p-6">
        <h1 className="text-3xl uppercase tracking-wide">{t.titlu}</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="parola" className="block text-sm font-medium">
            Parolă
          </label>
          <input
            id="parola"
            name="parola"
            type="password"
            required
            minLength={mod === "signup" ? 8 : undefined}
            autoComplete={t.autocomplete}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          {mod === "signup" && <p className="text-sm text-muted">Minimum 8 caractere.</p>}
        </div>

        {state?.error && (
          <p role="alert" className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-sport px-4 py-2 font-medium text-on-accent disabled:opacity-60"
        >
          {pending ? "Se trimite…" : t.buton}
        </button>

        <p className="text-center text-sm text-muted">
          {t.alt}{" "}
          <Link href={t.altHref} className="font-medium text-sport underline">
            {t.altLink}
          </Link>
        </p>
      </form>
    </div>
  );
}
