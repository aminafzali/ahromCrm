import { NextRequest } from "next/server";
import { ChatServiceApi } from "../../../../service/ChatServiceApi";

const service = new ChatServiceApi();

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const roomId = Number(params.roomId);
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const res = await service.listMessages(roomId, { page, limit });
  return new Response(JSON.stringify(res), {
    headers: { "content-type": "application/json" },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const roomId = Number(params.roomId);
  const body = await req.json();
  const created = await service.createMessage(roomId, body);
  return new Response(JSON.stringify(created), {
    headers: { "content-type": "application/json" },
  });
}
