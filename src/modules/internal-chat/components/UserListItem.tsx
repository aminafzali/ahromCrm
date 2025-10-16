"use client";

import DIcon from "@/@Client/Components/common/DIcon";

interface UserListItemProps {
  user: any;
  isOnline?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  unreadCount?: number;
  isSelf?: boolean;
}

export default function UserListItem({
  user,
  isOnline = false,
  isSelected = false,
  onClick,
  unreadCount = 0,
  isSelf = false,
}: UserListItemProps) {
  const displayName = user.displayName || user.user?.name || "کاربر";
  const roleName = user.role?.name || "کاربر";
  const isAdmin = roleName === "Admin";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-right ${
        isSelected
          ? "bg-blue-50 border border-blue-200"
          : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm ${
            isSelf
              ? "bg-gradient-to-br from-purple-500 to-pink-500"
              : isAdmin
              ? "bg-amber-500"
              : "bg-blue-500"
          }`}
        >
          {isSelf ? (
            <DIcon icon="fa-bookmark" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        {/* Online indicator */}
        {isOnline && !isSelf && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {isSelf ? "پیام‌های ذخیره شده" : displayName}
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          {isSelf ? (
            <span>Saved Messages</span>
          ) : (
            <>
              {isAdmin && (
                <DIcon icon="fa-crown" classCustom="text-amber-500" />
              )}
              <span>{roleName}</span>
            </>
          )}
        </div>
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div className="flex-shrink-0">
          <div className="min-w-[20px] h-5 px-1.5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        </div>
      )}
    </button>
  );
}
