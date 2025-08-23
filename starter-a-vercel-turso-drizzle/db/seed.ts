import { db } from "@/lib/db";
import { users } from "./schema";
import { randomUUID } from "node:crypto";

async function seed() {
  await db
    .insert(users)
    .values({ id: randomUUID(), email: "demo@example.com", name: "Demo" })
    .onConflictDoNothing?.();
  console.log("Seed complete");
}

seed();
