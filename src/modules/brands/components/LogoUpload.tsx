import React, { useCallback } from 'react';
import { Button } from 'ndui-ahrom';
import DIcon from '@/@Client/Components/common/DIcon';

interface LogoUploadProps {
  onUpload: (file: File) => void;
  currentLogo?: string;
  onDelete?: () => void;
  loading?: boolean;
}

const LogoUpload: React.FC<LogoUploadProps> = ({
  onUpload,
  currentLogo,
  onDelete,
  loading = false
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
    }
  }, [onUpload]);

  return (
    <div className="space-y-4">
      {currentLogo ? (
        <div className="relative group w-48">
          <img
            src={currentLogo}
            alt="Brand logo"
            className="w-full h-48 object-contain rounded-lg border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-error"
                onClick={onDelete}
                loading={loading}
                icon={<DIcon icon="fa-trash" cdi={false} />}
              >
                حذف لوگو
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center w-48">
          <input
            type="file"
            id="logo-upload"
            className="hidden"
            onChange={handleChange}
            accept="image/*"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="space-y-2">
              <DIcon icon="fa-image" cdi={false} classCustom="text-4xl text-gray-400" />
              <p className="text-gray-600 text-sm">آپلود لوگو</p>
              <Button
                variant="ghost"
                size="sm"
                loading={loading}
                icon={<DIcon icon="fa-upload" cdi={false} classCustom="ml-2" />}
              >
                انتخاب فایل
              </Button>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;