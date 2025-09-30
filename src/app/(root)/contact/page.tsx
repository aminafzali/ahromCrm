"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Form, Input } from "ndui-ahrom";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  email: z.string().email("ایمیل نامعتبر است"),
  subject: z.string().min(1, "موضوع الزامی است"),
  message: z.string().min(10, "پیام باید حداقل 10 کاراکتر باشد"),
});

export default function ContactPage() {
  const handleSubmit = async (data: z.infer<typeof contactSchema>) => {
    // Handle form submission
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">تماس با ما</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">اطلاعات تماس</h2>

          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <DIcon
                  icon="fa-location-dot"
                  cdi={false}
                  classCustom="text-2xl text-primary"
                />
              </div>
              <div>
                <h3 className="font-bold mb-1">آدرس</h3>
                <p className="text-gray-600">تهران، خیابان ولیعصر، پلاک 123</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <DIcon
                  icon="fa-phone"
                  cdi={false}
                  classCustom="text-2xl text-primary"
                />
              </div>
              <div>
                <h3 className="font-bold mb-1">تلفن تماس</h3>
                <p className="text-gray-600">021-12345678</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <DIcon
                  icon="fa-envelope"
                  cdi={false}
                  classCustom="text-2xl text-primary"
                />
              </div>
              <div>
                <h3 className="font-bold mb-1">ایمیل</h3>
                <p className="text-gray-600">info@example.com</p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">
              ما را در شبکه‌های اجتماعی دنبال کنید
            </h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <DIcon
                  icon="fa-instagram"
                  cdi={false}
                  classCustom="text-xl text-primary"
                />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <DIcon
                  icon="fa-telegram"
                  cdi={false}
                  classCustom="text-xl text-primary"
                />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <DIcon
                  icon="fa-whatsapp"
                  cdi={false}
                  classCustom="text-xl text-primary"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">ارسال پیام</h2>
          <Form schema={contactSchema} onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                name="name"
                label="نام و نام خانوادگی"
                placeholder="نام خود را وارد کنید"
              />

              <Input
                name="email"
                label="ایمیل"
                type="email"
                placeholder="ایمیل خود را وارد کنید"
              />

              <Input name="subject" label="موضوع" placeholder="موضوع پیام" />

              <Input
                name="message"
                label="پیام"
                placeholder="پیام خود را بنویسید"
              />

              <Button
                type="submit"
                icon={
                  <DIcon icon="fa-paper-plane" cdi={false} classCustom="ml-2" />
                }
              >
                ارسال پیام
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Map */}
      <div className="mt-12">
        <div className="w-full h-96 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
