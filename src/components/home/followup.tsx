"use client";

import { Button, Form, Input } from "ndui-ahrom";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import DIcon from "../../@Client/Components/common/DIcon";

const schema = z.object({
  id: z.number().min(1, "شماره پیگیری معتبر نیست"),
});

export default function FollowUp() {
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestId(e.target.value);
  };

  const handleSubmit = async (data: { id: number }) => {
    setLoading(true);
    setError(null);

    try {
      // // Check if request exists
      // const response = await fetch(`/api/requests/${data.id}`);

      // if (!response.ok) {
      //   if (response.status === 404) {
      //     setError("درخواست با این شماره پیگیری یافت نشد");
      //   } else {
      //     setError("خطا در پیگیری درخواست");
      //   }
      //   return;
      // }

      // Redirect to request details page
      router.push(`/panel/requests/${data.id}`);
    } catch (error) {
      console.error("Error tracking request:", error);
      setError("خطا در پیگیری درخواست");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 !p-4 !py-6 w-full max-w-md flex flex-col !gap-2">
      <Form
        schema={schema}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <label htmlFor="requestId" className="block text-lg">
          <DIcon icon="fa-rotate-reverse " classCustom="!ml-2"></DIcon>
          پیگیری درخواست
        </label>

        {error && <div className="text-red-500 text-sm mt-1 mb-2">{error}</div>}

        <Input
          name="id"
          type="number"
          id="requestId"
          value={requestId}
          onChange={handleInputChange}
          placeholder="کد درخواست را وارد کنید"
          className=" w-full"
        />

        <Button
          type="submit"
          variant="primary"
          icon={
            <DIcon
              cdi={false}
              icon="fa-rotate-reverse "
              classCustom="!ml-2 text-2xl"
            ></DIcon>
          }
          disabled={requestId === "" || loading}
          size="md"
          className="mt-2 w-full"
        >
          {loading ? "در حال پیگیری..." : "پیگیری درخواست"}
        </Button>
      </Form>
    </div>
  );
}
