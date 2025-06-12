
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "OTP",
        credentials: {
          phone: { label: "Phone", type: "text" },
          token: { label: "Token", type: "text" },
        },
        async authorize(credentials) {
          if (!credentials?.phone || !credentials?.token) {
            throw new Error("Missing credentials");
          }
  
          try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
              throw new Error("JWT_SECRET is not defined");
            }
  
            const decoded = jwt.verify(credentials.token, secret) as {
              id: number;
              phone: string;
              role: string;
            };
  
            if (decoded.phone !== credentials.phone) {
              throw new Error("Phone number mismatch");
            }
  
            const user = await prisma.user.findUnique({
              where: { phone: credentials.phone },
            });
  
            if (!user) {
              throw new Error("User not found");
            }
  
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
            };
          } catch (error) {
            console.error("Authentication error:", error);
            throw new Error("Invalid or expired token");
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id as number;
          token.role = user.role;
          token.phone = user.phone;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user.id = token.id as number;
          session.user.role = token.role as string;
          session.user.phone = token.phone as string;
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