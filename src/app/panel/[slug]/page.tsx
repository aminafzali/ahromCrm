"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useParams } from "next/navigation";
import { lazy, Suspense } from "react";

export default function DynamicIndexPage() {
  const params = useParams();
  const slug = params?.slug;
  const { activeWorkspace, isLoading } = useWorkspace();

  const DynamicComponent = lazy(async () => {
    try {
      return await import(`@/modules/${slug}/views/page`);
    } catch (error) {
      console.error("Error loading module:", error);
      return {
        default: () => <NotFound />,
      };
    }
  });

  return (
    <Suspense fallback={<Loading />}>
      {isLoading ? (
        <Loading />
      ) : (
        <DynamicComponent isAdmin={activeWorkspace?.role?.name === "Admin"} />
      )}
    </Suspense>
  );
}
