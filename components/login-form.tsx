"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Formulaire magic link, à insérer dans la landing page `/`. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return <p>Lien de connexion envoyé à {email}.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@domaine.com"
        className="border px-3 py-2"
      />
      <button type="submit" disabled={status === "sending"} className="border px-4 py-2">
        {status === "sending" ? "Envoi…" : "Accéder au terminal"}
      </button>
      {status === "error" && <p className="text-red-500">Échec de l'envoi.</p>}
    </form>
  );
}
