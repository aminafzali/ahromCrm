// مسیر فایل: src/app/(root)/[slug]/request/page.tsx

import NotFound from "@/@Client/Components/common/NotFound";
import { prisma } from "@/lib/prisma";
import PublicRequestForm4 from "@/modules/requests/components/PublicRequestForm4";

interface PublicRequestPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicRequestPageBySlug({
  params,
}: PublicRequestPageProps) {
  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { slug } });

  if (!workspace) {
    return <NotFound />;
  }

  const serviceTypes = await prisma.serviceType.findMany({
    where: {
      workspaceId: workspace.id,
    },
  });

  const initialStatus = await prisma.status.findFirst({
    where: {
      workspaceId: workspace.id,
    },
    orderBy: {
      id: "asc",
    },
  });

  if (!initialStatus) {
    return <NotFound />;
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">
          ثبت درخواست جدید برای {workspace.name}
        </h1>
      </div>

      <PublicRequestForm4
        workspaceId={workspace.id}
        serviceTypes={serviceTypes}
        initialStatusId={initialStatus.id}
        slug={slug}
      />
    </div>
  );
}
