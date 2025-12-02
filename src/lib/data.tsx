// مسیر فایل: src/lib/data.tsx

import DIcon from "@/@Client/Components/common/DIcon";

export const dashboardMenuItems = [
  {
    id: "notifications",
    value: "notifications",
    label: "اعلان ها",
    icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
    href: "/dashboard/notifications",
  },
  {
    id: "chatbot",
    value: "chatbot",
    label: "دستیار مدیریت کاربران",
    icon: <DIcon icon="fa-robot" cdi={false}></DIcon>,
    href: "/dashboard/chatbot",
  },
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
    id: "workspace-users",
    label: "مخاطبین",
    icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
    href: "/dashboard/workspace-users",
  },

  // {
  //   id: "user",
  //   label: "مخاطبین",
  //   icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
  //   href: "/dashboard/users",
  // },
  {
    id: "userGroups",
    label: "گروه‌های کاربری",
    icon: <DIcon icon="fa-users" cdi={false}></DIcon>,
    children: [
      {
        id: "user-groups",
        label: "گروه‌ها",
        icon: <DIcon icon="fa-users" cdi={false}></DIcon>,
        href: "/dashboard/user-groups",
      },
      {
        id: "teams",
        label: "تیم ها",
        icon: <DIcon icon="fa-people-group" cdi={false}></DIcon>,
        href: "/dashboard/teams",
      },
    ],
  },
  {
    id: "labels",
    label: "برچسب‌ها",
    icon: <DIcon icon="fa-tags" cdi={false}></DIcon>,
    href: "/dashboard/labels",
  },
  {
    id: "mkh",
    label: "مدیریت خدمات",
    divider: true,
    href: "/mkh",
  },
  {
    id: "hand",
    label: "درخواست‌ها",
    icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
    href: "/dashboard/requests",
  },
  // 2. خدمات و زیرمجموعه‌هایش
  {
    id: "settings",
    label: "وضعیت ها",
    icon: <DIcon icon="fa-octagon-check" cdi={false}></DIcon>,
    href: "/dashboard/statuses",
  },
  {
    id: "service-types",
    label: "دسته بندی خدمات",
    icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
    href: "/dashboard/service-types",
  },
  // +++ آیتم جدید در اینجا اضافه شده است +++
  {
    id: "actual-services",
    label: "خدمات",
    icon: <DIcon icon="fa-wrench" cdi={false}></DIcon>,
    href: "/dashboard/actual-services",
  },
  // 3. انواع دستگاه (آیتم جدید)
  {
    id: "service-types-group", // شناسه برای جلوگیری از تداخل
    label: "مدیریت دریافتی ها",
    icon: <DIcon icon="fa-dolly" cdi={false}></DIcon>,
    children: [
      {
        id: "device-types",
        label: "دسته بندی دستگاه",
        icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
        href: "/dashboard/device-types",
      },
      {
        id: "received-devices",
        label: "دستگاه‌های دریافتی",
        icon: <DIcon icon="fa-dolly" cdi={false}></DIcon>,
        href: "/dashboard/received-devices",
      },
    ],
  },

  {
    id: "settingDivider",
    label: "فروشگاه و موجودی",
    divider: true,
    href: "/settingDivider",
  },
  {
    id: "categories",
    label: "دسته بندی محصولات",
    icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
    href: "/dashboard/categories",
  },
  {
    id: "brands",
    label: "برند",
    icon: <DIcon icon="fa-copyright" cdi={false}></DIcon>,
    href: "/dashboard/brands",
  },
  {
    id: "products",
    label: "محصولات",
    icon: <DIcon icon="fa-box" cdi={false}></DIcon>,
    href: "/dashboard/products",
  },
  {
    id: "warehouse-management",
    label: "مدیریت انبار",
    icon: <DIcon icon="fa-boxes-stacked" cdi={false}></DIcon>,
    children: [
      {
        id: "warehouses",
        label: "انبارها",
        icon: <DIcon icon="fa-warehouse" cdi={false}></DIcon>,
        href: "/dashboard/warehouses",
      },
      {
        id: "inventory",
        label: "مدیریت موجودی",
        icon: <DIcon icon="fa-cubes" cdi={false}></DIcon>,
        href: "/dashboard/inventory",
      },
      {
        id: "stock-transfers",
        label: "انتقال موجودی",
        icon: <DIcon icon="fa-arrows-left-right" cdi={false}></DIcon>,
        href: "/dashboard/stock-transfers",
      },
      {
        id: "stock-movements",
        label: "تاریخچه تغییرات موجودی",
        icon: <DIcon icon="fa-clock-rotate-left" cdi={false}></DIcon>,
        href: "/dashboard/stock-movements",
      },
    ],
  },
  {
    id: "purchase-orders",
    label: "سفارشات خرید",
    icon: <DIcon icon="fa-shopping-cart" cdi={false}></DIcon>,
    href: "/dashboard/purchase-orders",
  },
  {
    id: "sales-divider",
    label: "فروش و سفارشات",
    divider: true,
    href: "/sales-divider",
  },
  {
    id: "orders",
    label: "سفارشات مشتریان",
    icon: <DIcon icon="fa-shopping-bag" cdi={false}></DIcon>,
    href: "/dashboard/orders",
  },
  {
    id: "pos",
    label: "فروش حضوری (POS)",
    icon: <DIcon icon="fa-cash-register" cdi={false}></DIcon>,
    href: "/dashboard/pos",
  },
  {
    id: "shop-settings",
    label: "تنظیمات فروشگاه",
    icon: <DIcon icon="fa-cog" cdi={false}></DIcon>,
    children: [
      {
        id: "shipping-methods",
        label: "روش‌های ارسال",
        icon: <DIcon icon="fa-truck" cdi={false}></DIcon>,
        href: "/dashboard/settings/shipping-methods",
      },
      {
        id: "payment-gateways",
        label: "درگاه‌های پرداخت",
        icon: <DIcon icon="fa-credit-card" cdi={false}></DIcon>,
        href: "/dashboard/settings/payment-gateways",
      },
      {
        id: "shipping-zones",
        label: "مناطق ارسال",
        icon: <DIcon icon="fa-map-location-dot" cdi={false}></DIcon>,
        href: "/dashboard/settings/shipping-zones",
      },
    ],
  },
  {
    id: "mali",
    label: "مالی",
    divider: true,
    href: "/mali",
  },
  {
    id: "invoice",
    label: "فاکتور",
    icon: <DIcon icon="fa-file-lines" cdi={false}></DIcon>,
    href: "/dashboard/invoices",
  },
  {
    id: "payment-categories",
    label: "دسته بندی تراکنش ها",
    icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
    href: "/dashboard/payment-categories",
  },
  {
    id: "receive",
    label: "دریافتی و پرداخت ",
    icon: <DIcon icon="fa-inbox-in" cdi={false}></DIcon>,
    href: "/dashboard/payments",
  },

  {
    id: "activity",
    label: "ارتباطات",
    divider: true,
    href: "/activity",
  },
  {
    id: "internal-chat",
    label: "چت درون سازمانی",
    icon: <DIcon icon="fa-comments" cdi={false}></DIcon>,
    href: "/dashboard/internal-chat",
  },
  {
    id: "reminders",
    label: "یادآوری ها",
    icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
    href: "/dashboard/reminders",
  },
  // برای فعالیت هاو در ابتدا یادآور نوشته شد
  {
    id: "project-management",
    label: "مدیریت پروژه",
    icon: <DIcon icon="fa-diagram-project" cdi={false}></DIcon>,
    children: [
      {
        id: "pm-statuses",
        label: "وضعیت ها",
        icon: <DIcon icon="fa-list-check" cdi={false}></DIcon>,
        href: "/dashboard/pm-statuses",
      },
      {
        id: "projects",
        label: "پروژه ها",
        icon: <DIcon icon="fa-diagram-project" cdi={false}></DIcon>,
        href: "/dashboard/projects",
      },
      {
        id: "tasks",
        label: "وظایف",
        icon: <DIcon icon="fa-list-timeline" cdi={false}></DIcon>,
        href: "/dashboard/tasks",
      },
    ],
  },
  {
    id: "chat-group",
    label: "فعالیت ها",
    icon: <DIcon icon="fa-headset" cdi={false}></DIcon>,
    children: [
      {
        id: "activities",
        label: "فعالیت ها",
        icon: <DIcon icon="fa-list-timeline" cdi={false}></DIcon>,
        href: "/dashboard/activities",
      },
      {
        id: "activity-categories",
        label: "دسته بندی فعالیت",
        icon: <DIcon icon="fa-list-check" cdi={false}></DIcon>,
        href: "/dashboard/activity-categories",
      },
    ],
  },
  {
    id: "information",
    label: "اطلاعات",
    divider: true,
    href: "/information",
  },
  {
    id: "knowledge-group",
    label: "پایگاه دانش",
    icon: <DIcon icon="fa-book" cdi={false}></DIcon>,
    children: [
      {
        id: "knowledge",
        label: "دانش‌نامه",
        icon: <DIcon icon="fa-book-open" cdi={false}></DIcon>,
        href: "/dashboard/knowledge",
      },
      {
        id: "knowledge-categories",
        label: "دسته‌بندی دانش",
        icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
        href: "/dashboard/knowledge-categories",
      },
    ],
  },

  {
    id: "documents-group",
    label: "مدیریت اسناد",
    icon: <DIcon icon="fa-folder" cdi={false}></DIcon>,
    children: [
      {
        id: "documents",
        label: "اسناد",
        icon: <DIcon icon="fa-file" cdi={false}></DIcon>,
        href: "/dashboard/documents",
      },
      {
        id: "document-categories",
        label: "دسته‌های اسناد",
        icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
        href: "/dashboard/document-categories",
      },
    ],
  },
];

export const dashboardBottomItems = [
  {
    id: "workspace-user",
    value: "workspace-user",
    label: "مخاطبین",
    icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
    href: "/dashboard/workspace-users",
  },
  {
    id: "hand",
    value: "hand",
    label: "درخواست‌ها",
    icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
    href: "/dashboard/requests",
  },
  {
    id: "tasks",
    value: "tasks",
    label: "وظایف",
    icon: <DIcon icon="fa-octagon-check" cdi={false}></DIcon>,
    href: "/dashboard/tasks",
  },
  {
    id: "notifications",
    value: "notifications",
    label: "اعلان ها",
    icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
    href: "/dashboard/notifications",
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
    id: "user-orders",
    label: "سفارشات من",
    icon: <DIcon icon="fa-shopping-bag" cdi={false}></DIcon>,
    href: "/panel/my-orders",
  },
  {
    id: "notifications",
    label: "اعلان ها",
    icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
    href: "/panel/notifications",
  },
  {
    id: "invoices",
    label: "فاکتور ها",
    icon: <DIcon icon="fa-file-lines" cdi={false}></DIcon>,
    href: "/panel/invoices",
  },
  {
    id: "panel-support-info",
    label: "اطلاعات پشتیبانی",
    icon: <DIcon icon="fa-circle-info" cdi={false}></DIcon>,
    href: "/panel/tickets",
  },
  {
    id: "panel-knowledge",
    label: "دانش‌نامه",
    icon: <DIcon icon="fa-book-open" cdi={false}></DIcon>,
    href: "/panel/knowledge",
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

// // src/lib/data.tsx

// import DIcon from "@/@Client/Components/common/DIcon";

// export const dashboardMenuItems = [
//   {
//     id: "dashboard",
//     label: "داشبورد",
//     icon: <DIcon icon="fa-grid" cdi={false}></DIcon>,
//     href: "/dashboard",
//   },

//   {
//     id: "adminDivider",
//     label: "کاربران",
//     divider: true,
//     href: "/adminDivider",
//   },
//   {
//     id: "user",
//     label: "مخاطبین",
//     icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
//     href: "/dashboard/users",
//   },
//   {
//     id: "userGroups",
//     label: "گروه‌های کاربری",
//     icon: <DIcon icon="fa-users" cdi={false}></DIcon>,
//     href: "/dashboard/user-groups",
//   },
//   {
//     id: "labels",
//     label: "برچسب‌ها",
//     icon: <DIcon icon="fa-tags" cdi={false}></DIcon>,
//     href: "/dashboard/labels",
//   },
//   {
//     id: "mkh",
//     label: "مدیریت خدمات",
//     divider: true,
//     href: "/mkh",
//   },
//   {
//     id: "hand",
//     label: "درخواست‌ها",
//     icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
//     href: "/dashboard/requests",
//   },
//   // 2. خدمات و زیرمجموعه‌هایش (منتقل شده به اینجا)
//   {
//     id: "service-types-group", // شناسه برای جلوگیری از تداخل
//     label: "خدمات",
//     icon: <DIcon icon="fa-wrench" cdi={false}></DIcon>,
//     children: [
//       {
//         id: "settings",
//         label: "وضعیت ها",
//         icon: <DIcon icon="fa-octagon-check" cdi={false}></DIcon>,
//         href: "/dashboard/statuses",
//       },
//       {
//         id: "service-types",
//         label: "انواع خدمات",
//         icon: <DIcon icon="fa-screwdriver-wrench" cdi={false}></DIcon>,
//         href: "/dashboard/service-types",
//       },
//     ],
//   },
//   // 3. انواع دستگاه (آیتم جدید)
//   {
//     id: "device-types",
//     label: "انواع دستگاه",
//     icon: <DIcon icon="fa-tags" cdi={false}></DIcon>,
//     href: "/dashboard/device-types",
//   },
//   {
//     id: "received-devices",
//     label: "دستگاه‌های دریافتی",
//     icon: <DIcon icon="fa-dolly" cdi={false}></DIcon>,
//     href: "/dashboard/received-devices",
//   },
//   {
//     id: "settingDivider",
//     label: "فروشگاه",
//     divider: true,
//     href: "/settingDivider",
//   },
//   // آیتم‌های "درخواست‌ها" و "خدمات" از اینجا حذف شدند چون به گروه بالا منتقل شدند

//   {
//     id: "categories",
//     label: "دسته بندی ها",
//     icon: <DIcon icon="fa-code-branch" cdi={false}></DIcon>,
//     href: "/dashboard/categories",
//   },
//   {
//     id: "brands",
//     label: "برند",
//     icon: <DIcon icon="fa-copyright" cdi={false}></DIcon>,
//     href: "/dashboard/brands",
//   },
//   {
//     id: "products",
//     label: "محصولات",
//     icon: <DIcon icon="fa-box" cdi={false}></DIcon>,
//     href: "/dashboard/products",
//   },
//   // {
//   //   id: "f",
//   //   label: "فرم",
//   //   icon: <DIcon icon="fa-rectangle-list" cdi={false}></DIcon>,
//   //   children: [
//   //     {
//   //       id: "forms",
//   //       label: "فرم ‌ها",
//   //       icon: <DIcon icon="fa-rectangle-list" cdi={false}></DIcon>,
//   //       href: "/dashboard/forms",
//   //     },
//   //     {
//   //       id: "formFileds",
//   //       label: "فیلد ها ",
//   //       icon: <DIcon icon="fa-input-numeric" cdi={false}></DIcon>,
//   //       href: "/dashboard/fields",
//   //     },
//   //   ],
//   // },
//   {
//     id: "mali",
//     label: "مالی",
//     divider: true,
//     href: "/mali",
//   },
//   {
//     id: "invoice",
//     label: "فاکتور",
//     icon: <DIcon icon="fa-file-lines" cdi={false}></DIcon>,
//     href: "/dashboard/invoices",
//   },
//   {
//     id: "receive",
//     label: "دریافتی و پرداخت ",
//     icon: <DIcon icon="fa-inbox-in" cdi={false}></DIcon>,
//     href: "/dashboard/payments",
//   },
// ];

// export const dashboardBottomItems = [
//   {
//     id: "user",
//     value: "user",
//     label: "مخاطبین",
//     icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
//     href: "/dashboard/users",
//   },
//   {
//     id: "hand",
//     value: "hand",
//     label: "درخواست‌ها",
//     icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
//     href: "/dashboard/requests",
//   },
//   {
//     id: "settings",
//     value: "settings",
//     label: "وضعیت ها",
//     icon: <DIcon icon="fa-octagon-check" cdi={false}></DIcon>,
//     href: "/dashboard/statuses",
//   },
//   {
//     id: "service-types",
//     value: "service-types",
//     label: "خدمات",
//     icon: <DIcon icon="fa-gears" cdi={false}></DIcon>,
//     href: "/dashboard/service-types",
//   },
// ];

// export const userMenuItems = [
//   {
//     id: "user-dashboard",
//     label: "داشبورد",
//     icon: <DIcon icon="fa-grid" cdi={false}></DIcon>,
//     href: "/panel",
//   },
//   {
//     id: "hand",
//     label: "درخواست‌ها",
//     icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
//     href: "/panel/requests",
//   },
//   {
//     id: "notifications",
//     label: "اعلان ها",
//     icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
//     href: "/panel/notifications",
//   },
//   {
//     id: "notifications",
//     label: "فاکتور ها",
//     icon: <DIcon icon="fa-file-lines" cdi={false}></DIcon>,
//     href: "/panel/invoices",
//   },
//   {
//     id: "profile",
//     label: "پروفایل",
//     icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
//     href: "/panel/profile",
//   },
// ];

// export const userBottomItems = [
//   {
//     id: "panel",
//     value: "panel",
//     label: "داشبورد",
//     icon: <DIcon icon="fa-grid" cdi={false}></DIcon>,
//     href: "/panel",
//   },
//   {
//     id: "hand",
//     value: "hand",
//     label: "درخواست‌ها",
//     icon: <DIcon icon="fa-hand" cdi={false}></DIcon>,
//     href: "/panel/requests",
//   },
//   {
//     id: "notifications",
//     value: "notifications",
//     label: "اعلان ها",
//     icon: <DIcon icon="fa-bell" cdi={false}></DIcon>,
//     href: "/panel/notifications",
//   },
//   {
//     id: "profile",
//     value: "profile",
//     label: "پروفایل",
//     icon: <DIcon icon="fa-user" cdi={false}></DIcon>,
//     href: "/panel/profile",
//   },
// ];
