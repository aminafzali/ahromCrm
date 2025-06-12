import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().optional(),
  token: z.string().min(1, "Token is required"), // Token from OTP verification
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, address, token } = validation.data;

    // Verify token to ensure phone is verified
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, secret) as {
        id: number;
        phone: string;
      };

      // Check if the phone in the token matches the provided phone
      if (decoded.phone !== phone) {
        return NextResponse.json(
          { error: "Phone number mismatch" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      let user;

      if (existingUser) {
        // Update existing user with new information
        user = await prisma.user.update({
          where: { phone },
          data: {
            name,
            address,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            name,
            phone,
            address,
            role: "USER",
          },
        });
      }


      const { ...userWithoutPassword } = user;

      return NextResponse.json(
        { message: "User registered successfully", user: userWithoutPassword },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" + error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
