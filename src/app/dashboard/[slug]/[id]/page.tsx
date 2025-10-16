"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
//import { useSession } from "next-auth/react";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useParams } from "next/navigation";
import { lazy, Suspense } from "react";

export default function DynamicDashboardPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  //const { data: session, status } = useSession();
  const { activeWorkspace } = useWorkspace();

  const DynamicComponent = lazy(async () => {
    try {
      // Dynamically import the corresponding module's view component
      return await import(`@/modules/${slug}/views/view/page`);
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
