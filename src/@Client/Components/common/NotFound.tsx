import DIcon from "./DIcon";

const NotFound = () => {
  return (
    <div className="flex flex-col w-full items-center justify-center pt-24 text-gray-800">
      {/* تصویر وکتوری */}
      <div className="w-48 h-48 flex flex-col justify-center items-center bg-error text-white w-lg rounded-full">
        {/* عدد 404 */}
        <div className="text-3xl font-bold ">404</div>

        <DIcon
          icon="fa-search"
          cdi={false}
          classCustom="text-3xl text-white mt-4 font-bold"
        />
      </div>

      {/* متن خطا */}
      <h2 className="text-2xl font-bold mt-6">
        موردی که دنبال آن بودید پیدا نشد!
      </h2>
      <p className="text-gray-600 mt-6">
        ممکن است لینک اشتباه باشد یا صفحه حذف شده باشد.
      </p>
    </div>
  );
};

export default NotFound;
