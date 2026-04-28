'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import useSWR from 'swr';
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  FileSearch,
  FolderOpen,
  Gift,
  Globe,
  HelpCircle,
  Info,
  Link2,
  LogOut,
  Monitor,
  Moon,
  PanelLeft,
  Pencil,
  PlusCircle,
  RefreshCw,
  Share2,
  Shuffle,
  Smartphone,
  Star,
  Settings,
  Tablet,
  Zap,
} from 'lucide-react';
import { useArtifactViewMode, type UIArtifact } from './artifact';
import { useActiveChat } from '@/hooks/use-active-chat';
import { buildIframeDoc } from './project-runtime-preview';
import { isProjectContent, parseProjectContent } from '@/lib/project-manifest';

type Viewport = 'desktop' | 'tablet' | 'mobile';

type WorkspaceHeaderProps = {
  projectName?: string;
};

const HEADER_TOOLS = [
  { id: 'analytics', label: 'Analytics (coming soon)', icon: BarChart3 },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'design', label: 'Design (coming soon)', icon: FileSearch },
  { id: 'speed', label: 'Speed (coming soon)', icon: Activity },
];

const MENU_ITEM_CLS =
  'flex w-full items-center gap-2.5 px-3 py-[7px] text-[13px] text-foreground hover:bg-accent transition-colors text-left';

const SEPARATOR = <div className="my-1 h-px bg-border" />;

export function WorkspaceHeader({ projectName }: WorkspaceHeaderProps) {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const { viewMode, setViewMode } = useArtifactViewMode();
  const { chatTitle } = useActiveChat();
  const { data: session } = useSession();

  // Sidebar open/close state (shared via SWR)
  const { data: sidebarOpen, mutate: mutateSidebar } = useSWR<boolean>(
    'sidebar-open', null, { fallbackData: true }
  );

  // History drawer open/close state (shared via SWR)
  const { data: historyOpen, mutate: mutateHistory } = useSWR<boolean>(
    'history-open', null, { fallbackData: false }
  );

  // Viewport mode state (shared via SWR)
  const { data: viewport, mutate: mutateViewport } = useSWR<Viewport>(
    'preview-viewport', null, { fallbackData: 'desktop' }
  );

  // Preview reload counter (shared via SWR)
  const { data: reloadCounter, mutate: mutateReload } = useSWR<number>(
    'preview-reload-counter', null, { fallbackData: 0 }
  );

  // Artifact data for open-in-new-tab
  const { data: artifactData } = useSWR<UIArtifact>('artifact');

  const displayTitle = projectName ?? chatTitle ?? 'Untitled Project';
  const email = session?.user?.email ?? '';
  const rawUsername = email ? email.split('@')[0] : 'Guest';
  const username =
    rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
  const initials = rawUsername ? rawUsername.slice(0, 2).toUpperCase() : 'U';
  const planLabel =
    session?.user?.type === 'regular' ? 'Free' : 'Guest';

  const currentViewport = viewport ?? 'desktop';
  const ViewportIcon =
    currentViewport === 'desktop' ? Monitor : currentViewport === 'tablet' ? Tablet : Smartphone;

  const cycleViewport = () => {
    const next: Viewport =
      currentViewport === 'desktop' ? 'tablet' : currentViewport === 'tablet' ? 'mobile' : 'desktop';
    mutateViewport(next, { revalidate: false });
  };

  const handleReload = () => {
    mutateReload((c) => (c ?? 0) + 1, { revalidate: false });
  };

  const handleOpenInNewTab = () => {
    if (!artifactData?.content) return;
    let html: string;
    if (isProjectContent(artifactData.content)) {
      const parsed = parseProjectContent(artifactData.content);
      html = buildIframeDoc(parsed.files);
    } else {
      html = artifactData.content;
    }
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    // Revoke after a short delay to allow the tab to load
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const closeMenu = () => setShowProjectMenu(false);

  return (
    <nav className="hidden h-12 shrink-0 items-center border-b border-border/30 px-4 bg-background md:flex">
      <div className="w-full flex items-center justify-between min-w-0">

        {/* ── Left cluster ─────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2" style={{ width: '34%' }}>

          {/* Project title button → opens project menu */}
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => setShowProjectMenu((v) => !v)}
              className="group flex items-center gap-2 outline-none hover:opacity-80 transition-opacity min-w-0"
            >
              <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded bg-orange-500/90">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <div className="flex min-w-0 flex-col items-start">
                <div className="flex min-w-0 items-center gap-1">
                  <span className="truncate text-sm font-medium leading-none text-foreground">
                    {displayTitle}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-foreground/50 transition-transform duration-150 ${
                      showProjectMenu ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <p className="truncate text-[11px] text-muted-foreground leading-none mt-0.5">
                  Previewing last saved version
                </p>
              </div>
            </button>

            {/* ── Project dropdown ── */}
            {showProjectMenu && (
              <>
                {/* Invisible backdrop — closes menu on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={closeMenu}
                />

                <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-68 overflow-hidden rounded-xl border border-border bg-card shadow-2xl py-1">

                  {/* Go to Dashboard */}
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className={MENU_ITEM_CLS}
                  >
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    Go to Dashboard
                  </Link>

                  {SEPARATOR}

                  {/* User section */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-semibold text-white">
                        {initials}
                      </div>
                      <span className="truncate text-[13px] font-medium text-foreground max-w-35">
                        {username}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground">
                      {planLabel}
                    </span>
                  </div>

                  {SEPARATOR}

                  {/* Upgrade */}
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Gift className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Get free credits
                  </button>

                  {SEPARATOR}

                  {/* Settings & Connectors */}
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Settings
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      Ctrl&nbsp;.
                    </span>
                  </button>
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Connectors
                  </button>

                  {SEPARATOR}

                  {/* Project actions */}
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Shuffle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Remix this project
                  </button>
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Pencil className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Rename project
                  </button>
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Star className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Star project
                  </button>
                  <button type="button" className={MENU_ITEM_CLS}>
                    <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Move to folder
                  </button>
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Details
                  </button>

                  {SEPARATOR}

                  {/* Appearance & Help */}
                  <button type="button" className={MENU_ITEM_CLS}>
                    <Moon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Appearance
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </button>
                  <button type="button" className={MENU_ITEM_CLS}>
                    <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Help
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  {SEPARATOR}

                  {/* Sign out */}
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      signOut({ callbackUrl: '/early-access' });
                    }}
                    className={`${MENU_ITEM_CLS} text-muted-foreground hover:text-foreground`}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* History + Sidebar toggle */}
          <div className="flex items-center gap-1 sm:ml-auto sm:mr-2">
            <button
              type="button"
              onClick={() => mutateHistory((v) => !v, { revalidate: false })}
              className={`inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-accent transition-colors ${
                historyOpen ? 'bg-accent' : ''
              }`}
              aria-label="History"
              title="Chat history"
            >
              <Clock className="shrink-0 h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => mutateSidebar((v) => !(v ?? true), { revalidate: false })}
              className={`inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-accent transition-colors ${
                sidebarOpen === false ? 'text-muted-foreground' : ''
              }`}
              aria-label="Toggle sidebar"
              title="Toggle chat panel"
            >
              <PanelLeft className="shrink-0 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Center cluster ────────────────────────────────── */}
        <div className="relative flex w-full items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Preview pill */}
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors h-7 px-3 rounded-lg ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Globe className="shrink-0 h-4 w-4" />
              <span>Preview</span>
            </button>

            {/* Tool Icons Strip */}
            <div className="flex items-center gap-0.5">
              {HEADER_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={tool.id === 'code' ? () => setViewMode('code') : undefined}
                  className={`inline-flex items-center justify-center h-7 w-7 rounded-lg transition-colors ${
                    tool.id === 'code' && viewMode === 'code'
                      ? 'bg-blue-600 text-white'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  aria-label={tool.label}
                  title={tool.label}
                >
                  <tool.icon className="shrink-0 h-4 w-4" />
                </button>
              ))}

              <button
                type="button"
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Add tab (coming soon)"
                title="Add tab (coming soon)"
              >
                <PlusCircle className="shrink-0 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* URL bar — centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-8 w-55 items-center justify-between gap-2 rounded-full border border-border/50 bg-card/30 px-1 text-sm">
              <button
                type="button"
                onClick={cycleViewport}
                className="hidden items-center justify-center h-6 w-6 p-1 rounded-md transition-colors hover:bg-accent md:flex"
                aria-label={`Viewport: ${currentViewport}`}
                title={`Viewport: ${currentViewport} (click to cycle)`}
              >
                <ViewportIcon className="shrink-0 h-4 w-4" />
              </button>
              <div className="grow">
                <input
                  className="flex w-full border-none bg-transparent text-sm p-0 shadow-none focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted-foreground"
                  placeholder="/"
                  value="/"
                  readOnly
                />
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleReload}
                  className="inline-flex items-center justify-center h-6 w-6 p-1 rounded-md hover:bg-accent transition-colors"
                  aria-label="Reload preview"
                  title="Reload preview"
                >
                  <RefreshCw className="shrink-0 h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center justify-center h-6 w-6 p-1 rounded-md hover:bg-accent transition-colors"
                  aria-label="Open preview in new tab"
                  title="Open preview in new tab"
                >
                  <ExternalLink className="shrink-0 h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Right cluster ── */}
          <div className="flex items-center gap-1.5">
            {/* Static avatar — user info lives in project menu */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/80 border border-border/40">
              <span className="text-[11px] font-semibold text-foreground">{initials}</span>
            </div>

            <button
              type="button"
              title="Share (coming soon)"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors h-7 px-3 rounded-lg border border-border/50 bg-transparent text-foreground/80 hover:bg-accent hover:text-foreground"
            >
              <Share2 className="shrink-0 h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              type="button"
              title="Upgrade (coming soon)"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors h-7 px-3 rounded-full bg-purple-600 text-white hover:bg-purple-700"
            >
              <Zap className="shrink-0 h-4 w-4" />
              <span>Upgrade</span>
            </button>
            <button
              type="button"
              title="Publish (coming soon)"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors h-7 px-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Globe className="shrink-0 h-4 w-4" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
