import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "./authOptions";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Middleware to check if user is authenticated
export async function isAuthenticated(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return handler(req);
}

// Middleware to check if user is admin
export async function isAdmin(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  return handler(req);
}