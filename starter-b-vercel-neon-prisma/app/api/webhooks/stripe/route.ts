import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const orgId = s.client_reference_id!;
      const sub = await stripe.subscriptions.retrieve(
        s.subscription as string
      );
      await prisma.subscription.upsert({
        where: { id: sub.id },
        create: {
          id: sub.id,
          orgId,
          stripeCustomerId: String(sub.customer),
          priceId: sub.items.data[0]?.price?.id ?? null,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null,
        },
        update: {
          stripeCustomerId: String(sub.customer),
          priceId: sub.items.data[0]?.price?.id ?? null,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null,
        },
      });
      return new Response("ok");
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const s = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { id: s.id },
        data: {
          status: s.status,
          priceId: s.items.data[0]?.price?.id ?? null,
          currentPeriodEnd: s.current_period_end
            ? new Date(s.current_period_end * 1000)
            : null,
        },
      });
      return new Response("ok");
    }

    return new Response("ignored");
  } catch (e: any) {
    return new Response(`Webhook Error: ${e.message}`, { status: 400 });
  }
}
