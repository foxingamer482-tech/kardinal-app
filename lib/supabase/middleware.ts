import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Préfixes de routes réservés aux membres authentifiés. */
const PROTECTED_PREFIXES = ["/dashboard"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Propager les cookies rafraîchis à la requête (lus par les Server Components)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // 2. Et à la réponse (renvoyés au navigateur)
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT : aucun code entre createServerClient et cet appel.
  // getClaims() vérifie la signature du JWT (et rafraîchit le token si expiré).
  // Ne jamais utiliser getSession() ici : elle ne valide pas le token.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Conserver les éventuels cookies de session nettoyés/rafraîchis
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // Renvoyer l'objet `response` tel quel : en créer un nouveau désynchroniserait
  // les cookies navigateur/serveur et déconnecterait l'utilisateur.
  return response;
}
