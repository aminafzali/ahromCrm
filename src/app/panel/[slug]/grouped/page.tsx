"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useParams } from "next/navigation";
import { lazy, Suspense } from "react";

export default function DynamicGroupedListPage() {
  const params = useParams();
  const slug = params?.slug;
  const { activeWorkspace, isLoading } = useWorkspace();

  const DynamicComponent = lazy(async () => {
    try {
      // Dynamically import the corresponding module's grouped list component
      return await import(`@/modules/${slug}/views/grouped/page`);
    } catch (error) {
      console.error("Error loading grouped list module:", error);
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
        <DynamicComponent
          isAdmin={false} // همیشه false برای panel
        />
      )}
    </Suspense>
  );
}
