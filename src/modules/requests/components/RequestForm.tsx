"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useStatus } from "@/modules/statuses/hooks/useStatus";
import { Button, Form, Input } from "ndui-ahrom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useRequest } from "../hooks/useRequest";
import AuthenticationStep from "./AuthenticationStep";
import RequestSteps from "./RequestSteps";
import RequestStepsAdmin from "./RequestStepsAdmin";
import ServiceSelection from "./ServiceSelection";
import UserSelection from "./UserSelection";

const schema = z.object({
  serviceTypeId: z.number().min(1, "نوع خدمات را انتخاب کنید"),
  description: z.string().min(10, "توضیحات باید حداقل 10 کاراکتر باشد"),
  address: z.string().optional(),
});

export default function RequestForm({
  params,
}: {
  params: { isAdmin: boolean };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { getAll: getAllStatuses } = useStatus();

  const {
    create,
    submitting: loading,
    error,
    success,
    setError,
  } = useRequest();
  const [currentStep, setCurrentStep] = useState(
    session?.user.role === "ADMIN" ? 0 : 1
  );
  const [formData, setFormData] = useState({
    serviceTypeId: 0,
    description: "",
    address: "",
    userId: session?.user.role === "USER" ? session?.user?.id : undefined,
    statusId: 0,
  });

  useEffect(() => {
    if (session?.user.role === "USER") {
      setFormData((prev) => ({ ...prev, userId: session?.user.id }));
    }
  }, [session]);

  if (status === "loading") return <Loading />;

  const handleNextStep = async () => {
    if (currentStep === 2) {
      const validation = schema.safeParse(formData);
      if (!validation.success) {
        setError("توضیحات باید حداقل 10 کاراکتر باشد");
        return;
      }
    }

    if (currentStep === 1) {
      // Get initial status
      const statuses = await getAllStatuses({
        orderBy: "id",
        orderDirection: "asc",
        page: 1,
        limit: 1,
      });
      const initialStatus = statuses.data[0];
      if (initialStatus) {
        setFormData((prev) => ({ ...prev, statusId: initialStatus.id }));
      }
    }

    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handleServiceSelect = (serviceTypeId: number) => {
    setFormData({ ...formData, serviceTypeId });
  };

  const handleUserSelect = (userId: number) => {
    setFormData((prev) => ({ ...prev, userId }));
  };

  const handleSubmit = async (data: any) => {
    try {
      if (session) {
        if (session?.user.role === "USER") {
          formData.userId = session?.user?.id;
        }
      }

      // If user is not authenticated and not admin, store form data and show auth step
      if (!session) {
        sessionStorage.setItem("pendingRequest", JSON.stringify(data));
        setCurrentStep(4); // Show authentication step
        return;
      }

      // Add userId to request data
      const requestData = {
        ...data,
        userId: formData.userId || session?.user?.id,
        serviceTypeId: formData.serviceTypeId,
        statusId: formData.statusId,
      };

      const res: any = await create(requestData);
      if (session?.user.role === "ADMIN")
        router.push(`/dashboard/requests/${res?.data.id}`);
      else router.push(`/panel/requests/${res?.data.id}`);
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  const handleAuthenticationSuccess = async (userId: number) => {
    try {
      // Get stored form data
      const storedData = sessionStorage.getItem("pendingRequest");
      if (!storedData) return;

      const requestData = {
        ...JSON.parse(storedData),
        userId,
        serviceTypeId: formData.serviceTypeId,
        statusId: formData.statusId,
      };

      const res: any = await create(requestData);
      router.push(`/panel/requests/${res?.data.id}`);
      sessionStorage.removeItem("pendingRequest");
    } catch (error) {
      console.error("Error submitting request after authentication:", error);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={loading || !formData.userId}
              icon={
                <DIcon icon="fa-arrow-left" cdi={false} classCustom="ml-2" />
              }
            >
              {loading ? "در حال ثبت..." : "مرحله بعد"}
            </Button>
          </div>
          <UserSelection onSelect={handleUserSelect} />
        </div>
      );
    }
    if (currentStep === 4) {
      return <AuthenticationStep onSuccess={handleAuthenticationSuccess} />;
    }
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            onSelect={handleServiceSelect}
            selectedService={formData.serviceTypeId}
          />
        );
      case 2:
        return (
          <Form
            schema={schema}
            onSubmit={handleSubmit}
            defaultValues={formData}
          >
            <div className="space-y-4">
              <Input
                name="description"
                className="bg-white"
                label="توضیحات"
                placeholder="مشکل دستگاه را شرح دهید"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Input
                name="address"
                label="آدرس"
                placeholder="آدرس دقیق خود را وارد کنید"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </Form>
        );
      case 3:
        return (
          <div className="">
            <div className="flex justify-between gap-4 my-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
                icon={
                  <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
                }
              >
                بازگشت
              </Button>
              <Button
                onClick={() => handleSubmit(formData)}
                disabled={loading}
                icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
              >
                {loading ? "در حال ثبت..." : "ثبت نهایی"}
              </Button>
            </div>
            <div>
              <div className="p-6 bg-white rounded-lg">
                <h3 className="text-xl font-bold mb-4">خلاصه درخواست</h3>
                <div className="space-y-4">
                  <div>
                    <strong>نوع خدمات:</strong> {formData.serviceTypeId}
                  </div>
                  <div>
                    <strong>توضیحات:</strong>
                    <div className="mt-2">{formData.description}</div>
                  </div>
                  <div>
                    <strong>آدرس:</strong> {formData.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-2 max-w-lg mx-auto">
      {session?.user.role === "ADMIN" ? (
        <RequestStepsAdmin
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      ) : (
        <RequestSteps currentStep={currentStep} onStepChange={setCurrentStep} />
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {currentStep < 3 && currentStep > 0 && (
        <div className="flex justify-between my-4">
          {(session?.user.role === "ADMIN" || currentStep > 1) && (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="mr-4"
              icon={
                <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
              }
            >
              بازگشت
            </Button>
          )}
          <Button
            onClick={() => handleNextStep()}
            disabled={currentStep === 1 && !formData.serviceTypeId}
            icon={<DIcon icon="fa-arrow-left" cdi={false} classCustom="ml-2" />}
          >
            مرحله بعد
          </Button>
        </div>
      )}

      <div>
        <div className="p-1">{renderStepContent()}</div>
      </div>
    </div>
  );
}
