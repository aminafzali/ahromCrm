import Loading from "@/@Client/Components/common/Loading";
import { DetailWrapper } from "@/@Client/Components/wrappers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormRenderer from "../../components/FormRenderer";
import { useForm } from "../../hooks/useForm";

interface FormDetailsViewProps {
  id: number;
}

export default function DetailPage({ id }: FormDetailsViewProps) {
  const { getById, loading, error, success } = useForm();
  const [form, setForm] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFormDetails();
  }, []);

  const fetchFormDetails = async () => {
    try {
      const data = await getById(id);
      setForm(data);
    } catch (error) {
      console.error("Error fetching form details:", error);
    }
  };

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form submission:", data);
  };
  const advance = () => {
    router.push(`/dashboard/forms/${id}/advance`);
  };

  const customRenderers = {
    fields: (fields: any[]) => (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-4">پیش‌نمایش فرم</h3>
        <FormRenderer
          fields={fields.map((item) => ({
            ...item.field,
          }))}
          onSubmit={handleSubmit}
        />
      </div>
    ),
  };

  const header = <div className="flex border"></div>;

  if (loading) return <Loading />;

  return (
    <DetailWrapper
      data={form}
      actionButtons={[
        {
          label: "فرم ساز",
          variant: "accent",
          onClick() {
            advance();
          },
        },
        { label: "پیش نمایش", variant: "ghost" },
      ]}
      title="جزئیات فرم"
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      editUrl={`/dashboard/forms/${id}/update`}
      showDefaultActions
    />
  );
}
