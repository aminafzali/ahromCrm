import DIcon from "@/@Client/Components/common/DIcon";
import { getLabelByValue } from "@/modules/fields/data/labels";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Field as FormField } from "@prisma/client";
import { Button } from "ndui-ahrom";
import { useState } from "react";
import SelectField from "./SelectField";

interface FormBuilderProps {
  initialFields: FormField[];
  onSave: (fields: FormField[]) => void;
}

const SortableItem = ({
  field,
  removeField,
}: {
  field: FormField;
  removeField: (id) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex justify-between items-center p-2 border border-gray-400 rounded-md cursor-move transition-all hover:border-primary"
    >
      <div {...attributes} {...listeners} className="cursor-grab p-2">
        <DIcon icon="fa-bars" cdi={false} classCustom="text-gray-500" />
      </div>
      <div className="w-full">
        <h4 className="font-semibold">{field.label}</h4>
        <div className="flex gap-2 text-sm text-gray-500">
          <span>{getLabelByValue(field.type)}</span>
          {field.required && <span className="text-error">*</span>}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeField(field.id)}
        className="transition-transform hover:scale-110"
        icon={<DIcon icon="fa-times" cdi={false} classCustom="text-error" />}
      />
    </div>
  );
};

export default function FormBuilder({
  initialFields = [],
  onSave,
}: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields);

  const addFields = (selectedItems: any[]) => {
    const newFields = selectedItems
      .filter((item) => !fields.some(({ name }) => name === item.name))
      .map((item) => {
        const uniqueId = Math.random().toString(36).substr(2, 9);
        return {
          ...item,
        };
      });

    if (newFields.length > 0) {
      setFields((prevFields) => [...prevFields, ...newFields]);
    }
  };

  const removeField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleSave = () => {
    // Update order based on current position
    const updatedFields = fields.map((field, index) => ({
      ...field,
      order: index,
    }));
    onSave(updatedFields);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      setFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">فیلدهای فرم</h3>
          {fields.length > 0 && (
            <Button onClick={handleSave} variant="primary">
              ذخیره فرم
            </Button>
          )}
        </div>

        <div className="min-h-[200px]">
          {fields.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <DIcon
                icon="fa-plus-circle"
                cdi={false}
                classCustom="text-4xl mb-2"
              />
              <p>برای شروع، فیلدهای مورد نظر را اضافه کنید</p>
            </div>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {fields.map((field, index) => (
                    <SortableItem
                      key={index}
                      field={field}
                      removeField={removeField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="mt-4">
          <SelectField onSelect={addFields} />
        </div>
      </div>

      {fields.length > 0 && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">پیش‌نمایش فرم</h3>
        </div>
      )}
    </div>
  );
}
