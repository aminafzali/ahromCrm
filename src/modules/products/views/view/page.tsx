import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DetailWrapper from "@/@Client/Components/wrappers/DetailWrapper/Index";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageGallery from "../../components/ImageGallery";
import ImageUpload from "../../components/ImageUpload";
import { useProduct } from "../../hooks/useProduct";
import { useProductImages } from "../../hooks/useProductImages";
import { ProductWithRelations } from "../../types";

interface ProductDetailsViewProps {
  id: number;
}

export default function DetailPage({ id }: ProductDetailsViewProps) {
  const {
    getById,
    loading,
    loading: dataLoading,
    statusCode,
    remove,
    update,
    unlink,
    Put,
  } = useProduct();

  const { uploadImages, loading: imageLoading } = useProductImages(id);

  const [product, setProduct] = useState<ProductWithRelations>(
    {} as ProductWithRelations
  );
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await getById(id);
     if (data != undefined) setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleDelete = async (row: any) => {
    try {
      await remove(row.id);
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const customRenderers = {
    images: (value: any[]) => (
      <div className="p-2">
        <h2 className="flex text-xl font-semibold mb-4">تصاویر محصول</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <ImageUpload onUpload={handleImageUpload} loading={imageLoading} />
          {product?.images &&
            product.images.map((image) => (
              <ImageGallery
                key={image.id}
                image={image}
                onDelete={handleImageDelete}
                loading={imageLoading}
              />
            ))}
        </div>
      </div>
    ),
  };

  const handleImageUpload = async (files: FileList) => {
    try {
      const data = await uploadImages(files);

      await Put(id, {
        images: data,
      });
      fetchProduct(); // Refresh product data
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handleImageDelete = async (imageId: number) => {
    try {
      await unlink(id, {
        relation: "images",
        relatedIds: [imageId],
      });
      fetchProduct(); // Refresh product data
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailWrapper
      data={product}
      title="محصول"
      excludeFields={["id", "createdAt", "updatedAt", "_count"]}
      loading={loading}
      customRenderers={customRenderers}
      onDelete={handleDelete}
      editUrl={`/dashboard/products/${id}/update`}
    />
  );
}
