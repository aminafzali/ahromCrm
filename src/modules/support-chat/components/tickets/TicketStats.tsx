"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React from "react";

// Types
interface TicketStatsData {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface TicketStatsProps {
  stats: TicketStatsData;
  className?: string;
}

interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}

// Constants
const STAT_CARDS: Omit<StatCard, "value">[] = [
  {
    label: "کل تیکت‌ها",
    icon: "fa-ticket-alt",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    label: "باز",
    icon: "fa-folder-open",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    label: "در حال بررسی",
    icon: "fa-spinner",
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    label: "حل شده",
    icon: "fa-check-circle",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    label: "بسته شده",
    icon: "fa-times-circle",
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
  },
];

// Components
const StatCard: React.FC<StatCard> = ({
  label,
  value,
  icon,
  color,
  bgColor,
}) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 hover:shadow-md transition-all duration-200 hover:scale-105">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString("fa-IR")}
        </p>
      </div>
      <div
        className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
      >
        <DIcon icon={icon} classCustom={`text-xl ${color}`} />
      </div>
    </div>
  </div>
);

// Main Component
const TicketStats: React.FC<TicketStatsProps> = ({ stats, className = "" }) => {
  const statValues = [
    stats.total,
    stats.open,
    stats.inProgress,
    stats.resolved,
    stats.closed,
  ];

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}
    >
      {STAT_CARDS.map((card, index) => (
        <StatCard key={card.label} {...card} value={statValues[index]} />
      ))}
    </div>
  );
};

export default TicketStats;
export type { TicketStatsData, TicketStatsProps };
