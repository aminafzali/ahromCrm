import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailWrapper } from "@/@Client/Components/wrappers";
import { ActionButton } from "@/@Client/types";
import { listItemRender2 } from "@/modules/notifications/data/table";
import { Card } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";
import FormSubmissionView from "../../components/FormSubmissionView";
import ReminderButton from "../../components/ReminderButton";
import RequestStatusForm from "../../components/RequestStatusForm";
import { useRequest } from "../../hooks/useRequest";
import { RequestWithRelations } from "../../types";

interface RequestDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id, isAdmin }: RequestDetailsViewProps) {
  const {
    getById,
    update,
    submitting: loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useRequest();
  const [request, setRequest] = useState<RequestWithRelations>(
    {} as RequestWithRelations
  );
  const [showStatusForm, setShowStatusForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const data = await getById(id);
      setRequest(data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  // const handleFormSubmit = async (formData: any) => {
  //   try {
  //     await update(id, {
  //       formSubmissionid: formData.formId,
  //       formData: formData.data,
  //     });
  //     fetchRequestDetails();
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //   }
  // };

  const handleStatusUpdateSuccess = () => {
    setShowStatusForm(false);
    fetchRequestDetails();
  };

  const getActionButtons = (): ActionButton[] => {
    const buttons: ActionButton[] = [];

    if (isAdmin) {
      buttons.push({
        label: "تغییر وضعیت",
        onClick: () => setShowStatusForm(true),
        icon: <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />,
        variant: "primary",
      });
    }

    return buttons;
  };

  const customRenderers = {
    phone: (value: string) => (
      <div className="flex justify-between py-1 rounded-lg bg-primary text-white px-2">
        <a href={`tel:${value}`} className="text-white text-lg flex">
          {value || "نامشخص"}
          <DIcon
            icon="fa-phone"
            cdi={false}
            classCustom="!mx-2 text-white text-lg"
          />
        </a>
      </div>
    ),
    user: (row) => (
      <div className="flex justify-start lg:gap-2 py-1  mt-4 items-center">
        <div className="lg:flex flex-row-reverse justify-between bg-white p-4 rounded-lg w-full boder-[1px] border-gray-400 items-start mb-3">
          <div className="flex justify-center py-1 my-2 rounded-lg border-[1px] border-primary text-primary px-2">
            <a href={`tel:${row.phone}`} className="text-primary text-lg flex">
              {row.phone || "نامشخص"}
              <DIcon
                icon="fa-phone"
                cdi={false}
                classCustom="!mx-1 text-primary text-lg"
              />
            </a>
          </div>
          <Link href={`/dashboard/users/${row.id}`} className="w-full py-2">
            <h3 className="font-meduim text-md">{row.name || "نامشخص"}</h3>

            <p className="text-gray-400 text-sm mt-2">
              <DIcon icon="fa-location-dot" cdi={false} classCustom="ml-1" />
              {row.address || " آدرس نامشخص"}
            </p>

            {row.labels && row.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t-[1px] border-t-gray-400">
                {row.labels.map((item) => (
                  <span
                    key={item.id}
                    className={` p-2 rounded-xl py-1 border-[1px]`}
                    style={{ borderColor: item.color, color: item.color }}
                  >
                    {" "}
                    {item.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </div>
      </div>
    ),
    formSubmission: (value: any) => (
      <FormSubmissionView formSubmission={value} />
    ),
  };

  const renderStatusForm = () => {
    if (!showStatusForm) return null;

    return (
      <Card className="mb-6">
        <RequestStatusForm
          requestId={id}
          currentStatus={request.status.id}
          onSuccess={handleStatusUpdateSuccess}
        />
      </Card>
    );
  };

  const renderTimeline = () => {
    if (!request.notifications || request.notifications.length === 0)
      return null;

    return (
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-4 py-2">گزارش وضعیت</h2>
        <div className="grid gap-2 py-2">
          {request.notifications.map((note) => (
            <div key={note.id}>{listItemRender2(note)}</div>
          ))}
        </div>
      </div>
    );
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  const excludeFields = [
    "id",
    "createdAt",
    "updatedAt",
    "notes",
    "userId",
    "notifications",
  ];

  if (!isAdmin) excludeFields.push("user");

  return (
    <div>
      {renderStatusForm()}
      <DetailWrapper
        data={request}
        title="جزئیات درخواست"
        excludeFields={excludeFields}
        actionButtons={getActionButtons()}
        loading={loading}
        headerContent={<ReminderButton requestId={id} userId={request.user.id} />
      }
        error={error}
        success={success}
        customRenderers={customRenderers}
      />

      {renderTimeline()}
    </div>
  );
}
