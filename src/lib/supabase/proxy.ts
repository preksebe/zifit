import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Reimprospateaza sesiunea Supabase la fiecare cerere si face verificari "optimiste" de acces.
// Autoritatea reala sta in paginile/actiunile de pe server (requireAdmin) si in RLS.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Valideaza si reimprospateaza token-ul. Nu pune cod intre createServerClient si getClaims.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const path = request.nextUrl.pathname;

  const copiazaCookies = (redirect: NextResponse) => {
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  // Profilul (rol, blocat) se citeste o data pe cerere, sub RLS (userul isi vede propriul profil).
  let profil: { role: string; blocked: boolean } | null = null;
  if (userId) {
    const { data: p } = await supabase.from("zifit_profiles").select("role, blocked").eq("id", userId).maybeSingle();
    profil = p;
    // Un cont blocat e deconectat imediat, oriunde ar fi.
    if (profil?.blocked) {
      await supabase.auth.signOut();
      return copiazaCookies(NextResponse.redirect(new URL("/autentificare", request.url)));
    }
  }

  const protejat = ["/dashboard", "/contul-meu", "/plata"].some((p) => path === p || path.startsWith(p + "/"));
  if (protejat && !userId) {
    return copiazaCookies(NextResponse.redirect(new URL("/autentificare", request.url)));
  }

  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    if (profil?.role !== "admin") {
      return copiazaCookies(NextResponse.redirect(new URL("/", request.url)));
    }
  }

  return response;
}
