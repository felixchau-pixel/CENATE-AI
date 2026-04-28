import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

if ((!googleClientId || !googleClientSecret) && process.env.NODE_ENV !== "production") {
  console.warn(
    "[auth] Google OAuth is disabled. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in .env.local to enable Google sign-in."
  );
}

export const authConfig = {
  basePath: "/api/auth",
  trustHost: true,
  pages: {
    signIn: `${base}/login`,
  },
  providers:
    googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                type: "regular" as const,
              };
            },
          }),
        ]
      : [],
  callbacks: {},
} satisfies NextAuthConfig;
