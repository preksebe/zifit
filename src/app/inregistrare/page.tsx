import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Înregistrare · ZiFit" };

export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <AuthForm mod="signup" />
    </main>
  );
}
