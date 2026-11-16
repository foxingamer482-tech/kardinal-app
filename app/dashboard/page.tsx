'use client';

import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import CheckoutButton from './CheckoutButton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function DashboardContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const code = searchParams.get('code');

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVip, setIsVip] = useState(false);
  const [memberSince, setMemberSince] = useState('N/A');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    async function initAuth() {
      // Échange le code de sécurité Supabase contre une session active
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Erreur d'échange de code:", exchangeError);
        } else {
          window.history.replaceState({}, '', '/dashboard');
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsConnected(false);
        setLoading(false);
        return;
      }

      setIsConnected(true);
      const email = session.user.email;
      if (email) setUserEmail(email);

      // 1. Validation Stripe
      if (success === 'true' && email) {
        await supabase.from('profiles').update({ is_vip: true }).eq('email', email);
      }

      // 2. Récupération des données
      if (email) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (userData) {
          setIsVip(userData.is_vip);
          if (userData.created_at) {
            setMemberSince(new Date(userData.created_at).toLocaleDateString('fr-FR'));
          }
        }
      }
      setLoading(false);
    }

    initAuth();
  }, [success, code]);

  if (loading) {
    return <p className="text-gray-400">Validation de la connexion en cours...</p>;
  }

  if (!isConnected) {
    return (
      <div className="mt-8 border border-red-500/50 bg-red-500/10 p-6 max-w-md">
        <h2 className="text-red-500 font-bold mb-2">Session expirée</h2>
        <p className="text-gray-300 mb-6 text-sm">Le système n'a pas pu valider le lien. Veuillez vous reconnecter.</p>
        <Link href="/login" className="bg-white text-black px-4 py-2 font-bold uppercase hover:bg-gray-200 transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
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
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl font-bold mb-8">KARDINAL // TERMINAL</h1>
      <Suspense fallback={<p className="text-gray-400">Chargement...</p>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}