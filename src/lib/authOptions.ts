// مسیر فایل: src/lib/authOptions.ts (نسخه نهایی و کامل)

import prisma from "@/lib/prisma";
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.phone) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // برگرداندن یک آبجکت کامل که با تایپ User در next-auth هماهنگ است
        return {
          id: user.id.toString(), // ++ id به صورت رشته برگردانده می‌شود ++
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
        // اطلاعات اصلی کاربر به توکن اضافه می‌شود
        token.id = user.id; // user.id اکنون یک رشته است
        token.phone = (user as any).phone;
        // -- فیلد role به طور کامل حذف شده است --
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        // -- فیلد role به طور کامل حذف شده است --
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
