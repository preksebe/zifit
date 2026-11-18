// Cele 8 planuri de test noi. Exercitiile, repetarile, mesele, duratele si preturile sunt inventate, doar pentru test.
// Descrierile vin din agent-copywriter/livrari/zifit/planuri-noi.md (cu corecturile cerute de coordonator).

import { ex, masa } from "./seed-data.mjs";

// ---------- 1. Abdomen și core (14 zile, mediu, forță, fără echipament) ----------
const coreSapt = {
  1: { sets: 3, reps: 10, rest: 45, nota: "Prima săptămână: te pune pe picioare. Mișcări controlate, fără grabă." },
  2: { sets: 3, reps: 14, rest: 40, nota: "A doua săptămână: continuă de unde ai rămas, cu mai multe repetări." },
};
const coreZile = [
  ["Abdomen drept", [["Crunch", "r"], ["Ridicări de picioare în culcat", "r"], ["Bicicletă în culcat", "r"], ["Plank pe antebrațe", "t"]]],
  ["Oblici", [["Atingeri de călcâie", "r"], ["Russian twist fără greutate", "r"], ["Plank lateral", "t"], ["Crunch cu rotire", "r"]]],
  ["Stabilitate", [["Dead bug", "r"], ["Bird dog", "r"], ["Plank cu atingerea umărului", "r"], ["Hollow hold", "t"]]],
  ["Odihnă activă", [["Plimbare ușoară", "walk"], ["Întindere ușoară pentru tot corpul", "stretch"]]],
  ["Core complet", [["Mountain climbers", "r"], ["Crunch", "r"], ["Plank pe antebrațe", "t"], ["Ridicări de picioare în culcat", "r"]]],
  ["Abdomen inferior", [["Flutter kicks", "r"], ["Genunchi la piept în culcat", "r"], ["Ridicări de șold", "r"], ["Plank cu genunchi la piept", "r"]]],
  ["Zi liberă", [["Plimbare ușoară (opțional)", "walk"], ["Întindere ușoară pentru tot corpul", "stretch"]]],
];
function core() {
  const zile = [];
  for (let z = 1; z <= 14; z++) {
    const sapt = z <= 7 ? 1 : 2;
    const c = coreSapt[sapt];
    const [tema, lista] = coreZile[(z - 1) % 7];
    const items = lista.map(([name, tip]) => {
      if (tip === "r") return ex(name, c.sets, c.reps + " repetări", c.rest, null);
      if (tip === "t") return ex(name, c.sets, (sapt === 1 ? 25 : 35) + " secunde", c.rest, null);
      if (tip === "walk") return ex(name, 1, "20 minute", 0, "Ritm care îți permite să vorbești.");
      return ex(name, 1, "5 minute", 0, "Fără durere, respirație lentă.");
    });
    zile.push({ day_number: z, title: tema, notes: c.nota, items });
  }
  return zile;
}

// ---------- 2. Yoga de dimineață (14 zile, ușor, yoga, saltea) ----------
const post = (name, secunde, detalii) => ex(name, 1, `${secunde} secunde`, 0, detalii ?? null);
const yogaSecvente = [
  ["Trezirea corpului", [post("Poziția copilului", 40, "Respiri lent, fruntea pe saltea."), post("Pisică-vacă", 45, "Mișcarea urmează respirația."), post("Câinele cu capul în jos", 30, "Genunchii pot rămâne ușor îndoiți."), post("Ridicare lentă în picioare", 30, "Vertebră cu vertebră."), post("Poziția muntelui", 30)]],
  ["Șolduri", [post("Fandare joasă, piciorul stâng în față", 30), post("Fandare joasă, piciorul drept în față", 30), post("Poziția fluturelui", 40), post("Poziția porumbelului pe stânga", 30), post("Poziția porumbelului pe dreapta", 30)]],
  ["Echilibru", [post("Poziția copacului pe stânga", 25, "Te poți sprijini cu o mână de perete."), post("Poziția copacului pe dreapta", 25), post("Războinic III cu sprijin", 20), post("Poziția scaunului", 30), post("Poziția muntelui", 30)]],
  ["Spate", [post("Cobra", 25), post("Sfinxul", 40), post("Poziția copilului", 40), post("Răsucire în șezut pe stânga", 30), post("Răsucire în șezut pe dreapta", 30)]],
  ["Picioare", [post("Războinic I pe stânga", 30), post("Războinic I pe dreapta", 30), post("Războinic II pe stânga", 30), post("Războinic II pe dreapta", 30), post("Întindere pentru spatele coapsei în șezut", 40)]],
  ["Tot corpul", [post("Salut la soare lent", 60, "Cinci repetări în ritmul respirației."), post("Câinele cu capul în jos", 30), post("Triunghi pe stânga", 25), post("Triunghi pe dreapta", 25), post("Poziția cadavrului", 60)]],
  ["Calm", [post("Poziția copilului", 45), post("Răsucire în culcat pe stânga", 35), post("Răsucire în culcat pe dreapta", 35), post("Picioarele pe perete", 60), post("Respirație profundă în culcat", 90)]],
];
function yoga() {
  const zile = [];
  for (let z = 1; z <= 14; z++) {
    const [tema, items] = yogaSecvente[(z - 1) % 7];
    zile.push({
      day_number: z,
      title: tema,
      notes: z <= 7 ? "Ritm ușor. Ai nevoie de o saltea." : "A doua săptămână reia și continuă ce ai făcut în prima, tot într-un ritm ușor.",
      items,
    });
  }
  return zile;
}

// ---------- 3. Stretching de seară (7 zile, ușor, fără echipament) ----------
const stretchingSeri = [
  ["Gât și umeri", [post("Înclinarea gâtului în lateral, pe stânga", 30), post("Înclinarea gâtului în lateral, pe dreapta", 30), post("Cercuri lente cu umerii", 30), post("Întindere de piept lângă perete", 40), post("Respirație adâncă", 45)]],
  ["Spate", [post("Poziția copilului", 45), post("Pisică-vacă lentă", 40), post("Răsucire în culcat, pe stânga", 35), post("Răsucire în culcat, pe dreapta", 35), post("Genunchii la piept", 40)]],
  ["Șolduri", [post("Poziția fluturelui", 45), post("Fandare joasă, pe stânga", 35), post("Fandare joasă, pe dreapta", 35), post("Poziția figurii 4 în culcat, pe stânga", 35), post("Poziția figurii 4 în culcat, pe dreapta", 35)]],
  ["Picioare", [post("Întindere pentru spatele coapsei, pe stânga", 40), post("Întindere pentru spatele coapsei, pe dreapta", 40), post("Întindere pentru fața coapsei în picioare, pe stânga", 30), post("Întindere pentru fața coapsei în picioare, pe dreapta", 30), post("Întindere de gambe la perete", 40)]],
  ["Piept și brațe", [post("Întindere de piept în ușă", 40), post("Întindere de triceps, pe stânga", 30), post("Întindere de triceps, pe dreapta", 30), post("Rotiri de încheietură", 30), post("Brațele sus, întindere în lateral", 40)]],
  ["Tot corpul", [post("Salut la soare lent", 60), post("Câinele cu capul în jos", 30), post("Fandare cu rotire, pe stânga", 30), post("Fandare cu rotire, pe dreapta", 30), post("Poziția copilului", 45)]],
  ["Relaxare", [post("Genunchii la piept", 45), post("Răsucire ușoară în culcat", 40), post("Picioarele pe perete", 90), post("Respirație profundă în culcat", 120)]],
];
function stretching() {
  return stretchingSeri.map(([tema, items], i) => ({
    day_number: i + 1,
    title: tema,
    notes: "Seara, la un nivel ușor. Oprește-te dacă apare durere.",
    items,
  }));
}

// ---------- 4. HIIT acasă (21 zile, greu, fără echipament, crește treptat) ----------
// Pe saptamana: runde, munca (sec), pauza (sec)
const hiitSapt = {
  1: { runde: 4, munca: 30, pauza: 30, nota: "Săptămâna 1: 30 de secunde de efort, 30 de pauză, 4 runde." },
  2: { runde: 5, munca: 40, pauza: 20, nota: "Săptămâna 2: efort mai lung, pauză mai scurtă, 5 runde." },
  3: { runde: 6, munca: 45, pauza: 15, nota: "Săptămâna 3: efort lung, pauză scurtă, 6 runde." },
};
const hiitZile = [
  ["HIIT picioare", ["Squat jumps", "Fandări sărite", "Genuflexiuni rapide", "Sărituri pe loc"]],
  ["HIIT corp întreg", ["Burpees", "Jumping jacks", "Flotări", "Mountain climbers"]],
  ["Odihnă activă", null],
  ["HIIT cardio", ["High knees", "Skater jumps", "Jumping jacks", "Shadow boxing"]],
  ["HIIT core", ["Mountain climbers", "Plank jacks", "Bicicletă în culcat", "Plank cu atingerea umărului"]],
  ["HIIT mix", ["Burpees", "Squat jumps", "Plank jacks", "High knees"]],
  ["Zi liberă", null],
];
function hiit() {
  const zile = [];
  for (let z = 1; z <= 21; z++) {
    const sapt = Math.ceil(z / 7);
    const c = hiitSapt[sapt];
    const [tema, lista] = hiitZile[(z - 1) % 7];
    const items = lista
      ? [
          ex("Încălzire: mers pe loc și rotiri de brațe", 1, "3 minute", 0, null),
          ...lista.map((name) => ex(name, c.runde, `${c.munca} secunde`, c.pauza, "Efort maxim în timpul lucrului, pauză completă.")),
          ex("Răcire: întinderi ușoare", 1, "4 minute", 0, null),
        ]
      : [ex("Plimbare ușoară", 1, "20 minute", 0, "Ritm care îți permite să vorbești."), ex("Întindere ușoară pentru tot corpul", 1, "5 minute", 0, null)];
    zile.push({ day_number: z, title: tema, notes: c.nota, items });
  }
  return zile;
}

// ---------- 5. Alergare pentru începători (28 zile, ușor, fără echipament) ----------
// Pe saptamana: alergare (min), mers (min), repetari
const alergSapt = {
  1: { alerg: 1, mers: 2, rep: 6, nota: "Săptămâna 1: alergare ușoară scurtă, alternată cu mers." },
  2: { alerg: 2, mers: 2, rep: 5, nota: "Săptămâna 2: intervalele de alergare devin puțin mai lungi." },
  3: { alerg: 3, mers: 2, rep: 4, nota: "Săptămâna 3: alergare mai lungă între pauzele de mers." },
  4: { alerg: 5, mers: 2, rep: 3, nota: "Săptămâna 4: intervale lungi de alergare, tot cu mers între ele." },
};
const minute = (n) => (n === 1 ? "1 minut" : `${n} minute`);
function alergare() {
  const zile = [];
  for (let z = 1; z <= 28; z++) {
    const sapt = Math.ceil(z / 7);
    const c = alergSapt[sapt];
    const zi = ((z - 1) % 7) + 1;
    let tema;
    let items;
    if (zi === 1 || zi === 3 || zi === 5) {
      tema = "Mers și alergare";
      items = [
        ex("Încălzire: mers alert", 1, "5 minute", 0, null),
        ex("Alergare ușoară", c.rep, minute(c.alerg), 0, "Ritm la care poți încă vorbi."),
        ex("Mers", c.rep, minute(c.mers), 0, "Alternezi cu alergarea, pentru recuperare."),
        ex("Răcire: mers lent", 1, "5 minute", 0, null),
        ex("Întindere ușoară pentru picioare", 1, "3 minute", 0, null),
      ];
    } else if (zi === 6) {
      tema = "Mers lung";
      items = [ex("Mers într-un ritm confortabil", 1, "30 de minute", 0, "Fără alergare. Alegi traseul care îți place."), ex("Întindere ușoară pentru picioare", 1, "3 minute", 0, null)];
    } else {
      tema = zi === 2 ? "Odihnă activă" : "Zi liberă";
      items = [ex("Plimbare ușoară (opțional)", 1, "15 minute", 0, null), ex("Întindere ușoară pentru tot corpul", 1, "5 minute", 0, null)];
    }
    zile.push({ day_number: z, title: tema, notes: c.nota, items });
  }
  return zile;
}

// ---------- 6. Mic dejun rapid (7 zile, 1 mic dejun pe zi) ----------
const micuriDejun = [
  ["Ovăz peste noapte", "Ovăz, iaurt natural, lapte și o linguriță de miere, lăsate la rece peste noapte. Deasupra, fructe de pădure."],
  ["Pâine prăjită cu ou", "Pâine integrală prăjită, un ou fiert sau la tigaie, roșii feliate."],
  ["Iaurt cu fructe și nuci", "Iaurt natural, o banană tăiată, nuci tocate."],
  ["Omletă cu legume", "Două ouă, ardei și spanac, o felie de pâine."],
  ["Terci de ovăz cu mere", "Ovăz fiert în lapte, un măr ras, puțină scorțișoară."],
  ["Sandviș cu brânză", "Pâine integrală, brânză proaspătă, castravete și roșii."],
  ["Brânză de vaci cu fructe", "Brânză de vaci, fructe de sezon și semințe de dovleac."],
];
function micDejun() {
  return micuriDejun.map(([nume, detalii], i) => ({
    day_number: i + 1,
    title: nume,
    notes: "Pregătire scurtă, fără gătit complicat.",
    items: [masa(`Mic dejun: ${nume.toLowerCase()}`, detalii)],
  }));
}

// ---------- 7. Nutriție vegetariană (7 zile, 3 mese + 2 gustări, fără carne și pește) ----------
const vegetarian = [
  [masa("Mic dejun: ovăz cu fructe", "Ovăz fiert în lapte sau băutură vegetală, banană, nuci."), masa("Gustare: iaurt", "Iaurt natural cu o linguriță de miere."), masa("Prânz: orez cu legume și brânză", "Orez fiert, ardei, dovlecel și brânză telemea."), masa("Gustare: fruct", "Un măr sau o pară."), masa("Cină: omletă cu ciuperci", "Ouă, ciuperci, ceapă verde, o felie de pâine integrală.")],
  [masa("Mic dejun: pâine cu avocado", "Pâine integrală, avocado strivit, roșii."), masa("Gustare: o mână de migdale", "Migdale nesărate."), masa("Prânz: supă de linte", "Linte, morcov, țelină, un strop de lămâie."), masa("Gustare: morcov cu humus", "Bețișoare de morcov, humus."), masa("Cină: paste cu sos de roșii", "Paste, sos de roșii cu ceapă și busuioc, parmezan.")],
  [masa("Mic dejun: clătite de ovăz", "Ovăz, ou și banană, făcute la tigaie."), masa("Gustare: brânză de vaci", "Brânză de vaci cu afine."), masa("Prânz: năut cu cuscus", "Năut fiert, cuscus, castravete și pătrunjel."), masa("Gustare: portocală", "O portocală."), masa("Cină: salată cu ou și fasole", "Ouă fierte, fasole, castraveți, ulei de măsline.")],
  [masa("Mic dejun: iaurt cu cereale", "Iaurt natural, fulgi de ovăz, fructe."), masa("Gustare: ou fiert", "Un ou fiert tare."), masa("Prânz: tocăniță de legume cu mămăligă", "Dovlecel, ardei, vinete, mămăligă."), masa("Gustare: banană", "O banană."), masa("Cină: sandviș cu brânză", "Pâine integrală, brânză, salată verde, roșii.")],
  [masa("Mic dejun: omletă cu spanac", "Ouă și spanac, o felie de pâine."), masa("Gustare: iaurt cu semințe", "Iaurt natural, semințe de dovleac."), masa("Prânz: burgeri de fasole", "Fasole, ceapă, ovăz, la tigaie, cu salată."), masa("Gustare: măr cu unt de arahide", "Un măr feliat, o lingură de unt de arahide."), masa("Cină: supă cremă de dovleac", "Dovleac, ceapă, o felie de pâine prăjită.")],
  [masa("Mic dejun: terci de gris cu fructe", "Gris fiert în lapte, fructe de pădure."), masa("Gustare: o mână de alune", "Alune nesărate."), masa("Prânz: mazăre cu orez", "Mazăre călită ușor, orez, iaurt alături."), masa("Gustare: iaurt cu miere", "Iaurt natural, miere."), masa("Cină: quesadilla cu fasole", "Tortilla, fasole, brânză, ardei.")],
  [masa("Mic dejun: ouă jumări", "Două ouă, pâine, castravete."), masa("Gustare: pară", "O pară."), masa("Prânz: paste cu legume", "Paste, ardei, ceapă, roșii, parmezan."), masa("Gustare: brânză cu roșii cherry", "Brânză proaspătă, roșii cherry."), masa("Cină: mămăligă cu brânză și smântână", "Mămăligă, brânză de vaci, smântână, salată.")],
];
function nutritieVegetariana() {
  return vegetarian.map((items, i) => ({
    day_number: i + 1,
    title: "Meniul zilei " + (i + 1),
    notes: "3 mese și 2 gustări, fără carne și pește. Porțiile le potrivești tu.",
    items,
  }));
}

// ---------- 8. Mese pentru zile aglomerate (14 zile, 3 mese pe zi, rețete simple) ----------
const aglomerate = [
  ["Omletă cu roșii", "Ouă bătute cu roșii tăiate, la tigaie, 5 minute.", "Paste cu ton", "Paste fierte, ton conservat, porumb, ulei de măsline.", "Supă de legume din pliculeț, cu pâine", "Legume tăiate fierte în apă cu o lingură de pastă de legume."],
  ["Iaurt cu ovăz și banană", "Fără gătit: iaurt, fulgi de ovăz, banană.", "Orez cu legume congelate", "Orez fiert, un amestec de legume congelate la tigaie.", "Sandviș cu ou", "Pâine, ou fiert, salată, roșii."],
  ["Pâine cu brânză și castravete", "Fără gătit.", "Quesadilla cu fasole", "Tortilla, fasole din conservă, brânză, la tigaie.", "Salată cu năut", "Năut din conservă, castravete, roșii, ulei de măsline."],
  ["Terci de ovăz la microunde", "Ovăz și lapte, 3 minute la microunde, cu fructe.", "Piure cu ouă ochiuri", "Piure de cartofi (din cartofi fierți), două ouă la tigaie.", "Wrap cu pui", "Tortilla, pui fiert sau la grătar, salată."],
  ["Clătite de banană", "O banană strivită, două ouă, la tigaie.", "Cuscus cu legume", "Cuscus înmuiat în apă fierbinte, ardei, castravete.", "Omletă cu brânză", "Ouă, brânză rasă, o felie de pâine."],
  ["Brânză de vaci cu fructe", "Fără gătit.", "Supă cremă la blender", "Legume fierte (dovleac, morcov), date prin blender.", "Paste cu sos de roșii", "Paste, sos de roșii din borcan, parmezan."],
  ["Ouă fierte și pâine", "Ouă fierte tare pregătite din ajun.", "Salată de paste", "Paste fierte, roșii, ardei, brânză.", "Orez cu ou", "Orez fiert, un ou la tigaie, legume."],
  ["Iaurt cu fructe și nuci", "Fără gătit.", "Tocăniță rapidă de legume", "Dovlecel, ardei, ceapă, roșii, într-o singură oală.", "Sandviș cu brânză", "Pâine, brânză, roșii, salată verde."],
  ["Omletă cu spanac", "Ouă, spanac, 5 minute.", "Chiftele la cuptor cu salată", "Chiftele de pui sau curcan, coapte pe tavă, salată de varză.", "Supă de legume", "Reîncălzită din ziua anterioară."],
  ["Ovăz peste noapte", "Pregătit seara: ovăz, iaurt, lapte.", "Paste cu legume", "Paste, dovlecel și ardei la tigaie.", "Salată cu ton", "Ton conservat, fasole, castravete."],
  ["Pâine prăjită cu avocado", "Pâine, avocado, un strop de lămâie.", "Orez cu pui", "Orez fiert, pui la tigaie tăiat mărunt.", "Quesadilla cu brânză", "Tortilla, brânză, ardei."],
  ["Terci de gris", "Gris fiert în lapte, 5 minute.", "Fasole la cuptor cu pâine", "Fasole din conservă încălzită, pâine.", "Omletă cu ciuperci", "Ouă, ciuperci."],
  ["Banană cu unt de arahide", "Fără gătit: banană, unt de arahide, pâine.", "Cartofi la cuptor cu iaurt", "Cartofi tăiați, copți pe tavă, iaurt cu usturoi.", "Salată cu brânză și roșii", "Brânză, roșii, castravete, ulei de măsline."],
  ["Iaurt cu cereale", "Fără gătit.", "Supă de linte", "Linte, morcov, ceapă, fiartă într-o singură oală.", "Sandviș cu ou și roșii", "Pâine, ou fiert, roșii, salată."],
];
function mese() {
  return aglomerate.map(([m1, d1, m2, d2, m3, d3], i) => ({
    day_number: i + 1,
    title: "Meniul zilei " + (i + 1),
    notes: "3 mese, cu pregătire simplă.",
    items: [masa(`Mic dejun: ${m1.toLowerCase()}`, d1), masa(`Prânz: ${m2.toLowerCase()}`, d2), masa(`Cină: ${m3.toLowerCase()}`, d3)],
  }));
}

export const planuriNoi = [
  {
    slug: "abdomen-core",
    title: "Abdomen și core",
    subtitle: "Core, fără echipament",
    category: "sport",
    type: "forță",
    difficulty: "mediu",
    equipment: "fără echipament",
    days_count: 14,
    description:
      "Două săptămâni în care lucrezi zilnic pentru abdomen și core, fără să ai nevoie de echipament. Fiecare zi are programul ei.\n\nPrima săptămână te pune pe picioare, iar a doua continuă de unde ai rămas. Dificultate: mediu.\n\nE pentru cine are deja o bază de mișcare și vrea un program clar pentru această zonă.",
    price_cents: 3900,
    zile: core(),
  },
  {
    slug: "yoga-de-dimineata",
    title: "Yoga de dimineață",
    subtitle: "Yoga cu saltea",
    category: "sport",
    type: "yoga",
    difficulty: "usor",
    equipment: "saltea",
    days_count: 14,
    description:
      "Dimineața ai o singură treabă: întinzi salteaua și urmezi programul zilei. Planul de yoga ține 14 zile.\n\nRitmul rămâne ușor pe toată durata, iar a doua săptămână reia și continuă ce ai făcut în prima. Ai nevoie de o saltea.\n\nE pentru cine începe yoga sau vrea să-și facă din ea un obicei de dimineață. Dificultate: ușor.",
    price_cents: 3500,
    zile: yoga(),
  },
  {
    slug: "stretching-de-seara",
    title: "Stretching de seară",
    subtitle: "Șapte seri, stretching",
    category: "sport",
    type: "stretching",
    difficulty: "usor",
    equipment: "fără echipament",
    days_count: 7,
    description:
      "Șapte seri la rând, cu câte un program de stretching pentru încheierea zilei. Nu ai nevoie de echipament.\n\nPlanul ține o săptămână, iar fiecare seară are propriul program, la un nivel ușor.\n\nE pentru cine vrea să închidă ziua cu mișcare, fără efort mare.",
    price_cents: 2500,
    zile: stretching(),
  },
  {
    slug: "hiit-acasa",
    title: "HIIT acasă",
    subtitle: "Intens, 21 de zile",
    category: "sport",
    type: "HIIT",
    difficulty: "greu",
    equipment: "fără echipament",
    days_count: 21,
    description:
      "HIIT e intens, iar acest plan nu face excepție. Ai 21 de zile de antrenamente de acasă, fără echipament.\n\nProgramul crește treptat pe parcursul celor trei săptămâni. Dificultate: greu.\n\nE pentru cine are deja o bază de mișcare. Dacă începi de la zero, un plan ușor e un start mai potrivit.",
    price_cents: 5900,
    zile: hiit(),
  },
  {
    slug: "alergare-incepatori",
    title: "Alergare pentru începători",
    subtitle: "Alergare de la zero",
    category: "sport",
    type: "alergare",
    difficulty: "usor",
    equipment: "fără echipament",
    days_count: 28,
    description:
      "Patru săptămâni, 28 de zile, ca să intri în alergare fără grabă. Nu ai nevoie de echipament pentru plan.\n\nProgramul pornește ușor și se schimbă treptat de la o săptămână la alta. Dificultate: ușor.\n\nE pentru cine nu a alergat niciodată sau revine după o pauză lungă.",
    price_cents: 5500,
    zile: alergare(),
  },
  {
    slug: "mic-dejun-rapid",
    title: "Mic dejun rapid",
    subtitle: "Mic dejun, zilnic",
    category: "nutritie",
    type: "nutriție",
    difficulty: null,
    equipment: "1 mic dejun pe zi",
    days_count: 7,
    description:
      "Dimineața nu mai alegi ce mănânci. Primești câte un mic dejun pe zi, șapte zile la rând.\n\nPlanul ține o săptămână, iar fiecare zi are propriul mic dejun.\n\nE pentru cine vrea să rezolve cel puțin prima masă a zilei fără să se gândească.",
    price_cents: 2500,
    zile: micDejun(),
  },
  {
    slug: "nutritie-vegetariana",
    title: "Nutriție vegetariană",
    subtitle: "Șapte zile vegetariene",
    category: "nutritie",
    type: "nutriție",
    difficulty: null,
    equipment: "3 mese + 2 gustări",
    days_count: 7,
    description:
      "Șapte zile de mâncare vegetariană, cu 3 mese și 2 gustări în fiecare zi. Nu ai de planificat nimic în plus.\n\nPlanul ține o săptămână, iar fiecare zi are propriul meniu.\n\nE pentru cine mănâncă vegetarian sau vrea să încerce o săptămână fără carne.",
    price_cents: 3900,
    zile: nutritieVegetariana(),
  },
  {
    slug: "mese-zile-aglomerate",
    title: "Mese pentru zile aglomerate",
    subtitle: "Mese fără complicații",
    category: "nutritie",
    type: "nutriție",
    difficulty: null,
    equipment: "3 mese pe zi",
    days_count: 14,
    description:
      "Când ziua e plină, mâncarea ajunge ultima pe listă. Acest plan îți dă 3 mese pe zi, cu pregătire simplă, timp de 14 zile.\n\nPe parcursul celor două săptămâni, fiecare zi are meniul ei.\n\nE pentru cine are un program încărcat și vrea mese gândite dinainte.",
    price_cents: 4500,
    zile: mese(),
  },
];
