"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CenateLogo } from "@/components/brand/cenate-logo";
import { SparklesIcon } from "@/components/chat/icons";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import StaticLuxuryBackground from "@/components/ui/static-luxury-background";
import type { Chat } from "@/lib/db/schema";
import { generateUUID } from "@/lib/utils";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

type SharedHomeSurfaceProps = {
  mode: "logged-out" | "dashboard";
  projects?: Chat[];
  userEmail?: string | null;
  userName?: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFirstName(name?: string | null, email?: string | null): string {
  if (name?.trim()) return name.trim().split(/\s+/)[0] ?? name.trim();
  if (!email) return "there";
  const username = email.split("@")[0] ?? "";
  if (!username) return "there";
  return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
}

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

// Thumbnail gradient presets — cycling per card
const THUMB_GRADIENTS = [
  "linear-gradient(145deg, #1a2a4a 0%, #0f1e38 50%, #0a1628 100%)",
  "linear-gradient(145deg, #1e1a3a 0%, #150f2e 50%, #0d0a20 100%)",
  "linear-gradient(145deg, #0e2a1a 0%, #0a2018 50%, #071510 100%)",
  "linear-gradient(145deg, #2a1a10 0%, #1e1208 50%, #140c05 100%)",
  "linear-gradient(145deg, #1a0a2a 0%, #140820 50%, #0e0518 100%)",
  "linear-gradient(145deg, #0a1e2a 0%, #071520 50%, #050e18 100%)",
];

// Avatar accent colors per card
const AVATAR_COLORS = [
  "#5B6AF0", "#E85D75", "#F0A045", "#45C27B", "#9B5CF6", "#0EA5E9",
];

// ── Project card (Lovable-style) ──────────────────────────────────────────────

function ProjectCard({ project, index }: { project: Chat; index: number }) {
  const thumbGrad = THUMB_GRADIENTS[index % THUMB_GRADIENTS.length];
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const date = project.createdAt ? new Date(project.createdAt) : null;

  return (
    // Outer link is fully transparent — no bg, no border, no box
    <Link
      href={`/chat/${project.id}`}
      className="group flex flex-col"
    >
      {/* Thumbnail — ONLY this element has background, border, and radius */}
      <div
        className="relative w-full overflow-hidden rounded-[10px] border border-white/[0.08] transition-all duration-200 group-hover:-translate-y-[2px] group-hover:border-white/[0.2] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
        style={{ aspectRatio: "16 / 9", background: thumbGrad }}
      >
        {project.previewUrl ? (
          <img
            src={project.previewUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex size-7 items-center justify-center rounded-lg ring-1 ring-white/[0.1]"
                style={{ backgroundColor: `${avatarColor}20` }}
              >
                <SparklesIcon size={11} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* External labels — sit below the image, outside any box */}
      <div className="mt-2 px-0.5">
        <p className="truncate text-[13px] font-medium leading-snug text-white/85 transition-colors group-hover:text-white">
          {project.title || "Untitled Project"}
        </p>
        <p className="mt-0.5 text-[11px] text-white/40">
          {date ? `Edited ${timeAgo(date)}` : "website"}
        </p>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SharedHomeSurface({
  mode,
  projects = [],
  userEmail,
  userName,
}: SharedHomeSurfaceProps) {
  const router = useRouter();
  const isLoggedOut = mode === "logged-out";
  const firstName = getFirstName(userName, userEmail);

  const handleSend = (message: string) => {
    const text = message.trim();
    if (!text) return;
    const chatPath = `/chat/${generateUUID()}?query=${encodeURIComponent(text)}`;

    if (isLoggedOut) {
      router.push(`/login?redirectTo=${encodeURIComponent(chatPath)}`);
      return;
    }

    router.push(chatPath);
  };

  // ── Logged-out surface ───────────────────────────────────────────────────
  if (isLoggedOut) {
    return (
      <section className="relative min-h-screen w-full overflow-hidden bg-[#0D0D0D]">
        <div className="pointer-events-none absolute inset-0 z-0 md:hidden">
          <img
            src="/background.png"
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
          />
        </div>

        <video
          autoPlay
          className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-cover md:block"
          loop
          muted
          playsInline
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        <div
          className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(100,40,220,0.22) 0%, rgba(220,80,160,0.12) 50%, transparent 80%)",
            filter: "blur(40px)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-3/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute right-4 top-4 z-20 flex items-center gap-3 md:right-5 md:top-5 lg:right-6 lg:top-6">
          <Link
            href="/login"
            className="rounded-[10px] border border-white/[0.14] bg-black/35 px-4 py-2 text-sm text-white/85 backdrop-blur-xl transition-all hover:border-white/[0.22] hover:bg-black/45 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-[10px] bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            Get Started
          </Link>
        </div>

        <div
          className="relative z-10 flex min-h-screen flex-col px-4 text-center md:px-5"
          style={{
            paddingTop: "clamp(88px, 11vh, 132px)",
            paddingBottom: "clamp(24px, 4vh, 40px)",
          }}
        >
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[720px]">
              <div className="mb-5 inline-flex h-[30px] items-center gap-2 rounded-full border border-white/[0.18] bg-black/30 px-4 backdrop-blur-md">
                <div className="flex h-5 items-center justify-center rounded-full bg-white/[0.00] px-1.5">
                  <CenateLogo variant="mark" className="h-5 w-20" />
                </div>
            
              </div>

              <h1 className="mx-auto max-w-[560px] text-[30px] font-semibold tracking-[-0.03em] text-white [text-shadow:0_2px_32px_rgba(0,0,0,0.7)] md:text-[42px]">
                Build a ready web experiences from a single prompt.
              </h1>

              

              <div className="mt-7 w-full">
                <PromptInputBox
                  onSend={handleSend}
                  placeholder="Ask Cenate to generate..."
                />
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-3 pb-[max(env(safe-area-inset-bottom),0px)] text-center">
            <p className="text-[12px] text-white/40">
              Secure sign-in is required before Cenate creates a project.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-white/52">
              <Link
                href="#"
                className="transition-colors hover:text-white/78"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-white/78"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-white/78"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:rounded-[28px] md:border md:border-white/[0.08]">
      <div className="pointer-events-none absolute inset-0 z-0 md:hidden">
        <img
          src="/background.png"
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
      </div>

      <video
        autoPlay
        className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-cover md:block"
        loop
        muted
        playsInline
        >
          <source src={VIDEO_URL} type="video/mp4" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(100,40,220,0.22) 0%, rgba(220,80,160,0.12) 50%, transparent 80%)",
          filter: "blur(40px)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-3/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div
        className="relative z-10 flex flex-col items-center justify-center px-4 text-center md:px-5 md:py-20"
        style={{
          minHeight: "clamp(80vh, calc(100% - 48px), 100%)",
          paddingTop: "clamp(64px, 10vh, 100px)",
          paddingBottom: "clamp(64px, 10vh, 100px)",
        }}
      >
        <div className="mb-5 inline-flex h-[30px] items-center gap-2 rounded-full border border-white/[0.22] bg-black/30 px-4 backdrop-blur-md md:mb-6">
          <span className="text-[12px] font-medium text-white/82">
            GPT 4.5 now in early access
          </span>
          <span className="text-[12px] text-white/40">→</span>
        </div>

        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-white [text-shadow:0_2px_32px_rgba(0,0,0,0.7)] md:mb-8 md:text-[38px] lg:text-[44px]">
          Let&apos;s build something, {firstName}
        </h1>

        <div className="w-full max-w-[720px]">
          <PromptInputBox
            onSend={handleSend}
            placeholder="Ask Cenate to generate..."
          />
        </div>
      </div>

      <div className="relative z-10 mx-4 mb-4 mt-10 overflow-hidden rounded-[18px] border border-white/[0.05] bg-black/75 backdrop-blur-[8px] md:mx-5 md:mb-5 md:mt-0">

        <div className="sticky top-0 z-20 flex items-center border-b border-white/[0.07] bg-black/80 px-4 backdrop-blur-sm md:px-5">
          <button
            type="button"
            className="relative flex-shrink-0 px-3 pb-3 pt-3 text-[13px] font-semibold text-white after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:rounded-full after:bg-white"
          >
            My projects
          </button>
          <button
            type="button"
            className="flex-shrink-0 px-3 pb-3 pt-3 text-[13px] font-medium text-white/40 transition-colors duration-200 hover:text-white/70"
          >
            Recently viewed
          </button>
          <button
            type="button"
            className="flex-shrink-0 px-3 pb-3 pt-3 text-[13px] font-medium text-white/40 transition-colors duration-200 hover:text-white/70"
          >
            Templates
          </button>
          <Link
            href="/dashboard"
            className="ml-auto flex-shrink-0 whitespace-nowrap pb-3 pt-3 text-[12px] font-medium text-white/35 transition-colors duration-200 hover:text-white/60"
          >
            Browse all →
          </Link>
        </div>

        {/* Cards grid
            Mobile:  grid-cols-2  — 2-column gallery, never a single stack
            md:      grid-cols-3
            lg:      grid-cols-4
            xl:      grid-cols-5  — most projects visible, most professional  */}
        <div className="p-4 md:p-5">
          {projects.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-white/[0.07] px-5 py-10 text-center text-[13px] text-white/30">
              Your recent projects will appear here after you create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {projects.slice(0, 15).map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
