// مسیر فایل: src/lib/authOptions.ts (نسخه نهایی و کامل)

import prisma from "@/lib/prisma";
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials", // نام provider را به credentials تغییر می‌دهیم که استانداردتر است
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
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

        // ++ اصلاحیه کلیدی: منطق کامل تایید OTP ++
        if (user.otp !== credentials.otp) {
          throw new Error("کد تایید نامعتبر است.");
        }
        if (!user.otpExpires || user.otpExpires < new Date()) {
          throw new Error("کد تایید منقضی شده است.");
        }

        // پس از تایید موفق، OTP را از دیتابیس پاک می‌کنیم
        await prisma.user.update({
          where: { id: user.id },
          data: { otp: null, otpExpires: null },
        });

        // برگرداندن آبجکت کاربر برای ایجاد نشست
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
  },
  pages: {
    signIn: "/login",
    error: "/login", // صفحه خطا در صورت بروز مشکل در لاگین
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
