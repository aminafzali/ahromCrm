"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useState } from "react";
import TeamListItem from "./TeamListItem";
import UserListItem from "./UserListItem";

interface ContactsListProps {
  users: any[];
  teams: any[];
  selectedId?: number | null;
  selectedType?: "user" | "team" | null;
  onSelectUser: (user: any) => void;
  onSelectTeam: (team: any) => void;
  onlineUsers?: number[];
  unreadCounts?: { [key: number]: number };
  currentUserId?: number;
}

export default function ContactsList({
  users = [],
  teams = [],
  selectedId,
  selectedType,
  onSelectUser,
  onSelectTeam,
  onlineUsers = [],
  unreadCounts = {},
  currentUserId,
}: ContactsListProps) {
  const [activeTab, setActiveTab] = useState<"users" | "teams">("users");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users
  const filteredUsers = users.filter((user) => {
    const name = user.displayName || user.user?.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    const name = team.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-900 mb-4">گفتگوها</h2>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <DIcon
            icon="fa-search"
            classCustom="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "users"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <DIcon icon="fa-user" classCustom="ml-2" />
            کاربران ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "teams"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <DIcon icon="fa-users" classCustom="ml-2" />
            گروه‌ها ({filteredTeams.length})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "users" && (
          <div className="p-3 space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <DIcon icon="fa-user-slash" classCustom="text-3xl mb-2" />
                <p>کاربری یافت نشد</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  isOnline={onlineUsers.includes(user.id)}
                  isSelected={selectedType === "user" && selectedId === user.id}
                  onClick={() => onSelectUser(user)}
                  unreadCount={unreadCounts[user.id] || 0}
                  isSelf={user.id === currentUserId}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "teams" && (
          <div className="p-3 space-y-1">
            {filteredTeams.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <DIcon icon="fa-users-slash" classCustom="text-3xl mb-2" />
                <p>گروهی یافت نشد</p>
              </div>
            ) : (
              filteredTeams.map((team) => (
                <TeamListItem
                  key={team.id}
                  team={team}
                  isSelected={selectedType === "team" && selectedId === team.id}
                  membersCount={team._count?.members}
                  onClick={() => onSelectTeam(team)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer - New Chat Button */}
      <div className="p-3 border-t">
        <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
          <DIcon icon="fa-plus" classCustom="ml-2" />
          گفتگوی جدید
        </button>
      </div>
    </div>
  );
}
