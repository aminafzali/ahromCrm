import { useForm } from "@/modules/forms/hooks/useForm";
import { Button, Modal } from "ndui-ahrom";
import { useState } from "react";
import DIcon from "@/@Client/Components/common/DIcon";
import FormRenderer from "@/modules/forms/components/FormRenderer";

interface FormSelectorProps {
  requestId: number;
  onSubmit: (formData: any) => void;
}

export default function FormSelector({ requestId, onSubmit }: FormSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const { getAll, loading } = useForm();
  const [forms, setForms] = useState<any[]>([]);

  const handleOpenModal = async () => {
    try {
      const response = await getAll();
      setForms(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const handleFormSelect = (form: any) => {
    setSelectedForm(form);
  };

  const handleFormSubmit = (data: any) => {
    onSubmit({
      formId: selectedForm.id,
      data,
    });
    setIsModalOpen(false);
    setSelectedForm(null);
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        icon={<DIcon icon="fa-file-lines" cdi={false} classCustom="ml-2" />}
      >
        افزودن فرم
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="2xl">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">انتخاب و تکمیل فرم</h2>

          {!selectedForm ? (
            <div className="grid gap-4">
              {forms.map((form) => (
                <button
                  key={form.id}
                  className="p-4 border rounded-lg hover:border-primary transition-colors text-right"
                  onClick={() => handleFormSelect(form)}
                >
                  <h3 className="font-semibold">{form.name}</h3>
                  {form.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {form.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <Button
                variant="ghost"
                onClick={() => setSelectedForm(null)}
                className="mb-4"
                icon={
                  <DIcon
                    icon="fa-arrow-right"
                    cdi={false}
                    classCustom="ml-2"
                  />
                }
              >
                بازگشت به لیست
              </Button>

              <FormRenderer
                fields={selectedForm.fields.map((f: any) => f.field)}
                onSubmit={handleFormSubmit}
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}