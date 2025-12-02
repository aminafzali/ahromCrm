"use client";

import DIcon from "@/@Client/Components/common/DIcon";

export default function StockTransfersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">انتقال موجودی</h1>

      <div className="bg-white rounded-lg border p-12 text-center">
        <DIcon
          icon="fa-arrows-left-right"
          cdi={false}
          classCustom="text-6xl text-gray-300 mb-4"
        />
        <p className="text-gray-500 mb-4">
          این قابلیت به‌زودی اضافه خواهد شد
        </p>
        <p className="text-sm text-gray-400">
          در این بخش می‌توانید موجودی را بین انبارهای مختلف انتقال دهید
        </p>
      </div>
    </div>
  );
}

