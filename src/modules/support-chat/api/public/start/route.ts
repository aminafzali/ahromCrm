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
    const clientIP = getClientIP(req);

    console.log("🚀 [Support Chat API] درخواست شروع چت", {
      clientIP,
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      timestamp: new Date().toISOString(),
      bodyKeys: Object.keys(body),
    });

    // Check for registered user first (from request body, not cookies)
    const workspaceUserId = body.workspaceUserId;
    const workspaceId = body.workspaceId;

    let guestId = cookieStore.get("support_guest_id")?.value || body.guestId;
    let guest: any = null;

    // If we have a registered user, create ticket for them
    if (workspaceUserId && workspaceId) {
      console.log("👤 [Support Chat API] Registered user detected", {
        workspaceUserId,
        workspaceId,
      });

      // Try to find existing ticket for this user
      let ticket = await prisma.supportChatTicket.findFirst({
        where: {
          workspaceUserId: parseInt(workspaceUserId),
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
        orderBy: { createdAt: "desc" },
      });

      // If no registered ticket found, check for guest ticket with same user
      if (!ticket && guestId) {
        console.log(
          "🔍 [Support Chat API] Checking for guest ticket to convert",
          {
            guestId,
            workspaceUserId,
          }
        );

        const guestTicket = await prisma.supportChatTicket.findFirst({
          where: {
            guestUserId: parseInt(guestId),
            status: { in: ["OPEN", "IN_PROGRESS"] },
            workspaceUserId: null, // Not already converted
          },
          orderBy: { createdAt: "desc" },
        });

        if (guestTicket) {
          console.log(
            "🔄 [Support Chat API] Converting guest ticket to registered",
            {
              guestTicketId: guestTicket.id,
              workspaceUserId,
              workspaceId,
            }
          );

          // Convert guest ticket to registered user ticket
          ticket = await prisma.supportChatTicket.update({
            where: { id: guestTicket.id },
            data: {
              workspaceUserId: parseInt(workspaceUserId),
              workspaceId: parseInt(workspaceId),
              guestUserId: null, // Clear guest association
            },
          });
        }
      }

      if (!ticket) {
        // Create new ticket for registered user
        const ticketNumber = `TKT-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase()}`;

        ticket = await prisma.supportChatTicket.create({
          data: {
            workspaceId: parseInt(workspaceId),
            workspaceUserId: parseInt(workspaceUserId),
            ticketNumber,
            subject: "پشتیبانی آنلاین",
            description: "درخواست پشتیبانی از طریق چت آنلاین",
            status: "OPEN",
            priority: "MEDIUM",
          },
        });
      }

      const res = NextResponse.json({
        guestId: null,
        ticketId: ticket.id,
        guestInfo: null,
        isRegisteredUser: true,
      });

      res.cookies.set("support_ticket_id", ticket.id.toString(), {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });

      return res;
    }

    // If we have a guestId, try to find existing guest
    if (guestId) {
      try {
        console.log("🔍 [Support Chat API] جستجوی مهمان موجود", { guestId });

        guest = await prisma.supportGuestUser.findFirst({
          where: { id: parseInt(guestId) },
        });

        if (guest) {
          console.log("✅ [Support Chat API] مهمان موجود پیدا شد", {
            guestId: guest.id,
            name: guest.name,
            visitCount: guest.visitCount,
            lastVisitAt: guest.lastVisitAt,
            country: guest.country,
            ipAddress: guest.ipAddress,
          });

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

          console.log("🔄 [Support Chat API] اطلاعات مهمان به‌روزرسانی شد", {
            guestId: guest.id,
            newVisitCount: guest.visitCount,
            newLastVisitAt: guest.lastVisitAt,
            newIpAddress: guest.ipAddress,
          });
        } else {
          console.log("❌ [Support Chat API] مهمان با ID داده شده پیدا نشد", {
            guestId,
          });
        }
      } catch (error) {
        console.error("❌ [Support Chat API] خطا در جستجوی مهمان:", error);
        guest = null;
      }
    }

    // If no existing guest, create new one
    if (!guest) {
      const clientIP = getClientIP(req);
      const parsedUA = parseUserAgent(body.userAgent || "");

      console.log("🆕 [Support Chat API] ایجاد مهمان جدید", {
        clientIP,
        userAgent: body.userAgent,
        browser: parsedUA.browser,
        os: parsedUA.os,
        deviceType: parsedUA.deviceType,
        screenResolution: body.screenResolution,
        timezone: body.timezone,
        referrer: body.referrer,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
      });

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

      console.log("✅ [Support Chat API] مهمان جدید ایجاد شد", {
        guestId: guest.id,
        sessionId: guest.sessionId,
        fingerprint: guest.fingerprint,
        createdAt: guest.createdAt,
      });
    }

    // try to reuse existing ticket id cookie to keep continuity between sessions
    let ticketId = cookieStore.get("support_ticket_id")?.value;
    let ticket: any = null;

    if (ticketId) {
      // Try to find existing ticket
      try {
        console.log("🔍 [Support Chat API] جستجوی تیکت موجود", { ticketId });

        ticket = await prisma.supportChatTicket.findUnique({
          where: { id: parseInt(ticketId) },
        });

        if (ticket) {
          console.log("✅ [Support Chat API] تیکت موجود پیدا شد", {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
          });
        } else {
          console.log("❌ [Support Chat API] تیکت با ID داده شده پیدا نشد", {
            ticketId,
          });
        }
      } catch (error) {
        console.error("❌ [Support Chat API] خطا در جستجوی تیکت:", error);
        ticket = null;
      }
    }

    if (!ticket) {
      // Generate unique ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;

      console.log("🆕 [Support Chat API] ایجاد تیکت جدید", {
        ticketNumber,
        guestId: guest.id,
        workspaceId: 1,
      });

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

      console.log("✅ [Support Chat API] تیکت جدید ایجاد شد", {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      });
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

    console.log("🎉 [Support Chat API] چت با موفقیت شروع شد", {
      guestId,
      ticketId: Number(ticketId),
      ticketNumber: ticket.ticketNumber,
      clientIP,
      userAgent: req.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    });

    return res;
  } catch (e: any) {
    console.error("❌ [Support Chat API] خطا در شروع چت:", {
      error: e.message,
      stack: e.stack,
      clientIP: getClientIP(req),
      userAgent: req.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ error: "Failed to start" }, { status: 500 });
  }
}
