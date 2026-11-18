import { CalendarDays, Dumbbell, Gauge, Utensils } from "lucide-react";
import { faraOrfane } from "@/lib/fara-orfane";
import { CATEGORII, CULORI_CATEGORIE, DIFICULTATI } from "@/lib/labels";
import type { Plan } from "@/lib/plans";
import { INALTIME_ZONA_TITLU_CQW, marimeTitlu } from "@/lib/titlu-coperta";

type Props = Pick<Plan, "title" | "subtitle" | "category" | "difficulty" | "equipment" | "days_count"> & { cover_url?: string | null };

// Titlul trece prin faraOrfane() (cuvintele scurte si ultimele doua cuvinte raman lipite), iar marimea lui
// se calculeaza pe aceste unitati (vezi lib/titlu-coperta.ts), ca nimic sa nu se rupa la mijloc.
//
// Coperta generata din cod: patrat alb, banda in culoarea categoriei, titlu Oswald cu majuscule.
//
// Aceeasi asezare pe toate cardurile (zone cu inaltime fixa, in cqw = procente din latimea cardului):
//   eticheta  →  zona titlului (inaltime fixa, titlul scade in marime ca sa incapa, cuvintele nu se rup)
//   →  subtitlul (imediat sub zona)  →  rand de trei informatii (zile, echipament, dificultate), mereu jos.
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
  const titluAsezat = faraOrfane(title);
  const { marime, linie } = marimeTitlu(titluAsezat);
  const infoMese = category === "nutritie" ? equipment || "3 mese + 2 gustări" : null;

  return (
    // Containerul permite unitatile cqw; aspect-square il face patrat.
    <div className="aspect-square w-full [container-type:inline-size]">
      <div className="flex h-full flex-col overflow-hidden rounded-[2.5cqw] border border-border bg-white">
        <div className={`h-[2cqw] shrink-0 ${culori.banda}`} />
        <div className="flex min-h-0 flex-1 flex-col px-[7cqw] pb-[6cqw] pt-[5cqw]">
          <p className={`text-[4cqw] font-medium uppercase leading-none tracking-wider ${culori.text}`}>{eticheta}</p>

          {/* Zona titlului: inaltime fixa; titlul incepe sus si are marimea calculata dupa cel mai lung cuvant. */}
          <h3
            className="mt-[3cqw] overflow-hidden font-display uppercase [overflow-wrap:normal] [word-break:normal] [hyphens:manual]"
            style={{ height: `${INALTIME_ZONA_TITLU_CQW}cqw`, fontSize: `${marime}cqw`, lineHeight: linie }}
          >
            {titluAsezat}
          </h3>

          <p className={`mt-[2cqw] min-h-[10cqw] text-[5cqw] font-medium leading-snug ${culori.text}`}>
            {subtitle ? faraOrfane(subtitle) : null}
          </p>

          {/* Informatii: trei coloane cu pozitii fixe, mereu jos. */}
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
