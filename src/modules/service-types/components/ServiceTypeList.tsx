import { useEffect, useState } from 'react';
import { useServiceType } from '../hooks/useServiceType';
import { Card } from 'ndui-ahrom';
import DIcon from '@/@Client/Components/common/DIcon';

export default function ServiceTypeList() {
  const { getAll, loading, error } = useServiceType();
  const [services, setServices] = useState<any>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getAll();
      setServices(response?.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        خطا در دریافت لیست خدمات
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {services.map((service: any) => (
        <Card key={service.id} className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <DIcon icon="fa-wrench" classCustom="text-2xl text-primary" />
              <h3 className="text-xl font-bold ml-2">{service.name}</h3>
            </div>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="text-primary font-bold">
              قیمت پایه: {service.basePrice.toLocaleString()} تومان
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}