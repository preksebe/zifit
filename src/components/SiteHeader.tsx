import Link from "next/link";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

const LINK = "rounded-md px-3 py-1.5 text-sm font-medium hover:bg-sidebar";

async function MeniuUtilizator() {
  const profil = await getCurrentProfile();

  if (!profil) {
    return (
      <>
        <Link href="/autentificare" className={LINK}>
          Autentificare
        </Link>
        <Link href="/inregistrare" className="rounded-md bg-sport px-3 py-1.5 text-sm font-medium text-on-accent">
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
      <form action={logout}>
        <button type="submit" className={LINK}>
          Deconectare
        </button>
      </form>
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide">
          ZiFit
        </Link>
        <nav className="flex items-center gap-1">
          <Suspense fallback={<span className="h-8 w-24" aria-hidden />}>
            <MeniuUtilizator />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
