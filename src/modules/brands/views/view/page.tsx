import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBrand } from "../../hooks/useBrand";
import { BrandWithRelations } from "../../types";

interface BrandDetailsViewProps {
  id: number;
}

export default function DetailPage({ id }: BrandDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
    remove,
  } = useBrand();
  const [brand, setBrand] = useState<BrandWithRelations>({} as BrandWithRelations);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchBrandDetails();
    }
  }, [id]);

  const fetchBrandDetails = async () => {
    try {
      const data = await getById(id);
      
      if(data != undefined){
        setBrand(data);
      }
     
    } catch (error) {
      console.error("Error fetching brand details:", error);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/brands");
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  };

  const customRenderers = {
    website: (value: string) => (
      value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary">
          {value}
        </a>
      ) : "-"
    ),
    logoUrl: (value: string) => (
      value ? (
        <img src={value} alt="Brand Logo" className="max-w-xs rounded-lg" />
      ) : "-"
    ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={brand}
      title="برند"
      excludeFields={["id", "createdAt", "updatedAt", "_count"]}
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      onDelete={handleDelete}
      editUrl={`/dashboard/brands/${id}/update`}
    />
  );
}