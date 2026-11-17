// Test de acces pe aplicatia pornita (BASE_URL, implicit http://localhost:3100).
// Verifica: /dashboard pentru anonim, client si admin, si butonul „Dashboard” din meniu.
// Rulare: node --env-file=.env.local scripts/test-app.mjs
// Creeaza un client de test si il sterge la final. Nu afiseaza chei sau parole.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let ok = 0;
let fail = 0;
const check = (nume, c, d = "") => {
  c ? ok++ : fail++;
  console.log(c ? "  OK   " : "  EȘEC ", nume, c ? "" : d);
};

// Se autentifica si intoarce header-ul Cookie exact cum l-ar trimite browserul.
async function cookieDupaLogin(email, password) {
  const jar = new Map();
  const sb = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error("login esuat: " + error.message);
  return [...jar].map(([n, v]) => `${n}=${v}`).join("; ");
}

async function get(path, cookie) {
  const r = await fetch(BASE + path, { redirect: "manual", headers: cookie ? { cookie } : {} });
  return { status: r.status, location: r.headers.get("location"), text: await r.text() };
}
const arataDashboard = (t) => />\s*Dashboard\s*</.test(t) && t.includes('href="/dashboard"');

const emailClient = `test-app-${randomBytes(4).toString("hex")}@zifit.test`;
const parolaClient = randomBytes(12).toString("base64url") + "Aa1!";
let clientId;
try {
  const { data, error } = await service.auth.admin.createUser({ email: emailClient, password: parolaClient, email_confirm: true });
  if (error) throw error;
  clientId = data.user.id;

  const fisier = readFileSync("ADMIN-TEST.local.md", "utf8");
  const emailAdmin = /Email: (\S+)/.exec(fisier)[1];
  const parolaAdmin = /Parolă: (\S+)/.exec(fisier)[1];
  const cAdmin = await cookieDupaLogin(emailAdmin, parolaAdmin);
  const cClient = await cookieDupaLogin(emailClient, parolaClient);

  console.log("Vizitator (fără cont)");
  let r = await get("/dashboard");
  check("/dashboard redirecționează la /autentificare", r.status === 307 && r.location?.endsWith("/autentificare"), `${r.status} ${r.location}`);
  r = await get("/");
  check("meniul NU arată „Dashboard”", r.status === 200 && !arataDashboard(r.text));
  check("meniul arată „Autentificare”", r.text.includes("Autentificare"));
  for (const p of ["/autentificare", "/inregistrare"]) {
    r = await get(p);
    check(`${p} se deschide`, r.status === 200);
  }

  console.log("Client nou");
  r = await get("/dashboard", cClient);
  check("/dashboard îl trimite la /", r.status === 307 && new URL(r.location, BASE).pathname === "/", `${r.status} ${r.location}`);
  r = await get("/dashboard/orice", cClient);
  check("/dashboard/orice îl trimite la /", r.status === 307 && new URL(r.location, BASE).pathname === "/", `${r.status} ${r.location}`);
  r = await get("/", cClient);
  check("meniul NU arată „Dashboard”", r.status === 200 && !arataDashboard(r.text));
  check("meniul arată „Deconectare”", r.text.includes("Deconectare"));

  console.log("Admin");
  r = await get("/dashboard", cAdmin);
  check("/dashboard se deschide (200)", r.status === 200, `${r.status} ${r.location}`);
  check("pagina conține titlul „Dashboard”", /Dashboard/.test(r.text));
  r = await get("/", cAdmin);
  check("meniul arată „Dashboard”", r.status === 200 && arataDashboard(r.text));

  console.log("Blocat");
  await service.from("zifit_profiles").update({ blocked: true }).eq("id", clientId);
  r = await get("/", cClient);
  check("un cont blocat nu mai apare ca autentificat", r.status === 200 && !r.text.includes("Deconectare"));
  r = await get("/dashboard", cClient);
  check("un cont blocat nu intră în /dashboard", r.status === 307);
} catch (e) {
  fail++;
  console.log("  EȘEC  eroare neașteptată:", e.message);
} finally {
  if (clientId) {
    const { error } = await service.auth.admin.deleteUser(clientId);
    console.log(error ? "Curățenie eșuată" : "Curățenie: clientul de test a fost șters");
  }
}
console.log(`\nRezultat: ${ok} reușite, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
