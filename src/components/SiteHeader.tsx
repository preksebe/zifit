import Link from "next/link";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { MeniuMobil } from "@/components/MeniuMobil";

const LINK = "rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-sidebar lg:py-1.5";

async function MeniuUtilizator() {
  const profil = await getCurrentProfile();

  if (!profil) {
    return (
      <>
        <Link href="/autentificare" className={LINK}>
          Autentificare
        </Link>
        <Link href="/inregistrare" className="rounded-md bg-sport px-3 py-2 text-sm font-medium text-on-accent lg:py-1.5">
          Înregistrare
        </Link>
      </>
    );
  }

  return (
    <>
      {/* Butonul apare doar pentru admin; verificarea rolului se face pe server. */}
      {profil.role === "admin" && (
        <Link href="/dashboard" className={LINK}>
          Dashboard
        </Link>
      )}
      <Link href="/contul-meu" className={LINK}>
        Contul meu
      </Link>
      <form action={logout}>
        <button type="submit" className={`${LINK} w-full`}>
          Deconectare
        </button>
      </form>
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="relative border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide" aria-label="ZiFit, prima pagină">
          ZI<span className="text-sport">FIT</span>
        </Link>
        <MeniuMobil>
          <Link href="/planuri" className={LINK}>
            Planuri
          </Link>
          <Link href="/despre" className={LINK}>
            Despre
          </Link>
          <Link href="/contact" className={LINK}>
            Contact
          </Link>
          <Suspense fallback={<span className="h-8 w-28" aria-hidden />}>
            <MeniuUtilizator />
          </Suspense>
        </MeniuMobil>
      </div>
    </header>
  );
}
