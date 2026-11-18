// Date de test pentru ZiFit. Exercitiile, repetarile, mesele si preturile sunt inventate, doar pentru test.
// Descrierile vin din agent-copywriter/livrari/zifit/texte-site.md.

export const ex = (name, sets, reps, rest_seconds, details) => ({
  kind: "exercitiu",
  name,
  sets,
  reps,
  rest_seconds,
  details,
});

export const masa = (name, details) => ({ kind: "masa", name, details });

// ---------- 1. Mobilitate (14 zile, usor, fara echipament) ----------
const mobilitateTeme = [
  ["Gât și umeri", [
    ex("Rotiri lente de gât", 1, "5 în fiecare direcție", 0, "Mișcare mică și lentă, fără să forțezi."),
    ex("Cercuri cu umerii", 2, "10 înainte, 10 înapoi", 20, "Umerii merg în cerc mare, brațele relaxate."),
    ex("Înclinarea gâtului în lateral", 1, "30 secunde pe parte", 0, "Urechea spre umăr, umărul opus rămâne jos."),
    ex("Întindere de piept lângă perete", 1, "30 secunde pe parte", 0, "Palma pe perete, corpul se rotește ușor în partea opusă."),
  ]],
  ["Coloană", [
    ex("Pisică-vacă", 2, "10 repetări", 20, "În patru labe: spatele se curbează în sus, apoi în jos, în ritmul respirației."),
    ex("Rotiri de torace în patru labe", 2, "8 pe parte", 20, "O mână la ceafă, cotul se deschide spre tavan."),
    ex("Poziția copilului", 1, "45 secunde", 0, "Fesele spre călcâie, brațele întinse în față."),
    ex("Răsucire în culcat", 1, "30 secunde pe parte", 0, "Genunchii într-o parte, umerii rămân pe podea."),
  ]],
  ["Șolduri", [
    ex("Cercuri de șold în patru labe", 2, "8 în fiecare direcție", 20, "Genunchiul desenează un cerc larg, spatele stă drept."),
    ex("Fandare joasă cu mâinile pe podea", 2, "30 secunde pe parte", 20, "Piciorul din spate sprijinit pe genunchi, șoldul împins ușor în față."),
    ex("Poziția fluturelui", 1, "45 secunde", 0, "Tălpile lipite, genunchii cad natural în lateral."),
    ex("Podul pe fese ușor", 2, "10 repetări", 20, "Ridici șoldurile încet, cobori la fel de încet."),
  ]],
  ["Glezne și picioare", [
    ex("Rotiri de gleznă", 1, "10 în fiecare direcție, pe picior", 0, "Stai pe un picior (cu sprijin dacă ai nevoie) și rotești celălalt picior."),
    ex("Întindere de gambe la perete", 2, "30 secunde pe picior", 15, "Călcâiul rămâne pe podea."),
    ex("Ridicări pe vârfuri", 2, "12 repetări", 20, "Urci încet pe vârfuri, cobori încet."),
    ex("Întindere pentru spatele coapsei", 1, "30 secunde pe picior", 0, "Stai pe un scaun, piciorul întins în față, spatele drept."),
  ]],
  ["Tot corpul", [
    ex("Salut la soare lent", 2, "5 repetări", 30, "Ridici brațele, te apleci în față, revii. Respirație lentă."),
    ex("Fandare cu rotire", 2, "6 pe parte", 20, "După fandare, rotești trunchiul spre piciorul din față."),
    ex("Câinele cu capul în jos", 2, "30 secunde", 20, "Genunchii pot rămâne ușor îndoiți."),
    ex("Squat adânc susținut", 2, "30 secunde", 20, "Te ții de ceva stabil dacă ai nevoie, călcâiele pe podea."),
  ]],
  ["Încheieturi și brațe", [
    ex("Rotiri de încheietură", 1, "10 în fiecare direcție", 0, "Brațele întinse în față, degetele relaxate."),
    ex("Întindere pentru antebrațe", 2, "20 secunde pe mână", 10, "Palma spre tine, degetele trase ușor înapoi."),
    ex("Cercuri mari cu brațele", 2, "10 înainte, 10 înapoi", 20, "Cercuri largi, din umăr."),
    ex("Întindere de triceps", 1, "30 secunde pe parte", 0, "Cotul spre tavan, palma pe spate."),
  ]],
  ["Zi ușoară", [
    ex("Respirație profundă în culcat", 1, "2 minute", 0, "Mâna pe abdomen, inspiri pe nas, expiri lent."),
    ex("Genunchii la piept", 1, "45 secunde", 0, "Te legeni ușor în stânga și în dreapta."),
    ex("Pisică-vacă lentă", 1, "8 repetări", 0, "Mai lent decât în zilele de lucru."),
  ]],
];

function mobilitate() {
  const zile = [];
  for (let z = 1; z <= 14; z++) {
    const [tema, items] = mobilitateTeme[(z - 1) % mobilitateTeme.length];
    zile.push({
      day_number: z,
      title: tema,
      notes: z <= 7 ? "Prima săptămână: mișcare lentă, fără durere." : "A doua săptămână: același ritm ușor, continui ce ai început.",
      items,
    });
  }
  return zile;
}

// ---------- 2. Forta acasa (21 zile, mediu, fara echipament, creste pe saptamani) ----------
// Pe saptamana: [seturi, repetari de baza (text), pauza (sec), nota de progres]
const fortaSaptamani = {
  1: { sets: 3, mult: "8", rest: 60, nota: "Săptămâna 1: învață mișcările, controlează coborârea." },
  2: { sets: 3, mult: "12", rest: 45, nota: "Săptămâna 2: mai multe repetări și pauze mai scurte decât în prima." },
  3: { sets: 4, mult: "12", rest: 45, nota: "Săptămâna 3: un set în plus și coborâre lentă (3 secunde) la fiecare repetare." },
};

const fortaZile = [
  ["Împingere", [
    ["Flotări (pe genunchi dacă e nevoie)", "reps"],
    ["Flotări cu mâinile apropiate", "reps"],
    ["Pike push-up (șoldurile sus)", "reps"],
    ["Extensii de triceps pe scaun", "reps"],
  ]],
  ["Picioare", [
    ["Genuflexiuni", "reps"],
    ["Fandări alternative", "reps"],
    ["Podul pe fese", "reps"],
    ["Ridicări pe vârfuri", "reps"],
  ]],
  ["Core și spate", [
    ["Plank pe antebrațe", "time"],
    ["Superman", "reps"],
    ["Bicicletă în culcat", "reps"],
    ["Plank lateral", "time"],
  ]],
  ["Odihnă activă", [
    ["Plimbare ușoară", "walk"],
    ["Întindere ușoară pentru tot corpul", "stretch"],
  ]],
  ["Corp întreg", [
    ["Genuflexiuni", "reps"],
    ["Flotări (pe genunchi dacă e nevoie)", "reps"],
    ["Fandări în spate", "reps"],
    ["Plank pe antebrațe", "time"],
  ]],
  ["Picioare și core", [
    ["Genuflexiuni cu pauză jos", "reps"],
    ["Pas lateral în fandare", "reps"],
    ["Podul pe fese cu un picior", "reps"],
    ["Ridicări de picioare în culcat", "reps"],
  ]],
  ["Zi liberă", [
    ["Plimbare ușoară (opțional)", "walk"],
    ["Întindere ușoară pentru tot corpul", "stretch"],
  ]],
];

function forta() {
  const zile = [];
  for (let z = 1; z <= 21; z++) {
    const sapt = Math.ceil(z / 7);
    const cfg = fortaSaptamani[sapt];
    const [tema, lista] = fortaZile[(z - 1) % 7];
    const items = lista.map(([name, tip]) => {
      if (tip === "reps") return ex(name, cfg.sets, cfg.mult + " repetări", cfg.rest, null);
      if (tip === "time") {
        const secunde = 20 + (sapt - 1) * 10; // 20, 30, 40 secunde
        return ex(name, cfg.sets, secunde + " secunde", cfg.rest, null);
      }
      if (tip === "walk") return ex(name, 1, "20 minute", 0, "Ritm care îți permite să vorbești.");
      return ex(name, 1, "5 minute", 0, "Fără durere, respirație lentă.");
    });
    zile.push({ day_number: z, title: tema, notes: cfg.nota, items });
  }
  return zile;
}

// ---------- 3. Cardio pentru incepatori (14 zile, usor) ----------
const cardioZile = [
  ["Mers alert", [
    ex("Mers alert", 1, "15 minute", 0, "Un ritm la care poți încă vorbi."),
    ex("Întindere ușoară pentru picioare", 1, "3 minute", 0, null),
  ]],
  ["Cardio în casă", [
    ex("Mers pe loc cu genunchii sus", 3, "30 secunde", 30, "Genunchii urcă doar cât e confortabil."),
    ex("Pași laterali cu brațele sus", 3, "30 secunde", 30, null),
    ex("Jumping jacks fără săritură", 3, "30 secunde", 30, "Pășești în lateral în loc să sari."),
  ]],
  ["Zi ușoară", [
    ex("Plimbare ușoară", 1, "15 minute", 0, "Orice ritm confortabil."),
  ]],
  ["Intervale scurte", [
    ex("Mers alert", 4, "2 minute", 0, "Alternezi cu mers lent."),
    ex("Mers lent", 4, "1 minut", 0, "Recuperezi respirația."),
  ]],
  ["Cardio în casă", [
    ex("Pas înainte și înapoi", 3, "30 secunde", 30, "Fără sărituri, brațele însoțesc mișcarea."),
    ex("Mers pe loc cu brațele în ritm", 3, "40 secunde", 30, null),
    ex("Ridicări alternative de genunchi", 3, "30 secunde", 30, null),
  ]],
  ["Mers cu schimbări", [
    ex("Mers alert", 1, "10 minute", 0, null),
    ex("Mers cu pași mari", 1, "3 minute", 0, "Pași lungi, brațele se mișcă natural."),
    ex("Mers lent pentru revenire", 1, "3 minute", 0, null),
  ]],
  ["Zi liberă", [
    ex("Plimbare ușoară (opțional)", 1, "10 minute", 0, null),
  ]],
];

function cardio() {
  const zile = [];
  for (let z = 1; z <= 14; z++) {
    const [tema, items] = cardioZile[(z - 1) % cardioZile.length];
    zile.push({
      day_number: z,
      title: tema,
      notes: "Ritm accesibil. Dacă te simți amețit sau ai durere, oprește-te.",
      items,
    });
  }
  return zile;
}

// ---------- 4. Nutritie echilibrata (7 zile, 3 mese + 2 gustari) ----------
const nutritieMeniuri = [
  [
    masa("Mic dejun: ovăz cu fructe", "Ovăz fiert în lapte sau băutură vegetală, o banană tăiată, câteva nuci."),
    masa("Gustare: iaurt", "Iaurt natural cu o linguriță de miere."),
    masa("Prânz: pui cu orez și salată", "Piept de pui la tigaie, orez fiert, salată de varză."),
    masa("Gustare: fruct", "Un măr sau o pară."),
    masa("Cină: omletă cu legume", "Ouă, ardei și roșii, o felie de pâine integrală."),
  ],
  [
    masa("Mic dejun: pâine cu brânză și roșii", "Pâine integrală, brânză proaspătă, roșii feliate."),
    masa("Gustare: o mână de nuci", "Nuci sau migdale, nesărate."),
    masa("Prânz: supă de legume și paste", "Supă cu morcov, țelină și cartof, o porție mică de paste."),
    masa("Gustare: morcov cu humus", "Bețișoare de morcov, humus."),
    masa("Cină: pește la cuptor cu cartofi", "Pește la cuptor, cartofi fierți, salată verde."),
  ],
  [
    masa("Mic dejun: clătite de ovăz", "Ovăz, ou și banană, făcute la tigaie."),
    masa("Gustare: brânză de vaci cu fructe", "Brânză de vaci cu afine sau căpșuni."),
    masa("Prânz: mazăre cu orez", "Mazăre călită ușor, orez, un iaurt alături."),
    masa("Gustare: portocală", "O portocală."),
    masa("Cină: salată cu ton", "Ton conservat în apă, fasole, castravete, roșii, ulei de măsline."),
  ],
  [
    masa("Mic dejun: iaurt cu cereale", "Iaurt natural, fulgi de ovăz sau cereale simple, fructe."),
    masa("Gustare: ou fiert", "Un ou fiert tare."),
    masa("Prânz: chiftele la cuptor cu piure", "Chiftele de pui sau curcan, piure de cartofi, murături."),
    masa("Gustare: banană", "O banană."),
    masa("Cină: tocăniță de legume", "Dovlecel, ardei, vinete, o felie de pâine."),
  ],
  [
    masa("Mic dejun: omletă cu spanac", "Ouă și spanac, o felie de pâine integrală."),
    masa("Gustare: iaurt cu semințe", "Iaurt natural, semințe de dovleac."),
    masa("Prânz: cuscus cu năut", "Cuscus, năut fiert, castravete și pătrunjel."),
    masa("Gustare: măr cu unt de arahide", "Un măr feliat, o lingură de unt de arahide."),
    masa("Cină: pui cu legume la wok", "Pui, broccoli, morcov, sos de soia în cantitate mică."),
  ],
  [
    masa("Mic dejun: terci de gris cu fructe", "Gris fiert în lapte, fructe de pădure."),
    masa("Gustare: o mână de alune", "Alune sau caju, nesărate."),
    masa("Prânz: tocană de linte", "Linte cu ceapă, morcov și puțină roșie, pâine."),
    masa("Gustare: iaurt cu miere", "Iaurt natural, miere."),
    masa("Cină: sandviș cu pui și salată", "Pâine integrală, pui fiert, salată verde, roșii."),
  ],
  [
    masa("Mic dejun: ouă jumări cu pâine", "Două ouă, o felie de pâine, castravete."),
    masa("Gustare: pară", "O pară."),
    masa("Prânz: paste cu sos de roșii și legume", "Paste, sos de roșii cu ceapă și ardei."),
    masa("Gustare: brânză cu roșii", "Brânză proaspătă, roșii cherry."),
    masa("Cină: supă cremă de dovleac", "Supă cremă de dovleac, o felie de pâine prăjită."),
  ],
];

function nutritie() {
  return nutritieMeniuri.map((items, i) => ({
    day_number: i + 1,
    title: "Meniul zilei " + (i + 1),
    notes: "3 mese și 2 gustări. Porțiile le potrivești tu, după cum te simți.",
    items,
  }));
}

export const planuri = [
  {
    slug: "mobilitate",
    title: "Mobilitate",
    subtitle: "14 zile, fără echipament",
    category: "sport",
    type: "mobilitate",
    difficulty: "usor",
    equipment: "fără echipament",
    days_count: 14,
    description:
      "Un plan de mobilitate pe 14 zile, cu un program scurt în fiecare zi. Nu ai nevoie de echipament.\n\nPlanul ține două săptămâni. A doua săptămână continuă ce ai început în prima, într-un ritm la fel de ușor.\n\nE pentru cine începe cu mișcarea sau vrea să se miște fără bătaie de cap. Dificultate: ușor.",
    price_cents: 2900,
    zile: mobilitate(),
  },
  {
    slug: "forta-acasa",
    title: "Forță acasă",
    subtitle: "21 de zile acasă",
    category: "sport",
    type: "forță",
    difficulty: "mediu",
    equipment: "fără echipament",
    days_count: 21,
    description:
      "Un plan de forță pe 21 de zile, pe care îl faci acasă, fără echipament. Fiecare zi are antrenamentul ei.\n\nPlanul ține trei săptămâni, iar programul crește treptat de la o săptămână la alta. Dificultate: mediu.\n\nE pentru cine are deja o bază și vrea un program clar, fără sală.",
    price_cents: 4900,
    zile: forta(),
  },
  {
    slug: "cardio-incepatori",
    title: "Cardio pentru începători",
    subtitle: "Cardio, pas cu pas",
    category: "sport",
    type: "cardio",
    difficulty: "usor",
    equipment: "fără echipament",
    days_count: 14,
    description:
      "Un plan de cardio pe 14 zile, gândit pentru începători. În fiecare zi ai un antrenament scurt de urmat.\n\nPlanul ține două săptămâni, iar ritmul rămâne accesibil de la început până la sfârșit. Dificultate: ușor.\n\nE pentru cine nu a mai făcut cardio sau revine după o pauză.",
    price_cents: 3500,
    zile: cardio(),
  },
  {
    slug: "nutritie-echilibrata",
    title: "Nutriție echilibrată",
    subtitle: "7 zile de mese",
    category: "nutritie",
    type: "nutriție",
    difficulty: null,
    equipment: null,
    days_count: 7,
    description:
      "Un plan de nutriție pe 7 zile. În fiecare zi ai 3 mese și 2 gustări de urmat.\n\nPlanul ține o săptămână, iar fiecare zi are propriul meniu.\n\nE pentru cine vrea o structură pentru mesele de peste zi, fără să le planifice singur.",
    price_cents: 3900,
    zile: nutritie(),
  },
];
