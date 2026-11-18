// Verifica meniul de sus (conectat ca admin = cele mai multe elemente) la mai multe lățimi:
// nimic taiat, fara scroll orizontal, meniul cu buton deschide toate elementele in ecran.
// Rulare: node --env-file=.env.local e2e/meniu.mjs     (aplicatia pornita pe BASE_URL, implicit http://localhost:3100)
// Capturile merg in CAPTURI_DIR (implicit e2e/capturi, ignorat de git). Nu modifica date.

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

const ASTEPTATE = ["Planuri", "Despre", "Contact", "Dashboard", "Contul meu", "Deconectare"];
const browser = await chromium.launch({ headless: true, executablePath: gasesteChromium() });
let probleme = 0;
const spune = (ok, text) => {
  if (!ok) probleme++;
  console.log(ok ? "  OK   " : "  EȘEC ", text);
};

for (const w of [375, 768, 990, 1024, 1280, 1440]) {
  console.log(`@${w}px`);
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, baseURL: BASE });
  const p = await ctx.newPage();
  await p.goto("/autentificare");
  await p.getByRole("button", { name: "Intră ca admin demo" }).click();
  await p.waitForURL((u) => u.pathname === "/dashboard", { timeout: 20000 });
  await p.goto("/dashboard/produse");
  const hrefEdit = await p.locator('a:has-text("Editează")').first().getAttribute("href");
  for (const pagina of ["/planuri", "/", "/dashboard", "/dashboard/produse", hrefEdit, "/dashboard/utilizatori", "/dashboard/comenzi"]) {
    await p.goto(pagina);
    await p.locator("header nav button", { hasText: "Deconectare" }).waitFor({ state: "attached" });
    await p.waitForLoadState("networkidle");
    const buton = p.getByRole("button", { name: "Meniu", exact: true });
    const areButon = await buton.isVisible();
    if (areButon) await buton.click();
    await p.waitForTimeout(250);

    const r = await p.evaluate((asteptate) => {
      const header = document.querySelector("header");
      const vw = document.documentElement.clientWidth;
      const out = { scrollOrizontal: document.documentElement.scrollWidth > vw, vw, elemente: [] };
      const nav = header.querySelector("nav");
      for (const nume of asteptate) {
        const el = [...nav.querySelectorAll("a, button")].find((x) => x.textContent.trim() === nume);
        if (!el) {
          out.elemente.push({ nume, lipsa: true });
          continue;
        }
        const rc = el.getBoundingClientRect();
        const vizibil = rc.width > 0 && rc.height > 0 && getComputedStyle(el).visibility !== "hidden";
        out.elemente.push({ nume, vizibil, stanga: Math.round(rc.left), dreapta: Math.round(rc.right) });
      }
      return out;
    }, ASTEPTATE);

    const eticheta = pagina.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, "[id]");
    const gresite = r.elemente.filter((e) => e.lipsa || !e.vizibil || e.stanga < 0 || e.dreapta > r.vw);
    spune(!r.scrollOrizontal && gresite.length === 0, `${eticheta}: ${areButon ? "meniu cu buton" : "meniu întins"}, ${r.scrollOrizontal ? "ARE scroll orizontal" : "fără scroll orizontal"}, ${gresite.length ? "tăiat/lipsă: " + gresite.map((e) => e.nume).join(", ") : "toate cele 6 elemente în ecran"}`);
    if (pagina === "/planuri") await p.screenshot({ path: `${CAPTURI}/meniu-${w}.png`, clip: { x: 0, y: 0, width: w, height: areButon ? 420 : 120 } });
    if (areButon) await buton.click();
  }
  await ctx.close();
}
await browser.close();
console.log(`\nTOTAL probleme: ${probleme}`);
process.exit(probleme ? 1 : 0);
