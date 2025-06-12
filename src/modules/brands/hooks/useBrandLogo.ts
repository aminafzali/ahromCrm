import { useToast } from 'ndui-ahrom';
import { useCallback, useState } from 'react';

export function useBrandLogo(brandId: number) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const uploadLogo = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/brands/${brandId}/logo`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      showToast('لوگو با موفقیت آپلود شد', 'success');
      return data.brand;
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast('خطا در آپلود لوگو', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  const deleteLogo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/brands/${brandId}/logo`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      showToast('لوگو با موفقیت حذف شد', 'success');
    } catch (error) {
      console.error('Error deleting logo:', error);
      showToast('خطا در حذف لوگو', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  return {
    loading,
    uploadLogo,
    deleteLogo
  };
}