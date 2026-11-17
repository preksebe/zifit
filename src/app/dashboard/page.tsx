import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard · ZiFit" };

export default async function Page() {
  await requireAdmin();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="text-4xl uppercase tracking-wide">Dashboard</h1>
    </main>
  );
}
