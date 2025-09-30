import Link from "next/link";
import ProductCard from "@/modules/products/components/ProductCard";
import { Button } from "ndui-ahrom";
import DIcon from "@/@Client/Components/common/DIcon";

export default function ProductShowcase({ products }) {
  return (
    <div className="py-16 container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">محصولات جدید</h2>
        <Link href="/products">
          <Button
            variant="ghost"
            icon={<DIcon icon="fa-arrow-left" cdi={false} classCustom="mr-2" />}
          >
            مشاهده همه محصولات
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}