import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Menu } from "ndui-ahrom";
import { signOut } from "next-auth/react";

const items = [
  {
    label: "پروفایل",
    icon: <DIcon icon="fa-user" cdi={false} classCustom="text-lg" />,
    href: "/dashboard/profile",
  },
  {
    label: "مشاهده وبسایت",
    icon: <DIcon icon="fa-globe" cdi={false} classCustom="text-lg" />,
    href: "/",
  },
  { label: "SettingsDivider", divider: true },
  {
    label: "تنظیمات",
    href: "/dashboard/settings",
    icon: <DIcon icon="fa-gear" cdi={false} classCustom="text-lg" />,
  },
  {
    label: "خروج",
    icon: (
      <DIcon
        icon="fa-left-from-bracket"
        cdi={false}
        classCustom="text-lg text-error"
      />
    ),
    onClick: () => signOut({ callbackUrl: "/" }),
  },
];

// کامپوننت اصلی
const MainMenu = () => {
  return (
    <Menu
      trigger={
        <Button size="sm" variant="ghost">
          {" "}
          <DIcon
            icon="fa-ellipsis-stroke-vertical"
            cdi={false}
            classCustom="text-gray-700 text-xl"
          />
        </Button>
      }
      items={items}
    />
  );
};

export default MainMenu;
