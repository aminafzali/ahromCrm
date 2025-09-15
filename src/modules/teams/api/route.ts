import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { TeamServiceApi } from "../service/TeamServiceApi";
import { TeamSchema } from "../validation/schema";

const teamService = new TeamServiceApi();

/**
 * Handles GET request to fetch all teams.
 * This is the new self-contained version.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Use 'currentWorkspaceId' as it's defined in your next-auth.d.ts
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workspaceId = session.user.workspaceId;
    const queryParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = await teamService.getTeams(Number(workspaceId), queryParams);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handles POST request to create a new team.
 * This is the new self-contained version.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workspaceId = session.user.workspaceId;
    const body = await request.json();
    const validation = TeamSchema.safeParse(body);

    if (!validation.success) {
      // This correctly handles the Zod error and fixes the TypeScript error
      return NextResponse.json(
        { error: "ورودی نامعتبر است.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = await teamService.createTeam(
      Number(workspaceId),
      validation.data
    );

    return NextResponse.json(
      { message: "تیم با موفقیت ایجاد شد.", data },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
