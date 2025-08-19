import React, { useRef } from 'react';

interface FilePickerProps {
  onChange: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  label?: string;
  error?: string;
  className?: string;
}

const FilePicker: React.FC<FilePickerProps> = ({
  onChange,
  accept,
  multiple = false,
  maxSize,
  label,
  error,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (files && maxSize) {
      const invalidFiles = Array.from(files).some(file => file.size > maxSize);
      if (invalidFiles) {
        event.target.value = '';
        return;
      }
    }
    
    onChange(files);
  };

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      
      <input
        ref={inputRef}
        type="file"
        className={`file-input file-input-bordered w-full ${error ? 'file-input-error' : ''} ${className}`}
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
      
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

export default FilePicker;