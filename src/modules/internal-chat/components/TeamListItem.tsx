"use client";

import DIcon from "@/@Client/Components/common/DIcon";

interface TeamListItemProps {
  team: any;
  isSelected?: boolean;
  membersCount?: number;
  onClick?: () => void;
}

export default function TeamListItem({
  team,
  isSelected = false,
  membersCount,
  onClick,
}: TeamListItemProps) {
  const teamName = team.name || "گروه";
  const description = team.description || "";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right ${
        isSelected ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
      }`}
    >
      {/* Team Icon */}
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <DIcon icon="fa-users" classCustom="text-white text-sm" />
      </div>

      {/* Team info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {teamName}
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          {membersCount !== undefined && (
            <span className="flex items-center gap-1">
              <DIcon icon="fa-user" classCustom="text-gray-400" />
              {membersCount}
            </span>
          )}
          {description && <span className="truncate">{description}</span>}
        </div>
      </div>

      {/* Badge for team type (optional) */}
      <div className="flex-shrink-0">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
      </div>
    </button>
  );
}
