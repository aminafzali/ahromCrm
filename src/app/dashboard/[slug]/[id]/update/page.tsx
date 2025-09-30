"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
//import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { lazy, Suspense } from "react";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";

export default function DynamicUpdatePage() {
  const { slug, id } = useParams();
 // const { data: session, status } = useSession();
  const { activeWorkspace } = useWorkspace();
  const DynamicComponent = lazy(async () => {
    try {
      // Dynamically import the corresponding module's update view
      return await import(`@/modules/${slug}/views/view/update/page`);
    } catch (error) {
      console.error("Error loading module:", error);
      return {
        default: () => <NotFound />,
      };
    }
  });

  return (
    <Suspense fallback={<Loading />}>
      {status === "loading" ? (
        <Loading />
      ) : (
        <DynamicComponent
          id={parseInt(id as string)}
          backUrl={`/dashboard/${slug}`}
          isAdmin={activeWorkspace?.role?.name === "Admin"}
        />
      )}
    </Suspense>
  );
}
