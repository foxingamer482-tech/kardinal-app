import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Kardinal — Terminal" };

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_vip: boolean;
  stripe_customer_id: string | null;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Défense en profondeur : le middleware filtre déjà, mais la page ne fait
  // jamais confiance à l'amont. getUser() interroge le serveur Auth.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_vip, stripe_customer_id, created_at")
    .eq("id", user.id)
    .single<Profile>();

  const isVip = profile?.is_vip ?? false;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-mono">
      <header className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl tracking-widest">KARDINAL // TERMINAL</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 text-xs border ${
              isVip
                ? "border-emerald-500 text-emerald-400"
                : "border-neutral-700 text-neutral-400"
            }`}
          >
            {isVip ? "VIP ACTIF" : "ACCÈS STANDARD"}
          </span>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs text-neutral-400 hover:text-neutral-100"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Panel label="Statut abonnement" value={isVip ? "VIP" : "Inactif"} />
        <Panel
          label="Client Stripe"
          value={profile?.stripe_customer_id ? "Lié" : "Non lié"}
        />
        <Panel
          label="Membre depuis"
          value={
            profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("fr-FR")
              : "—"
          }
        />
      </section>

      {!isVip && (
        <section className="mt-8 border border-neutral-800 p-6">
          <p className="text-sm text-neutral-400">
            Les signaux d'arbitrage sont réservés aux membres VIP.
          </p>
          {/* Phase 2 : bouton Stripe Checkout */}
        </section>
      )}
    </main>
  );
}

function Panel({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-800 p-4">
      <p className="text-xs uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-lg">{value}</p>
    </div>
  );
}
