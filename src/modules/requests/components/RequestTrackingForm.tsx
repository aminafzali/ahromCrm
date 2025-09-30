import { useState } from 'react';
import { Form, Input, Button } from 'ndui-ahrom';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import DIcon from '@/@Client/Components/common/DIcon';

const schema = z.object({
  trackingCode: z.string().min(1, 'کد پیگیری الزامی است'),
});

export default function RequestTrackingForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: { trackingCode: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/requests/${data.trackingCode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('درخواستی با این کد پیگیری یافت نشد');
        }
        throw new Error('خطا در پیگیری درخواست');
      }

      router.push(`/request/${data.trackingCode}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form schema={schema} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Input
          name="trackingCode"
          label="کد پیگیری"
          placeholder="کد پیگیری خود را وارد کنید"
        />

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading}
          icon={<DIcon icon="fa-search" cdi={false} classCustom="ml-2" />}
        >
          {loading ? 'در حال جستجو...' : 'پیگیری درخواست'}
        </Button>
      </div>
    </Form>
  );
}