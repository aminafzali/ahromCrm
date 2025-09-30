const ComingSoon = () => {
  return (
    <div className="flex border rounded-lg border-primary p-8 items-center justify-center my-8">
      <div className="text-center max-w-md">
        <svg
          className="w-32 h-32 mx-auto mb-4"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="80" fill="#E5E7EB" />
          <path
            d="M60 100L90 130L140 70"
            stroke="#3B82F6"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-2xl font-bold text-primary">به زودی...</h2>
        <p className="text-lg text-gray-700 mt-2">
          این بخش در حال توسعه است و به زودی در دسترس خواهد بود.
        </p>
        <div className="mt-4">
          <span className="loading loading-infinity loading-lg text-primary"></span>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
