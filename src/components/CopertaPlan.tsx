import { CalendarDays, Dumbbell, Gauge, Utensils } from "lucide-react";
import { faraOrfane } from "@/lib/fara-orfane";
import { CATEGORII, CULORI_CATEGORIE, DIFICULTATI } from "@/lib/labels";
import { lipesteScurte } from "@/lib/lipeste-scurte";
import type { Plan } from "@/lib/plans";

type Props = Pick<Plan, "title" | "subtitle" | "category" | "difficulty" | "equipment" | "days_count"> & { cover_url?: string | null };

// Coperta generata din cod: patrat alb, banda in culoarea categoriei, titlu Oswald cu majuscule.
//
// Aceeasi asezare pe TOATE cardurile (marimi in cqw = procente din latimea cardului, deci identice la orice latime):
//   eticheta  →  zona titlului (exact 3 randuri; O SINGURA marime de font, aceeasi la toate titlurile)
//   →  subtitlul (imediat sub zona)  →  rand cu trei informatii (zile, echipament, dificultate), mereu jos.
// Marimea titlului nu depinde de lungimea lui. Cuvintele nu se rup niciodata: cel mai lung cuvant incape pe latimea
// cardului la aceasta marime. Randurile sunt echilibrate de text-wrap: balance (tipografie.css), iar
// lipesteScurte() leaga doar cuvintele scurte („de”, „pentru”, „și”) de cuvantul urmator.
const MARIME_TITLU = "10cqw";
const LINIE_TITLU = 1.15;
const INALTIME_ZONA_TITLU = "34.5cqw"; // 3 randuri x 10cqw x 1.15

export function CopertaPlan({ title, subtitle, category, difficulty, equipment, days_count, cover_url }: Props) {
  const culori = CULORI_CATEGORIE[category];

  // Daca adminul a incarcat o coperta, se afiseaza imaginea; altfel coperta generata din cod.
  if (cover_url) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover_url} alt={title} className="h-full w-full object-cover" />
      </div>
    );
  }

  const eticheta = [CATEGORII[category], difficulty ? DIFICULTATI[difficulty] : null].filter(Boolean).join(" · ");
  const infoMese = category === "nutritie" ? equipment || "3 mese + 2 gustări" : null;

  return (
    // Containerul permite unitatile cqw; aspect-square il face patrat.
    <div className="aspect-square w-full [container-type:inline-size]">
      <div className="flex h-full flex-col overflow-hidden rounded-[2.5cqw] border border-border bg-white">
        <div className={`h-[2cqw] shrink-0 ${culori.banda}`} />
        <div className="flex min-h-0 flex-1 flex-col px-[7cqw] pb-[6cqw] pt-[5cqw]">
          <p className={`text-[4cqw] font-medium uppercase leading-none tracking-wider ${culori.text}`}>{eticheta}</p>

          {/* Zona titlului: inaltime fixa (3 randuri), titlul incepe sus. */}
          <h3
            className="mt-[3cqw] overflow-hidden font-display uppercase [overflow-wrap:normal] [word-break:normal] [hyphens:manual]"
            style={{ height: INALTIME_ZONA_TITLU, fontSize: MARIME_TITLU, lineHeight: LINIE_TITLU }}
          >
            {lipesteScurte(title)}
          </h3>

          <p className={`mt-[2cqw] min-h-[10cqw] text-[5cqw] font-medium leading-snug ${culori.text}`}>
            {subtitle ? faraOrfane(subtitle) : null}
          </p>

          {/* Informatii (zile, echipament, dificultate): fiecare pe o singura linie, mereu jos, la aceeasi inaltime. */}
          <ul className="mt-auto flex h-[22cqw] shrink-0 items-start justify-between gap-[3cqw] whitespace-nowrap text-[4.4cqw] leading-tight text-muted">
            <li className="flex shrink-0 flex-col items-start gap-[1cqw]">
              <CalendarDays className="size-[5cqw]" aria-hidden />
              <span>{days_count} zile</span>
            </li>
            <li className="flex shrink-0 flex-col items-start gap-[1cqw]">
              {infoMese ? (
                <>
                  <Utensils className="size-[5cqw]" aria-hidden />
                  <span>{infoMese}</span>
                </>
              ) : equipment ? (
                <>
                  <Dumbbell className="size-[5cqw]" aria-hidden />
                  <span>{equipment}</span>
                </>
              ) : null}
            </li>
            <li className="flex shrink-0 flex-col items-start gap-[1cqw]">
              {difficulty && (
                <>
                  <Gauge className="size-[5cqw]" aria-hidden />
                  <span>{DIFICULTATI[difficulty]}</span>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
