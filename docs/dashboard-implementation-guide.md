# 🚀 راهنمای سریع پیاده‌سازی دو ماژول در داشبورد

## 📋 چک‌لیست پیاده‌سازی

### مرحله 1: Migration دیتابیس ✅

```bash
# 1. کپی schema جدید
cp prisma/chat-schema-proposal-v2.prisma prisma/schema.prisma

# 2. اضافه کردن روابط به مدل‌های موجود
# ویرایش prisma/schema.prisma و اضافه کردن back-relations

# 3. ایجاد migration
npx prisma migrate dev --name add_chat_and_support_systems

# 4. تولید Prisma Client
npx prisma generate
```

### مرحله 2: ساختار فولدرها ✅

```
src/modules/
├── internal-chat/              # ✅ NEW
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── service/
│   ├── types/
│   └── views/
│
├── support/                    # ✅ NEW
│   ├── api/
│   │   ├── tickets/
│   │   ├── categories/
│   │   └── labels/
│   ├── components/
│   │   ├── admin/
│   │   └── public/
│   ├── hooks/
│   ├── service/
│   ├── types/
│   └── views/
│       ├── admin/
│       └── public/
│
└── chat/                       # ❌ قدیمی - پاک شود
```

---

## 📝 راهنمای گام به گام

### گام 1: ایجاد Internal Chat Module

#### 1.1 Types

```typescript
// src/modules/internal-chat/types/index.ts
import { ChatRoom, ChatRoomMember, ChatMessage } from "@prisma/client";

export type ChatRoomWithRelations = ChatRoom & {
  members?: ChatRoomMemberWithRelations[];
  messages?: ChatMessageWithRelations[];
  team?: any;
  project?: any;
  _count?: {
    members: number;
    messages: number;
  };
};

export type ChatRoomMemberWithRelations = ChatRoomMember & {
  workspaceUser: {
    displayName: string;
    user: { name: string };
  };
};

export type ChatMessageWithRelations = ChatMessage & {
  sender: {
    displayName: string;
    user: { name: string };
  };
  replyTo?: ChatMessage;
};
```

#### 1.2 Repository

```typescript
// src/modules/internal-chat/repo/InternalChatRepository.ts
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ChatRoomWithRelations } from "../types";

export class InternalChatRepository extends BaseRepository<
  ChatRoomWithRelations,
  number
> {
  constructor() {
    super("internal-chat");
  }

  // متدهای سفارشی
  async getMessages(roomId: number, params?: any) {
    return this.get(`${this.slug}/${roomId}/messages`, params);
  }

  async sendMessage(
    roomId: number,
    data: { body: string; replyToId?: number }
  ) {
    return this.post(`${this.slug}/${roomId}/messages`, data);
  }

  async getResources(roomId: number, includeProject: boolean = true) {
    return this.get(`${this.slug}/${roomId}/resources`, { includeProject });
  }

  async linkDocument(roomId: number, documentId: number, note?: string) {
    return this.post(`${this.slug}/${roomId}/resources/documents`, {
      documentId,
      note,
    });
  }
}
```

#### 1.3 Hook

```typescript
// src/modules/internal-chat/hooks/useInternalChat.ts
"use client";

import { InternalChatRepository } from "../repo/InternalChatRepository";
import { useCrud } from "@/@Client/hooks/useCrud";

const repo = new InternalChatRepository();

export function useInternalChat() {
  const crud = useCrud(repo);

  return {
    ...crud,
    repo,
    // متدهای اضافی
    getMessages: (roomId: number, params?: any) =>
      repo.getMessages(roomId, params),
    sendMessage: (roomId: number, data: any) => repo.sendMessage(roomId, data),
    getResources: (roomId: number, includeProject?: boolean) =>
      repo.getResources(roomId, includeProject),
    linkDocument: (roomId: number, documentId: number, note?: string) =>
      repo.linkDocument(roomId, documentId, note),
  };
}
```

#### 1.4 Service (Server)

```typescript
// src/modules/internal-chat/service/InternalChatService.ts
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  type: z.enum(["DIRECT", "TEAM", "GROUP", "PROJECT"]),
  title: z.string().optional(),
  teamId: z.number().optional(),
  projectId: z.number().optional(),
  memberIds: z.array(z.number()).optional(),
});

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isArchived: z.boolean().optional(),
});

class InternalChatRepo extends BaseRepository<any> {
  constructor() {
    super("chatRoom");
  }

  // Override findAll برای فیلتر workspace
  async findAll(params: any): Promise<any> {
    const { filters, ...rest } = params;

    return super.findAll({
      ...rest,
      filters: {
        ...filters,
        // فقط اتاق‌هایی که کاربر عضو آنهاست
        members: {
          some: {
            workspaceUserId: filters?.userId,
            leftAt: null,
          },
        },
      },
    });
  }
}

export class InternalChatService extends BaseService<any> {
  constructor() {
    super(
      new InternalChatRepo(),
      createSchema,
      updateSchema,
      ["title"],
      ["members", "messages", "team", "project"]
    );
  }

  // Override create برای اضافه کردن اعضا
  async create(data: any, context: any): Promise<any> {
    const validated = this.validate(createSchema, data);

    return prisma.$transaction(async (tx) => {
      // 1. ساخت اتاق
      const room = await tx.chatRoom.create({
        data: {
          type: validated.type,
          title: validated.title,
          teamId: validated.teamId,
          projectId: validated.projectId,
          workspaceId: context.workspaceId,
          createdById: context.workspaceUser?.id,
        },
      });

      // 2. اضافه کردن اعضا
      if (validated.memberIds?.length) {
        await tx.chatRoomMember.createMany({
          data: validated.memberIds.map((userId: number, index: number) => ({
            roomId: room.id,
            workspaceUserId: userId,
            role: index === 0 ? "OWNER" : "MEMBER",
          })),
        });
      }

      // 3. پیام خوش‌آمدگویی
      await tx.chatMessage.create({
        data: {
          roomId: room.id,
          senderId: context.workspaceUser?.id,
          body: `اتاق ${room.title || "جدید"} ایجاد شد`,
          messageType: "SYSTEM",
        },
      });

      return room;
    });
  }

  // متد برای دریافت پیام‌ها
  async getMessages(roomId: number, params: any, context: any) {
    // چک عضویت
    const member = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: context.workspaceUser?.id,
        leftAt: null,
      },
    });

    if (!member) {
      throw new Error("شما عضو این اتاق نیستید");
    }

    const { page = 1, limit = 50 } = params;

    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: {
            displayName: true,
            user: { select: { name: true } },
          },
        },
        replyTo: true,
      },
    });

    const total = await prisma.chatMessage.count({ where: { roomId } });

    return {
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // متد برای ارسال پیام
  async sendMessage(roomId: number, data: any, context: any) {
    // چک عضویت
    const member = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: context.workspaceUser?.id,
        leftAt: null,
      },
    });

    if (!member) {
      throw new Error("شما عضو این اتاق نیستید");
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId: context.workspaceUser?.id,
        body: data.body,
        messageType: data.messageType || "TEXT",
        replyToId: data.replyToId,
        attachments: data.attachments,
        mentions: data.mentions,
      },
      include: {
        sender: {
          select: {
            displayName: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    // بروزرسانی lastActivityAt
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastActivityAt: new Date() },
    });

    return message;
  }

  // متد برای دریافت منابع (Documents, Tasks, Knowledge)
  async getResources(roomId: number, includeProject: boolean, context: any) {
    // چک عضویت
    const member = await prisma.chatRoomMember.findFirst({
      where: {
        roomId,
        workspaceUserId: context.workspaceUser?.id,
        leftAt: null,
      },
    });

    if (!member) {
      throw new Error("شما عضو این اتاق نیستید");
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: { projectId: true, workspaceId: true },
    });

    // دریافت اسناد
    const documents = await this.getRoomDocuments(roomId, room, includeProject);

    // دریافت وظایف
    const tasks = await this.getRoomTasks(roomId, room, includeProject);

    // دریافت دانش
    const knowledge = await this.getRoomKnowledge(roomId, room, includeProject);

    return { documents, tasks, knowledge };
  }

  private async getRoomDocuments(
    roomId: number,
    room: any,
    includeProject: boolean
  ) {
    const where: any = {};

    if (includeProject && room?.projectId) {
      where.OR = [
        { chatRooms: { some: { roomId } } },
        { entityType: "project", entityId: room.projectId },
      ];
    } else {
      where.chatRooms = { some: { roomId } };
    }

    return prisma.document.findMany({
      where,
      include: {
        chatRooms: {
          where: { roomId },
        },
        category: true,
      },
    });
  }

  private async getRoomTasks(
    roomId: number,
    room: any,
    includeProject: boolean
  ) {
    const where: any = {};

    if (includeProject && room?.projectId) {
      where.OR = [
        { chatRooms: { some: { roomId } } },
        { projectId: room.projectId },
      ];
    } else {
      where.chatRooms = { some: { roomId } };
    }

    return prisma.task.findMany({
      where,
      include: {
        status: true,
        chatRooms: {
          where: { roomId },
        },
      },
    });
  }

  private async getRoomKnowledge(
    roomId: number,
    room: any,
    includeProject: boolean
  ) {
    const where: any = { status: "PUBLISHED" };

    if (includeProject && room?.projectId) {
      where.OR = [
        { chatRooms: { some: { roomId } } },
        // فرض: دانش‌های پروژه با tag مشخص می‌شوند
      ];
    } else {
      where.chatRooms = { some: { roomId } };
    }

    return prisma.knowledge.findMany({
      where,
      include: {
        category: true,
        chatRooms: {
          where: { roomId },
        },
      },
    });
  }
}
```

#### 1.5 API Routes

```typescript
// src/modules/internal-chat/api/route.ts
import { NextRequest } from "next/server";
import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { InternalChatService } from "../service/InternalChatService";

const service = new InternalChatService();

class Controller extends BaseController<any> {
  constructor() {
    super(service, { members: true, messages: true }, true, true);
  }
}

const controller = new Controller();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
```

```typescript
// src/modules/internal-chat/api/[id]/messages/route.ts
import { NextRequest } from "next/server";
import { InternalChatService } from "../../../service/InternalChatService";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";

const service = new InternalChatService();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const context = await AuthProvider.isAuthenticated(req);
  const roomId = Number(params.id);

  const result = await service.getMessages(
    roomId,
    req.nextUrl.searchParams,
    context
  );

  return Response.json(result);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const context = await AuthProvider.isAuthenticated(req);
  const roomId = Number(params.id);
  const body = await req.json();

  const message = await service.sendMessage(roomId, body, context);

  return Response.json(message);
}
```

```typescript
// src/modules/internal-chat/api/[id]/resources/route.ts
import { NextRequest } from "next/server";
import { InternalChatService } from "../../../service/InternalChatService";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";

const service = new InternalChatService();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const context = await AuthProvider.isAuthenticated(req);
  const roomId = Number(params.id);
  const includeProject =
    req.nextUrl.searchParams.get("includeProject") === "true";

  const resources = await service.getResources(roomId, includeProject, context);

  return Response.json(resources);
}
```

#### 1.6 UI Components

```typescript
// src/modules/internal-chat/components/ChatInterface.tsx
"use client";

import { useState, useEffect } from "react";
import { useInternalChat } from "../hooks/useInternalChat";

export default function ChatInterface({ roomId }: { roomId: number }) {
  const { getMessages, sendMessage } = useInternalChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "messages" | "documents" | "tasks" | "knowledge"
  >("messages");

  useEffect(() => {
    loadMessages();
  }, [roomId]);

  const loadMessages = async () => {
    const result = await getMessages(roomId);
    setMessages(result.data);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage(roomId, { body: input });
    setInput("");
    loadMessages();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header با تب‌ها */}
      <div className="border-b">
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${activeTab === "messages" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            💬 پیام‌ها
          </button>
          <button
            className={`tab ${activeTab === "documents" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            📄 اسناد
          </button>
          <button
            className={`tab ${activeTab === "tasks" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            ✅ وظایف
          </button>
          <button
            className={`tab ${activeTab === "knowledge" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("knowledge")}
          >
            📚 دانش
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "messages" && (
          <div className="space-y-3">
            {messages.map((msg: any) => (
              <div key={msg.id} className="bg-base-200 p-3 rounded">
                <div className="font-bold">{msg.sender.displayName}</div>
                <div>{msg.body}</div>
                <div className="text-xs opacity-70">{msg.createdAt}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "documents" && <DocumentsTab roomId={roomId} />}
        {activeTab === "tasks" && <TasksTab roomId={roomId} />}
        {activeTab === "knowledge" && <KnowledgeTab roomId={roomId} />}
      </div>

      {/* Input (فقط برای تب پیام‌ها) */}
      {activeTab === "messages" && (
        <div className="border-t p-4 flex gap-2">
          <input
            className="input input-bordered flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="پیام خود را بنویسید..."
          />
          <button className="btn btn-primary" onClick={handleSend}>
            ارسال
          </button>
        </div>
      )}
    </div>
  );
}
```

#### 1.7 View Page

```typescript
// src/modules/internal-chat/views/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useInternalChat } from "../hooks/useInternalChat";
import ChatInterface from "../components/ChatInterface";

export default function InternalChatPage() {
  const { getAll } = useInternalChat();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const result = await getAll();
    setRooms(result.data);
    if (result.data.length > 0) {
      setSelectedRoom(result.data[0].id);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-l bg-base-100 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold">چت تیمی</h2>
        </div>

        {rooms.map((room: any) => (
          <button
            key={room.id}
            className={`w-full p-4 text-right hover:bg-base-200 ${
              selectedRoom === room.id ? "bg-base-200" : ""
            }`}
            onClick={() => setSelectedRoom(room.id)}
          >
            <div className="font-bold">{room.title}</div>
            <div className="text-sm opacity-70">{room.type}</div>
          </button>
        ))}
      </div>

      {/* Main Area */}
      <div className="flex-1">
        {selectedRoom ? (
          <ChatInterface roomId={selectedRoom} />
        ) : (
          <div className="flex items-center justify-center h-full">
            اتاقی انتخاب نشده
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### گام 2: ایجاد Support Module

#### 2.1 Types

```typescript
// src/modules/support/types/index.ts
import {
  SupportTicket,
  SupportMessage,
  SupportGuestUser,
} from "@prisma/client";

export type SupportTicketWithRelations = SupportTicket & {
  guestUser?: SupportGuestUser;
  workspaceUser?: any;
  assignedTo?: any;
  messages?: SupportMessageWithRelations[];
  labels?: any[];
  _count?: {
    messages: number;
  };
};

export type SupportMessageWithRelations = SupportMessage & {
  supportAgent?: any;
  guestUser?: SupportGuestUser;
  workspaceUser?: any;
};
```

#### 2.2 Service

```typescript
// src/modules/support/service/SupportService.ts
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createTicketSchema = z.object({
  subject: z.string().min(3),
  description: z.string().optional(),
  guestInfo: z
    .object({
      userAgent: z.string(),
      fingerprint: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
});

class SupportRepo extends BaseRepository<any> {
  constructor() {
    super("supportTicket");
  }
}

export class SupportService extends BaseService<any> {
  constructor() {
    super(
      new SupportRepo(),
      createTicketSchema,
      z.object({}),
      ["subject"],
      ["guestUser", "workspaceUser", "messages", "assignedTo"]
    );
  }

  async createTicket(data: any, req: any, context?: any): Promise<any> {
    const validated = this.validate(createTicketSchema, data);

    // استخراج IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // دریافت اطلاعات جغرافیایی
    const geoData = await this.getGeoData(ip);

    return prisma.$transaction(async (tx) => {
      let guestUserId, workspaceUserId;

      if (!context?.user) {
        // کاربر مهمان
        const guestUser = await tx.supportGuestUser.create({
          data: {
            workspaceId: data.workspaceId,
            ipAddress: ip,
            country: geoData.country,
            city: geoData.city,
            userAgent: data.guestInfo?.userAgent,
            browser: this.parseBrowser(data.guestInfo?.userAgent),
            os: this.parseOS(data.guestInfo?.userAgent),
            device: this.parseDevice(data.guestInfo?.userAgent),
            fingerprint: data.guestInfo?.fingerprint,
            email: data.guestInfo?.email,
            name: data.guestInfo?.name,
          },
        });
        guestUserId = guestUser.id;
      } else {
        workspaceUserId = context.workspaceUser?.id;
      }

      // ساخت شماره تیکت
      const ticketNumber = await this.generateTicketNumber(
        tx,
        data.workspaceId
      );

      // ایجاد تیکت
      const ticket = await tx.supportTicket.create({
        data: {
          workspaceId: data.workspaceId,
          ticketNumber,
          subject: validated.subject,
          description: validated.description,
          guestUserId,
          workspaceUserId,
          priority: "MEDIUM",
          status: "OPEN",
        },
        include: {
          guestUser: true,
          workspaceUser: true,
        },
      });

      // پیام خوش‌آمدگویی
      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          body: `تیکت ${ticketNumber} ایجاد شد. به زودی پشتیبانان پاسخ خواهند داد.`,
          messageType: "SYSTEM",
          isInternal: false,
        },
      });

      // تاریخچه
      await tx.supportTicketHistory.create({
        data: {
          ticketId: ticket.id,
          action: "CREATED",
          note: `تیکت توسط ${guestUserId ? "مهمان" : "کاربر"} ایجاد شد`,
        },
      });

      return ticket;
    });
  }

  private async generateTicketNumber(
    tx: any,
    workspaceId: number
  ): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.supportTicket.count({
      where: {
        workspaceId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    });

    const number = (count + 1).toString().padStart(5, "0");
    return `TKT-${year}-${number}`;
  }

  private async getGeoData(ip: string) {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      return await response.json();
    } catch {
      return {};
    }
  }

  private parseBrowser(ua: string = "") {
    // استفاده از ua-parser-js یا regex ساده
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    return "Unknown";
  }

  private parseOS(ua: string = "") {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS")) return "iOS";
    return "Unknown";
  }

  private parseDevice(ua: string = "") {
    if (ua.includes("Mobile")) return "mobile";
    if (ua.includes("Tablet")) return "tablet";
    return "desktop";
  }
}
```

#### 2.3 API Route

```typescript
// src/modules/support/api/tickets/route.ts
import { NextRequest } from "next/server";
import { SupportService } from "../../service/SupportService";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";

const service = new SupportService();

export async function GET(req: NextRequest) {
  const context = await AuthProvider.isAuthenticated(req);

  const params = {
    page: Number(req.nextUrl.searchParams.get("page")) || 1,
    limit: Number(req.nextUrl.searchParams.get("limit")) || 20,
    filters: {
      workspaceId: context.workspaceId,
      status: req.nextUrl.searchParams.get("status"),
      priority: req.nextUrl.searchParams.get("priority"),
      assignedToId: req.nextUrl.searchParams.get("assignedToId"),
    },
  };

  const result = await service.getAll(params);
  return Response.json(result);
}

export async function POST(req: NextRequest) {
  const context = await AuthProvider.isAuthenticated(req, false); // مهمان هم OK
  const body = await req.json();

  const ticket = await service.createTicket(body, req, context);

  return Response.json(ticket, { status: 201 });
}
```

---

### گام 3: اضافه کردن به منوی داشبورد

```typescript
// lib/data.tsx

export const adminMenuItems = [
  // ... existing items

  {
    id: "communication",
    label: "ارتباطات",
    icon: <DIcon icon="fa-comments" />,
    submenu: [
      {
        id: "internal-chat",
        label: "چت تیمی",
        icon: <DIcon icon="fa-users" />,
        href: "/dashboard/internal-chat",
      },
      {
        id: "support",
        label: "پشتیبانی",
        icon: <DIcon icon="fa-headset" />,
        href: "/dashboard/support",
      },
    ],
  },
];
```

---

### گام 4: صفحات داشبورد

```typescript
// src/app/dashboard/internal-chat/page.tsx
import InternalChatPage from "@/modules/internal-chat/views/page";

export default function Page() {
  return <InternalChatPage />;
}
```

```typescript
// src/app/dashboard/support/page.tsx
import SupportAdminPage from "@/modules/support/views/admin/page";

export default function Page() {
  return <SupportAdminPage />;
}
```

```typescript
// src/app/(root)/[slug]/support/page.tsx
import SupportPublicPage from "@/modules/support/views/public/page";

export default async function Page({ params }: { params: { slug: string } }) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.slug },
  });

  return <SupportPublicPage workspaceId={workspace!.id} />;
}
```

---

## ✅ چک‌لیست نهایی

- [ ] Migration اجرا شد
- [ ] Internal Chat Module ساخته شد
- [ ] Support Module ساخته شد
- [ ] API Routes تست شدند
- [ ] منوی داشبورد به‌روز شد
- [ ] UI Components کامل شدند
- [ ] Socket.io برای real-time اضافه شد (اختیاری)
- [ ] مستندات خوانده شد
- [ ] ماژول قدیمی (`modules/chat`) پاک شد

---

**موفق باشید! 🚀**
