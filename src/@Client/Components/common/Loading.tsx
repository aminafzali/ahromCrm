const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh/2)]">
      <div className="flex flex-col items-center space-y-4">
        <span className="loading loading-ring loading-lg text-primary"></span>
        <p className="text-lg font-semibold text-gray-600">
          در حال بارگذاری ....
        </p>
      </div>
    </div>
  );
};

export default Loading;
