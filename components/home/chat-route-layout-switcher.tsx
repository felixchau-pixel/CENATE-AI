"use client";

import { usePathname } from "next/navigation";
import { ChatPageLayout } from "@/components/chat/chat-page-layout";
import { LeftChatPanel } from "@/components/chat/left-chat-panel";
import { RightNavPanel } from "@/components/chat/right-nav-panel";
import { WorkspaceHeader } from "@/components/chat/workspace-header";

export function ChatRouteLayoutSwitcher({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (!pathname.startsWith("/chat/")) {
    return <>{children}</>;
  }

  return (
    <>
      <ChatPageLayout
        header={<WorkspaceHeader />}
        leftPanel={<LeftChatPanel />}
        rightPanel={<RightNavPanel />}
      />
      {children}
    </>
  );
}
