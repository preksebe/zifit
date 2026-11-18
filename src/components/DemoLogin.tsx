import { connection } from "next/server";
import { intraDemo } from "@/app/actions/demo";
import { faraOrfane as T } from "@/lib/fara-orfane";

// Caseta „Conturi demo (temporar)”. Apare doar daca DEMO_LOGIN_ENABLED=true; valoarea se citeste la fiecare
// cerere (connection()), ca sa poata fi oprita fara rebuild. In HTML nu ajung emailuri sau parole.
export async function DemoLogin({ eroare }: { eroare?: boolean }) {
  await connection();
  if (process.env.DEMO_LOGIN_ENABLED !== "true") return null;

  return (
    <section aria-labelledby="titlu-demo" className="w-full max-w-sm rounded-lg border-2 border-dashed border-border bg-card p-5">
      <h2 id="titlu-demo" className="text-xl uppercase tracking-wide">
        Conturi demo (temporar)
      </h2>
      <p className="mt-1 text-sm text-muted">{T("Intri cu un clic, fără parolă. Conturile sunt de test.")}</p>
      {eroare && (
        <p role="alert" className="mt-3 rounded-md border border-red-700 bg-background px-3 py-2 text-sm text-red-700">
          {T("Conectarea demo nu a mers. Încearcă din nou mai târziu.")}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <form action={intraDemo}>
          <input type="hidden" name="rol" value="client" />
          <button type="submit" className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm font-medium">
            Intră ca client demo
          </button>
        </form>
        <form action={intraDemo}>
          <input type="hidden" name="rol" value="admin" />
          <button type="submit" className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm font-medium">
            Intră ca admin demo
          </button>
        </form>
      </div>
    </section>
  );
}
