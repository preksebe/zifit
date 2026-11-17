import { CalendarDays, Dumbbell, Gauge, Utensils } from "lucide-react";
import { faraOrfane } from "@/lib/fara-orfane";
import { CATEGORII, CULORI_CATEGORIE, DIFICULTATI } from "@/lib/labels";
import type { Plan } from "@/lib/plans";

type Props = Pick<Plan, "title" | "subtitle" | "category" | "difficulty" | "equipment" | "days_count">;

// Coperta generata din cod: patrat alb, banda in culoarea categoriei, titlu Oswald cu majuscule.
export function CopertaPlan({ title, subtitle, category, difficulty, equipment, days_count }: Props) {
  const culori = CULORI_CATEGORIE[category];
  const eticheta = [CATEGORII[category], difficulty ? DIFICULTATI[difficulty] : null].filter(Boolean).join(" · ");

  return (
    <div className="flex aspect-square w-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className={`h-1.5 shrink-0 ${culori.banda}`} />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider ${culori.text}`}>{eticheta}</p>
          <h3 className="mt-2 text-3xl uppercase leading-tight sm:text-4xl">{faraOrfane(title)}</h3>
          {subtitle && <p className={`mt-2 text-sm font-medium ${culori.text}`}>{faraOrfane(subtitle)}</p>}
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden /> {days_count} zile
          </li>
          {category === "nutritie" ? (
            <li className="flex items-center gap-1.5">
              <Utensils size={14} aria-hidden /> 3 mese + 2 gustări
            </li>
          ) : (
            equipment && (
              <li className="flex items-center gap-1.5">
                <Dumbbell size={14} aria-hidden /> {equipment}
              </li>
            )
          )}
          {difficulty && (
            <li className="flex items-center gap-1.5">
              <Gauge size={14} aria-hidden /> {DIFICULTATI[difficulty]}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
