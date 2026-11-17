import type { Metadata } from "next";
import { faraOrfane as T } from "@/lib/fara-orfane";

export const metadata: Metadata = { title: "Despre · ZiFit" };

const PARAGRAFE = [
  "ZiFit pornește de la o idee simplă: o zi, un antrenament. Un program întreg poate părea mult, dar o singură zi se vede cu ochii.",
  "De aceea fiecare plan e împărțit pe zile. Deschizi planul și vezi doar ce ai de făcut azi. Când termini, bifezi ziua și ți se salvează progresul.",
  "ZiFit vinde planuri digitale de sport și de nutriție. Tonul rămâne simplu: fără presiune și fără promisiuni de rezultate.",
];

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-4xl uppercase sm:text-5xl">Despre ZiFit</h1>
      <div className="mt-5 max-w-prose space-y-4 text-lg">
        {PARAGRAFE.map((p) => (
          <p key={p}>{T(p)}</p>
        ))}
      </div>
    </main>
  );
}
