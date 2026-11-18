// Sterge orice a ramas dupa testele automate: planuri „plan-test-e2e-*”, conturi „client-test-*@zifit.test”
// (cu comenzile si progresul lor), mesaje „mesaj-test-e2e-*”.
// Rulare: node --env-file=.env.local scripts/curata-teste.mjs
// Nu atinge conturile demo, planurile reale sau comenzile lor.

import { createClient } from "@supabase/supabase-js";

export async function curataTeste(sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })) {
  const rezultat = { planuri: 0, useri: 0, mesaje: 0 };

  const { data: planuri } = await sb.from("zifit_plans").select("id").like("slug", "plan-test-e2e-%");
  for (const p of planuri ?? []) {
    // comenzile (daca exista) trebuie sterse inainte de plan (FK restrict)
    await sb.from("zifit_orders").delete().eq("plan_id", p.id);
    await sb.from("zifit_plans").delete().eq("id", p.id);
    rezultat.planuri++;
  }

  for (let page = 1; page < 20; page++) {
    const { data } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    const useri = data?.users ?? [];
    for (const u of useri) {
      if (/^client-test-\d+@zifit\.test$/.test(u.email ?? "") || /^test-(client|app)-[0-9a-f]+@zifit\.test$/.test(u.email ?? "")) {
        await sb.auth.admin.deleteUser(u.id); // profilul, comenzile si progresul se sterg in cascada
        rezultat.useri++;
      }
    }
    if (useri.length < 200) break;
  }

  const { data: mesaje } = await sb.from("zifit_mesaje").select("id").like("message", "mesaj-test-e2e-%");
  for (const m of mesaje ?? []) {
    await sb.from("zifit_mesaje").delete().eq("id", m.id);
    rezultat.mesaje++;
  }
  return rezultat;
}

// Rulat direct: curata si afiseaza ce a gasit.
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/curata-teste.mjs")) {
  const r = await curataTeste();
  console.log(`Șterse: ${r.planuri} planuri de test, ${r.useri} conturi de test, ${r.mesaje} mesaje de test.`);
}
