'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (!error) {
      setSent(true);
    } else {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-mono flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold">KARDINAL // LOGIN</h1>
        {sent ? (
          <p className="text-green-500">Lien de connexion envoyé à {email}. Vérifie tes e-mails !</p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 font-bold uppercase hover:bg-gray-200 transition-colors"
            >
              {loading ? "Envoi..." : "Recevoir le lien magique"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}