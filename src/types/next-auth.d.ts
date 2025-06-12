import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: string;
      phone: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    role: string;
    phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
    phone: string;
  }
}