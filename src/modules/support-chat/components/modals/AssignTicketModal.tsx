"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Input, Modal, Select } from "ndui-ahrom";
import React, { useCallback, useEffect, useState } from "react";
import { SupportTicketWithRelations } from "../../types";

// Types
interface AssignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignToId: number) => void;
  ticket: SupportTicketWithRelations | null;
  className?: string;
}

interface Agent {
  id: number;
  displayName: string;
  user: {
    name: string;
    email: string;
  };
  isOnline?: boolean;
  lastActiveAt?: string;
  currentTicketCount?: number;
}

interface AgentOption {
  value: number;
  label: string;
  description: string;
  isOnline: boolean;
  currentTicketCount: number;
}

// Constants
const SORT_OPTIONS = [
  { value: "name", label: "نام" },
  { value: "ticketCount", label: "تعداد تیکت‌ها" },
  { value: "lastActive", label: "آخرین فعالیت" },
  { value: "online", label: "وضعیت آنلاین" },
];

// Helper Functions
const getAgentStatus = (agent: Agent) => {
  if (agent.isOnline) {
    return {
      text: "آنلاین",
      color: "text-green-600 bg-green-100 dark:bg-green-900/20",
      icon: "fa-circle",
    };
  }

  if (agent.lastActiveAt) {
    const lastActive = new Date(agent.lastActiveAt);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 5) {
      return {
        text: "اخیراً آنلاین",
        color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
        icon: "fa-clock",
      };
    } else if (diffMinutes < 60) {
      return {
        text: `${diffMinutes} دقیقه پیش`,
        color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
        icon: "fa-clock",
      };
    } else {
      return {
        text: "آفلاین",
        color: "text-gray-600 bg-gray-100 dark:bg-gray-900/20",
        icon: "fa-circle",
      };
    }
  }

  return {
    text: "نامشخص",
    color: "text-gray-600 bg-gray-100 dark:bg-gray-900/20",
    icon: "fa-question-circle",
  };
};

// Sub-components
const AgentCard: React.FC<{
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ agent, isSelected, onSelect }) => {
  const status = getAgentStatus(agent);

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
          : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
            {agent.displayName?.charAt(0).toUpperCase() || "ن"}
          </div>
          {agent.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {agent.displayName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
              <DIcon icon={status.icon} classCustom="w-3 h-3 ml-1" />
              {status.text}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {agent.user.email}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <DIcon icon="fa-ticket-alt" classCustom="w-3" />
              {agent.currentTicketCount || 0} تیکت فعال
            </span>
          </div>
        </div>

        {isSelected && (
          <div className="text-teal-500">
            <DIcon icon="fa-check-circle" />
          </div>
        )}
      </div>
    </div>
  );
};

const AgentList: React.FC<{
  agents: Agent[];
  selectedAgentId: number | null;
  onSelectAgent: (agentId: number) => void;
  searchQuery: string;
  sortBy: string;
}> = ({ agents, selectedAgentId, onSelectAgent, searchQuery, sortBy }) => {
  const filteredAndSortedAgents = React.useMemo(() => {
    const filtered = agents.filter(
      (agent) =>
        agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.displayName.localeCompare(b.displayName, "fa");
        case "ticketCount":
          return (a.currentTicketCount || 0) - (b.currentTicketCount || 0);
        case "lastActive":
          if (!a.lastActiveAt || !b.lastActiveAt) return 0;
          return (
            new Date(b.lastActiveAt).getTime() -
            new Date(a.lastActiveAt).getTime()
          );
        case "online":
          if (a.isOnline === b.isOnline) return 0;
          return a.isOnline ? -1 : 1;
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchQuery, sortBy]);

  if (filteredAndSortedAgents.length === 0) {
    return (
      <div className="text-center py-8">
        <DIcon icon="fa-search" classCustom="text-3xl text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery ? "هیچ کارشناسی یافت نشد" : "هیچ کارشناسی در دسترس نیست"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {filteredAndSortedAgents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isSelected={selectedAgentId === agent.id}
          onSelect={() => onSelectAgent(agent.id)}
        />
      ))}
    </div>
  );
};

// Main Component
const AssignTicketModal: React.FC<AssignTicketModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  ticket,
  className = "",
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("online");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Load agents
  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/support-chat/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.data || []);
      }
    } catch (error) {
      console.error("Error loading agents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle assign
  const handleAssign = useCallback(async () => {
    if (!selectedAgentId || !ticket) return;

    setAssigning(true);
    try {
      await onAssign(selectedAgentId);
      onClose();
    } catch (error) {
      console.error("Error assigning ticket:", error);
    } finally {
      setAssigning(false);
    }
  }, [selectedAgentId, ticket, onAssign, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedAgentId(null);
      setSearchQuery("");
      loadAgents();
    }
  }, [isOpen, loadAgents]);

  if (!ticket) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تخصیص تیکت به کارشناس"
      size="lg"
    >
      <div className="space-y-6">
        {/* Ticket Info */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              #{ticket.ticketNumber}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {ticket.subject}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            این تیکت به کارشناس منتخب تخصیص خواهد یافت
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="جستجو در کارشناسان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              name="search"
            />
          </div>
          <div className="w-48">
            <Select
              name="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={SORT_OPTIONS}
              placeholder="مرتب‌سازی"
            />
          </div>
        </div>

        {/* Agents List */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            انتخاب کارشناس
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <DIcon
                icon="fa-spinner"
                classCustom="animate-spin text-2xl text-gray-400 mb-3"
              />
              <p className="text-gray-500 dark:text-gray-400">
                در حال بارگذاری...
              </p>
            </div>
          ) : (
            <AgentList
              agents={agents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
              searchQuery={searchQuery}
              sortBy={sortBy}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
          <Button onClick={onClose} variant="ghost" disabled={assigning}>
            انصراف
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedAgentId || assigning}
            loading={assigning}
          >
            {assigning ? "در حال تخصیص..." : "تخصیص تیکت"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignTicketModal;
export type { AssignTicketModalProps };
