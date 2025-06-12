import prisma from "@/lib/prisma";
import { SmsHelper } from "@/lib/smsHelper";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const phoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = phoneSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { phone } = validation.data;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // If user doesn't exist, create a new one with minimal info
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: "USER",
        },
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real implementation, you would send the OTP via SMS here
    // For now, we'll just log it to the console
    console.log(`OTP for ${phone}: ${otp}`);

    // Store OTP in database or cache (for verification later)
    // For simplicity, we'll create a JWT token with the OTP and phone
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      {
        phone,
        otp,
        exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes expiration
      },
      secret
    );

    const res = SmsHelper.send(phone, otp)
    return NextResponse.json({
      message: "OTP sent successfully",
      token, // This token will be used for verification
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "An error occurred while sending OTP" },
      { status: 500 }
    );
  }
}
