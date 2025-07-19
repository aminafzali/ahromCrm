// مسیر فایل: src/lib/authOptions.ts (نسخه نهایی و کامل)

import prisma from "@/lib/prisma";
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
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
    // ++ اصلاحیه کلیدی: تعریف callback برای redirect ++
    async redirect({ url, baseUrl }) {
      // اگر کاربر در حال لاگین کردن است، همیشه او را به صفحه انتخاب ورک‌اسپیس بفرست
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/select-workspace`;
      }
      // در غیر این صورت، به آدرسی که از آن آمده بود برگردان
      return url;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
