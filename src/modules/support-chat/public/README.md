# Public Support Chat Widget

A floating action button (FAB) widget that allows unregistered website visitors to chat with support staff without requiring registration.

## Features

- **No Registration Required**: Guests can chat immediately without creating an account
- **Persistent Sessions**: Chat sessions persist across page reloads using localStorage
- **Real-time Communication**: Uses Socket.IO for instant messaging
- **Floating Action Button**: Clean, unobtrusive UI that doesn't interfere with site content
- **Responsive Design**: Works on desktop and mobile devices
- **RTL Support**: Properly aligned for Persian/Arabic text

## Quick Start

### 1. Mount the Widget

Add the widget to your public pages by importing it in your layout:

```tsx
// src/app/(root)/[slug]/layout.tsx
import dynamic from "next/dynamic";

const SupportChatWidget = dynamic(
  () => import("@/modules/support-chat/public/SupportChatWidget"),
  { ssr: false }
);

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <BaseToolBar />
      <main className="flex-grow container mx-auto px-2">{children}</main>
      <Footer />
      <SupportChatWidget workspaceSlug="your-workspace-slug" />
    </div>
  );
}
```

### 2. Configure Workspace

The widget automatically detects the workspace from the URL slug, but you can also pass it explicitly:

```tsx
<SupportChatWidget workspaceSlug="my-company" />
```

## API Reference

### SupportChatWidget Props

```tsx
interface SupportChatWidgetProps {
  workspaceSlug?: string; // Optional workspace slug hint
}
```

### useSupportPublicChat Hook

```tsx
const {
  connect, // Connect to socket
  disconnect, // Disconnect from socket
  connected, // Connection status
  joining, // Joining room status
  messages, // Array of messages
  ticketId, // Current ticket ID
  guestId, // Current guest ID
  startOrResume, // Start or resume chat session
  join, // Join ticket room
  send, // Send message
} = useSupportPublicChat({
  startEndpoint: "/api/support-chat/public/start", // Optional custom endpoint
  workspaceSlug: "my-workspace", // Optional workspace hint
});
```

## How It Works

### 1. Guest Identification

- Each visitor gets a unique `guestId` stored in localStorage
- If no `guestId` exists, a new one is created via API call
- Guest information is stored in the database for tracking

### 2. Ticket Management

- Each chat session creates a `SupportTicket` in the database
- Tickets are linked to guests and workspaces
- Only one open ticket per guest per workspace

### 3. Message Flow

1. User types message and clicks send
2. Message is optimistically added to UI with `tempId`
3. Message is sent via Socket.IO to server
4. Server persists message and broadcasts to room
5. Client receives persisted message and replaces temp message

### 4. Persistence

- `guestId` and `ticketId` are stored in localStorage
- Sessions survive page reloads and browser restarts
- Messages are stored in database for admin review

## Database Schema

The widget uses these database models:

```prisma
model Guest {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userAgent String?
  locale    String?
  tickets   SupportTicket[]
}

model SupportTicket {
  id          Int      @id @default(autoincrement())
  guestId     String
  workspaceId Int
  status      String   @default("open")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  guest     Guest      @relation(fields: [guestId], references: [id])
  workspace Workspace  @relation(fields: [workspaceId], references: [id])
  messages  SupportMessage[]
}

model SupportMessage {
  id        Int      @id @default(autoincrement())
  ticketId  Int
  body      String
  isInternal Boolean @default(false)
  createdAt DateTime @default(now())

  ticket SupportTicket @relation(fields: [ticketId], references: [id])
}
```

## Socket Events

### Client → Server

- `support-chat:join` - Join a ticket room
- `support-chat:message` - Send a message

### Server → Client

- `support-chat:message` - Receive a message
- `support-chat:error` - Error occurred

## Styling

The widget uses Tailwind CSS classes and can be customized by modifying the component:

```tsx
// Customize FAB position
<div className="fixed bottom-6 left-6 z-50">
  {/* FAB content */}
</div>

// Customize chat panel
<div className="fixed bottom-24 left-6 w-80 h-96 bg-white rounded-lg shadow-lg">
  {/* Chat content */}
</div>
```

## Error Handling

The widget handles common errors gracefully:

- **Network Issues**: Shows connection status
- **Invalid Workspace**: Displays error message
- **Message Send Failures**: Retries automatically
- **Session Expired**: Creates new session

## Security Considerations

- Guests cannot access internal admin functions
- Messages are validated on server side
- Rate limiting should be implemented for production
- Consider adding CAPTCHA for spam prevention

## Troubleshooting

### Widget Not Appearing

1. Check that `ssr: false` is set in dynamic import
2. Verify workspace slug is correct
3. Check browser console for errors

### Messages Not Sending

1. Verify Socket.IO connection is established
2. Check network tab for API errors
3. Ensure ticket is properly created

### Session Not Persisting

1. Check localStorage is enabled
2. Verify `guestId` and `ticketId` are being stored
3. Check for localStorage quota exceeded

## Production Checklist

- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Test on mobile devices
- [ ] Verify RTL text alignment
- [ ] Add analytics tracking
- [ ] Configure proper logging levels
