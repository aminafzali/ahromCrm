"use client";

import Link from "next/link";

export default function RoomsList({ rooms }: { rooms: any[] }) {
  return (
    <ul className="menu bg-white rounded-lg border">
      {(rooms || []).map((r) => (
        <li key={r.id}>
          <Link href={`/dashboard/chat/${r.id}`}>
            {r.name || `Room #${r.id}`}
          </Link>
        </li>
      ))}
    </ul>
  );
}
