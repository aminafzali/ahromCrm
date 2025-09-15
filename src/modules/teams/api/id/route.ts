import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { TeamServiceApi } from "../../service/TeamServiceApi";
import { TeamSchema } from "../../validation/schema";

const teamService = new TeamServiceApi();

interface RouteParams {
  params: { id: string };
}

/**
 * Handles GET request for a single team.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    const workspaceId = session.user.workspaceId;
    const data = await teamService.getTeamById(id, Number(workspaceId));

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

/**
 * Handles PUT request to update a team.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    const body = await request.json();
    const validation = TeamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر است.", details: validation.error.format() },
        { status: 400 }
      );
    }

    // Security check should be done in the service layer before updating
    const data = await teamService.updateTeam(id, validation.data);

    return NextResponse.json({ message: "تیم با موفقیت ویرایش شد.", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE request to remove a team.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    // Security check should be done in the service layer before deleting
    await teamService.deleteTeam(id);

    return NextResponse.json(
      { message: "تیم با موفقیت حذف شد." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
