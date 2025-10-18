import React from "react";

interface ErrorStateProps {
  onBack: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  onBack,
  title = "خطا",
  message = "تیکت یافت نشد",
  buttonText = "بازگشت",
}) => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onBack}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  </div>
);

export default ErrorState;
