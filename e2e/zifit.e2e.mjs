// Test end-to-end ZiFit (Playwright), pe aplicatia pornita local.
//
// Pornire: npm run build && npm run start -- -p 3100
// Rulare:  node --env-file=.env.local e2e/zifit.e2e.mjs        (BASE_URL implicit: http://localhost:3100)
//
// Datele adminului se citesc din ADMIN-TEST.local.md (ignorat de git) si nu se afiseaza.
// Testul isi sterge la final datele: clientul de test (cu comenzile si progresul), planul adaugat si mesajul.

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const ts = Date.now();
const emailClient = `client-test-${ts}@zifit.test`;
const parolaClient = randomBytes(12).toString("base64url") + "Aa1!";
const slugPlan = `plan-test-e2e-${ts}`;
const titluPlan = `Plan test E2E ${ts}`;
const textMesaj = `mesaj-test-e2e-${ts}`;

const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const rezultate = [];
async function pas(nume, fn) {
  try {
    await fn();
    rezultate.push([nume, true]);
    console.log("  OK   ", nume);
  } catch (e) {
    rezultate.push([nume, false]);
    console.log("  EȘEC ", nume, "\n        ", String(e.message).split("\n")[0].slice(0, 220));
  }
}
function aserteaza(conditie, mesaj) {
  if (!conditie) throw new Error(mesaj);
}

// Browserul descarcat deja de Playwright (alt numar de revizie decat cel asteptat de pachet): il cautam direct.
function gasesteChromium() {
  const radacina = process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\ms-playwright` : null;
  if (!radacina || !existsSync(radacina)) return undefined;
  const dirs = readdirSync(radacina).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const exe = `${radacina}\\${d}\\chrome-win64\\chrome.exe`;
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

const browser = await chromium.launch({ headless: true, executablePath: gasesteChromium() });
const nouContext = () => browser.newContext({ viewport: { width: 1280, height: 900 }, baseURL: BASE });

async function login(page, email, parola) {
  await page.goto("/autentificare");
  await page.locator("#email").fill(email);
  await page.locator("#parola").fill(parola);
  await page.getByRole("button", { name: "Autentifică-te" }).click();
}
const cale = (page) => new URL(page.url()).pathname;
const asteaptaCale = (page, rx) => page.waitForURL((u) => rx.test(u.pathname), { timeout: 15000 });

try {
  // ============ 1. Vizitator ============
  console.log("1. Vizitator");
  const vizitator = await nouContext();
  const pv = await vizitator.newPage();
  await pas("vede cele 4 planuri în /planuri", async () => {
    await pv.goto("/planuri");
    await pv.locator('a[aria-label^="Plan: "]').first().waitFor();
    aserteaza((await pv.locator('a[aria-label^="Plan: "]').count()) >= 4, "mai puțin de 4 planuri");
  });
  await pas("vede ziua 1 și zilele blocate la „Mobilitate”", async () => {
    await pv.goto("/planuri/mobilitate");
    await pv.getByText("Previzualizare: ziua 1").waitFor();
    await pv.getByText("Disponibil după cumpărare").first().waitFor();
    const text = await pv.locator("main").innerText();
    aserteaza(/Ziua 1/.test(text), "lipsește ziua 1");
    aserteaza(!/Glezne și picioare/.test(text), "titlul unei zile blocate s-a scurs în pagină");
  });
  await pas("/dashboard duce la autentificare", async () => {
    await pv.goto("/dashboard");
    aserteaza(cale(pv) === "/autentificare", `a ajuns la ${cale(pv)}`);
  });
  await pas("/contul-meu duce la autentificare", async () => {
    await pv.goto("/contul-meu");
    aserteaza(cale(pv) === "/autentificare", `a ajuns la ${cale(pv)}`);
  });
  await pas("formularul de contact salvează mesajul", async () => {
    await pv.goto("/contact");
    await pv.getByLabel("Nume").fill("Test E2E");
    await pv.getByLabel("Email").fill(`mesaj-${ts}@zifit.test`);
    await pv.getByLabel("Mesaj").fill(textMesaj);
    await pv.getByRole("button", { name: "Trimite mesajul" }).click();
    await pv.getByText("Mesaj primit. Îți răspundem cât de repede putem.").waitFor();
  });
  await pas("contactul respinge un email invalid", async () => {
    const r = await vizitator.newPage();
    await r.goto("/contact");
    await r.getByLabel("Nume").fill("Test");
    await r.getByLabel("Email").fill("nu-este-email");
    await r.getByLabel("Mesaj").fill("text");
    await r.evaluate(() => document.querySelector("form").setAttribute("novalidate", ""));
    await r.getByRole("button", { name: "Trimite mesajul" }).click();
    await r.getByText("Scrie un email valid.").waitFor();
    await r.close();
  });
  await vizitator.close();

  // ============ 2. Client nou ============
  console.log("2. Client nou");
  const ctxClient = await nouContext();
  const pc = await ctxClient.newPage();
  await pas("se înregistrează", async () => {
    await pc.goto("/inregistrare");
    await pc.locator("#email").fill(emailClient);
    await pc.locator("#parola").fill(parolaClient);
    await pc.getByRole("button", { name: "Creează contul" }).click();
    await asteaptaCale(pc, /^\/$/);
    await pc.getByRole("button", { name: "Deconectare" }).waitFor();
  });
  await pas("nu vede butonul „Dashboard”", async () => {
    aserteaza((await pc.getByRole("link", { name: "Dashboard", exact: true }).count()) === 0, "butonul Dashboard e vizibil");
  });
  await pas("/dashboard îl trimite la /", async () => {
    await pc.goto("/dashboard");
    aserteaza(cale(pc) === "/", `a ajuns la ${cale(pc)}`);
  });
  await pas("fără comandă, planul din cont duce înapoi la pagina publică", async () => {
    await pc.goto("/contul-meu/planuri/forta-acasa");
    await asteaptaCale(pc, /^\/planuri\/forta-acasa$/);
  });
  await pas("cumpără „Mobilitate”: plata eșuată", async () => {
    await pc.goto("/planuri/mobilitate");
    await pc.getByRole("button", { name: "Cumpără planul" }).click();
    await asteaptaCale(pc, /^\/plata\/[0-9a-f-]{36}$/);
    await pc.getByText("PLATĂ DE TEST: nu se percep bani").waitFor();
    aserteaza((await pc.locator('input[type="text"], input[autocomplete^="cc-"]').count()) === 0, "pagina de plată are câmpuri de card");
    await pc.getByRole("button", { name: "Simulează plata eșuată" }).click();
    await pc.getByText("Plata de test a eșuat. Nu s-a încasat nimic.").waitFor();
  });
  await pas("încearcă din nou și plata reușește", async () => {
    await pc.getByRole("button", { name: "Încearcă din nou" }).click();
    await asteaptaCale(pc, /^\/plata\/[0-9a-f-]{36}$/);
    await pc.getByRole("button", { name: "Simulează plata reușită" }).click();
    await asteaptaCale(pc, /^\/contul-meu\/planuri\/mobilitate$/);
    await pc.getByText("Plata de test a reușit. Nu s-a încasat nimic.").waitFor();
  });
  await pas("planul apare în contul lui, cu „0 din 14 zile”", async () => {
    await pc.goto("/contul-meu");
    await pc.getByRole("heading", { name: "Mobilitate" }).waitFor();
    await pc.getByText("0 din 14 zile").waitFor();
  });
  await pas("pagina planului arată „Ai deja acest plan”", async () => {
    await pc.goto("/planuri/mobilitate");
    await pc.getByText("Ai deja acest plan").waitFor();
    aserteaza((await pc.getByRole("button", { name: "Cumpără planul" }).count()) === 0, "butonul Cumpără e încă vizibil");
  });
  await pas("vede toate zilele în planul cumpărat și bifează ziua 1", async () => {
    await pc.goto("/contul-meu/planuri/mobilitate");
    await pc.getByRole("link", { name: "Ziua 14" }).waitFor();
    await pc.getByRole("button", { name: "Am terminat ziua" }).click();
    await pc.getByText("1 din 14 zile").first().waitFor();
  });
  await pas("progresul rămâne după deconectare și reconectare", async () => {
    await pc.getByRole("button", { name: "Deconectare" }).click();
    await pc.getByRole("link", { name: "Autentificare" }).first().waitFor();
    await login(pc, emailClient, parolaClient);
    await asteaptaCale(pc, /^\/$/);
    await pc.goto("/contul-meu");
    await pc.getByText("1 din 14 zile").waitFor();
    await pc.goto("/contul-meu/planuri/mobilitate?zi=1");
    await pc.getByText("Ziua e terminată").waitFor();
  });
  await pas("„Repetă programul” cere confirmare și șterge progresul", async () => {
    await pc.goto("/contul-meu/planuri/mobilitate");
    await pc.getByText("Repetă programul", { exact: true }).click();
    await pc.getByRole("button", { name: "Da, repet" }).click();
    await pc.getByText("0 din 14 zile").first().waitFor();
    // refacem ziua 1, ca restul testului sa ramana la fel
    await pc.getByRole("button", { name: "Am terminat ziua" }).click();
    await pc.getByText("1 din 14 zile").first().waitFor();
  });
  await pas("cererile directe către API: clientul fără comandă la alt plan vede doar ziua 1", async () => {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { error } = await sb.auth.signInWithPassword({ email: emailClient, password: parolaClient });
    aserteaza(!error, "autentificarea clientului pe API a eșuat");
    const { data: plan } = await sb.from("zifit_plans").select("id").eq("slug", "forta-acasa").single();
    const { data: zile } = await sb.from("zifit_plan_days").select("day_number").eq("plan_id", plan.id);
    aserteaza(zile.length === 1 && zile[0].day_number === 1, `a primit ${zile.length} zile`);
    const { data: mob } = await sb.from("zifit_plans").select("id").eq("slug", "mobilitate").single();
    const { data: zileMob } = await sb.from("zifit_plan_days").select("day_number").eq("plan_id", mob.id);
    aserteaza(zileMob.length === 14, `la planul cumpărat a primit ${zileMob.length} zile`);
  });

  // ============ 3. Admin ============
  console.log("3. Admin");
  const fisierAdmin = readFileSync("ADMIN-TEST.local.md", "utf8");
  const emailAdmin = /Email: (\S+)/.exec(fisierAdmin)[1];
  const parolaAdmin = /Parolă: (\S+)/.exec(fisierAdmin)[1];
  const ctxAdmin = await nouContext();
  const pa = await ctxAdmin.newPage();

  await pas("adminul se autentifică și vede „Dashboard”", async () => {
    await login(pa, emailAdmin, parolaAdmin);
    await asteaptaCale(pa, /^\/$/);
    await pa.getByRole("link", { name: "Dashboard", exact: true }).waitFor();
  });
  await pas("dashboardul are sidebar cu toate secțiunile", async () => {
    await pa.getByRole("link", { name: "Dashboard", exact: true }).click();
    await asteaptaCale(pa, /^\/dashboard$/);
    const nav = pa.getByRole("navigation", { name: "Meniu dashboard" });
    for (const t of ["Panou", "Produse", "Utilizatori", "Comenzi", "Mesaje", "Înapoi la site"]) {
      await nav.getByRole("link", { name: t }).waitFor();
    }
    await pa.getByText("Mesaje necitite").waitFor();
  });
  await pas("adaugă un plan de test cu 2 zile", async () => {
    await pa.goto("/dashboard/produse/nou");
    await pa.getByLabel("Titlu", { exact: true }).fill(titluPlan);
    await pa.getByLabel("Slug (adresa planului)").fill(slugPlan);
    await pa.getByLabel("Preț (RON, de test)").fill("10");
    await pa.getByLabel("Descriere", { exact: false }).fill("Plan creat de testul automat.");
    await pa.getByLabel("Publicat (vizibil în magazin)").check();
    await pa.getByRole("button", { name: "Creează planul" }).click();
    await asteaptaCale(pa, /^\/dashboard\/produse\/[0-9a-f-]{36}$/);
    const zi = (n) => pa.locator("section", { has: pa.getByRole("heading", { name: `Ziua ${n}`, exact: true }) });
    const adaugaElement = async (n, nume) => {
      const sec = zi(n);
      await sec.getByText("Adaugă un exercițiu").click();
      await sec.locator("form").filter({ has: pa.getByRole("button", { name: "Adaugă", exact: true }) }).locator('input[name="name"]').fill(nume);
      await sec.getByRole("button", { name: "Adaugă", exact: true }).click();
      await sec.locator(`input[name="name"][value="${nume}"]`).waitFor();
    };
    await zi(1).waitFor();
    await adaugaElement(1, "Rotiri de test");
    await pa.getByRole("button", { name: "Adaugă o zi" }).click();
    await zi(2).waitFor();
    await adaugaElement(2, "Întindere de test");
    await pa.getByText("Număr de zile: 2").waitFor();
  });
  await pas("planul apare în magazin", async () => {
    await pa.goto("/planuri");
    await pa.getByText(titluPlan.toUpperCase(), { exact: false }).first().waitFor();
    await pa.goto(`/planuri/${slugPlan}`);
    await pa.getByText("Rotiri de test").waitFor();
    await pa.getByText("Disponibil după cumpărare").waitFor();
  });
  await pas("îl ascunde și dispare din magazin", async () => {
    await pa.goto("/dashboard/produse");
    const rand = pa.locator("tr", { hasText: slugPlan });
    await rand.getByRole("button", { name: "Ascunde" }).click();
    await rand.getByText("Ascuns").waitFor();
    await pa.goto("/planuri");
    await pa.locator('a[aria-label^="Plan: "]').first().waitFor();
    aserteaza((await pa.getByText(titluPlan.toUpperCase(), { exact: false }).count()) === 0, "planul ascuns încă apare în magazin");
    await pa.goto(`/planuri/${slugPlan}`);
    await pa.waitForLoadState("networkidle");
    await pa.waitForTimeout(1500);
    aserteaza(!(await pa.getByText("Rotiri de test").count()), "planul ascuns încă se deschide");
  });
  await pas("vede comanda clientului", async () => {
    await pa.goto("/dashboard/comenzi");
    const rand = pa.locator("tr", { hasText: emailClient }).filter({ hasText: "Plătită" });
    await rand.first().waitFor();
    aserteaza((await pa.locator("tr", { hasText: emailClient }).filter({ hasText: "Eșuată" }).count()) >= 1, "lipsește comanda eșuată");
  });
  await pas("vede mesajul din /contact și îl marchează citit", async () => {
    await pa.goto("/dashboard/mesaje");
    const mesaj = pa.locator("li", { hasText: textMesaj });
    await mesaj.getByText("Necitit").waitFor();
    await mesaj.getByRole("button", { name: "Marchează citit" }).click();
    await pa.locator("li", { hasText: textMesaj }).getByText("Citit", { exact: false }).first().waitFor();
    await pa.locator("li", { hasText: textMesaj }).getByRole("button", { name: "Marchează necitit" }).waitFor();
  });
  await pas("adminul nu se poate bloca, scoate sau șterge singur", async () => {
    await pa.goto("/dashboard/utilizatori");
    const rand = pa.locator("tr", { hasText: emailAdmin });
    await rand.waitFor();
    aserteaza((await rand.getByRole("button").count()) === 0, "pe propriul rând există butoane de acțiune");
  });
  await pas("blochează clientul de test", async () => {
    await pa.goto("/dashboard/utilizatori");
    const rand = pa.locator("tr", { hasText: emailClient });
    await rand.getByRole("button", { name: "Blochează" }).click();
    await rand.getByRole("button", { name: "Deblochează" }).waitFor();
  });
  await pas("clientul blocat nu se mai poate autentifica", async () => {
    const ctx = await nouContext();
    const p = await ctx.newPage();
    await login(p, emailClient, parolaClient);
    await p.getByText("Contul este blocat.").waitFor();
    aserteaza(cale(p) === "/autentificare", `a ajuns la ${cale(p)}`);
    await ctx.close();
  });
  await pas("clientul blocat, cu sesiunea deschisă, e deconectat", async () => {
    await pc.goto("/contul-meu");
    await asteaptaCale(pc, /^\/autentificare$/);
  });

  // ============ 4. Conturi demo ============
  console.log("4. Conturi demo (butoane de conectare rapidă)");
  const ctxDemo = await nouContext();
  const pd = await ctxDemo.newPage();
  await pas("pe /autentificare apar caseta și cele două butoane", async () => {
    await pd.goto("/autentificare");
    await pd.getByText("Conturi demo (temporar)").waitFor();
    await pd.getByRole("button", { name: "Intră ca client demo" }).waitFor();
    await pd.getByRole("button", { name: "Intră ca admin demo" }).waitFor();
  });
  await pas("parolele demo nu apar în HTML-ul paginii", async () => {
    const html = await (await fetch(`${BASE}/autentificare`)).text();
    for (const k of ["DEMO_CLIENT_PASSWORD", "DEMO_ADMIN_PASSWORD", "SUPABASE_SERVICE_ROLE_KEY"]) {
      const v = process.env[k];
      aserteaza(v && v.length > 8, `variabila ${k} lipsește din mediul testului`);
      aserteaza(!html.includes(v), `valoarea ${k} apare în HTML`);
    }
  });
  await pas("„Intră ca client demo”: conectat, vede planul în „Contul meu”, fără „Dashboard”", async () => {
    await pd.getByRole("button", { name: "Intră ca client demo" }).click();
    await asteaptaCale(pd, /^\/contul-meu$/);
    await pd.getByRole("heading", { name: "Mobilitate" }).waitFor();
    await pd.getByRole("button", { name: "Deconectare" }).waitFor();
    aserteaza((await pd.getByRole("link", { name: "Dashboard", exact: true }).count()) === 0, "clientul demo vede Dashboard");
    await pd.goto("/dashboard");
    aserteaza(cale(pd) === "/", `clientul demo a ajuns la ${cale(pd)}`);
  });
  await pas("„Intră ca admin demo”: vede „Dashboard”", async () => {
    await pd.getByRole("button", { name: "Deconectare" }).click();
    await pd.goto("/autentificare");
    await pd.getByRole("button", { name: "Intră ca admin demo" }).click();
    await asteaptaCale(pd, /^\/dashboard$/);
    await pd.getByRole("link", { name: "Dashboard", exact: true }).waitFor();
  });
  await pas("conturile demo sunt protejate în dashboard", async () => {
    await pd.goto("/dashboard/utilizatori");
    const rand = pd.locator("tr", { hasText: "client-demo@zifit.test" });
    await rand.getByText("Cont demo (protejat)").waitFor();
    aserteaza((await rand.getByRole("button").count()) === 0, "clientul demo are butoane de acțiune");
  });
  await pas("acțiunea de server refuză blocarea unui cont demo, chiar cu formular falsificat", async () => {
    const { data: u } = await service.from("zifit_profiles").select("id").eq("email", "client-demo@zifit.test").single();
    await pd.goto("/dashboard/utilizatori");
    // Luam formularul „Deblochează” al clientului de test si ii inlocuim id-ul cu cel al clientului demo.
    const rand = pd.locator("tr", { hasText: emailClient });
    const formular = rand.locator("form", { has: pd.getByRole("button", { name: "Deblochează" }) });
    await formular.locator('input[name="user_id"]').evaluate((el, id) => (el.value = id), u.id);
    await formular.locator('input[name="blocat"]').evaluate((el) => (el.value = "true"));
    await formular.getByRole("button", { name: "Deblochează" }).click();
    await pd.waitForURL((x) => x.searchParams.get("eroare") === "cont-demo", { timeout: 15000 });
    await pd.getByText("Conturile demo sunt protejate").waitFor();
    const { data: dupa } = await service.from("zifit_profiles").select("blocked, role").eq("id", u.id).single();
    aserteaza(dupa.blocked === false && dupa.role === "client", "contul demo a fost modificat");
  });
  await ctxDemo.close();
} finally {
  // ============ Curatenie ============
  console.log("Curățenie");
  try {
    const { data: lista } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
    const u = lista?.users.find((x) => x.email === emailClient);
    if (u) await service.auth.admin.deleteUser(u.id); // sterge profilul, comenzile si progresul (cascada)
    await service.from("zifit_plans").delete().eq("slug", slugPlan); // sterge zilele si elementele (cascada)
    await service.from("zifit_mesaje").delete().like("message", `${textMesaj}%`);
    const { data: ramas } = await service.from("zifit_plans").select("id").eq("slug", slugPlan);
    const { data: ramasM } = await service.from("zifit_mesaje").select("id").like("message", `${textMesaj}%`);
    const { data: lista2 } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
    const curat = !ramas?.length && !ramasM?.length && !lista2?.users.some((x) => x.email === emailClient);
    console.log(curat ? "  OK    datele de test au fost șterse" : "  ATENȚIE: au rămas date de test");
  } catch (e) {
    console.log("  Curățenia a eșuat:", String(e.message).slice(0, 150));
  }
  await browser.close();
}

const esuate = rezultate.filter(([, ok]) => !ok);
console.log(`\nRezultat: ${rezultate.length - esuate.length} reușite, ${esuate.length} eșuate`);
process.exit(esuate.length ? 1 : 0);
