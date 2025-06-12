import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";

interface InvoiceItemsProps {
  items: any[];
  onRemove: (index: number) => void;
}

export default function InvoiceItems({ items, onRemove }: InvoiceItemsProps) {
  if (items.length === 0) {
    return (
      <div className="bg-teal-50 border-2 border-dashed rounded-lg p-8 text-center text-gray-500">
        هیچ آیتمی به فاکتور اضافه نشده است
      </div>
    );
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "محصول";
      case "SERVICE":
        return "خدمت";
      default:
        return "متن آزاد";
    }
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-right">#</th>
              <th className="px-4 py-2 text-right">نوع</th>
              <th className="px-4 py-2 text-right">شرح</th>
              <th className="px-4 py-2 text-right">تعداد</th>
              <th className="px-4 py-2 text-right">قیمت واحد (تومان)</th>
              <th className="px-4 py-2 text-right">جمع (تومان)</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{getItemTypeLabel(item.itemType)}</td>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">{item.price.toLocaleString()}</td>

                <td className="px-4 py-2">
                  {(item.price * item.quantity).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="text-error"
                    icon={<DIcon icon="fa-trash" cdi={false} />}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
