"use client";

import { useState } from "react";
import Link from "next/link";
import { CenateLogo } from "@/components/brand/cenate-logo";

export default function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted/60 ring-1 ring-border/50">
            <CenateLogo variant="mark" className="h-7 w-7" />
          </div>
          <CenateLogo variant="wordmark" className="h-7 w-[114px]" />
          <p className="text-sm text-muted-foreground">
            AI-generated websites. Join the waitlist for early access.
          </p>
        </div>

        {status === "done" ? (
          <div className="rounded-xl border border-border/60 bg-card p-6 text-center">
            <p className="text-sm font-medium">You&apos;re on the list.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We&apos;ll reach out when your spot is ready.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {status === "loading" ? "Submitting…" : "Request Access"}
            </button>
            {status === "error" && (
              <p className="text-center text-xs text-destructive">
                Something went wrong. Try again.
              </p>
            )}
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have access?{" "}
          <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
