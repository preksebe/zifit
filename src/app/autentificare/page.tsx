import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { DemoLogin } from "@/components/DemoLogin";

export const metadata: Metadata = { title: "Autentificare · ZiFit" };

export default function Page({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <AuthForm mod="login" />
      <Suspense fallback={null}>
        <DemoSectiune searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function DemoSectiune({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams;
  return <DemoLogin eroare={demo === "eroare"} />;
}
