// لیست استان‌ها و شهرهای ایران برای استفاده در فرم‌ها (بدون نیاز به API)

export type IranProvince = {
  code: string;
  name: string;
};

export type IranCity = {
  code: string;
  name: string;
  provinceCode: string;
};

export const IRAN_PROVINCES: IranProvince[] = [
  { code: "TEH", name: "تهران" },
  { code: "ALB", name: "البرز" },
  { code: "ESF", name: "اصفهان" },
  { code: "FAR", name: "فارس" },
  { code: "KHU", name: "خوزستان" },
  { code: "MZN", name: "مازندران" },
  { code: "GLS", name: "گیلان" },
  { code: "KRM", name: "کرمان" },
  { code: "KHZ", name: "خراسان رضوی" },
  { code: "WAZ", name: "آذربایجان غربی" },
  { code: "EAZ", name: "آذربایجان شرقی" },
  { code: "ARF", name: "اردبیل" },
  { code: "HRM", name: "هرمزگان" },
  { code: "YZD", name: "یزد" },
  { code: "CHB", name: "چهارمحال و بختیاری" },
  { code: "ILM", name: "ایلام" },
  { code: "KBD", name: "کهگیلویه و بویراحمد" },
  { code: "LRS", name: "لرستان" },
  { code: "SMN", name: "سمنان" },
  { code: "QOM", name: "قم" },
  { code: "QAZ", name: "قزوین" },
  { code: "KRH", name: "کرمانشاه" },
  { code: "ZJN", name: "زنجان" },
  { code: "GOL", name: "گلستان" },
  { code: "SBN", name: "سیستان و بلوچستان" },
  { code: "HDN", name: "همدان" },
  { code: "KRD", name: "کردستان" },
  { code: "BRJ", name: "بوشهر" },
  { code: "KHS", name: "خراسان جنوبی" },
  { code: "KHN", name: "خراسان شمالی" },
  { code: "MRK", name: "مرکزی" },
];

// چند شهر نمونه؛ در صورت نیاز می‌توان آن را کامل‌تر کرد
export const IRAN_CITIES: IranCity[] = [
  { code: "TEH-TEH", name: "تهران", provinceCode: "TEH" },
  { code: "TEH-SHR", name: "شهر ری", provinceCode: "TEH" },
  { code: "ALB-KRJ", name: "کرج", provinceCode: "ALB" },
  { code: "ESF-ESF", name: "اصفهان", provinceCode: "ESF" },
  { code: "FAR-SHI", name: "شیراز", provinceCode: "FAR" },
  { code: "KHU-AHV", name: "اهواز", provinceCode: "KHU" },
  { code: "MZN-SAR", name: "ساری", provinceCode: "MZN" },
  { code: "GLS-RAS", name: "رشت", provinceCode: "GLS" },
];

export const getCitiesByProvince = (provinceCode: string): IranCity[] =>
  IRAN_CITIES.filter((c) => c.provinceCode === provinceCode);
