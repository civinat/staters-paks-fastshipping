import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.user.create({
    data: { email: "demo@example.com", name: "Demo User" },
  });
  await prisma.product.create({
    data: { name: "Sample Product", price: 1000 },
  });
  console.log("Seed complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
