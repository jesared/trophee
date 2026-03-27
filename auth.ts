import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "";
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? "";
const emailServer = process.env.EMAIL_SERVER
  ? process.env.EMAIL_SERVER.replace(/^"|"$/g, "")
  : undefined;
const emailFrom = process.env.EMAIL_FROM
  ? process.env.EMAIL_FROM.replace(/^"|"$/g, "")
  : undefined;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    EmailProvider({
      server: emailServer,
      from: emailFrom,
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(provider.server);
        const subject = `Votre lien de connexion — ${host}`;
        const text = `Bonjour,\n\nVoici votre lien de connexion :\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n— ${host}`;
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2 style="margin:0 0 8px;">Connexion à ${host}</h2>
            <p>Bonjour,</p>
            <p>Voici votre lien de connexion :</p>
            <p>
              <a href="${url}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;border-radius:6px;text-decoration:none;">
                Se connecter
              </a>
            </p>
            <p style="font-size:12px;color:#6b7280;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <p style="font-size:12px;color:#6b7280;">Lien direct : ${url}</p>
          </div>
        `;

        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject,
          text,
          html,
        });
      },
    }),
  ],
  pages: {
    verifyRequest: "/login/check-email",
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
