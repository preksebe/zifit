"use client";

import { LayoutDashboard, Mail, Menu, Package, ReceiptText, Store, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKURI = [
  { href: "/dashboard", text: "Panou", Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/produse", text: "Produse", Icon: Package },
  { href: "/dashboard/utilizatori", text: "Utilizatori", Icon: Users },
  { href: "/dashboard/comenzi", text: "Comenzi", Icon: ReceiptText },
  { href: "/dashboard/mesaje", text: "Mesaje", Icon: Mail },
  { href: "/", text: "Înapoi la site", Icon: Store, exact: true, extern: true },
];

// Sidebar in stanga; pe telefon se strange sub un buton „Meniu”.
export function DashboardNav() {
  const pathname = usePathname();
  const [deschis, setDeschis] = useState(false);

  return (
    <aside className="border-b border-border bg-sidebar md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <button
        type="button"
        onClick={() => setDeschis((d) => !d)}
        aria-expanded={deschis}
        aria-controls="meniu-dashboard"
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium md:hidden"
      >
        {deschis ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
        Meniu dashboard
      </button>
      <nav
        id="meniu-dashboard"
        aria-label="Meniu dashboard"
        onClick={() => setDeschis(false)}
        className={`${deschis ? "flex" : "hidden"} flex-col gap-1 px-3 pb-3 md:sticky md:top-0 md:flex md:py-4`}
      >
        {LINKURI.map(({ href, text, Icon, exact, extern }) => {
          const activ = !extern && (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              aria-current={activ ? "page" : undefined}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                activ ? "bg-sport text-on-accent" : "hover:bg-card"
              }`}
            >
              <Icon size={16} aria-hidden />
              {text}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
