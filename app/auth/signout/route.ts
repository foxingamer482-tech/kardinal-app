import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  // 303 : force un GET après le POST du formulaire
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
