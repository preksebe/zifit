export const CATEGORII = { sport: "Sport", nutritie: "Nutriție" } as const;
export const DIFICULTATI = { usor: "Ușor", mediu: "Mediu", greu: "Greu" } as const;

export const CULORI_CATEGORIE = {
  sport: { banda: "bg-sport", text: "text-sport", buton: "bg-sport" },
  nutritie: { banda: "bg-nutritie", text: "text-nutritie", buton: "bg-nutritie" },
} as const;

// "29 RON" cu spatiu neseparabil intre numar si moneda
export function formatPret(cents: number, moneda: string) {
  const suma = cents / 100;
  const text = Number.isInteger(suma) ? String(suma) : suma.toFixed(2).replace(".", ",");
  return `${text} ${moneda}`;
}

// Textele „Ce primești” din livrările copywriterului (texte-site.md și planuri-noi.md).
// Prima linie depinde de plan; celelalte doua sunt aceleasi la toate.
const UNITATE: Record<string, string> = { "stretching-de-seara": "seri" };

export function ceaPrimesti(slug: string, zile: number): string[] {
  const unitate = UNITATE[slug] ?? "zile";
  const nr = zile >= 20 ? `${zile} de ${unitate}` : `${zile} ${unitate}`;
  let primul = `Un program pentru fiecare dintre cele ${nr}`;
  if (slug === "nutritie-echilibrata" || slug === "nutritie-vegetariana") {
    primul = `Un ${slug === "nutritie-vegetariana" ? "meniu" : "program"} de 3 mese și 2 gustări pentru fiecare dintre cele ${nr}`;
  } else if (slug === "mic-dejun-rapid") {
    primul = `Un mic dejun pentru fiecare dintre cele ${nr}`;
  } else if (slug === "mese-zile-aglomerate") {
    primul = `Un meniu de 3 mese pentru fiecare dintre cele ${nr}`;
  }
  return [primul, "Bifarea zilelor, cu progres salvat în cont", "Acces la plan din contul tău"];
}
