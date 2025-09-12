// مسیر فایل: src/types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      workspaceId: any;
      id: string; // id همیشه رشته است
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      role?: string; // ** فیلد role باید اینجا تعریف شده باشد **
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    phone?: string | null;
    role?: string; // ** فیلد role باید اینجا تعریف شده باشد **
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone?: string | null;
    role?: string; // ** فیلد role باید اینجا تعریف شده باشد **
  }
}
