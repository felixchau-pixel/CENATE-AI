import { CenateAuthPage } from "@/components/auth/cenate-auth-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;

  return <CenateAuthPage mode="login" redirectTo={params.redirectTo ?? null} />;
}
