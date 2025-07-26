"use client";

// ایمپورت‌های اصلی شما دست‌نخورده باقی می‌مانند
import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailWrapper } from "@/@Client/Components/wrappers";
import { ActionButton } from "@/@Client/types";
import { listItemRender2 } from "@/modules/notifications/data/table";
import { Button, Card } from "ndui-ahrom"; // Button اضافه شده است
import { useEffect, useState } from "react";
import RequestStatusForm from "../../components/RequestStatusForm";
import { useRequest } from "../../hooks/useRequest";
import { RequestWithRelations } from "../../types";

// +++ ایمپورت‌های جدید برای قابلیت ویرایش +++
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormSubmissionView from "../../components/FormSubmissionView";
import RequestServicesManager from "../../components/RequestServicesManager"; // کامپوننت زیبای ما
import { createRequestSchema } from "../../validation/schema";

interface RequestDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

// استخراج نوع داده فرم از Zod Schema
type RequestFormData = z.infer<typeof createRequestSchema>;

export default function DetailPage({ id, isAdmin }: RequestDetailsViewProps) {
  // --- هوک‌ها و stateهای اصلی شما بدون تغییر ---
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

  // +++ راه‌اندازی React Hook Form برای مدیریت فرم ویرایش +++
  const { control, register, handleSubmit, reset, formState } =
    useForm<RequestFormData>({
      resolver: zodResolver(createRequestSchema.partial()), // استفاده از partial برای آپدیت
    });

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const data = await getById(id);
      console.log("fetchRequestDetail data :", data);
      if (data != undefined) setRequest(data); // state برای نمایش اطلاعات در DetailWrapper آپدیت می‌شود

      // ++ راه‌حل نهایی: ساخت یک آبجکت تمیز فقط با فیلدهای مورد نیاز فرم ++
      if (data != undefined) {
        const formValues = {
          // todo:t3 نیاز به اصلاح دارد خیلی مهمه
          // userId: data.userId,
          description: data.description,
          // تبدیل null به undefined برای جلوگیری از خطا
          serviceTypeId: data.serviceTypeId ?? undefined,
          statusId: data.statusId ?? undefined,
          address: data.address ?? undefined,
          formSubmissionid: data.formSubmissionid ?? undefined,

          // تبدیل آبجکت Date به رشته متنی برای ورودی‌های تاریخ و زمان
          preferredDate: data.preferredDate
            ? new Date(data.preferredDate).toISOString().split("T")[0]
            : undefined,
          preferredTime: data.preferredTime
            ? new Date(data.preferredTime)
                .toISOString()
                .split("T")[1]
                .substring(0, 5)
            : undefined,

          // تبدیل ساختار خدمات به ساختاری که فرم انتظار دارد
          actualServices:
            data.actualServices?.map((item) => ({
              actualServiceId: item.actualServiceId,
              quantity: item.quantity,
              price: item.price,
            })) || [],
        };
        console.log("fetchRequestDetail formValues :", formValues);
        reset(formValues); // فرم با مقادیر صحیح و تمیز پر می‌شود
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  // تابع برای ارسال تغییرات به سرور
  const onSaveChanges = async (data: RequestFormData) => {
    try {
      console.log("data in onSaveChanges", data);
      await update(id, data);

      fetchRequestDetails();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // --- بقیه توابع شما بدون تغییر باقی می‌مانند ---
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

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  const excludeFields = [
    "id",
    "createdAt",
    "updatedAt",
    "notes",
    "userId",
    "notifications",
    "actualServices",
  ];
  if (!isAdmin) excludeFields.push("user");

  return (
    <div>
      {showStatusForm && (
        <Card className="mb-6">
          <RequestStatusForm
            requestId={id}
            currentStatus={request.status?.id}
            onSuccess={handleStatusUpdateSuccess}
          />
        </Card>
      )}
      {/* کل کامپوننت را در یک فرم قرار می‌دهیم تا دکمه ذخیره کار کند */}
      <form onSubmit={handleSubmit(onSaveChanges)}>
        {/* DetailWrapper شما بدون تغییر باقی می‌ماند */}
        <DetailWrapper
          data={request}
          title="جزئیات درخواست"
          excludeFields={excludeFields}
          actionButtons={getActionButtons()}
          loading={loading}
          // todo:t3 نیاز به اصلاح دارد خیلی مهمه
          // headerContent={
          //   request.user && (
          //     <ReminderButton requestId={id} userId={request.user.id} />
          //   )
          // }
          error={error}
          success={success}
          customRenderers={customRenderers}
        />

        {/* کامپوننت جدید و زیبای مدیریت خدمات */}
        <div>
          <Card className="mb-6">
            {isAdmin && (
              <RequestServicesManager
                control={control}
                register={register}
                formState={formState}
              />
            )}

            {/* دکمه ذخیره تغییرات */}
            {isAdmin && (
              <div className="flex flex-row-reverse m-4 justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={formState.isSubmitting}
                  loading={formState.isSubmitting}
                  icon={<DIcon icon="fa-save" cdi={false} classCustom="ml-2" />}
                >
                  ذخیره تغییرات
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* تایم‌لاین شما بدون تغییر */}
        {request.notifications && request.notifications.length > 0 && (
          <div className="my-6">
            <h2 className="text-xl font-semibold mb-4 py-2">گزارش وضعیت</h2>
            <div className="grid gap-2 py-2">
              {request.notifications.map((note) => (
                <div key={note.id}>{listItemRender2(note)}</div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
