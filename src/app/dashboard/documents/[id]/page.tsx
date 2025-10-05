import DocumentViewPage from "@/modules/documents/views/view/page";

export default function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  return <DocumentViewPage id={id} />;
}
