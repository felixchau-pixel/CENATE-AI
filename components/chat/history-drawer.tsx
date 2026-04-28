'use client';

import Link from 'next/link';
import { isToday, isYesterday } from 'date-fns';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import type { Chat } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { getChatHistoryPaginationKey, type ChatHistory } from './sidebar-history';

function groupByDate(chats: Chat[]) {
  const today: Chat[] = [];
  const yesterday: Chat[] = [];
  const older: Chat[] = [];
  for (const chat of chats) {
    const d = new Date(chat.createdAt);
    if (isToday(d)) today.push(chat);
    else if (isYesterday(d)) yesterday.push(chat);
    else older.push(chat);
  }
  return { today, yesterday, older };
}

const ITEM_CLS =
  'block truncate rounded-lg px-3 py-1.5 text-[13px] leading-snug text-foreground/55 hover:bg-accent/70 hover:text-foreground transition-colors';

export function HistoryDrawer() {
  const { data: isOpen, mutate } = useSWR<boolean>('history-open', null, {
    fallbackData: false,
  });
  const { data: session } = useSession();

  const { data: pages, isLoading } = useSWRInfinite<ChatHistory>(
    isOpen && session?.user ? getChatHistoryPaginationKey : () => null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const close = () => mutate(false, { revalidate: false });

  if (!isOpen) return null;

  const chats = pages?.flatMap((p) => p.chats) ?? [];
  const { today, yesterday, older } = groupByDate(chats);
  const sections = [
    { label: 'Today', items: today },
    { label: 'Yesterday', items: yesterday },
    { label: 'Older', items: older },
  ].filter((s) => s.items.length > 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-40"
        onClick={close}
      />

      {/* Drawer panel */}
      <div className="absolute left-0 top-0 bottom-0 z-50 flex w-72 flex-col bg-card border-r border-border/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
          <span className="text-[13px] font-semibold text-foreground/80">History</span>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Close history"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading && !chats.length && (
            <div className="flex flex-col gap-1 px-1 pt-1">
              {[60, 40, 72, 52, 44].map((w) => (
                <div
                  key={w}
                  className="h-7 animate-pulse rounded-lg bg-muted"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}

          {!isLoading && chats.length === 0 && (
            <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              No conversations yet.
            </p>
          )}

          {sections.map(({ label, items }) => (
            <div key={label} className="mb-3">
              <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </div>
              {items.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  onClick={close}
                  className={ITEM_CLS}
                >
                  {chat.title ?? 'Untitled'}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
