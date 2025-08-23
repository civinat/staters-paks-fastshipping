import { drizzle } from "drizzle-orm/d1";

export function db() {
  // @ts-ignore - DB binding provided by Cloudflare
  return drizzle((globalThis as any).DB);
}
