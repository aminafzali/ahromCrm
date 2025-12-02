import {
  DELETE as ModuleDELETE,
  POST as ModulePOST,
} from "@/modules/comments/api/id/like/route";
import { NextRequest } from "next/server";

// Wrapper to handle Promise-based params from Next.js App Router
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return ModulePOST(req, { params: { id } });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return ModuleDELETE(req, { params: { id } });
}
