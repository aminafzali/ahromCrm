import DIcon from "@/@Client/Components/common/DIcon";
import React, { useCallback } from "react";

interface ImageUploadProps {
  onUpload: (files: FileList) => void;
  multiple?: boolean;
  accept?: string;
  className?: string;
  loading?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = true,
  accept = "image/*",
  className = "",
  loading = false,
}) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      onUpload(files);
    },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        onUpload(e.target.files);
      }
    },
    [onUpload]
  );

  return (
    <div
      className={`border-[1px] border-dashed border-gray-500 rounded-lg p-6 text-center ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        multiple={multiple}
        accept={accept}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="space-y-2">
          <DIcon
            icon="fa-cloud-arrow-up"
            cdi={false}
            classCustom="text-4xl text-gray-600"
          />
          <p className="text-gray-700">
            فایل‌ها را اینجا رها کنید یا کلیک کنید
          </p>
        </div>
      </label>
    </div>
  );
};

export default ImageUpload;
