/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // بهینه‌سازی‌ها برای کاهش زمان بیلد:
  eslint: {
    // نادیده گرفتن Linting در طول فرآیند بیلد Production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // نادیده گرفتن خطاهای TypeScript در طول بیلد (اگرچه بهتر است لوکال چک شوند)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
