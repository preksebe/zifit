import type { Metadata } from "next";
import Link from "next/link";
import { PlanForm } from "@/components/dashboard/PlanForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Plan nou · Dashboard · ZiFit" };

export default async function Page() {
  await requireAdmin();
  return (
    <main>
      <Link href="/dashboard/produse" className="text-sm text-muted underline">
        ← Produse
      </Link>
      <h1 className="mt-2 mb-6 text-4xl uppercase tracking-wide">Plan nou</h1>
      <PlanForm
        initial={{ title: "", slug: "", subtitle: "", category: "sport", type: "", difficulty: "", equipment: "", description: "", price: "", published: false }}
      />
      <p className="mt-4 max-w-2xl text-sm text-muted">După ce creezi planul, îi poți adăuga zilele și exercițiile sau mesele.</p>
    </main>
  );
}
