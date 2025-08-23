import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
});

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("ownerId").notNull().references(() => users.id),
});

export const orgMembers = sqliteTable(
  "orgMembers",
  {
    orgId: text("orgId").notNull().references(() => organizations.id),
    userId: text("userId").notNull().references(() => users.id),
    role: text("role").default("owner"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.orgId, t.userId] }) })
);

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  orgId: text("orgId").notNull().references(() => organizations.id),
  stripeCustomerId: text("stripeCustomerId"),
  priceId: text("priceId"),
  status: text("status"),
  currentPeriodEnd: integer("currentPeriodEnd", { mode: "timestamp" }),
});
