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
  backUrl?: boolean;
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
      Promise.all(
        fetchers.map(async ({ key, fetcher }) => {
          try {
            const result = await fetcher();
            return { key, result };
          } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            return { key, result: [] };
          }
        })
      )
        .then((results) => {
          const newData = new Map<string, any>();
          results.forEach(({ key, result }) => {
            newData.set(key, result);
          });
          setData(newData);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSubmit = async (formData: T) => {
    console.log("formData1");
    console.log(formData);
    const result: any = await create(formData);
    after?.();
    if (backUrl && result.data.id) router.push(`./${result.data.id}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full">
      {backUrl && (
        <Link href="./" className="flex justify-start items-center mb-6">
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            {backLabel}
          </button>
        </Link>
      )}

      <div className="bg-white rounded-lg">
        <DynamicFormWrapper
          config={formConfig(data)}
          title=""
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
