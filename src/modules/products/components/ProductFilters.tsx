import React from 'react';
import { Button, Input, Select } from 'ndui-ahrom';
import DIcon from '@/@Client/Components/common/DIcon';

interface FilterOption {
  value: string;
  label: string;
}

interface ProductFiltersProps {
  brands: FilterOption[];
  categories: FilterOption[];
  onFilterChange: (filters: Record<string, any>) => void;
  onReset: () => void;
  loading?: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  brands,
  categories,
  onFilterChange,
  onReset,
  loading = false
}) => {
  const [filters, setFilters] = React.useState({
    brandId: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    isActive: true
  });

  const handleChange = (name: string, value: any) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({
      brandId: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      isActive: true
    });
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">فیلترها</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          loading={loading}
          icon={<DIcon icon="fa-rotate-left" cdi={false} classCustom="ml-2" />}
        >
          بازنشانی
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          name="brandId"
          label="برند"
          options={[{ value: '', label: 'همه برندها' }, ...brands]}
          value={filters.brandId}
          onChange={(e) => handleChange('brandId', e.target.value)}
          disabled={loading}
        />

        <Select
          name="categoryId"
          label="دسته‌بندی"
          options={[{ value: '', label: 'همه دسته‌ها' }, ...categories]}
          value={filters.categoryId}
          onChange={(e) => handleChange('categoryId', e.target.value)}
          disabled={loading}
        />

        <div className="flex gap-2">
          <Input
            name="minPrice"
            label="حداقل قیمت"
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            disabled={loading}
          />
          <Input
            name="maxPrice"
            label="حداکثر قیمت"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleChange('inStock', e.target.checked)}
              disabled={loading}
              className="checkbox checkbox-primary"
            />
            <span>فقط موجود</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              disabled={loading}
              className="checkbox checkbox-primary"
            />
            <span>فقط فعال</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;