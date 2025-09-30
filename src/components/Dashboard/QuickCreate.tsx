import DIcon from "@/@Client/Components/common/DIcon";
import CreateCategoryPage from "@/modules/categories/views/create/page";
import CreateLabelPage from "@/modules/labels/views/create/page";
import CreateProductPage from "@/modules/products/views/create/page";
import CreateServiceTypePage from "@/modules/service-types/views/create/page";
import CreateUserGroupPage from "@/modules/user-groups/views/create/page";
import CreateUserPage from "@/modules/users/views/create/page";
import { Button, Menu, Modal } from "ndui-ahrom";
import React, { useState } from "react";

// هوک مدیریت مودال
const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const ModalComponent = () => (
    <Modal size="2xl" isOpen={isOpen} onClose={closeModal}>
      <div className="p-4">{modalContent}</div>
    </Modal>
  );

  return { openModal, closeModal, ModalComponent };
};

// کامپوننت اصلی
const QuickCreate = () => {
  const { openModal, ModalComponent, closeModal } = useModal();

  // داده‌های دکمه‌ها
  const itemsCreate = [
    {
      label: "افزودن مخاطب",
      icon: <DIcon icon="fa-user" cdi={false} classCustom="text-lg" />,
      onClick: () =>
        openModal(<CreateUserPage back={false} after={closeModal} />),
    },
    {
      label: "افزودن گروه کاربری",
      icon: <DIcon icon="fa-users" cdi={false} classCustom="text-lg" />,
      onClick: () =>
        openModal(<CreateUserGroupPage back={false} after={closeModal} />),
    },
    {
      label: "افزودن برچسب",
      icon: <DIcon icon="fa-tag" cdi={false} classCustom="text-lg" />,
      onClick: () =>
        openModal(<CreateLabelPage back={false} after={closeModal} />),
    },

    { label: "SettingsDivider", divider: true },
    {
      label: "افزودن خدمت",
      icon: (
        <DIcon icon="fa-screwdriver-wrench" cdi={false} classCustom="text-lg" />
      ),
      onClick: () =>
        openModal(<CreateServiceTypePage back={false} after={closeModal} />),
    },
    {
      label: "افزودن دسته بندی",
      icon: <DIcon icon="fa-code-branch" cdi={false} classCustom="text-lg" />,
      onClick: () =>
        openModal(<CreateCategoryPage back={false} after={closeModal} />),
    },
    {
      label: "افزودن محصول",
      icon: <DIcon icon="fa-box" cdi={false} classCustom="text-lg" />,
      onClick: () =>
        openModal(<CreateProductPage back={false} after={closeModal} />),
    },
  ];

  return (
    <div className="flex space-x-4">
      <Menu
        trigger={
          <Button size="sm" variant="ghost" className="font-light">
            {"سریع بساز"}
            <DIcon
              icon="fa-grid-round-2-plus"
              cdi={false}
              classCustom="text-gray-700 text-xl"
            />
          </Button>
        }
        items={itemsCreate}
      />

      <ModalComponent />
    </div>
  );
};

export default QuickCreate;
