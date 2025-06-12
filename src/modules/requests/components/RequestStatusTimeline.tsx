interface TimelineItem {
  id: string;
  title: string;
  content: string;
  date: string;
  icon?: string;
}

interface RequestStatusTimelineProps {
  items: TimelineItem[];
}

export default function RequestStatusTimeline({
  items,
}: RequestStatusTimelineProps) {
  return (
    <div>
      <div className="p-1">
        <h2 className="text-xl font-semibold mb-6">گزارش وضعیت</h2>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`relative pl-8 ${
                index !== items.length - 1 ? "pb-6" : ""
              }`}
            >
              {index !== items.length - 1 && (
                <div className="absolute left-3 top-4 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                {item.icon || "●"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                <p className="mt-2">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
