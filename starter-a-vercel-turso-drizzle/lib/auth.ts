import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { ...schema }),
  session: { strategy: "jwt" },
  providers: [
    Email({
      async sendVerificationRequest({ identifier, url }) {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: identifier,
            subject: "Your sign-in link",
            html: `<p>Click to sign in: <a href='${url}'>${url}</a></p>`,
          }),
        });
        if (!r.ok) throw new Error("Email send failed");
      },
    }),
  ],
});
