"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { lazy, Suspense } from "react";

export default function DynamicDashboardPage() {
  const { slug, id } = useParams();
  const { data: session, status } = useSession();

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
          isAdmin={session?.user.role === "ADMIN"}
          id={parseInt(id as string)}
          backUrl={`/dashboard/${slug}`}
        />
      )}
    </Suspense>
  );
}
