import { CenateAuthPage } from "@/components/auth/cenate-auth-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;

  return (
    <CenateAuthPage
      mode="register"
      redirectTo={params.redirectTo ?? null}
    />
  );
}
