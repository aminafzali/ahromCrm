// مسیر فایل: src/app/(admin)/admin/users/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";

// این یک کامپوننت کاملاً مستقل است
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });

  // ۱. از useEffect برای واکشی داده‌ها هنگام بارگذاری صفحه استفاده می‌کنیم
  useEffect(() => {
    fetchUsers(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  // ۲. تابع واکشی داده که مستقیماً با API جدید صحبت می‌کند
  const fetchUsers = async (page: number, limit: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const result = await response.json();
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            مدیریت کاربران سراسری
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            لیست تمام کاربران ثبت‌شده در کل سیستم.
          </p>
        </div>
        {/* می‌توانید دکمه ساخت کاربر جدید را در اینجا اضافه کنید */}
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      نام
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      شماره تلفن
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      ایمیل
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {user.name || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {user.phone}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {user.email || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* می‌توانید کامپوننت صفحه‌بندی را در اینجا اضافه کنید */}
    </div>
  );
}
