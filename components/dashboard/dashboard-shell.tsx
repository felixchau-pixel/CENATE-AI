"use client";

import Image from "next/image";
import Link from "next/link";
import { Open_Sans } from "next/font/google";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Home,
  Inbox,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import { CenateLogo } from "@/components/brand/cenate-logo";
import { HomeSidebar } from "./home-sidebar";
import { signOutAction } from "@/app/(auth)/actions";
import type { Chat } from "@/lib/db/schema";

const openSansExtraBold = Open_Sans({
  subsets: ["latin"],
  weight: "800",
  display: "swap",
});

const THUMB_GRADIENTS = [
  "linear-gradient(145deg, #1a2a4a 0%, #0f1e38 50%, #0a1628 100%)",
  "linear-gradient(145deg, #1e1a3a 0%, #150f2e 50%, #0d0a20 100%)",
  "linear-gradient(145deg, #0e2a1a 0%, #0a2018 50%, #071510 100%)",
  "linear-gradient(145deg, #2a1a10 0%, #1e1208 50%, #140c05 100%)",
  "linear-gradient(145deg, #1a0a2a 0%, #140820 50%, #0e0518 100%)",
  "linear-gradient(145deg, #0a1e2a 0%, #071520 50%, #050e18 100%)",
];

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatUserLabel(name?: string | null, email?: string | null) {
  if (name?.trim()) return name;
  if (!email) return "Workspace";
  const username = email.split("@")[0] ?? "Workspace";
  return username.charAt(0).toUpperCase() + username.slice(1);
}

type DashboardShellProps = {
  chats: Chat[];
  userEmail: string | null;
  userImage: string | null;
  userName: string | null;
  children: React.ReactNode;
};

export function DashboardShell({
  chats,
  userEmail,
  userImage,
  userName,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const userLabel = formatUserLabel(userName, userEmail);
  const initials = userLabel.slice(0, 2).toUpperCase();
  const recentChats = chats.slice(0, 5);

  return (
    <div className="min-h-dvh bg-[#0D0D0D] text-white">

      {/* ── Mobile top bar ─────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0d0d0d]/95 px-4 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5">
          <CenateLogo variant="main-icon" className="h-9 w-9" />
          <span
            className={`${openSansExtraBold.className} text-[15px] leading-none tracking-[-0.02em] text-white`}
          >
            Cenate AI
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          className="flex size-9 items-center justify-center rounded-full bg-[#1a1a1a] transition-colors hover:bg-[#222]"
          aria-label="Account"
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
      </header>

      {/* ── Desktop layout ──────────────────────────────────────────────────── */}
      <div className="hidden md:block md:p-5 lg:p-6">
        <div
          className="grid h-[calc(100dvh-40px)] gap-5 transition-[grid-template-columns] duration-300 ease-in-out lg:h-[calc(100dvh-48px)] lg:gap-6"
          style={{
            gridTemplateColumns: collapsed
              ? "52px minmax(0,1fr)"
              : "308px minmax(0,1fr)",
          }}
        >
          <HomeSidebar
            chats={chats}
            userEmail={userEmail}
            userImage={userImage}
            userName={userName}
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />
          <main className="min-w-0 h-full overflow-hidden">{children}</main>
        </div>
      </div>

      {/* ── Mobile content ──────────────────────────────────────────────────── */}
      <div className="pt-14 md:hidden">{children}</div>

      {/* ── Mobile left drawer backdrop ─────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* ── Mobile left drawer panel ─────────────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[320px] max-w-[85vw] flex-col bg-[#111] transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Search + close */}
        <div className="flex items-center gap-2 px-4 pb-3 pt-4">
          <div className="flex flex-1 items-center gap-2.5 rounded-[12px] bg-white/[0.07] px-3 py-2.5">
            <Search className="size-4 shrink-0 text-white/40" />
            <span className="text-[14px] text-white/35">Search projects</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex size-9 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/[0.07]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {/* Home */}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-[12px] bg-white/[0.06] px-3 py-3 text-[14px] font-medium text-white"
          >
            <Home className="size-[18px] text-white/70" />
            Home
          </Link>

          {/* Recent projects */}
          <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
            Recent projects
          </p>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] text-white/75 transition-colors hover:bg-white/[0.05]"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.07]">
              <Plus className="size-4 text-white/60" />
            </div>
            Create new project
          </Link>

          {recentChats.map((chat, i) => {
            const grad = THUMB_GRADIENTS[i % THUMB_GRADIENTS.length];
            const date = chat.createdAt ? new Date(chat.createdAt) : null;
            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
              >
                <div
                  className="size-11 shrink-0 rounded-[10px]"
                  style={{ background: grad }}
                />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-white/90">
                    {chat.title || "Untitled Project"}
                  </p>
                  <p className="text-[12px] text-white/40">
                    {date ? timeAgo(date) : ""}
                  </p>
                </div>
              </Link>
            );
          })}

          {/* Projects */}
          <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
            Projects
          </p>
          {[
            { Icon: LayoutGrid, label: "All projects" },
            { Icon: Star, label: "Starred" },
            { Icon: User, label: "Created by me" },
            { Icon: Users, label: "Shared with me" },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-[14px] text-white/70 transition-colors hover:bg-white/[0.05]"
            >
              <Icon className="size-[18px] text-white/45" />
              {label}
            </button>
          ))}

          {/* Resources */}
          <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/38">
            Resources
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-[12px] px-3 py-3 text-[14px] text-white/70 transition-colors hover:bg-white/[0.05]"
          >
            <BookOpen className="size-[18px] text-white/45" />
            Templates
          </button>
        </div>

        {/* Workspace button at bottom */}
        <div className="border-t border-white/[0.06] p-3">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setAccountOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-[14px] bg-white/[0.05] px-3 py-3 transition-colors hover:bg-white/[0.08]"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#dd5614] text-[13px] font-semibold text-white">
              {initials.slice(0, 1)}
            </div>
            <span className="truncate text-[14px] font-medium text-white/90">
              {userLabel}
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile account sheet backdrop ───────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 md:hidden ${
          accountOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setAccountOpen(false)}
      />

      {/* ── Mobile account bottom sheet ─────────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-[#111] transition-transform duration-300 ease-in-out md:hidden ${
          accountOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* User info */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a]">
            {userImage ? (
              <Image
                src={userImage}
                alt={userLabel}
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-white/92">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-white">
              {userLabel}
            </p>
            {userEmail && (
              <p className="truncate text-[12px] text-white/45">{userEmail}</p>
            )}
          </div>
        </div>

        <div className="space-y-0.5 px-3 pb-3">
          {[
            { Icon: Inbox, label: "Inbox", chevron: true },
            { Icon: Bell, label: "What's new", chevron: true },
          ].map(({ Icon, label, chevron }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3.5 text-[14px] text-white/80 transition-colors hover:bg-white/[0.06]"
            >
              <Icon className="size-[18px] text-white/50" />
              <span className="flex-1 text-left">{label}</span>
              {chevron && <ChevronRight className="size-4 text-white/30" />}
            </button>
          ))}

          <div className="my-1.5 h-px bg-white/[0.06]" />

          {[
            { Icon: User, label: "Profile" },
            { Icon: Settings, label: "Account settings" },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3.5 text-[14px] text-white/80 transition-colors hover:bg-white/[0.06]"
            >
              <Icon className="size-[18px] text-white/50" />
              {label}
            </button>
          ))}

          <div className="my-1.5 h-px bg-white/[0.06]" />

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3.5 text-[14px] text-white/80 transition-colors hover:bg-white/[0.06]"
            >
              <LogOut className="size-[18px] text-white/50" />
              Sign out
            </button>
          </form>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
}
