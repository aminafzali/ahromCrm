import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = "Unknown";
  let browserVersion = "";

  if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
    const match = ua.match(/version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes("edg")) {
    browser = "Edge";
    const match = ua.match(/edg\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }

  // OS detection
  let os = "Unknown";
  let osVersion = "";

  if (ua.includes("windows")) {
    os = "Windows";
    if (ua.includes("windows nt 10.0")) osVersion = "10";
    else if (ua.includes("windows nt 6.3")) osVersion = "8.1";
    else if (ua.includes("windows nt 6.2")) osVersion = "8";
    else if (ua.includes("windows nt 6.1")) osVersion = "7";
  } else if (ua.includes("mac os")) {
    os = "macOS";
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace("_", ".");
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("android")) {
    os = "Android";
    const match = ua.match(/android (\d+\.\d+)/);
    if (match) osVersion = match[1];
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = ua.includes("iphone") ? "iOS" : "iPadOS";
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace("_", ".");
  }

  // Device type detection
  let deviceType = "desktop";
  if (ua.includes("mobile")) deviceType = "mobile";
  else if (ua.includes("tablet") || ua.includes("ipad")) deviceType = "tablet";

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
  };
}

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}${rand}`;
}

export async function POST(req: NextRequest) {
  const { prisma } = await import("@/lib/prisma");
  try {
    const body = await req.json().catch(() => ({}));
    const cookieStore = req.cookies;

    let guestId = cookieStore.get("support_guest_id")?.value || body.guestId;
    let guest: any = null;

    // If we have a guestId, try to find existing guest
    if (guestId) {
      try {
        guest = await prisma.supportGuestUser.findFirst({
          where: { id: parseInt(guestId) },
        });

        if (guest) {
          // Update last visit and increment visit count
          guest = await prisma.supportGuestUser.update({
            where: { id: guest.id },
            data: {
              lastVisitAt: new Date(),
              visitCount: { increment: 1 },
              ipAddress: getClientIP(req),
              userAgent: body.userAgent || guest.userAgent,
            },
          });
        }
      } catch (error) {
        console.error("Error finding guest:", error);
        guest = null;
      }
    }

    // If no existing guest, create new one
    if (!guest) {
      const clientIP = getClientIP(req);
      const parsedUA = parseUserAgent(body.userAgent || "");

      guest = await prisma.supportGuestUser.create({
        data: {
          workspaceId: 1, // Default workspace for now
          ipAddress: clientIP,
          userAgent: body.userAgent || "unknown",
          browser: parsedUA.browser,
          browserVersion: parsedUA.browserVersion,
          os: parsedUA.os,
          osVersion: parsedUA.osVersion,
          device: parsedUA.deviceType,
          deviceType: parsedUA.deviceType,
          screenResolution: body.screenResolution || "unknown",
          timezone: body.timezone || "unknown",
          referrer: body.referrer || null,
          utmSource: body.utmSource || null,
          utmMedium: body.utmMedium || null,
          utmCampaign: body.utmCampaign || null,
          sessionId: `session_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          fingerprint: `fp_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        },
      });
      guestId = guest.id.toString();
    }

    // try to reuse existing ticket id cookie to keep continuity between sessions
    let ticketId = cookieStore.get("support_ticket_id")?.value;
    let ticket: any = null;

    if (ticketId) {
      // Try to find existing ticket
      try {
        ticket = await prisma.supportChatTicket.findUnique({
          where: { id: parseInt(ticketId) },
        });
      } catch (error) {
        console.error("Error finding existing ticket:", error);
        ticket = null;
      }
    }

    if (!ticket) {
      // Generate unique ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;

      // Create a new support ticket
      ticket = await prisma.supportChatTicket.create({
        data: {
          workspaceId: 1, // Default workspace for now
          ticketNumber,
          guestUserId: guest.id,
          subject: "پشتیبانی آنلاین",
          description: "درخواست پشتیبانی از طریق چت آنلاین",
          status: "OPEN",
          priority: "MEDIUM",
        },
      });
      ticketId = ticket.id.toString();
    }

    const res = NextResponse.json({
      guestId,
      ticketId: Number(ticketId),
      guestInfo: {
        country: guest.country,
        city: guest.city,
        browser: guest.browser,
        os: guest.os,
        deviceType: guest.deviceType,
        visitCount: guest.visitCount,
      },
    });

    res.cookies.set("support_guest_id", guestId, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    res.cookies.set("support_ticket_id", ticketId || "", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    console.error("Error starting support chat:", e);
    return NextResponse.json({ error: "Failed to start" }, { status: 500 });
  }
}
