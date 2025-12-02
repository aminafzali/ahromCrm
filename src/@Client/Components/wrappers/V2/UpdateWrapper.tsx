import { useCrud } from "@/@Client/hooks/useCrud";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { FormConfig } from "../../../types/form";
import DIcon from "../../common/DIcon";
import Loading from "../../common/Loading";
import DynamicFormWrapper from "../DynamicFormWrapper";

interface DynamicUpdateWrapperProps<
  T,
  R extends BaseRepository<T, number>,
  S extends z.ZodType<any, any, any>
> {
  title: string;
  back?: boolean;
  backLabel?: string;
  formConfig: (data: Map<string, any>) => FormConfig;
  fetchers?: { key: string; fetcher: () => Promise<any> }[];
  repo: R;
  schema?: S;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  after?: () => void;
  mapDefaultValues?: (entity: T) => T;
}

const UpdateWrapper = <
  T,
  R extends BaseRepository<T, number>,
  S extends z.ZodType<any, any, any>
>({
  title,
  back = true,
  backLabel = "بازگشت",
  formConfig,
  fetchers = [],
  repo,
  schema,
  submitLabel = "ویرایش",
  submitIcon = <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
  after,
  mapDefaultValues,
}: DynamicUpdateWrapperProps<T, R, S>) => {
  const {
    update,
    loading: fetching,
    submitting,
    error,
    success,
    getById,
  } = useCrud<T, z.infer<S>>(repo);

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [defaultValues, setDefaultValues] = useState<T | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const entityData = await getById(Number(id));
        if (entityData !== undefined) {
          setDefaultValues(
            mapDefaultValues ? mapDefaultValues(entityData) : entityData
          );
        }
      } catch (error) {
        console.error("Error fetching entity:", error);
      }
    };

    fetchData();
  }, [id, mapDefaultValues]);

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
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (formData: T) => {
    if (!id) return;
    await update(Number(id), formData);
    after?.();
    if (back) router.push("./");
  };

  if (loading || fetching || !defaultValues) return <Loading />;

  return (
    <div className="w-full">
      {back && (
        <Link href={`./`} className="flex justify-start items-center mb-6">
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

export default UpdateWrapper;
