import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialisation avec la version API exacte exigée par Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia', 
});

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      // La ligne payment_method_types a été retirée pour laisser Stripe gérer automatiquement
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_VIP, 
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erreur Stripe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}