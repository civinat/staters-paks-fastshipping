import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { priceId } = await req.json();
  const session = await auth();
  if (!session?.user?.email || !session.user.id)
    return new Response("Unauthorized", { status: 401 });

  let org = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: `${session.user.name ?? "User"} Org`, ownerId: session.user.id },
    });
    await prisma.orgMember.create({
      data: { orgId: org.id, userId: session.user.id, role: "owner" },
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
    client_reference_id: org.id,
    customer_email: session.user.email,
  });
  return Response.json({ url: cs.url });
}
