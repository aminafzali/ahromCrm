import DIcon from "@/@Client/Components/common/DIcon";

export const dashboardMenuItems = [
  {
    id: "dashboard",
    label: "داشبورد",
    icon: <DIcon icon="fa-grid" cdi={false}></DIcon>,
    href: "/dashboard",
  },
  {
    id: "adminDivider",
    label: "کاربران",
    divider: true,
    href: "/adminDivider",
  },
  {
    id: "user",
    label: "مخاطبین",
    icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
    href: "/dashboard/users",
  },
  {
    id: "userGroups",
    label: "گروه‌های کاربری",
    icon: <DIcon icon="fa-users" cdi={false}></DIcon>,
    href: "/dashboard/user-groups",
  },
  {
    id: "labels",
    label: "برچسب‌ها",
    icon: <DIcon icon="fa-tags" cdi={false}></DIcon>,
    href: "/dashboard/labels",
  },
  {
    id: "settingDivider",
    label: "مدیریت",
    divider: true,
    href: "/settingDivider",
  },
  {
    id: "hand",
    label: "درخواست‌ها",
    icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
    href: "/dashboard/requests",
  },
  {
    id: "service-types",
    label: "خدمات",
    icon: <DIcon icon="fa-wrench" cdi={false}></DIcon>,
    children: [
      {
        id: "settings",
        label: "وضعیت ها",
        icon: <DIcon icon="fa-octagon-check" cdi={false}></DIcon>,
        href: "/dashboard/statuses",
      },
      {
        id: "service-types",
        label: "خدمات",
        icon: <DIcon icon="fa-screwdriver-wrench" cdi={false}></DIcon>,
        href: "/dashboard/service-types",
      },
    ],
  },
  {
    id: "p",
    label: "فروشگاه",

    icon: <DIcon icon="fa-shop" cdi={false}></DIcon>,
    children: [
      {
        id: "categories",
        label: "دسته بندی ها",
        icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
        href: "/dashboard/categories",
      },
      {
        id: "products",
        label: "محصولات",
        icon: <DIcon icon="fa-box" cdi={false}></DIcon>,
        href: "/dashboard/products",
      },
      {
        id: "brands",
        label: "برند",
        icon: <DIcon icon="fa-copyright" cdi={false}></DIcon>,
        href: "/dashboard/brands",
      },
    ],
  },
  {
    id: "f",
    label: "فرم",

    icon: <DIcon icon="fa-rectangle-list" cdi={false}></DIcon>,
    children: [
      {
        id: "forms",
        label: "فرم  ها",
        icon: <DIcon icon="fa-rectangle-list" cdi={false}></DIcon>,
        href: "/dashboard/forms",
      },
      {
        id: "formFileds",
        label: "فیلد ها ",
        icon: <DIcon icon="fa-input-numeric" cdi={false}></DIcon>,
        href: "/dashboard/fields",
      },
    ],
  },
  {
    id: "fi",
    label: "مالی",

    icon: <DIcon icon="fa-coins" cdi={false}></DIcon>,
    children: [
      {
        id: "invoice",
        label: "فاکتور",
        icon: <DIcon icon="fa-file-lines" cdi={false}></DIcon>,
        href: "/dashboard/invoices",
      },
      {
        id: "receive",
        label: "دریافتی و پرداخت ",
        icon: <DIcon icon="fa-inbox-in" cdi={false}></DIcon>,
        href: "/dashboard/payments",
      },
    ],
  },
];

export const dashboardBottomItems = [
  {
    id: "user",
    value: "user",
    label: "مخاطبین",
    icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
    href: "/dashboard/users",
  },
  {
    id: "hand",
    value: "hand",
    label: "درخواست‌ها",
    icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
    href: "/dashboard/requests",
  },
  {
    id: "settings",
    value: "settings",
    label: "وضعیت ها",
    icon: <DIcon icon="fa-octagon-check" cdi={false}></DIcon>,
    href: "/dashboard/statuses",
  },
  {
    id: "service-types",
    value: "service-types",
    label: "خدمات",
    icon: <DIcon icon="fa-gears" cdi={false}></DIcon>,
    href: "/dashboard/service-types",
  },
];

export const userMenuItems = [
  {
    id: "user-dashboard",
    label: "داشبورد",
    icon: <DIcon icon="fa-grid" cdi={false}></DIcon>,
    href: "/panel",
  },
  {
    id: "hand",
    label: "درخواست‌ها",
    icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
    href: "/panel/requests",
  },
  {
    id: "notifications",
    label: "اعلان ها",
    icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
    href: "/panel/notifications",
  },
  {
    id: "notifications",
    label: "فاکتور ها",
    icon: <DIcon icon="fa-file-lines" cdi={false}></DIcon>,
    href: "/panel/invoices",
  },
  {
    id: "profile",
    label: "پروفایل",
    icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
    href: "/panel/profile",
  },
];

export const userBottomItems = [
  {
    id: "panel",
    value: "panel",
    label: "داشبورد",
    icon: <DIcon icon="fa-grid" cdi={false}></DIcon>,
    href: "/panel",
  },
  {
    id: "hand",
    value: "hand",
    label: "درخواست‌ها",
    icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
    href: "/panel/requests",
  },
  {
    id: "notifications",
    value: "notifications",
    label: "اعلان ها",
    icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
    href: "/panel/notifications",
  },
  {
    id: "profile",
    value: "profile",
    label: "پروفایل",
    icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
    href: "/panel/profile",
  },
];
