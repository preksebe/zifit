"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

// Sub 1024px (telefon, tableta, ferestre inguste) meniul sta sub un buton si se inchide dupa ce apesi pe un link.
// De la 1024px in sus, meniul e mereu vizibil (cu toate elementele unui admin ocupa ~600px).
export function MeniuMobil({ children }: { children: React.ReactNode }) {
  const [deschis, setDeschis] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDeschis((d) => !d)}
        aria-expanded={deschis}
        aria-controls="meniu-principal"
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium lg:hidden"
      >
        {deschis ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
        Meniu
      </button>
      <nav
        id="meniu-principal"
        aria-label="Meniu principal"
        onClick={() => setDeschis(false)}
        className={`${deschis ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 border-b border-border bg-card px-4 py-3 lg:static lg:flex lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0`}
      >
        {children}
      </nav>
    </>
  );
}
