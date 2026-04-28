"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { memo, useMemo, useRef } from "react";
import { useArtifactSelector } from "@/hooks/use-artifact";
import type { ArtifactKind } from "@/components/chat/artifact";
import { suggestions as starterSuggestions } from "@/lib/constants";
import { isProjectContent, parseProjectContent } from "@/lib/project-manifest";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";

type SuggestionMode = "pre-generation" | "in-progress" | "post-generation";

type SuggestedActionsProps = {
  chatId: string;
  input: string;
  messages: ChatMessage[];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  setInput: (value: string) => void;
  selectedVisibilityType: VisibilityType;
  status: UseChatHelpers<ChatMessage>["status"];
};

type ProjectContext = {
  siteType: string | null;
  sectionOrder: string[];
  hasMultiplePages: boolean;
  hasPricing: boolean;
  hasTestimonials: boolean;
  hasFaq: boolean;
  hasGallery: boolean;
  hasContact: boolean;
  hasBooking: boolean;
  hasAboutPage: boolean;
};

const MAX_VISIBLE_SUGGESTIONS = 6;
const IN_PROGRESS_PHASES = new Set(["generating", "repairing", "finalizing"]);
const COMMON_FOLLOW_UPS = [
  "Improve the copy",
  "Refine the hero",
  "Improve mobile spacing",
  "Replace images",
  "Add another page",
] as const;
const IN_PROGRESS_SUGGESTIONS = [
  "Upload reference images",
  "Mention brand colors",
  "Ask for premium style",
  "Ask for more sections",
  "Make it more minimal",
  "Add another page later",
] as const;

function normalizeSiteType(siteType: string | null | undefined, raw: string): string | null {
  const value = siteType?.toLowerCase() ?? "";
  if (value.includes("restaurant")) return "restaurant";
  if (value.includes("construction") || value.includes("contractor")) return "construction";
  if (value.includes("hotel") || value.includes("hospitality") || value.includes("resort")) {
    return "hotel";
  }
  if (
    value.includes("saas") ||
    value.includes("software") ||
    value.includes("product") ||
    value.includes("startup")
  ) {
    return "saas";
  }

  const lowerRaw = raw.toLowerCase();
  if (/(restaurant|menu|reservation|private dining|chef)/.test(lowerRaw)) {
    return "restaurant";
  }
  if (/(construction|contractor|renovation|build-out|estimate|project site)/.test(lowerRaw)) {
    return "construction";
  }
  if (/(hotel|suite|amenities|rooms|hospitality|stay)/.test(lowerRaw)) {
    return "hotel";
  }
  if (/(saas|software|platform|dashboard|workflow|product)/.test(lowerRaw)) {
    return "saas";
  }

  return null;
}

function uniqSuggestions(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function buildProjectContext(raw: string): ProjectContext {
  if (!isProjectContent(raw)) {
    return {
      siteType: null,
      sectionOrder: [],
      hasMultiplePages: false,
      hasPricing: false,
      hasTestimonials: false,
      hasFaq: false,
      hasGallery: false,
      hasContact: false,
      hasBooking: false,
      hasAboutPage: false,
    };
  }

  const parsed = parseProjectContent(raw);
  const siteType = normalizeSiteType(parsed.meta?.siteType, raw);
  const sectionOrder = (parsed.meta?.sectionOrder ?? []).map((section) =>
    section.toLowerCase()
  );
  const combined = `${raw}\n${sectionOrder.join("\n")}`.toLowerCase();
  const pageLikeFiles = parsed.files.filter(
    (file) =>
      /^src\/(pages|app)\//.test(file.path) ||
      /\/about(\.|\/)|\/contact(\.|\/)|\/pricing(\.|\/)|\/menu(\.|\/)|\/rooms(\.|\/)/.test(
        file.path.toLowerCase()
      )
  );

  return {
    siteType,
    sectionOrder,
    hasMultiplePages: pageLikeFiles.length > 1,
    hasPricing: /pricing|plans|tier/.test(combined),
    hasTestimonials: /testimonial|reviews|proof|case study|guest quote|client/.test(combined),
    hasFaq: /\bfaq\b|questions|accordion/.test(combined),
    hasGallery: /gallery|showcase|portfolio|featured work|atmosphere/.test(combined),
    hasContact: /contact|reach us|service area|location|footer/.test(combined),
    hasBooking: /booking|reservation|reserve|book now|book a demo|schedule/.test(combined),
    hasAboutPage: /about/.test(combined),
  };
}

function resolvePostGenerationSuggestions(context: ProjectContext): string[] {
  const bySiteType: Record<string, string[]> = {
    saas: [
      "Add pricing",
      "Add testimonials",
      "Add FAQ",
      "Create an about page",
      "Add a product demo section",
      "Improve the copy",
      "Refine the hero",
      "Improve mobile spacing",
    ],
    restaurant: [
      "Add testimonials",
      "Add FAQ",
      "Add gallery",
      "Create an about page",
      "Add private dining details",
      "Replace images",
      "Refine the hero",
      "Improve the copy",
    ],
    construction: [
      "Add testimonials",
      "Add FAQ",
      "Add project gallery",
      "Create an about page",
      "Add service area details",
      "Improve the copy",
      "Refine the hero",
      "Improve mobile spacing",
    ],
    hotel: [
      "Add testimonials",
      "Add FAQ",
      "Add room gallery",
      "Create an about page",
      "Add amenities section",
      "Replace images",
      "Refine the hero",
      "Improve the copy",
    ],
  };

  const siteTypeSuggestions = context.siteType
    ? bySiteType[context.siteType] ?? []
    : [];
  const conditional: string[] = [];

  if (!context.hasPricing && context.siteType === "saas") {
    conditional.push("Add pricing");
  }
  if (!context.hasTestimonials) {
    conditional.push("Add testimonials");
  }
  if (!context.hasFaq) {
    conditional.push("Add FAQ");
  }
  if (!context.hasGallery && context.siteType === "restaurant") {
    conditional.push("Add gallery");
  }
  if (!context.hasGallery && context.siteType === "construction") {
    conditional.push("Add project gallery");
  }
  if (!context.hasGallery && context.siteType === "hotel") {
    conditional.push("Add room gallery");
  }
  if (!context.hasBooking && context.siteType === "restaurant") {
    conditional.push("Add booking flow");
  }
  if (!context.hasBooking && context.siteType === "hotel") {
    conditional.push("Add booking flow");
  }
  if (!context.hasBooking && context.siteType === "saas") {
    conditional.push("Add product demo section");
  }
  if (!context.hasContact && context.siteType === "construction") {
    conditional.push("Add contact section");
  }
  if (!context.hasAboutPage && !context.hasMultiplePages) {
    conditional.push("Create an about page");
  }
  if (!context.hasMultiplePages) {
    conditional.push("Add another page");
  }

  return uniqSuggestions([
    ...conditional,
    ...siteTypeSuggestions,
    ...COMMON_FOLLOW_UPS,
  ]);
}

function resolveSuggestionModel({
  artifactContent,
  artifactDocumentId,
  artifactKind,
  artifactStatus,
  generationStagePhase,
  messages,
  status,
}: {
  artifactContent: string;
  artifactDocumentId: string;
  artifactKind: ArtifactKind;
  artifactStatus: "streaming" | "idle";
  generationStagePhase?: string;
  messages: ChatMessage[];
  status: UseChatHelpers<ChatMessage>["status"];
}): { mode: SuggestionMode; suggestions: string[] } | null {
  const hasMessages = messages.length > 0;
  const hasArtifactResult =
    artifactDocumentId !== "init" && artifactContent.trim().length > 0;
  const isGenerationActive =
    status === "submitted" ||
    status === "streaming" ||
    artifactStatus === "streaming" ||
    (generationStagePhase ? IN_PROGRESS_PHASES.has(generationStagePhase) : false);

  if (!hasMessages && !hasArtifactResult && !isGenerationActive) {
    return {
      mode: "pre-generation",
      suggestions: [...starterSuggestions],
    };
  }

  if (isGenerationActive) {
    return {
      mode: "in-progress",
      suggestions: [...IN_PROGRESS_SUGGESTIONS],
    };
  }

  if (
    hasArtifactResult &&
    artifactKind === "code" &&
    isProjectContent(artifactContent) &&
    generationStagePhase !== "hard_failed"
  ) {
    return {
      mode: "post-generation",
      suggestions: resolvePostGenerationSuggestions(
        buildProjectContext(artifactContent)
      ),
    };
  }

  return null;
}

function PureSuggestedActions({
  chatId,
  input,
  messages,
  sendMessage,
  setInput,
  status,
}: SuggestedActionsProps) {
  const artifactContent = useArtifactSelector((state) => state.content);
  const artifactKind = useArtifactSelector((state) => state.kind);
  const artifactStatus = useArtifactSelector((state) => state.status);
  const artifactDocumentId = useArtifactSelector((state) => state.documentId);
  const generationStage = useArtifactSelector((state) => state.generationStage);
  const scrollRef = useRef<HTMLDivElement>(null);

  const model = useMemo(
    () =>
      resolveSuggestionModel({
        artifactContent,
        artifactDocumentId,
        artifactKind,
        artifactStatus,
        generationStagePhase: generationStage?.phase,
        messages,
        status,
      }),
    [
      artifactContent,
      artifactDocumentId,
      artifactKind,
      artifactStatus,
      generationStage?.phase,
      messages,
      status,
    ]
  );

  const visibleActions = useMemo(
    () => model?.suggestions.slice(0, MAX_VISIBLE_SUGGESTIONS) ?? [],
    [model]
  );

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    if (container.scrollWidth > container.clientWidth) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  };

  if (!model || visibleActions.length === 0) {
    return null;
  }

  const submitSuggestion = (suggestion: string) => {
    window.history.pushState(
      {},
      "",
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
    );
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: suggestion }],
    });
  };

  return (
    <div
      className="relative w-full min-w-0"
      data-mode={model.mode}
      data-testid="suggested-actions"
    >
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="w-full min-w-0 overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex w-max flex-nowrap gap-2 pb-1">
          {visibleActions.map((suggestedAction, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0"
              exit={{ opacity: 0, y: 6 }}
              initial={{ opacity: 0, y: 6 }}
              key={`${model.mode}:${suggestedAction}`}
              transition={{
                delay: 0.04 * index,
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg bg-muted px-3 text-sm text-foreground transition-colors hover:bg-accent md:h-7 md:text-xs"
                onClick={() => {
                  if (model.mode === "in-progress") {
                    setInput(input.trim() ? `${input.trim()} ${suggestedAction}` : suggestedAction);
                    return;
                  }

                  submitSuggestion(suggestedAction);
                }}
              >
                {suggestedAction}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.input !== nextProps.input) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.status !== nextProps.status) {
      return false;
    }
    if (prevProps.messages.length !== nextProps.messages.length) {
      return false;
    }

    return true;
  }
);
