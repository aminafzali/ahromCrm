"use client";

import { Card } from "ndui-ahrom";

const requestDetails = {
  id: "1",
  service: "تعمیر یخچال",
  status: "در حال بررسی",
  date: "1402/12/01",
  timeline: [
    {
      id: "1",
      title: "ثبت درخواست",
      content: "درخواست شما با موفقیت ثبت شد",
      date: "1402/12/01 10:30",
      icon: "📝",
    },
    {
      id: "2",
      title: "در حال بررسی",
      content: "درخواست شما در دست بررسی است",
      date: "1402/12/01 11:00",
      icon: "👀",
    },
  ],
};

export default function RequestTrackingPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">پیگیری درخواست</h1>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">اطلاعات درخواست</h2>
          <div className="space-y-2">
            <p>
              <strong>شماره پیگیری:</strong> {requestDetails.id}
            </p>
            <p>
              <strong>نوع خدمات:</strong> {requestDetails.service}
            </p>
            <p>
              <strong>تاریخ ثبت:</strong> {requestDetails.date}
            </p>
            <p>
              <strong>وضعیت:</strong> {requestDetails.status}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-2">
          <h2 className="text-xl font-semibold mb-4">گزارش وضعیت</h2>

          {requestDetails.timeline.map((stat, index) => (
            <div className="my-4 p-3 bg-gray-100 rounded-lg" key={index}>
              <div className="p-1">
                <div className="text-2xl font-semibold my-4 flex border-b-2 pb-4">
                  <div className="mx-2">{stat.icon}</div>
                  <div>{stat.title}</div>
                </div>
                <p className={`text-md font-bold `}>{stat.date}</p>
                <p className="py-2">{stat.content}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
