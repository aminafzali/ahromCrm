import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { compare } from "bcryptjs"; // تغییر از bcrypt به bcryptjs

const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { phone, password } = validation.data;

    // Find user by phone number
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 400 }
      );
    }

    // Generate authentication token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const authToken = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
      secret,
      { expiresIn: "90d" }
    );

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      token: authToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "An error occurred while logging in" },
      { status: 500 }
    );
  }
}