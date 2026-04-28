import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { SharedHomeSurface } from "@/components/home/shared-home-surface";
import { generateUUID } from "@/lib/utils";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (params.query) {
    if (!session?.user?.id) {
      redirect(
        `/login?redirectTo=${encodeURIComponent(`/chat/${generateUUID()}?query=${encodeURIComponent(params.query)}`)}`
      );
    }

    return null;
  }

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return <SharedHomeSurface mode="logged-out" userEmail={null} />;
}
