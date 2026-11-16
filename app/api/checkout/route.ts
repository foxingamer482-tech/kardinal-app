import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialisation de Stripe avec ta clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Version standard de l'API
});

export async function POST(request: Request) {
  try {
    // Récupère l'URL actuelle du site (localhost en développement, Vercel en production)
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Demande à Stripe de créer une session de paiement (Checkout)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // Mode abonnement récurrent
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_VIP, // Ton ID KARDINAL VIP
          quantity: 1,
        },
      ],
      // Redirections après le paiement
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
    });

    // Renvoie l'URL sécurisée générée par Stripe au navigateur
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}