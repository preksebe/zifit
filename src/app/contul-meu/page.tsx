import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { faraOrfane as T } from "@/lib/fara-orfane";

export const metadata: Metadata = { title: "Contul meu · ZiFit" };

async function Continut() {
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");
  return (
    <>
      <p className="mt-3 text-muted">{profil.email}</p>
      {/* Pagina temporara: planurile cumparate apar aici dupa etapa de plata. */}
      <p className="mt-6 max-w-prose">{T("Planurile cumpărate vor apărea aici în etapa următoare.")}</p>
    </>
  );
}

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-4xl uppercase sm:text-5xl">Contul meu</h1>
      <Suspense fallback={<p className="mt-3 text-muted">Se încarcă…</p>}>
        <Continut />
      </Suspense>
    </main>
  );
}
