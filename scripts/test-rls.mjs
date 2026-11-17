// Teste RLS pentru ZiFit, pe API-ul real (cu JWT-uri reale).
// Rulare: node --env-file=.env.local scripts/test-rls.mjs
// Creeaza un client de test, il sterge la final. Nu afiseaza chei sau parole.

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };

const service = createClient(url, serviceKey, opts);
const anon = createClient(url, anonKey, opts);

let ok = 0;
let fail = 0;
function check(nume, conditie, detaliu = "") {
  if (conditie) {
    ok++;
    console.log("  OK   ", nume);
  } else {
    fail++;
    console.log("  EȘEC ", nume, detaliu);
  }
}

const TOTAL_ZILE = 14 + 21 + 14 + 7;

// ----- anonim -----
console.log("Anonim");
{
  const { data: plans } = await anon.from("zifit_plans").select("slug").order("slug");
  check("vede cele 4 planuri publicate", plans?.length === 4, `a primit ${plans?.length}`);

  const { data: days } = await anon.from("zifit_plan_days").select("day_number");
  check("vede doar ziua 1 (4 zile în total)", days?.length === 4 && days.every((d) => d.day_number === 1), `a primit ${days?.length}`);
  const { data: forta } = await anon.from("zifit_plans").select("id").eq("slug", "forta-acasa").single();
  const { data: z2 } = await anon.from("zifit_plan_days").select("id").eq("plan_id", forta.id).eq("day_number", 2);
  check("NU vede ziua 2", z2?.length === 0);

  const { data: items } = await anon.from("zifit_day_items").select("id, zifit_plan_days(day_number)");
  check("vede doar elemente din ziua 1", items?.length > 0 && items.every((i) => i.zifit_plan_days.day_number === 1), `elemente: ${items?.length}`);

  for (const t of ["zifit_profiles", "zifit_orders", "zifit_progress"]) {
    const { data, error } = await anon.from(t).select("*");
    check(`NU poate citi ${t}`, error != null || data?.length === 0);
  }
  {
    const { data, error } = await anon.from("zifit_mesaje").select("id");
    check("NU poate citi zifit_mesaje", error != null || data?.length === 0);
    const { error: eMs } = await anon.from("zifit_mesaje").insert({ name: "x", email: "x@x.xx", message: "x" });
    check("NU poate scrie direct în zifit_mesaje", eMs != null);
  }
  const { error: eIns } = await anon.from("zifit_plans").insert({ slug: "x", title: "x", category: "sport" });
  check("NU poate scrie în zifit_plans", eIns != null);
}

// ----- client nou, prin inregistrare reala -----
console.log("Client nou (înregistrare reală)");
const emailClient = `test-client-${randomBytes(4).toString("hex")}@zifit.test`;
const parolaClient = randomBytes(12).toString("base64url") + "Aa1!";
let clientId;
const client = createClient(url, anonKey, opts);
try {
  const { data: su, error: eSu } = await client.auth.signUp({ email: emailClient, password: parolaClient });
  check("înregistrarea reușește", !eSu && su?.user, eSu?.message);
  check("primește sesiune imediat (fără confirmare pe email)", !!su?.session);
  clientId = su?.user?.id;

  const { data: prof } = await client.from("zifit_profiles").select("role, blocked").eq("id", clientId).single();
  check("profil creat automat cu rolul client", prof?.role === "client" && prof?.blocked === false, JSON.stringify(prof));

  const { data: toate } = await client.from("zifit_profiles").select("id");
  check("vede doar propriul profil", toate?.length === 1);

  const { data: zc } = await client.from("zifit_plan_days").select("day_number");
  check("fără comandă: vede doar ziua 1 (4 zile în total)", zc?.length === 4);
  const { data: forta } = await client.from("zifit_plans").select("id").eq("slug", "forta-acasa").single();
  const { data: z2 } = await client.from("zifit_plan_days").select("id").eq("plan_id", forta.id).eq("day_number", 2);
  check("fără comandă: NU vede ziua 2", z2?.length === 0);

  // nu-si poate schimba rolul
  const { data: upd, error: eUpd } = await client.from("zifit_profiles").update({ role: "admin" }).eq("id", clientId).select();
  const { data: dupa } = await service.from("zifit_profiles").select("role").eq("id", clientId).single();
  check("NU își poate schimba singur rolul în admin", dupa?.role === "client" && (eUpd != null || upd?.length === 0), `rol acum: ${dupa?.role}`);

  // nu poate crea comenzi, nici bifa progres fara plan
  const { error: eOrd } = await client.from("zifit_orders").insert({ user_id: clientId, plan_id: forta.id, amount_cents: 0, status: "platita" });
  check("NU poate crea comandă din browser", eOrd != null);
  const { error: ePr } = await client.from("zifit_progress").insert({ user_id: clientId, plan_id: forta.id, day_number: 1 });
  check("NU poate bifa progres la un plan necumpărat", ePr != null);
  const { error: ePl } = await client.from("zifit_plans").update({ title: "hack" }).eq("slug", "forta-acasa");
  const { data: titlu } = await service.from("zifit_plans").select("title").eq("slug", "forta-acasa").single();
  check("NU poate modifica planuri", titlu?.title === "Forță acasă");

  // storage: client nu poate incarca
  const { error: eUp } = await client.storage.from("zifit-covers").upload(`test/${clientId}.txt`, new Blob(["x"]), { contentType: "text/plain" });
  check("NU poate încărca în zifit-covers", eUp != null);
  const { data: msgC, error: eMc } = await client.from("zifit_mesaje").select("id");
  check("clientul NU citește mesajele", eMc != null || msgC?.length === 0);

  // dupa o comanda platita (scrisa de server)
  console.log("Client cu plan cumpărat (comandă scrisă de server)");
  const { error: eSrv } = await service.from("zifit_orders").insert({ user_id: clientId, plan_id: forta.id, amount_cents: 4900, status: "platita", provider: "mock" });
  check("serverul poate scrie comanda", !eSrv, eSrv?.message);
  const { data: zf } = await client.from("zifit_plan_days").select("day_number").eq("plan_id", forta.id);
  check("vede toate cele 21 de zile ale planului cumpărat", zf?.length === 21, `a primit ${zf?.length}`);
  const { data: altele } = await client.from("zifit_plan_days").select("id").neq("plan_id", forta.id);
  check("la celelalte planuri vede tot doar ziua 1", altele?.length === 3);
  const { error: eBif } = await client.from("zifit_progress").insert({ user_id: clientId, plan_id: forta.id, day_number: 1 });
  check("poate bifa ziua 1", !eBif, eBif?.message);
  const { data: prog } = await client.from("zifit_progress").select("day_number");
  check("progresul se citește înapoi", prog?.length === 1);
  const { data: ord } = await client.from("zifit_orders").select("id");
  check("vede doar propriile comenzi", ord?.length === 1);
  const { error: eSt } = await client.from("zifit_orders").update({ status: "esuata" }).eq("user_id", clientId);
  const { data: st } = await service.from("zifit_orders").select("status").eq("user_id", clientId).single();
  check("NU poate schimba statusul comenzii", st?.status === "platita");
} finally {
  // ----- admin -----
  console.log("Admin");
  try {
    const fisier = readFileSync("ADMIN-TEST.local.md", "utf8");
    const email = /Email: (\S+)/.exec(fisier)[1];
    const parola = /Parolă: (\S+)/.exec(fisier)[1];
    const admin = createClient(url, anonKey, opts);
    const { error: eIn } = await admin.auth.signInWithPassword({ email, password: parola });
    check("adminul se autentifică", !eIn, eIn?.message);
    const { data: pa } = await admin.from("zifit_profiles").select("role").eq("email", email).single();
    check("rolul adminului e admin", pa?.role === "admin");
    const { data: zAdm } = await admin.from("zifit_plan_days").select("id");
    check(`adminul vede toate cele ${TOTAL_ZILE} zile`, zAdm?.length === TOTAL_ZILE, `a primit ${zAdm?.length}`);
    const { data: profAdm } = await admin.from("zifit_profiles").select("id");
    check("adminul vede toate profilurile (≥ 2)", profAdm?.length >= 2, `a primit ${profAdm?.length}`);
    const { data: ordAdm } = await admin.from("zifit_orders").select("id");
    check("adminul vede toate comenzile (≥ 1)", ordAdm?.length >= 1);
    const { data: newPlan, error: eNp } = await admin.from("zifit_plans").insert({ slug: "tmp-test-admin", title: "tmp", category: "sport", published: false }).select("id").single();
    check("adminul poate crea un plan", !eNp, eNp?.message);
    if (newPlan) {
      const { error: eDelP } = await admin.from("zifit_plans").delete().eq("id", newPlan.id);
      check("adminul poate șterge planul creat", !eDelP, eDelP?.message);
    }
    const { error: eUpA } = await admin.storage.from("zifit-covers").upload(`test/admin.txt`, new Blob(["x"]), { contentType: "text/plain", upsert: true });
    check("adminul poate încărca în zifit-covers", !eUpA, eUpA?.message);
    await admin.storage.from("zifit-covers").remove(["test/admin.txt"]);
  } catch (e) {
    check("test admin", false, e.message);
  }

  // curatenie: stergem clientul de test (profilul, comenzile si progresul se sterg in cascada)
  if (clientId) {
    const { error } = await service.auth.admin.deleteUser(clientId);
    console.log(error ? "Curățenie eșuată: " + error.message : "Curățenie: clientul de test a fost șters");
  }
}

console.log(`\nRezultat: ${ok} reușite, ${fail} eșuate`);
process.exit(fail ? 1 : 0);
