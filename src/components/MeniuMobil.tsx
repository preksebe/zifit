"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

// Pe telefon, meniul sta sub un buton si se inchide dupa ce apesi pe un link.
// Pe ecran lat, meniul e mereu vizibil.
export function MeniuMobil({ children }: { children: React.ReactNode }) {
  const [deschis, setDeschis] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDeschis((d) => !d)}
        aria-expanded={deschis}
        aria-controls="meniu-principal"
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium md:hidden"
      >
        {deschis ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
        Meniu
      </button>
      <nav
        id="meniu-principal"
        aria-label="Meniu principal"
        onClick={() => setDeschis(false)}
        className={`${deschis ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 border-b border-border bg-card px-4 py-3 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0`}
      >
        {children}
      </nav>
    </>
  );
}
