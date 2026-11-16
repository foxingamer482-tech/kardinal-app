import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import CheckoutButton from './CheckoutButton'

export default async function DashboardPage({ searchParams }: { searchParams: { success?: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Récupérer la session utilisateur
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const userEmail = session.user.email

  // Si l'URL contient ?success=true (retour de Stripe)
  if (searchParams.success) {
    // Mettre à jour le statut VIP dans la base de données
    const { error } = await supabase.from('profiles').update({ is_vip: true }).eq('email', userEmail)
      .from('users') // Assure-toi que c'est le bon nom de ta table
      .update({ is_vip: true }) 
      .eq('email', userEmail)

    if (error) {
       console.error("Erreur lors de la mise à jour VIP:", error)
    }
  }

  // Récupérer les infos de l'utilisateur depuis la base de données
  const { data: userData } = await supabase.from('profiles').select('is_vip, created_at').eq('email', userEmail).single()
    .from('users')
    .select('is_vip, created_at')
    .eq('email', userEmail)
    .single()

  const isVip = userData?.is_vip || false
  const memberSince = userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl font-bold mb-8">KARDINAL // TERMINAL</h1>
      
      <div className="space-y-6 max-w-xl">
        <p>{userEmail}</p>
        
        <div>
          <h2 className="text-gray-400 text-sm mb-1 uppercase tracking-widest">Accès</h2>
          <p className={isVip ? "text-green-500 font-bold" : "text-white"}>
            {isVip ? "VIP" : "STANDARD"}
          </p>
        </div>

        <div>
          <h2 className="text-gray-400 text-sm mb-1 uppercase tracking-widest">Membre depuis</h2>
          <p>{memberSince}</p>
        </div>

        {isVip ? (
          <div className="mt-8 p-4 border border-green-500/30 bg-green-500/10">
            <h3 className="text-green-500 font-bold mb-2">Signaux d'arbitrage débloqués</h3>
            <p className="text-sm text-gray-300">Les données du marché sont en cours de synchronisation...</p>
            {/* Ici tu pourras afficher tes vrais signaux TCG */}
          </div>
        ) : (
          <div className="mt-8">
            <p className="mb-4">Les signaux d'arbitrage sont réservés aux membres VIP.</p>
            <CheckoutButton />
          </div>
        )}
      </div>
    </main>
  )
}