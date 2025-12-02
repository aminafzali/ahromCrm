import ChatbotPanel from "@/modules/chatbot/components/ChatbotPanel";

export default function ChatbotPage() {
  return (
    <div className="h-[calc(100vh-200px)] min-h-[600px] max-h-[calc(100vh-200px)] overflow-hidden">
      <ChatbotPanel />
    </div>
  );
}
