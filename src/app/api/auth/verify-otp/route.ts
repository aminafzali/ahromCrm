import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import jwt from "jsonwebtoken";

const verifyOtpSchema = z.object({
  token: z.string().min(1, "Token is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { token, otp } = validation.data;

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, secret) as {
        phone: string;
        otp: string;
      };

      // Check if OTP matches
      if (decoded.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { phone: decoded.phone },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Generate authentication token
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
        message: "OTP verified successfully",
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
        token: authToken,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" + error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying OTP" },
      { status: 500 }
    );
  }
}
