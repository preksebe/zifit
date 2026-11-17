import Link from "next/link";
import { CopertaPlan } from "@/components/CopertaPlan";
import type { Plan } from "@/lib/plans";

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Link
      href={`/planuri/${plan.slug}`}
      aria-label={`Plan: ${plan.title}`}
      className="block rounded-lg transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <CopertaPlan {...plan} />
    </Link>
  );
}
