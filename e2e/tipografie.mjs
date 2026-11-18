// Verificare tipografie (skill tipografie-ro, verifica_asezare.js) pe paginile ZiFit, la 375px si 1280px.
// Rulare: node --env-file=.env.local e2e/tipografie.mjs      (aplicatia pornita pe BASE_URL, implicit http://localhost:3100)
// Se autentifica prin butoanele demo (parolele nu se citesc si nu se afiseaza). Nu modifica date.

import { chromium } from "playwright";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const VERIFICATOR = readFileSync(`${process.env.USERPROFILE}\\.claude\\skills\\tipografie-ro\\verifica_asezare.js`, "utf8");

function gasesteChromium() {
  const radacina = process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\ms-playwright` : null;
  if (!radacina || !existsSync(radacina)) return undefined;
  for (const d of readdirSync(radacina).filter((x) => /^chromium-\d+$/.test(x)).sort().reverse()) {
    const exe = `${radacina}\\${d}\\chrome-win64\\chrome.exe`;
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

const browser = await chromium.launch({ headless: true, executablePath: gasesteChromium() });
const LATIMI = [375, 1280];
const rezultate = []; // { rol, pagina, latime, verificate, probleme }

async function ruleaza(rol, pagini, loginButon) {
  for (const w of LATIMI) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, baseURL: BASE });
    const p = await ctx.newPage();
    if (loginButon) {
      await p.goto("/autentificare");
      await p.getByRole("button", { name: loginButon }).click();
      await p.waitForURL((u) => u.pathname !== "/autentificare", { timeout: 20000 });
    }
    for (const pagina of pagini) {
      await p.goto(pagina);
      await p.waitForLoadState("networkidle");
      await p.waitForTimeout(700);
      // Deschidem toate casetele „Sigur?” / „Adauga”, ca sa verificam textul asa cum il vede cine le deschide.
      await p.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
      const r = await p.evaluate(VERIFICATOR);
      rezultate.push({ rol, pagina, latime: w, verificate: r.verificate, probleme: r.probleme });
    }
    await ctx.close();
  }
}

// slug-urile si id-ul planului vin din pagina publica, ca sa acoperim „fiecare slug”
const ctx0 = await browser.newContext({ baseURL: BASE });
const p0 = await ctx0.newPage();
await p0.goto("/planuri");
await p0.locator('a[aria-label^="Plan: "]').first().waitFor();
const slugs = await p0.locator('a[aria-label^="Plan: "]').evaluateAll((els) => els.map((e) => e.getAttribute("href").replace("/planuri/", "")));
await ctx0.close();

await ruleaza("vizitator", ["/", "/planuri", ...slugs.map((s) => `/planuri/${s}`), "/despre", "/contact", "/autentificare", "/inregistrare"]);

// pagina de editare a unui plan: id-ul il aflam dupa autentificare
const ctxA = await browser.newContext({ viewport: { width: 1280, height: 900 }, baseURL: BASE });
const pA = await ctxA.newPage();
await pA.goto("/autentificare");
await pA.getByRole("button", { name: "Intră ca admin demo" }).click();
await pA.waitForURL((u) => u.pathname === "/dashboard", { timeout: 20000 });
await pA.goto("/dashboard/produse");
const hrefEdit = await pA.locator('a:has-text("Editează")').first().getAttribute("href");
await ctxA.close();

await ruleaza(
  "admin",
  ["/dashboard", "/dashboard/produse", "/dashboard/produse/nou", hrefEdit, "/dashboard/utilizatori", "/dashboard/comenzi", "/dashboard/mesaje"],
  "Intră ca admin demo",
);
await ruleaza("client", ["/contul-meu", "/contul-meu/planuri/mobilitate", "/contul-meu/planuri/mobilitate?zi=3"], "Intră ca client demo");
await browser.close();

// ----- raport -----
const pagini = [...new Set(rezultate.map((r) => `${r.rol}|${r.pagina}`))];
let total = 0;
console.log("pagina | 375px | 1280px");
for (const k of pagini) {
  const [rol, pagina] = k.split("|");
  const r375 = rezultate.find((r) => r.rol === rol && r.pagina === pagina && r.latime === 375);
  const r1280 = rezultate.find((r) => r.rol === rol && r.pagina === pagina && r.latime === 1280);
  const eticheta = pagina.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, "[id]");
  total += r375.probleme.length + r1280.probleme.length;
  console.log(`${rol}: ${eticheta} | ${r375.probleme.length} (din ${r375.verificate}) | ${r1280.probleme.length} (din ${r1280.verificate})`);
}
console.log(`TOTAL probleme: ${total}`);
if (total) {
  console.log("\nDetalii:");
  for (const r of rezultate) for (const pr of r.probleme) console.log(`[${r.latime}] ${r.rol}: ${r.pagina.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/, "[id]")} -> ${pr.problema}: «${pr.detaliu}» în «${pr.text}»`);
}
process.exit(0);
