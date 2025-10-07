import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

export default async function SupportPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return notFound();

  const SupportChatPublic = dynamic(
    () => import("@/modules/chat/components/SupportChatPublicClient"),
    { ssr: true }
  );

  return <SupportChatPublic workspaceId={workspace.id} slug={slug} />;
}
