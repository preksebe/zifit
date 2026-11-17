export const CATEGORII = { sport: "Sport", nutritie: "Nutriție" } as const;
export const DIFICULTATI = { usor: "Ușor", mediu: "Mediu", avansat: "Avansat" } as const;

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

// Textele „Ce primești” din livrarea copywriterului (texte-site.md, secțiunea 5).
export function ceaPrimesti(slug: string, zile: number): string[] {
  const zileText = zile === 21 ? "21 de zile" : `${zile} zile`;
  const primul =
    slug === "nutritie-echilibrata"
      ? `Un program de 3 mese și 2 gustări pentru fiecare dintre cele ${zileText}`
      : `Un program pentru fiecare dintre cele ${zileText}`;
  return [primul, "Bifarea zilelor, cu progres salvat în cont", "Acces la plan din contul tău"];
}
