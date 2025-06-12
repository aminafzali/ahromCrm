// ✅ Fix: Define `params` explicitly in the function signature
export default async function ProductPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          محصول یافت نشد
        </h1>
        <p className="text-gray-600">محصول مورد نظر شما در سیستم موجود نیست.</p>
      </div>
    </div>
  );

  // return <ProductDetails product={product} />;
}
