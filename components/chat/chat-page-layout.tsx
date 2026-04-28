'use client';

import { useState, type ReactNode } from 'react';
import useSWR from 'swr';
import { ResizablePanels } from '@/components/chat/resizable-panels';
import { HistoryDrawer } from '@/components/chat/history-drawer';

type ChatPageLayoutProps = {
  header?: ReactNode;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
};

export function ChatPageLayout({
  header,
  leftPanel,
  rightPanel,
}: ChatPageLayoutProps) {
  const [mobileView, setMobileView] = useState<'chat' | 'preview'>('chat');
  const { data: sidebarOpen } = useSWR<boolean>('sidebar-open', null, { fallbackData: true });

  return (
    <div className="dark flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      {header}

      {/* Main content area */}
      <div className="relative flex min-h-0 flex-1">
        {/* Desktop: resizable split */}
        <div className="hidden min-h-0 flex-1 md:flex">
          <ResizablePanels
            defaultLeftWidth={42}
            storageKey="cenate-panel-width"
            minLeftWidth={35}
            maxLeftWidth={55}
            sidebarOpen={sidebarOpen ?? true}
          >
            {leftPanel}
            {rightPanel}
          </ResizablePanels>
        </div>

        {/* History drawer — slides over the left panel */}
        <HistoryDrawer />

        {/* Mobile: toggle between views */}
        <div className="flex w-full flex-1 flex-col overflow-hidden pb-16 md:hidden md:pb-0">
          {mobileView === 'chat' ? leftPanel : rightPanel}
        </div>
      </div>

      <MobileViewToggle activeView={mobileView} onChange={setMobileView} />
    </div>
  );
}

function MobileViewToggle({
  activeView,
  onChange,
}: {
  activeView: 'chat' | 'preview';
  onChange: (view: 'chat' | 'preview') => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-background px-4 py-3 md:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex w-full max-w-xs rounded-full border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => onChange('chat')}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeView === 'chat'
              ? 'bg-accent text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => onChange('preview')}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeView === 'preview'
              ? 'bg-accent text-foreground shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Preview
        </button>
      </div>
    </div>
  );
}
