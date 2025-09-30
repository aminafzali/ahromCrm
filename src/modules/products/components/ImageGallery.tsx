import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Modal } from "ndui-ahrom";
import React, { useState } from "react";

interface ImageGalleryProps {
  image: any;
  onDelete?: (imageId: number) => void;
  loading?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  image,
  onDelete,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail View */}
      <div
        key={image.id}
        className="relative group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={image.url}
          alt={image.alt || "Product image"}
          className="w-full h-48 object-cover rounded-lg"
        />
        {image.isPrimary && (
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs">
            تصویر اصلی
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Modal
        size="lg"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        footer={
          onDelete && (
            <div className="flex justify-center mt-4">
              <Button
                size="md"
                variant="ghost"
                className="text-error text-xl"
                onClick={() => onDelete(image.id)}
                loading={loading}
                icon={
                  <DIcon icon="fa-trash" cdi={false} classCustom="text-2xl" />
                }
              >
                حذف تصویر
              </Button>
            </div>
          )
        }
      >
        {/* Image Display */}
        <img
          src={image.url}
          alt={image.alt || "Product image"}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />
      </Modal>
    </>
  );
};

export default ImageGallery;
