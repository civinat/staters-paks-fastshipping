import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
  const { priceId } = await req.json();
  const session = await auth();
  if (!session?.user?.email || !session.user.id)
    return new Response("Unauthorized", { status: 401 });

  const found = await db
    .select()
    .from(organizations)
    .where(eq(organizations.ownerId, session.user.id));
  let orgId = found[0]?.id;
  if (!orgId) {
    orgId = randomUUID();
    await db.insert(organizations).values({
      id: orgId,
      name: `${session.user.name ?? "User"} Org`,
      ownerId: session.user.id,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });
  const cs = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId as string, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?sc=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?canceled=1`,
    client_reference_id: orgId,
    customer_email: session.user.email,
  });
  return Response.json({ url: cs.url });
}
