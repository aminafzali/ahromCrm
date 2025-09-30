import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { Button, Modal } from "ndui-ahrom";
import React, { useState } from "react";
import { columnsForAdmin } from "../../device-types/data/table";
import { DeviceTypeRepository } from "../../device-types/repo/DeviceTypeRepository";

interface SelectDeviceTypeProps {
  onSelect: (selectedItems: any) => void;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
  value?: any;
}

const SelectDeviceType2: React.FC<SelectDeviceTypeProps> = ({
  onSelect,
  buttonProps,
  value,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const datab = useDeviceType();

  const [selectedItems, setSelectedItems] = useState<any | null>(value || null);

  const handleSelect = (selectedItems: any[]) => {
    setSelectedItems(selectedItems[0]);
    onSelect(selectedItems[0]);
    setIsModalOpen(false); // Close modal after selection
  };

  const handleRemoveItem = () => {
    // setValue(name, null);
    onSelect(null);
    setSelectedItems(null);
  };
  // آیکون حذف آیتم
  const RemoveIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  );

  return (
    <div>
      {/* <ButtonSelectWithTable
        columns={columnsForAdmin}
        data={[]}
        onSelect={handleSelect}
        name={""}
        selectionMode="single"
      ></ButtonSelectWithTable> */}
      <h2 className="m-2">نوع دستگاه</h2>
      <Button
        variant="ghost"
        className="w-full justify-between bg-white !border-[1px] !border-gray-400 text-gray-950 hover:!bg-gray-200"
        {...buttonProps}
        onClick={() => setIsModalOpen(true)}
      >
        {selectedItems ? (
          <div className="flex flex-wrap gap-2 mt-2 text-gray-950">
            <span>{selectedItems.name}</span>
          </div>
        ) : (
          "انتخاب کنید"
        )}
      </Button>

      {selectedItems && (
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="bg-base-200 px-2 py-1 rounded-lg flex items-center gap-2">
            <span>{selectedItems.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveItem();
              }}
              type="button"
              className="text-error"
            >
              <RemoveIcon />
            </button>
          </div>
        </div>
      )}
      {isModalOpen && (
        <Modal
          size="2xl"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          {isModalOpen && (
            <IndexWrapper
              columns={columnsForAdmin}
              repo={new DeviceTypeRepository()}
              selectionMode="single"
              onSelect={handleSelect} // Call both onSelect and closeModal
              createUrl={false}
              showIconViews={false}
              defaultViewMode="table"
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default SelectDeviceType2;
