"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SharedHomeSurface } from "@/components/home/shared-home-surface";
import type { Chat } from "@/lib/db/schema";

type DashboardHistoryResponse = {
  chats?: Chat[];
};

async function fetchDashboardHistory(url: string): Promise<Chat[]> {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Failed to load dashboard history");
  }

  const data = (await response.json()) as DashboardHistoryResponse;
  return data.chats ?? [];
}

export function DashboardHomeClient() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/early-access");
    }
  }, [router, status]);

  const { data: chats = [] } = useSWR(
    status === "authenticated"
      ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history?limit=20`
      : null,
    fetchDashboardHistory,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  if (status !== "authenticated") {
    return null;
  }

  const userEmail = session.user?.email ?? null;
  const userImage = session.user?.image ?? null;
  const userName = session.user?.name ?? null;

  return (
    <DashboardShell
      chats={chats}
      userEmail={userEmail}
      userImage={userImage}
      userName={userName}
    >
      <SharedHomeSurface
        mode="dashboard"
        projects={chats}
        userEmail={userEmail}
        userName={userName}
      />
    </DashboardShell>
  );
}
