// // مسیر فایل: src/modules/teams/views/view/page.tsx
"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
// import ChatLinkButton from "@/modules/chat/components/ChatLinkButton"; // Removed: Use internal-chat instead
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTeam } from "../../hooks/useTeam";
import { TeamWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const router = useRouter();
  const { getById, loading, error, statusCode, remove } = useTeam();
  const [team, setTeam] = useState<TeamWithRelations | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    const data = await getById(id);
    if (data) {
      setTeam(data);
    }
  };

  const handleDelete = async (row: any) => {
    await remove(row.id);
    router.push("/dashboard/teams");
  };

  const displayData = team
    ? {
        "نام تیم": team.name,
        // ===== شروع کد جدید =====
        "تیم والد": team.parent ? (
          <Link
            href={`/dashboard/teams/${team.parentId}`}
            className="text-blue-600 hover:underline"
          >
            {team.parent.name}
          </Link>
        ) : (
          "ندارد"
        ),
        // ===== پایان کد جدید =====
        توضیحات: team.description || "-",
        "تعداد اعضا": team._count?.members || 0,
        اعضا:
          team.members
            ?.map(
              (m) => m.workspaceUser.displayName || m.workspaceUser.user.name
            )
            .join(", ") || "بدون عضو",
      }
    : {};

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <>
      <DetailPageWrapper
        data={displayData}
        title="جزئیات تیم"
        loading={loading}
        error={error}
        onDelete={() => handleDelete(team)}
        editUrl={`/dashboard/teams/${id}/update`}
      />
    </>
  );
}

// "use client";

// import Loading from "@/@Client/Components/common/Loading";
// import NotFound from "@/@Client/Components/common/NotFound";
// import { DetailPageWrapper } from "@/@Client/Components/wrappers";
// import { useParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useTeam } from "../../hooks/useTeam";
// import { TeamWithRelations } from "../../types";

// export default function DetailPage() {
//   const params = useParams();
//   const id = parseInt(params.id as string);
//   const router = useRouter();
//   const { getById, loading, error, statusCode, remove } = useTeam();
//   const [team, setTeam] = useState<TeamWithRelations | null>(null);

//   useEffect(() => {
//     if (id) {
//       fetchDetails();
//     }
//   }, [id]);

//   const fetchDetails = async () => {
//     const data = await getById(id);
//     if (data) {
//       setTeam(data);
//     }
//   };

//   const handleDelete = async (row: any) => {
//     await remove(row.id);
//     router.push("/dashboard/teams");
//   };

//   const displayData = team
//     ? {
//         "نام تیم": team.name,
//         توضیحات: team.description || "-",
//         "تعداد اعضا": team._count?.members || 0,
//         اعضا:
//           team.members
//             ?.map(
//               (m) => m.workspaceUser.displayName || m.workspaceUser.user.name
//             )
//             .join(", ") || "بدون عضو",
//       }
//     : {};

//   if (loading) return <Loading />;
//   if (statusCode === 404) return <NotFound />;

//   return (
//     <DetailPageWrapper
//       data={displayData}
//       title="جزئیات تیم"
//       loading={loading}
//       error={error}
//       onDelete={() => handleDelete(team)}
//       editUrl={`/dashboard/teams/${id}/update`}
//     />
//   );
// }
