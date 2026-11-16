import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 15 : fichier `middleware.ts`, fonction `middleware`.
// Next.js 16+ : renommer le fichier en `proxy.ts` et la fonction en `proxy`
// (la convention `middleware` y est dépréciée). Le contenu reste identique.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Exécuté sur toutes les routes (rafraîchissement de session),
  // sauf assets statiques et images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
