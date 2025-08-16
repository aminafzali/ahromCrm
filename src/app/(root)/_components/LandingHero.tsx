import LoginButton from "./LoginButton";

export default async function LandingHero() {
  return (
    <div className="hero min-h-[70vh] bg-base-200 rounded-3xl my-6">
      <div className="hero-content text-center  justify-items-center justify-center content-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold leading-tight justify-items-center justify-center content-center">
            کسب‌وکار خود را با <span className="text-primary">اهرم</span> متحول
            کنید
          </h1>
          <p className="py-6 text-lg">
            پنل مدیریت اهرم، یک راهکار جامع برای مدیریت هوشمند درخواست‌ها،
            خدمات، محصولات و مشتریان شماست. همه‌چیز در یک پلتفرم یکپارچه.
          </p>
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
