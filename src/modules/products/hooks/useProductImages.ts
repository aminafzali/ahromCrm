import { useToast } from 'ndui-ahrom';
import { useCallback, useState } from 'react';

export function useProductImages(productId: number) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const uploadImages = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) {
      showToast('هیچ فایلی انتخاب نشده است', 'error');
      return [];
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/uploads`, {
        method: 'POST',
        body: formData
      });


      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();
      const images = data.urls.map((item) => {
        return {
          url : item
        }
      })
      showToast('تصاویر با موفقیت آپلود شدند', 'success');
      return images ?? [];
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast('خطا در آپلود تصاویر', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);


  const deleteImage = useCallback(async (imageId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      showToast('تصویر با موفقیت حذف شد', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('خطا در حذف تصویر', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const setPrimaryImage = useCallback(async (imageId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/images/primary`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageId })
      });

      if (!response.ok) {
        throw new Error('Failed to set primary image');
      }

      showToast('تصویر اصلی با موفقیت تغییر کرد', 'success');
    } catch (error) {
      console.error('Error setting primary image:', error);
      showToast('خطا در تغییر تصویر اصلی', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return {
    loading,
    uploadImages,
    deleteImage,
    setPrimaryImage
  };
}