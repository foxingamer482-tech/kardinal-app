export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import CheckoutButton from './CheckoutButton'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { success?: string }
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const userEmail = session.user.email

  // 1. Validation du paiement Stripe
  if (searchParams?.success === 'true') {
    const { error } = await supabase
      .from('profiles')
      .update({ is_vip: true })
      .eq('email', userEmail)
      
    if (error) console.error("Erreur VIP:", error)
  }

  // 2. Récupérer le statut à jour depuis la base
  const { data: userData } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', userEmail)
    .single()

  const isVip = userData?.is_vip || false
  const memberSince = userData?.created_at ? new Date(userData.created_at).toLocaleDateString('fr-FR') : 'N/A'

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl font-bold mb-8">KARDINAL // TERMINAL</h1>
      
      <div className="space-y-6 max-w-xl">
        <p>{userEmail}</p>
        
        <div>
          <h2 className="text-gray-400 text-sm mb-1 uppercase tracking-widest">
            ACCÈS {isVip ? <span className="text-green-500">VIP</span> : "STANDARD"}
          </h2>
        </div>

        <div>
          <p className="text-gray-400 text-sm mb-1">Statut abonnement</p>
          <p className={isVip ? "text-green-500 font-bold" : "text-white"}>
            {isVip ? "Actif" : "Inactif"}
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-sm mb-1">Membre depuis</p>
          <p>{memberSince}</p>
        </div>

        <p className="mt-8">Les signaux d'arbitrage sont réservés aux membres VIP.</p>

        {isVip ? (
          <div className="mt-4 p-4 border border-green-500/30 bg-green-500/10">
            <h3 className="text-green-500 font-bold mb-2">Signaux d'arbitrage débloqués</h3>
            <p className="text-sm text-gray-300">Synchronisation des données du marché TCG en cours...</p>
          </div>
        ) : (
          <div className="mt-4">
            <CheckoutButton />
          </div>
        )}
      </div>
    </main>
  )
}