"use client";

import DIcon from "@/@Client/Components/common/DIcon";

interface TicketStatsProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

export default function TicketStats({ stats }: TicketStatsProps) {
  const cards = [
    {
      label: "کل تیکت‌ها",
      value: stats.total,
      icon: "fa-ticket-alt",
      color: "bg-blue-500",
    },
    {
      label: "باز",
      value: stats.open,
      icon: "fa-folder-open",
      color: "bg-yellow-500",
    },
    {
      label: "در حال بررسی",
      value: stats.inProgress,
      icon: "fa-spinner",
      color: "bg-purple-500",
    },
    {
      label: "حل شده",
      value: stats.resolved,
      icon: "fa-check-circle",
      color: "bg-green-500",
    },
    {
      label: "بسته شده",
      value: stats.closed,
      icon: "fa-times-circle",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white`}
            >
              <DIcon icon={card.icon} classCustom="text-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
