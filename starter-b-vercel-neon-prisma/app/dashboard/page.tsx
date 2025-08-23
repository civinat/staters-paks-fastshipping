import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function SubscribeButton({ priceId }: { priceId: string }) {
  "use client";
  return (
    <button
      onClick={async () => {
        const r = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId }),
        });
        const { url } = await r.json();
        window.location.href = url;
      }}
      className="border px-4 py-2"
    >
      Subscribe
    </button>
  );
}

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  const org = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
  });
  const sub = org
    ? await prisma.subscription.findFirst({ where: { orgId: org.id } })
    : null;
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {sub?.status === "active" ? (
        <p className="mt-4">
          Your subscription is <strong>active</strong>.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          <p>No active subscription.</p>
          <SubscribeButton priceId={priceId} />
        </div>
      )}
    </main>
  );
}
