// Marimea titlului de pe coperta, calculata dupa cel mai lung cuvant si dupa numarul de randuri,
// ca un cuvant sa nu se rupa niciodata la mijloc si titlul sa incapa mereu in zona rezervata.
//
// Toate marimile sunt in „cqw” (procente din latimea cardului), deci merg la orice latime.
// Latimea literelor Oswald 500 cu majuscule, masurata in browser: 0,39 - 0,55 em (medie ~0,49 em);
// folosim valori mai mari (rezerva ~10%), ca estimarea sa nu fie niciodata prea optimista.

const LATIME_IMPLICITA = 0.56; // em pe litera
const LATIME_LATA = 0.72; // M, W
const LATIME_SPATIU = 0.22; // em
const LINIE = 1.16; // inaltimea randului, ca multiplu de font-size (loc pentru diacritice)

export const LATIME_UTILA_CQW = 86; // cardul are 7cqw padding pe fiecare parte
export const INALTIME_ZONA_TITLU_CQW = 35; // zona rezervata titlului (aceeasi la toate cardurile)
const MARIME_MAX_CQW = 11.5;
const MARIME_MIN_CQW = 5;

// Latimea unei „unitati” (cuvinte lipite cu spatiu neseparabil U+00A0 de faraOrfane() raman impreuna pe acelasi rand).
const latimeCuvant = (cuvant: string) =>
  [...cuvant].reduce((s, c) => s + (c === " " ? LATIME_SPATIU : c === "M" || c === "W" ? LATIME_LATA : LATIME_IMPLICITA), 0);

// Numarul de randuri la o anumita marime (spargere „greedy”, pe cuvinte intregi), sau null daca un cuvant nu incape.
function randuri(cuvinte: string[], marime: number): number | null {
  const maxim = LATIME_UTILA_CQW;
  let n = 1;
  let curent = 0;
  for (const c of cuvinte) {
    const w = latimeCuvant(c) * marime;
    if (w > maxim) return null;
    const cuSpatiu = curent === 0 ? w : curent + LATIME_SPATIU * marime + w;
    if (cuSpatiu <= maxim) curent = cuSpatiu;
    else {
      n++;
      curent = w;
    }
  }
  return n;
}

// Primeste titlul deja trecut prin faraOrfane() si desparte DOAR dupa spatiul obisnuit (nu si dupa NBSP).
export function marimeTitlu(titlu: string): { marime: number; linie: number } {
  const cuvinte = titlu.toUpperCase().split(" ").filter(Boolean);
  for (let m = MARIME_MAX_CQW; m >= MARIME_MIN_CQW; m -= 0.25) {
    const r = randuri(cuvinte, m);
    if (r !== null && r * m * LINIE <= INALTIME_ZONA_TITLU_CQW) return { marime: m, linie: LINIE };
  }
  return { marime: MARIME_MIN_CQW, linie: LINIE };
}
