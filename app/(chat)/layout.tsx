import Script from "next/script";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { DataStreamHandler } from "@/components/chat/data-stream-handler";
import { ChatRouteLayoutSwitcher } from "@/components/home/chat-route-layout-switcher";
import { ActiveChatProvider } from "@/hooks/use-active-chat";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="lazyOnload"
      />
      <DataStreamProvider>
        <Toaster
          position="top-center"
          theme="system"
          toastOptions={{
            className:
              "!bg-card !text-foreground/90 !border-border !shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
          }}
        />
        <Suspense fallback={<div className="flex h-dvh bg-background" />}>
          <ActiveChatProvider>
            <ChatRouteLayoutSwitcher>{children}</ChatRouteLayoutSwitcher>
          </ActiveChatProvider>
        </Suspense>
        <DataStreamHandler />
      </DataStreamProvider>
    </>
  );
}
