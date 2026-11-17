import { Suspense } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { requireAdmin } from "@/lib/auth";

// Poarta pentru tot ce e sub /dashboard: verifica rolul pe server inainte sa afiseze ceva.
// (Fiecare pagina si fiecare actiune din dashboard apeleaza si ea requireAdmin,
// pentru ca layout-urile nu se reevalueaza la navigare.)
async function Poarta({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <DashboardNav />
      <div className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="flex-1 p-8 text-muted">Se încarcă…</main>}>
      <Poarta>{children}</Poarta>
    </Suspense>
  );
}
