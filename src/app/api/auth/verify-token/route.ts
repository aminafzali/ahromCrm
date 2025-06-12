import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    try {
      const decoded = jwt.verify(token, secret);
      return NextResponse.json({ valid: true, decoded }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" + error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during token verification" },
      { status: 500 }
    );
  }
}
