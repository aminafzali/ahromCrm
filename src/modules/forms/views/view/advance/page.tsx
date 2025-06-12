import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import FormBuilder from "@/modules/forms/components/FormBuilder";
import { useForm } from "@/modules/forms/hooks/useForm";
import { FormWithRelations } from "@/modules/forms/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdvanceFormPageProps {
  id: number;
}

export default function AdvanceFormPage({ id }: AdvanceFormPageProps) {
  const { update, loading, Put, submitting, error, success, getById } =
    useForm();

  const router = useRouter();
  const params = useParams();

  const [data, setData] = useState<Map<string, any>>(new Map());
  const [defaultValues, setDefaultValues] = useState<FormWithRelations>();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const entityData = await getById(Number(id));
        setDefaultValues(entityData);
      } catch (error) {
        console.error("Error fetching entity:", error);
      }
    };

    fetchData();
  }, [id]);

  // useEffect(() => {
  //   if (fetchers.length > 0) {
  //     Promise.all(
  //       fetchers.map(async ({ key, fetcher }) => {
  //         try {
  //           const result = await fetcher();
  //           return { key, result };
  //         } catch (error) {
  //           console.error(`Error fetching ${key}:`, error);
  //           return { key, result: [] };
  //         }
  //       })
  //     )
  //       .then((results) => {
  //         const newData = new Map<string, any>();
  //         results.forEach(({ key, result }) => {
  //           newData.set(key, result);
  //         });
  //         setData(newData);
  //       })
  //       .finally(() => setLoading(false));
  //   } else {
  //     setLoading(false);
  //   }
  // }, []);

  const handleSubmit = async (data) => {
    if (!id) return;

    await Put(Number(id), {
      fields: data,
    });
    router.push("./");
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full">
      <Link href={`./`} className="flex justify-start items-center mb-6">
        <button className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
        </button>
      </Link>
      <FormBuilder
        initialFields={
          defaultValues
            ? defaultValues.fields.map((item) => {
                return item.field;
              })
            : []
        }
        onSave={handleSubmit}
      />
    </div>
  );
}
