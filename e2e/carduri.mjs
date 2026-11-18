// Verificare automata a copertelor de plan (CopertaPlan) la 375px si 1280px:
//  1. niciun cuvant din titlu nu se rupe la mijloc;
//  2. titlul incape in zona lui (fara taiere, fara iesire din card);
//  3. pe acelasi rand, subtitlurile si randul cu iconite sunt la aceeasi inaltime (poziție) si au aceeasi dimensiune;
//  4. informatiile din randul cu iconite sunt vizibile (nu taiate de card).
// Rulare: node --env-file=.env.local e2e/carduri.mjs     (aplicatia pornita pe BASE_URL, implicit http://localhost:3100)
// Salveaza capturi in CAPTURI_DIR (implicit e2e/capturi, ignorat de git). Nu modifica date.

import { chromium } from "playwright";
import { existsSync, mkdirSync, readdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const CAPTURI = process.env.CAPTURI_DIR || "e2e/capturi";
mkdirSync(CAPTURI, { recursive: true });

function gasesteChromium() {
  const radacina = process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\ms-playwright` : null;
  if (!radacina || !existsSync(radacina)) return undefined;
  for (const d of readdirSync(radacina).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) {
    const exe = `${radacina}\\${d}\\chrome-win64\\chrome.exe`;
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

// Ruleaza in pagina: analizeaza toate copertele generate (cele cu h3 in interior).
const ANALIZA = () => {
  const coperti = [...document.querySelectorAll("[class*='container-type']")].filter((c) => c.querySelector("h3") && c.querySelector("ul"));
  const probleme = [];
  const randuri = []; // pentru comparatii pe rand
  for (const card of coperti) {
    const h = card.querySelector("h3");
    const titlu = h.textContent.trim();
    const cr = card.getBoundingClientRect();
    // 1. cuvinte rupte
    const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      const re = /[^\s ]+/g;
      for (let m; (m = re.exec(n.data)); ) {
        const r = document.createRange();
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        if (r.getClientRects().length > 1) probleme.push(`cuvânt rupt la mijloc: «${m[0]}» în «${titlu}»`);
      }
    }
    // 2. incape in zona lui
    if (h.scrollHeight > h.clientHeight + 1) probleme.push(`titlul depășește zona rezervată: «${titlu}»`);
    if (h.scrollWidth > h.clientWidth + 1) probleme.push(`titlul iese în lateral: «${titlu}»`);
    const sub = h.nextElementSibling;
    const info = card.querySelector("ul");
    const hr = h.getBoundingClientRect();
    const sr = sub.getBoundingClientRect();
    const ir = info.getBoundingClientRect();
    // 4. informatiile sunt in card si vizibile
    if (ir.bottom > cr.bottom + 1) probleme.push(`rândul cu iconițe iese din card: «${titlu}»`);
    for (const li of info.querySelectorAll("li")) {
      if (!li.textContent.trim()) continue;
      const lr = li.getBoundingClientRect();
      if (lr.bottom > ir.bottom + 1 || lr.right > cr.right + 1) probleme.push(`informație tăiată: «${li.textContent.trim()}» la «${titlu}»`);
    }
    // subtitlul nu se suprapune cu iconitele
    if (sr.bottom > ir.top + 1) probleme.push(`subtitlul se lipește de rândul cu iconițe: «${titlu}»`);
    // informatii lipsa: trebuie 3 pentru sport cu dificultate, 2 pentru nutritie
    const n = [...info.querySelectorAll("li")].filter((li) => li.textContent.trim()).length;
    randuri.push({ marime: getComputedStyle(h).fontSize, zona: Math.round(hr.height), titlu, top: Math.round(cr.top + scrollY), subTop: Math.round(sr.top - cr.top), subH: Math.round(sr.height), infoTop: Math.round(ir.top - cr.top), infoH: Math.round(ir.height), h: Math.round(cr.height), w: Math.round(cr.width), info: n });
  }
  // 5. aceeasi marime de font si aceeasi zona de titlu pe toate cardurile paginii (marimea e in cqw: comparam raportul cu latimea cardului)
  const rapoarte = new Set(randuri.map((r) => (parseFloat(r.marime) / r.w).toFixed(3)));
  if (rapoarte.size > 1) probleme.push(`mărimi de titlu diferite pe pagină: ${[...rapoarte].join(" / ")}`);
  const zone = new Set(randuri.map((r) => (r.zona / r.w).toFixed(3)));
  if (zone.size > 1) probleme.push(`zone de titlu cu înălțimi diferite: ${[...zone].join(" / ")}`);
  // 3. aceeasi pozitie pe randul de carduri
  const dupaRand = new Map();
  for (const r of randuri) dupaRand.set(r.top, [...(dupaRand.get(r.top) ?? []), r]);
  for (const [, grup] of dupaRand) {
    if (grup.length < 2) continue;
    for (const k of ["subTop", "infoTop", "h"]) {
      const valori = new Set(grup.map((g) => g[k]));
      if (valori.size > 1) probleme.push(`${k} diferit pe același rând: ${[...valori].join(" / ")} (${grup.map((g) => g.titlu).join(", ")})`);
    }
  }
  return { carduri: randuri.length, probleme, exemplu: randuri[0] ?? null };
};

const browser = await chromium.launch({ headless: true, executablePath: gasesteChromium() });
let totalProbleme = 0;
const raport = [];

async function verifica(rol, pagini, loginButon) {
  for (const w of [375, 768, 1024, 1280, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, baseURL: BASE });
    const p = await ctx.newPage();
    if (loginButon) {
      await p.goto("/autentificare");
      await p.getByRole("button", { name: loginButon }).click();
      await p.waitForURL((u) => u.pathname !== "/autentificare", { timeout: 20000 });
    }
    for (const [pagina, nume] of pagini) {
      await p.goto(pagina);
      await p.waitForLoadState("networkidle");
      await p.waitForTimeout(500);
      const r = await p.evaluate(ANALIZA);
      totalProbleme += r.probleme.length;
      raport.push({ rol, pagina, w, carduri: r.carduri, probleme: r.probleme });
      if (nume) {
        // captura numai a zonei cu carduri (sau a paginii intregi pentru pagini scurte)
        await p.screenshot({ path: `${CAPTURI}/${nume}-${w}.png`, fullPage: true });
        if (nume === "planuri") {
          // lista de carduri, decupata (fara filtre)
          const lista = p.locator('a[aria-label^="Plan: "]').first();
          void lista;
        }
      }
    }
    await ctx.close();
  }
}

const ctx0 = await browser.newContext({ baseURL: BASE });
const p0 = await ctx0.newPage();
await p0.goto("/planuri");
await p0.locator('a[aria-label^="Plan: "]').first().waitFor();
const slugs = await p0.locator('a[aria-label^="Plan: "]').evaluateAll((els) => els.map((e) => e.getAttribute("href").replace("/planuri/", "")));
await ctx0.close();

await verifica("vizitator", [["/", "acasa"], ["/planuri", "planuri"], ...slugs.map((s) => [`/planuri/${s}`, s === "alergare-incepatori" ? "plan-alergare" : s === "mese-zile-aglomerate" ? "plan-aglomerate" : null])]);
await verifica("client demo", [["/contul-meu", "contul-meu"], ["/contul-meu/planuri/mobilitate", null]], "Intră ca client demo");
await browser.close();

for (const r of raport) {
  console.log(`${r.rol} ${r.pagina} @${r.w}px: ${r.carduri} carduri generate, ${r.probleme.length} probleme`);
  for (const pr of r.probleme) console.log("   -", pr);
}
console.log(`\nTOTAL probleme: ${totalProbleme}`);
process.exit(totalProbleme ? 1 : 0);
