import DIcon from "@/@Client/Components/common/DIcon";

interface Step {
  id: number;
  title: string;
  icon: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "انتخاب خدمت",
    icon: "fa-list-check",
    description: "نوع خدمت مورد نیاز خود را انتخاب کنید",
  },
  {
    id: 2,
    title: "ثبت اطلاعات",
    icon: "fa-pen-to-square",
    description: "مشخصات و توضیحات درخواست را وارد کنید",
  },
  {
    id: 3,
    title: "تایید و ثبت",
    icon: "fa-check-circle",
    description: "درخواست خود را بررسی و نهایی کنید",
  },
];

interface RequestStepsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function RequestSteps({ currentStep }: RequestStepsProps) {
  return (
    <div className="mb-2">
      <div className="">
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-center ${
                currentStep === step.id ? "text-primary" : "text-gray-500"
              }`}
            >
              <div
                className={` rounded-full p-4 ${
                  currentStep >= step.id
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <DIcon icon={step.icon} cdi={false} classCustom="text-xl" />
              </div>
              {/* <h3 className="font-bold">{step.title}</h3> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
