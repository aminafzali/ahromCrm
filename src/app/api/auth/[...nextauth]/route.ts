import { authOptions } from "@/lib/authOptions";
import NextAuth from "next-auth";

// ✅ Correct API handler format for App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
