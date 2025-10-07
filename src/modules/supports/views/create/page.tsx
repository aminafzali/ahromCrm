"use client";

import { Card } from "ndui-ahrom";
import SupportForm from "../../components/SupportForm";

export default function SupportsCreatePage() {
  return (
    <Card className="p-4">
      <h1 className="text-xl font-bold mb-4">ایجاد تیکت پشتیبانی</h1>
      <SupportForm />
    </Card>
  );
}


