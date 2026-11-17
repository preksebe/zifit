import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";

// Poarta pentru tot ce e sub /dashboard: verifica rolul pe server inainte sa afiseze ceva.
// (Fiecare pagina din dashboard va apela si ea requireAdmin, pentru ca layout-urile nu se reevalueaza la navigare.)
async function Poarta({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="flex-1 p-8 text-muted">Se încarcă…</main>}>
      <Poarta>{children}</Poarta>
    </Suspense>
  );
}
