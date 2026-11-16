import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Échange le code PKCE (magic link / OAuth) contre une session cookie.
 * URL à déclarer dans Supabase > Authentication > URL Configuration > Redirect URLs.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Anti open-redirect : chemin relatif interne uniquement
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
