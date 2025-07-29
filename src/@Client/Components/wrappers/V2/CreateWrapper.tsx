// مسیر فایل: src/@Client/Components/wrappers/V2/CreateWrapper.tsx

"use client";

import { useCrud } from "@/@Client/hooks/useCrud";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { FormConfig } from "../../../types/form";
import DIcon from "../../common/DIcon";
import Loading from "../../common/Loading";
import DynamicFormWrapper from "../DynamicFormWrapper";

interface DynamicCreateWrapperProps<
  T,
  R extends BaseRepository<T, number>,
  S extends z.ZodType<any, any, any>
> {
  title: string;
  backUrl?: boolean | string;
  backLabel?: string;
  formConfig: (data: Map<string, any>) => FormConfig;
  fetchers?: { key: string; fetcher: () => Promise<any> }[];
  repo: R;
  schema?: S;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  after?: () => void;
  defaultValues?: any;
}

const CreateWrapper = <
  T,
  R extends BaseRepository<T, number>,
  S extends z.ZodType<any, any, any>
>({
  title,
  backUrl = true,
  backLabel = "بازگشت",
  formConfig,
  fetchers = [],
  repo,
  schema,
  defaultValues,
  submitLabel = "ایجاد",
  submitIcon = <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
  after,
}: DynamicCreateWrapperProps<T, R, S>) => {
  const { create, submitting, error, success } = useCrud<T, z.infer<S>>(repo);
  const router = useRouter();
  const [data, setData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState<boolean>(fetchers.length > 0);

  useEffect(() => {
    if (fetchers.length > 0) {
      console.log(
        `%c[CreateWrapper] 1. Starting to fetch data for form...`,
        "color: #007acc;"
      );
      Promise.all(
        fetchers.map(async ({ key, fetcher }) => {
          try {
            const result = await fetcher();
            return { key, result };
          } catch (error) {
            console.error(
              `%c[CreateWrapper] ❌ Error fetching data for key "${key}":`,
              "color: red;",
              error
            );
            return { key, result: [] };
          }
        })
      )
        .then((results) => {
          const newData = new Map<string, any>();
          results.forEach(({ key, result }) => {
            newData.set(key, result);
          });
          console.log(
            `%c[CreateWrapper] 2. ✅ Successfully fetched data:`,
            "color: #28a745;",
            newData
          );
          setData(newData);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSubmit = async (formData: T) => {
    // ===== شروع لاگ‌های ردیابی =====
    console.log(
      `%c[CreateWrapper] 3. handleSubmit triggered.`,
      "color: #fd7e14; font-weight: bold;"
    );
    console.log(
      `%c[CreateWrapper]    Form Data Received:`,
      "color: #fd7e14;",
      formData
    );
    // ================================

    try {
      console.log(
        `%c[CreateWrapper] 4. Calling create method from useCrud hook...`,
        "color: #fd7e14;"
      );
      const result: any = await create(formData);
      console.log(
        `%c[CreateWrapper] 5. ✅ Create method successful. Result:`,
        "color: #28a745; font-weight: bold;",
        result
      );

      if (after) {
        console.log(
          `%c[CreateWrapper] 6. Calling 'after' callback.`,
          "color: #28a745;"
        );
        after();
      }

      if (backUrl && result?.id) {
        const redirectUrl =
          typeof backUrl === "string" ? backUrl : `./${result.id}`;
        console.log(
          `%c[CreateWrapper] 7. Redirecting to: ${redirectUrl}`,
          "color: #28a745;"
        );
        router.push(redirectUrl);
      }
    } catch (err) {
      // ===== لاگ دقیق خطا =====
      console.error(
        `%c[CreateWrapper] ❌ Error during create operation:`,
        "color: red; font-weight: bold;",
        err
      );
      // =======================
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full">
      {backUrl && (
        <Link
          href={typeof backUrl === "string" ? backUrl : "./"}
          className="flex justify-start items-center mb-6"
        >
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            {backLabel}
          </button>
        </Link>
      )}

      <div className="bg-white rounded-lg">
        <DynamicFormWrapper
          config={formConfig(data)}
          title={title}
          onSubmit={handleSubmit}
          isLoading={submitting}
          error={error}
          success={success}
          submitLabel={submitLabel}
          submitIcon={submitIcon}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  );
};

export default CreateWrapper;

// import { useCrud } from "@/@Client/hooks/useCrud";
// import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { z } from "zod";
// import { FormConfig } from "../../../types/form";
// import DIcon from "../../common/DIcon";
// import Loading from "../../common/Loading";
// import DynamicFormWrapper from "../DynamicFormWrapper";
// interface DynamicCreateWrapperProps<
//   T,
//   R extends BaseRepository<T, number>,
//   S extends z.ZodType<any, any, any>
// > {
//   title: string;
//   backUrl?: boolean;
//   backLabel?: string;
//   formConfig: (data: Map<string, any>) => FormConfig;
//   fetchers?: { key: string; fetcher: () => Promise<any> }[];
//   repo: R;
//   schema?: S;
//   submitLabel?: string;
//   submitIcon?: React.ReactNode;
//   after?: () => void;
//   defaultValues?: any;
// }

// const CreateWrapper = <
//   T,
//   R extends BaseRepository<T, number>,
//   S extends z.ZodType<any, any, any>
// >({
//   title,
//   backUrl = true,
//   backLabel = "بازگشت",
//   formConfig,
//   fetchers = [],
//   repo,
//   schema,
//   defaultValues,
//   submitLabel = "ایجاد",
//   submitIcon = <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
//   after,
// }: DynamicCreateWrapperProps<T, R, S>) => {
//   const { create, submitting, error, success } = useCrud<T, z.infer<S>>(repo);

//   const router = useRouter();
//   const [data, setData] = useState<Map<string, any>>(new Map());
//   const [loading, setLoading] = useState<boolean>(fetchers.length > 0);

//   useEffect(() => {
//     if (fetchers.length > 0) {
//       Promise.all(
//         fetchers.map(async ({ key, fetcher }) => {
//           try {
//             const result = await fetcher();
//             return { key, result };
//           } catch (error) {
//             console.error(`Error fetching ${key}:`, error);
//             return { key, result: [] };
//           }
//         })
//       )
//         .then((results) => {
//           const newData = new Map<string, any>();
//           results.forEach(({ key, result }) => {
//             newData.set(key, result);
//           });
//           setData(newData);
//         })
//         .finally(() => setLoading(false));
//     }
//   }, []);

//   const handleSubmit = async (formData: T) => {
//     console.log("formData1");
//     console.log(formData);
//     const result: any = await create(formData);
//     after?.();
//     if (backUrl && result.data.id) router.push(`./${result.data.id}`);
//   };

//   if (loading) return <Loading />;

//   return (
//     <div className="w-full">
//       {backUrl && (
//         <Link href="./" className="flex justify-start items-center mb-6">
//           <button className="btn btn-ghost">
//             <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
//             {backLabel}
//           </button>
//         </Link>
//       )}

//       <div className="bg-white rounded-lg">
//         <DynamicFormWrapper
//           config={formConfig(data)}
//           title=""
//           onSubmit={handleSubmit}
//           isLoading={submitting}
//           error={error}
//           success={success}
//           submitLabel={submitLabel}
//           submitIcon={submitIcon}
//           defaultValues={defaultValues}
//         />
//       </div>
//     </div>
//   );
// };

// export default CreateWrapper;
