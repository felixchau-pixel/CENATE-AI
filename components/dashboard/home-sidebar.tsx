"use client";

import Image from "next/image";
import Link from "next/link";
import { Open_Sans } from "next/font/google";
import {
  Check,
  ChevronDown,
  Home,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { CenateLogo } from "@/components/brand/cenate-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShinyButton } from "@/components/ui/shiny-button";
import type { Chat } from "@/lib/db/schema";

const openSansExtraBold = Open_Sans({
  subsets: ["latin"],
  weight: "800",
  display: "swap",
});

type HomeSidebarProps = {
  chats: Chat[];
  userEmail?: string | null;
  userImage?: string | null;
  userName?: string | null;
  collapsed?: boolean;
  onToggle?: () => void;
};

function formatUserLabel(name?: string | null, email?: string | null) {
  if (name?.trim()) return name;
  if (!email) return "Workspace";
  const username = email.split("@")[0] ?? "Workspace";
  return username.charAt(0).toUpperCase() + username.slice(1);
}

export function HomeSidebar({
  chats,
  userEmail,
  userImage,
  userName,
  collapsed = false,
  onToggle,
}: HomeSidebarProps) {
  const userLabel = formatUserLabel(userName, userEmail);
  const recentChats = chats.slice(0, 8);
  const initials = userLabel.slice(0, 2).toUpperCase();

  // ── Collapsed rail ──────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <aside className="hidden h-full min-h-0 flex-col items-center bg-transparent py-6 text-white md:flex">
        {/* Toggle button */}
        <button
          type="button"
          onClick={onToggle}
          className="flex size-9 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="size-[18px]" />
        </button>

        {/* Logo icon */}
        <div className="mt-5 flex h-9 w-full items-center justify-center">
          <CenateLogo variant="collapsed-icon" className="h-8 w-8" />
        </div>

        {/* Nav icons */}
        <nav className="mt-8 flex flex-col items-center gap-1.5">
          <Link
            href="/dashboard"
            className="flex size-9 items-center justify-center rounded-xl bg-white/[0.06] text-white transition-colors"
            aria-label="Home"
          >
            <Home className="size-[17px]" />
          </Link>
          <Link
            href="/"
            className="flex size-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
            aria-label="New Project"
          >
            <Plus className="size-[17px]" />
          </Link>
          <Link
            href="/early-access"
            className="flex size-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
            aria-label="Early Access"
          >
            <Zap className="size-[17px]" />
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-[#1a1a1a] transition-colors hover:bg-[#202020]"
              aria-label="Account menu"
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userLabel}
                  width={36}
                  height={36}
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-semibold text-white/92">
                  {initials}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="right"
            sideOffset={12}
            className="rounded-[18px] border-0 bg-[#1a1a1a] p-2 text-white shadow-[0_20px_42px_rgba(0,0,0,0.48)] ring-1 ring-white/8"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-[13px] font-medium text-white">
                {userLabel}
              </p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-[12px] px-3 py-2.5 text-left text-[13px] text-white/82 transition-colors hover:bg-white/[0.06]"
              >
                Sign out
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>
    );
  }

  // ── Expanded sidebar ────────────────────────────────────────────────────────
  return (
    <aside className="hidden h-full flex-col bg-transparent px-3 py-5 text-white md:flex">
      {/* Header: logo + toggle */}
      <div className="flex items-center justify-between px-2.5">
        <div className="flex items-center gap-3">
          <CenateLogo variant="main-icon" className="h-9 w-9 shrink-0" />
          <span
            className={`${openSansExtraBold.className} text-[19px] leading-none tracking-[-0.03em] text-white`}
          >
            Cenate AI
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex size-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.07] hover:text-white/80"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="size-[17px]" />
        </button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="mt-5 flex h-11 w-full items-center justify-between rounded-lg border border-white/10 bg-[#191919] px-4 text-left transition-colors hover:bg-[#1d1d1d]"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#dd5614] text-[13px] font-semibold text-white">
                {initials.slice(0, 1)}
              </div>
              <p className="truncate text-[13px] font-medium text-white/94">
                {userLabel}
              </p>
            </div>
            <ChevronDown className="size-4 shrink-0 text-white/55" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={12}
          className="rounded-[20px] border-0 bg-[#1a1a1a] p-3.5 text-white shadow-[0_22px_48px_rgba(0,0,0,0.52)] ring-1 ring-white/8"
        >
          <div className="flex items-center gap-3 rounded-[16px] bg-[#202020] px-4 py-4">
            <div className="flex size-11 items-center justify-center rounded-[14px] bg-[#dd5614] text-sm font-semibold text-white">
              {initials.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-white">
                {userLabel}
              </p>
              <p className="truncate text-[12px] text-white/55">Free Plan</p>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[13px] bg-[#262626] px-4 py-3.5 text-[13px] font-medium text-white/86 transition-colors hover:bg-[#2d2d2d]"
            >
              <Settings className="size-3.5" />
              Settings
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[13px] bg-[#262626] px-4 py-3.5 text-[13px] font-medium text-white/86 transition-colors hover:bg-[#2d2d2d]"
            >
              <Users className="size-3.5" />
              Invite members
            </button>
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-[16px] bg-[#242424] px-4 py-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[15px] leading-none text-white/88">⚡</span>
              <span className="text-[14px] font-medium text-white/90">
                Turn Pro
              </span>
            </div>
            <button
              type="button"
              className="rounded-[11px] bg-[#8b5cf6] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Upgrade
            </button>
          </div>

          <div className="mt-3.5 rounded-[16px] bg-[#242424] px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-white">Credits</p>
              <p className="text-[14px] font-medium text-white/72">5 left</p>
            </div>
            <div className="mt-3.5 h-3 rounded-full bg-[#3a3a3a]">
              <div className="h-3 w-[92%] rounded-full bg-[linear-gradient(90deg,#c084fc,#8b5cf6)]" />
            </div>
            <div className="mt-3.5 space-y-2 text-[12px] text-white/72">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#8b5cf6]" />
                <span>Credits go 2x further until Apr 30</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-white/40" />
                <span>Daily credits reset at midnight UTC</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 rounded-[16px] bg-[#202020] px-4 py-4">
            <p className="text-[12px] font-semibold text-white/55">
              All workspaces
            </p>
            <div className="mt-3.5 flex items-center justify-between rounded-[13px] px-1 py-1 text-[14px] text-white">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#dd5614] text-[13px] font-semibold text-white">
                  {initials.slice(0, 1)}
                </div>
                <span className="truncate">{userLabel}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70">
                  Free
                </span>
              </div>
              <Check className="size-4 text-white/80" />
            </div>
            <button
              type="button"
              className="mt-2.5 flex w-full items-center gap-3 rounded-[13px] bg-[#2a2a2a] px-4 py-3.5 text-left text-[14px] text-white/86 transition-colors hover:bg-[#303030]"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-white/8">
                <Plus className="size-4" />
              </div>
              Create new workspace
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fixed nav items */}
      <nav className="mt-8 space-y-1">
        <Link
          href="/dashboard"
          className="flex h-9 w-full items-center gap-3 rounded-lg bg-white/[0.05] px-3 text-[14px] font-medium text-white transition-colors duration-200"
        >
          <Home className="size-4 shrink-0 stroke-[1.5]" />
          <span>Home</span>
        </Link>
        <Link
          href="/"
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[14px] text-[#A1A1AA] transition-colors duration-200 hover:bg-white/[0.05] hover:text-white"
        >
          <Plus className="size-4 shrink-0 stroke-[1.5]" />
          <span>New Project</span>
        </Link>
        <Link
          href="/early-access"
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[14px] text-[#A1A1AA] transition-colors duration-200 hover:bg-white/[0.05] hover:text-white"
        >
          <Zap className="size-4 shrink-0 stroke-[1.5]" />
          <span>Early Access</span>
        </Link>
      </nav>

      {/* Scrollable middle: only this section scrolls */}
      <section className="mt-8 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-3">
          <p className="text-[12px] tracking-[0.025em] text-[#71717A]">
            Recent Projects
          </p>
          <span className="text-[11px] text-[#71717A]">{chats.length}</span>
        </div>
        <div className="mt-3 min-h-0 flex-1 space-y-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recentChats.length === 0 ? (
            <div className="rounded-lg bg-white/[0.03] px-3 py-4 text-[13px] text-[#71717A]">
              Your recent builds will appear here.
            </div>
          ) : (
            recentChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex h-9 items-center rounded-lg px-3 transition-colors duration-200 hover:bg-white/[0.05]"
              >
                <p className="line-clamp-1 text-[14px] text-[#A1A1AA] hover:text-white">
                  {chat.title || "Untitled Project"}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Fixed bottom CTA cards — never scroll */}
      <div className="mt-3 space-y-2">
        <div className="rounded-xl bg-[#18181B] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07]">
              <Sparkles className="size-3.5 text-white/70" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-white">Share Cenate</p>
              <p className="mt-0.5 text-[11px] text-[#71717A]">
                100 credits per paid referral
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-[12px] font-medium text-black transition-opacity hover:opacity-90"
          >
            Share invite
          </Link>
        </div>

        <div className="rounded-xl bg-[#18181B] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07]">
              <Zap className="size-3.5 text-white/70" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white">Upgrade to Pro</p>
              <p className="text-[11px] text-[#71717A]">Unlock more features</p>
            </div>
            <ShinyButton type="button" className="shrink-0 bg-white text-[12px]">
              Upgrade
            </ShinyButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-full bg-[#1a1a1a] transition-colors hover:bg-[#202020]"
              aria-label="Open account menu"
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userLabel}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-white/92">
                  {initials}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={12}
            className="rounded-[18px] border-0 bg-[#1a1a1a] p-2 text-white shadow-[0_20px_42px_rgba(0,0,0,0.48)] ring-1 ring-white/8"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-[13px] font-medium text-white">
                {userLabel}
              </p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-[12px] px-3 py-2.5 text-left text-[13px] text-white/82 transition-colors hover:bg-white/[0.06]"
              >
                Sign out
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-full bg-[#1a1a1a] px-4 text-[13px] font-medium text-white/86 transition-colors hover:bg-[#202020]"
        >
          <Inbox className="size-4" />
          Inbox
        </button>
      </div>
    </aside>
  );
}
