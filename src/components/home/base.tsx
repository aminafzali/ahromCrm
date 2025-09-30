import AddSection from "./AddSection";
import FollowUp from "./followup";

export default function Base() {
  return (
    <div className=" flex flex-col items-center gap-6 py-6">
      <h1 className="text-2xl font-bold text-center">
        به سامانه خدمات خوش آمدید
      </h1>
      <p className="text-md md:text-xl text-justify max-w-2xl p-2">
        ما ارائه دهنده خدمات تعمیر لوازم خانگی هستیم. برای ثبت درخواست خود
        می‌توانید از دکمه زیر استفاده کنید یا برای پیگیری درخواست خود از باکس
        پیگیری درخواست استفاده کنید
      </p>

      <div className="w-full flex max-sm:flex-col justify-center gap-4">
        {/* <AddSection /> */}

        <FollowUp />
      </div>
    </div>
  );
}
