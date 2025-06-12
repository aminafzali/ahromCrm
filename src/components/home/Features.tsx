import DIcon from "@/@Client/Components/common/DIcon";

export default function Features() {
  const features = [
    {
      icon: "fa-clock",
      title: "سرویس سریع",
      description: "پاسخگویی و اعزام تکنسین در کمترین زمان ممکن"
    },
    {
      icon: "fa-shield",
      title: "گارانتی خدمات",
      description: "ضمانت کیفیت تمامی خدمات و قطعات"
    },
    {
      icon: "fa-wallet",
      title: "قیمت مناسب",
      description: "ارائه خدمات با قیمت‌های رقابتی و شفاف"
    },
    {
      icon: "fa-users",
      title: "تکنسین‌های متخصص",
      description: "تیم مجرب و آموزش‌دیده"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">
          چرا ما را انتخاب کنید؟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DIcon icon={feature.icon} cdi={false} classCustom="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}