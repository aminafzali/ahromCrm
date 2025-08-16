import RequestForm from "@/modules/requests/components/RequestForm";

export default function RequestPage() {
  return (
    <>
      <RequestForm params={{isAdmin : false}}/>
    </>
  );
}
