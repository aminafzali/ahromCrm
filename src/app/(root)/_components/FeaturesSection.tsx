import DIcon from "@/@Client/Components/common/DIcon";

const features = [
  {
    icon: "fa-tasks",
    title: "مدیریت جامع درخواست‌ها",
    description:
      "از ثبت تا انجام، تمام مراحل درخواست‌های مشتریان خود را به سادگی پیگیری و مدیریت کنید.",
  },
  {
    icon: "fa-cogs",
    title: "کاتالوگ خدمات و محصولات",
    description:
      "خدمات و محصولات خود را به صورت آنلاین و دسته‌بندی شده به مشتریان نمایش دهید.",
  },
  {
    icon: "fa-users",
    title: "مدیریت یکپارچه مشتریان",
    description:
      "سوابق، درخواست‌ها و تمام تعاملات مشتریان خود را در یک پروفایل کامل مشاهده کنید.",
  },
  {
    icon: "fa-file-invoice-dollar",
    title: "سیستم فاکتوردهی هوشمند",
    description:
      "به راحتی برای خدمات و محصولات خود فاکتور صادر کرده و وضعیت پرداخت‌ها را دنبال کنید.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">امکانات کلیدی پنل اهرم</h2>
        <p className="text-base-content/70 mt-2">
          ابزارهایی که برای رشد کسب‌وکار خود نیاز دارید.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="card bg-base-100 border hover:shadow-xl transition-shadow"
          >
            <div className="card-body items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <DIcon
                  icon={feature.icon}
                  cdi={false}
                  classCustom="text-primary text-3xl"
                />
              </div>
              <h3 className="card-title">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
