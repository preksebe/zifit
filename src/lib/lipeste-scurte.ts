import { CUVINTE_SCURTE } from "@/lib/fara-orfane";

// Lipeste (cu spatiu neseparabil) DOAR cuvintele scurte de legatura („de”, „pentru”, „și”, „în” ...) de cuvantul
// urmator, ca sa nu ramana singure la capat de rand. Nu lipeste ultimele doua cuvinte si nu forteaza alte rupturi:
// echilibrarea randurilor ramane pe seama lui text-wrap: balance (tipografie.css).
const radacina = (t: string) => t.toLowerCase().replace(/^[„"“«([]+/u, "").replace(/[”"»)\].,;:!?…]+$/u, "");

//
// In plus, ultimele doua cuvinte se lipesc ca sa nu ramana un cuvant singur pe ultimul rand, DOAR daca perechea e
// destul de scurta (maximum „maxPereche” caractere, cu tot lantul de cuvinte lipite) ca sa incapa pe un rand. Cele prea lungi
// (ex. „NUTRIȚIE ECHILIBRATĂ”) nu se lipesc: ar iesi din card.
export function lipesteScurte(text: string, maxPereche = 15): string {
  const cuvinte = text.split(" ");
  const lipit = cuvinte.slice(1).map((_, i) => CUVINTE_SCURTE.has(radacina(cuvinte[i])));
  const n = cuvinte.length;
  if (n >= 3) {
    // unitatea rezultata (cu tot lantul de cuvinte deja lipite din fata) trebuie sa incapa pe un rand
    let start = n - 2;
    while (start > 0 && lipit[start - 1]) start--;
    if (cuvinte.slice(start).join(" ").length <= maxPereche) lipit[n - 2] = true;
  }
  let rezultat = cuvinte[0] ?? "";
  for (let i = 1; i < n; i++) rezultat += (lipit[i - 1] ? " " : " ") + cuvinte[i];
  return rezultat;
}
