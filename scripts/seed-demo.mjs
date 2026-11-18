// Seed reluabil pentru conturile demo (butoanele „Intră ca ... demo” de pe /autentificare).
// Rulare: node --env-file=.env.local scripts/seed-demo.mjs
//
// - creeaza clientul demo (client-demo@zifit.test) cu o comanda platita (mock) pentru „Mobilitate”;
// - scrie DEMO_* in .env.local (parolele vin din ADMIN-TEST.local.md si din parola generata aici);
// - adauga datele clientului demo in ADMIN-TEST.local.md.
// Ambele fisiere sunt ignorate de git. Scriptul nu afiseaza nicio parola.

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ADMIN_FILE = "ADMIN-TEST.local.md";
const ENV_FILE = ".env.local";
const CLIENT_EMAIL = "client-demo@zifit.test";
const ADMIN_EMAIL = "admin@zifit.test";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const parolaNoua = () => {
  const alfabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let p = "";
  for (const b of randomBytes(23)) p += alfabet[b % alfabet.length];
  return p + "!";
};

if (!existsSync(ADMIN_FILE)) {
  console.error(`Lipsește ${ADMIN_FILE}: rulează întâi scripts/seed.mjs`);
  process.exit(1);
}
let fisier = readFileSync(ADMIN_FILE, "utf8");
const parolaAdmin = /Parolă: (\S+)/.exec(fisier)?.[1];
if (!parolaAdmin) {
  console.error("Nu am găsit parola adminului în fișier.");
  process.exit(1);
}

// ----- client demo -----
async function gasesteUser(email) {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email === email);
    if (u) return u;
    if (data.users.length < 200) return null;
  }
  return null;
}

const sectiune = /## Client demo[\s\S]*?Parolă: (\S+)/.exec(fisier);
let parolaClient = sectiune?.[1];
let user = await gasesteUser(CLIENT_EMAIL);

if (!user) {
  parolaClient = parolaNoua();
  const { data, error } = await sb.auth.admin.createUser({ email: CLIENT_EMAIL, password: parolaClient, email_confirm: true });
  if (error) throw error;
  user = data.user;
  console.log("Client demo: creat");
} else if (!parolaClient) {
  // Contul exista, dar nu avem parola salvata: o resetam.
  parolaClient = parolaNoua();
  const { error } = await sb.auth.admin.updateUserById(user.id, { password: parolaClient, email_confirm: true });
  if (error) throw error;
  console.log("Client demo: există, parola a fost resetată");
} else {
  console.log("Client demo: există deja");
}

// Profilul e creat de trigger (rol client); ne asiguram ca nu e blocat si ca e client.
const { error: eProf } = await sb
  .from("zifit_profiles")
  .upsert({ id: user.id, email: CLIENT_EMAIL, role: "client", blocked: false }, { onConflict: "id" });
if (eProf) throw eProf;

// Comanda platita (mock) pentru „Mobilitate”, daca nu exista deja.
const { data: plan } = await sb.from("zifit_plans").select("id, price_cents").eq("slug", "mobilitate").single();
const { data: comenzi } = await sb.from("zifit_orders").select("id").eq("user_id", user.id).eq("plan_id", plan.id).eq("status", "platita");
if (!comenzi?.length) {
  const { error } = await sb.from("zifit_orders").insert({
    user_id: user.id,
    plan_id: plan.id,
    amount_cents: plan.price_cents,
    status: "platita",
    provider: "mock",
    provider_ref: "mock-demo",
  });
  if (error) throw error;
  console.log("Comandă plătită pentru „Mobilitate”: creată");
} else {
  console.log("Comandă plătită pentru „Mobilitate”: există deja");
}

// ----- ADMIN-TEST.local.md: adaugam / actualizam sectiunea clientului demo -----
fisier = fisier.replace(/\n## Client demo[\s\S]*$/, "").trimEnd() + "\n";
fisier += ["", "## Client demo", "", `- Email: ${CLIENT_EMAIL}`, `- Parolă: ${parolaClient}`, ""].join("\n");
writeFileSync(ADMIN_FILE, fisier);

// ----- .env.local: scriem variabilele DEMO_* (pastram restul liniilor) -----
const existente = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8").split(/\r?\n/) : [];
const pastrate = existente.filter((l) => l.trim() && !/^(DEMO_[A-Z_]+)=/.test(l));
const demo = [
  `DEMO_LOGIN_ENABLED=true`,
  `DEMO_CLIENT_EMAIL=${CLIENT_EMAIL}`,
  `DEMO_CLIENT_PASSWORD=${parolaClient}`,
  `DEMO_ADMIN_EMAIL=${ADMIN_EMAIL}`,
  `DEMO_ADMIN_PASSWORD=${parolaAdmin}`,
];
writeFileSync(ENV_FILE, [...pastrate, ...demo].join("\n") + "\n");
console.log("Variabilele DEMO_* au fost scrise în .env.local (valorile nu se afișează).");
