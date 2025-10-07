import type { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: any & { io?: any };
  };
};
