import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { faraOrfane as T } from "@/lib/fara-orfane";

export const metadata: Metadata = { title: "Cumpără planul · ZiFit" };

async function Continut({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profil = await getCurrentProfile();
  if (!profil) redirect("/autentificare");
  return (
    <>
      {/* Pagina temporara: plata de test vine in etapa urmatoare. */}
      <h1 className="text-4xl uppercase sm:text-5xl">{T("Plata vine în etapa următoare")}</h1>
      <p className="mt-4 max-w-prose">{T("Cumpărarea planurilor nu e pornită încă.")}</p>
      <Link href={`/planuri/${encodeURIComponent(slug)}`} className="mt-6 inline-block rounded-md border border-border px-4 py-2 font-medium">
        Înapoi la plan
      </Link>
    </>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <Suspense fallback={<p className="text-muted">Se încarcă…</p>}>
        <Continut params={params} />
      </Suspense>
    </main>
  );
}
