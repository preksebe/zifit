// Seed reluabil pentru ZiFit: contul de admin si cele 4 planuri de test.
// Rulare: node --env-file=.env.local scripts/seed.mjs
// Nu afiseaza chei sau parole. Datele adminului se scriu doar in ADMIN-TEST.local.md (in .gitignore).

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { planuri } from "./seed-data.mjs";
import { planuriNoi } from "./seed-data-noi.mjs";

// --doar-noi: seed doar pentru cele 8 planuri adaugate ulterior (nu atinge primele 4 planuri si nici contul admin).
const DOAR_NOI = process.argv.includes("--doar-noi");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Lipsesc variabilele Supabase din .env.local");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const ADMIN_EMAIL = "admin@zifit.test";
const ADMIN_FILE = "ADMIN-TEST.local.md";

function parolaNoua() {
  // 24 de caractere, litere mari/mici, cifre si un simbol
  const alfabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(23);
  let p = "";
  for (const b of bytes) p += alfabet[b % alfabet.length];
  return p + "!";
}

function scrieFisierAdmin(parola) {
  writeFileSync(
    ADMIN_FILE,
    [
      "# Cont admin ZiFit (doar test)",
      "",
      "Fișier local, nu intră în git.",
      "",
      `- Email: ${ADMIN_EMAIL}`,
      `- Parolă: ${parola}`,
      "",
    ].join("\n"),
  );
}

async function gasesteAdmin() {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email === ADMIN_EMAIL);
    if (u) return u;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function seedAdmin() {
  let user = await gasesteAdmin();
  let creat = false;
  if (!user) {
    const parola = parolaNoua();
    const { data, error } = await sb.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: parola,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    scrieFisierAdmin(parola);
    creat = true;
  } else if (!existsSync(ADMIN_FILE)) {
    // Contul exista, dar fisierul cu parola lipseste: resetam parola si rescriem fisierul.
    const parola = parolaNoua();
    const { error } = await sb.auth.admin.updateUserById(user.id, { password: parola, email_confirm: true });
    if (error) throw error;
    scrieFisierAdmin(parola);
    creat = true;
  }

  // Profilul e creat de trigger; ne asiguram ca exista si ca are rolul admin.
  const { error: e1 } = await sb
    .from("zifit_profiles")
    .upsert({ id: user.id, email: ADMIN_EMAIL, role: "admin", blocked: false }, { onConflict: "id" });
  if (e1) throw e1;
  console.log(creat ? "Admin: creat (datele sunt în " + ADMIN_FILE + ")" : "Admin: există deja, rol verificat");
}

async function seedPlanuri() {
  const lista = DOAR_NOI ? planuriNoi : [...planuri, ...planuriNoi];
  for (const { zile, ...plan } of lista) {
    const { data: p, error } = await sb
      .from("zifit_plans")
      .upsert({ ...plan, published: true, is_test: true }, { onConflict: "slug" })
      .select("id")
      .single();
    if (error) throw error;

    // Reluabil: stergem zilele planului (elementele se sterg in cascada) si le reinseram.
    const { error: eDel } = await sb.from("zifit_plan_days").delete().eq("plan_id", p.id);
    if (eDel) throw eDel;

    const { data: dayRows, error: eDays } = await sb
      .from("zifit_plan_days")
      .insert(zile.map((z) => ({ plan_id: p.id, day_number: z.day_number, title: z.title, notes: z.notes })))
      .select("id, day_number");
    if (eDays) throw eDays;
    const idPeZi = new Map(dayRows.map((d) => [d.day_number, d.id]));

    const items = zile.flatMap((z) =>
      z.items.map((it, i) => ({
        day_id: idPeZi.get(z.day_number),
        position: i + 1,
        kind: it.kind,
        name: it.name,
        sets: it.sets ?? null,
        reps: it.reps ?? null,
        rest_seconds: it.rest_seconds ?? null,
        details: it.details ?? null,
      })),
    );
    const { error: eItems } = await sb.from("zifit_day_items").insert(items);
    if (eItems) throw eItems;
    console.log(`Plan „${plan.title}”: ${zile.length} zile, ${items.length} elemente`);
  }
}

if (!DOAR_NOI) await seedAdmin();
await seedPlanuri();
console.log("Seed terminat.");
