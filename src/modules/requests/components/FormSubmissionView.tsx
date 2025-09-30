import { Card } from "ndui-ahrom";

interface FormSubmissionViewProps {
  formSubmission: any;
}

export default function FormSubmissionView({
  formSubmission,
}: FormSubmissionViewProps) {
  if (!formSubmission) return null;

  return (
    <Card className="mt-6">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">اطلاعات فرم</h2>
        <div className="grid gap-4">
          {Object.entries(formSubmission.data).map(([key, value]) => (
            <div key={key} className="border-b pb-2">
              <div className="font-semibold text-gray-600">{key}</div>
              <div className="mt-1">{value as string}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}