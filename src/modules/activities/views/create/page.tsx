"use client";

import { Card } from "ndui-ahrom";
import ActivityForm from "../../components/ActivityForm";

export default function ActivityCreatePage() {
  return (
    <Card className="p-4">
      <h1 className="text-xl font-bold mb-4">ایجاد فعالیت جدید</h1>
      <ActivityForm />
    </Card>
  );
}
