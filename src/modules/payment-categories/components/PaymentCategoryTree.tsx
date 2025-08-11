import React from 'react';
import DIcon from '@/@Client/Components/common/DIcon';
import Link from 'next/link';

interface CategoryNode {
  id: number;
  name: string;
  children?: CategoryNode[];
  _count?: {
    products: number;
    children: number;
  };
}

interface CategoryTreeProps {
  categories: CategoryNode[];
  onSelect?: (category: CategoryNode) => void;
  selectedId?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onSelect,
  selectedId,
}) => {
  const renderCategory = (category: CategoryNode, level: number = 0) => {
    const isSelected = category.id === selectedId;
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          className={`
            flex items-center justify-between p-2 my-1 rounded-lg cursor-pointer
            ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'}
          `}
          onClick={() => onSelect?.(category)}
        >
          <div className="flex items-center">
            <DIcon
              icon={hasChildren ? 'fa-folder' : 'fa-folder-open'}
              cdi={false}
              classCustom="ml-2"
            />
            <span>{category.name}</span>
          </div>
          <div className="flex items-center text-sm">
            {category._count && (
              <>
                <span className="mx-2">
                  {category._count.products} محصول
                </span>
                {hasChildren && (
                  <span className="mx-2">
                    {category._count.children} زیردسته
                  </span>
                )}
              </>
            )}
            {onSelect && (
              <Link
                href={`/dashboard/categories/${category.id}`}
                className={isSelected ? 'text-white' : 'text-primary'}
                onClick={(e) => e.stopPropagation()}
              >
                <DIcon icon="fa-eye" cdi={false} classCustom="mx-2" />
              </Link>
            )}
          </div>
        </div>
        {hasChildren &&
          category.children?.map((child) => renderCategory(child, level + 1))}
      </div>
    );
  };

  return <div className="space-y-2">{categories.map((cat) => renderCategory(cat))}</div>;
};

export default CategoryTree;