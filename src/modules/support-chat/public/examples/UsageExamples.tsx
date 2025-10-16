// Example usage patterns for SupportChatWidget

import dynamic from "next/dynamic";
import { useSupportPublicChat } from "../hooks/useSupportPublicChat";

// 1. Basic usage with automatic workspace detection
const BasicWidget = dynamic(() => import("../SupportChatWidget"), {
  ssr: false,
});

// 2. Custom configuration
const CustomWidget = dynamic(() => import("../SupportChatWidget"), {
  ssr: false,
});

// 3. Manual integration with custom UI
function CustomChatIntegration() {
  const { connect, disconnect, connected, messages, send, startOrResume } =
    useSupportPublicChat({
      workspaceSlug: "my-company",
      startEndpoint: "/api/support-chat/public/start",
    });

  const handleSendMessage = async (message: string) => {
    await startOrResume();
    send(message);
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => connect()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {connected ? "Connected" : "Connect to Chat"}
      </button>
    </div>
  );
}

// 4. Multiple widgets for different workspaces
function MultiWorkspaceExample() {
  return (
    <div>
      <BasicWidget workspaceSlug="company-a" />
      <BasicWidget workspaceSlug="company-b" />
    </div>
  );
}

// 5. Conditional rendering based on user type
function ConditionalWidget({ isGuest }: { isGuest: boolean }) {
  if (!isGuest) return null;

  return <BasicWidget />;
}

// 6. Custom styling wrapper
function StyledWidget() {
  return (
    <div className="custom-chat-container">
      <style jsx>{`
        .custom-chat-container :global(.chat-fab) {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          border-radius: 50px;
        }
        .custom-chat-container :global(.chat-panel) {
          border: 2px solid #4ecdc4;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      <BasicWidget />
    </div>
  );
}

export {
  BasicWidget,
  ConditionalWidget,
  CustomChatIntegration,
  CustomWidget,
  MultiWorkspaceExample,
  StyledWidget,
};
