import { db as getDb } from "@/lib/db";
import { users } from "./schema";
import { randomUUID } from "node:crypto";

async function seed() {
  const db = getDb();
  await db
    .insert(users)
    .values({ id: randomUUID(), email: "demo@example.com", name: "Demo" })
    .onConflictDoNothing?.();
  console.log("Seed complete");
}

seed();
