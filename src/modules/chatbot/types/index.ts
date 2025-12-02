import {
  ChatbotActionStatus,
  ChatbotMessageRole,
  ChatbotSessionStatus,
} from "@prisma/client";

export type ChatbotIntent =
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "USER_SEARCH"
  | "USER_LIST"
  | "USER_VIEW"
  | "LABEL_CREATE"
  | "LABEL_UPDATE"
  | "LABEL_DELETE"
  | "LABEL_SEARCH"
  | "LABEL_LIST"
  | "LABEL_VIEW"
  | "GROUP_CREATE"
  | "GROUP_UPDATE"
  | "GROUP_DELETE"
  | "GROUP_SEARCH"
  | "GROUP_LIST"
  | "GROUP_VIEW"
  | "SMALL_TALK"
  | "UNKNOWN";

export interface QuickReplyOption {
  label: string;
  value: string;
  color?: string; // رنگ پس‌زمینه دکمه
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  quickReplies?: QuickReplyOption[]; // دکمه‌های پاسخ سریع برای پیام‌های chatbot
}

export interface ChatbotActionProgress {
  intent: ChatbotIntent;
  collectedData: Record<string, any>;
  missingFields?: string[];
  nextField?: string;
}

export interface ChatbotSessionContextState {
  progress?: ChatbotActionProgress | null;
  lastIntent?: ChatbotIntent | null;
}

export interface ChatbotCommandResult {
  reply: string;
  intent: ChatbotIntent;
  completed?: boolean;
  extractedData?: Record<string, any>;
  shouldAskForMore?: boolean;
  missingFields?: string[];
  quickReplies?: QuickReplyOption[]; // دکمه‌های پاسخ سریع
}

export interface ChatbotSessionDTO {
  id: number;
  workspaceId: number;
  workspaceUserId: number;
  status: ChatbotSessionStatus;
  currentIntent?: ChatbotIntent | null;
  context?: ChatbotSessionContextState | null;
  lastMessageAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotMessageDTO {
  id: number;
  sessionId: number;
  role: ChatbotMessageRole;
  content: string | null;
  intent?: ChatbotIntent | null;
  payload?: any;
  isError: boolean;
  createdAt: Date;
}

export interface ChatbotActionLogDTO {
  id: number;
  sessionId: number;
  actionType: string;
  status: ChatbotActionStatus;
  payload?: any;
  result?: any;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
