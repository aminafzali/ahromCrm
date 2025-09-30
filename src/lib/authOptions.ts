// مسیر فایل: src/lib/authOptions.ts

import prisma from "@/lib/prisma";
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: { phone: {}, otp: {} },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.phone || !credentials.otp) {
          throw new Error("شماره تلفن و کد تایید الزامی است.");
        }
        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });
        if (!user) {
          throw new Error("کاربری با این مشخصات یافت نشد.");
        }
        if (user.otp !== credentials.otp) {
          throw new Error("کد تایید نامعتبر است.");
        }
        if (!user.otpExpires || user.otpExpires < new Date()) {
          throw new Error("کد تایید منقضی شده است.");
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { otp: null, otpExpires: null },
        });
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        // ++ اصلاحیه: هدایت به آدرس جدید و صحیح ++
        return `${baseUrl}/workspaces`;
      }
      return url;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
