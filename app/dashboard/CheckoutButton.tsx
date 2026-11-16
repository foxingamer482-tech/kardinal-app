"use client";
import { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirige vers la page Stripe
      } else {
        console.error("Erreur:", data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur de connexion Stripe", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      style={{
        padding: "10px 20px",
        backgroundColor: "white",
        color: "black",
        border: "none",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "20px"
      }}
    >
      {loading ? "Chargement..." : "Passer VIP - 9,99€/mois"}
    </button>
  );
}