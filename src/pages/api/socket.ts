import type { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import type { NextApiResponseServerIO } from "./types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server as any, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      socket.on("chat:join", (roomId: number) => {
        if (!roomId) return;
        socket.join(String(roomId));
        socket.emit("chat:joined", roomId);
      });

      socket.on("chat:typing", (roomId: number) => {
        if (!roomId) return;
        socket
          .to(String(roomId))
          .emit("chat:typing", { roomId, at: Date.now() });
      });

      socket.on(
        "chat:message",
        (payload: { roomId: number; body: string; tempId?: string }) => {
          if (!payload?.roomId || !payload?.body) return;
          io.to(String(payload.roomId)).emit("chat:message", {
            id: payload.tempId || Date.now(),
            roomId: payload.roomId,
            body: payload.body,
            createdAt: new Date().toISOString(),
          });
        }
      );
    });

    res.socket.server.io = io as any;
  }
  res.end();
}
