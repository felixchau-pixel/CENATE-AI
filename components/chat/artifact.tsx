import type { UseChatHelpers } from "@ai-sdk/react";
import { formatDistance } from "date-fns";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, Eye } from "lucide-react";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import { getPreviewHtml, isProjectContent, parseProjectContent } from "@/lib/project-manifest";
import { codeArtifact } from "@/artifacts/code/client";
import { imageArtifact } from "@/artifacts/image/client";
import { sheetArtifact } from "@/artifacts/sheet/client";
import { textArtifact } from "@/artifacts/text/client";
import { useArtifact } from "@/hooks/use-artifact";
import type { Document, Vote } from "@/lib/db/schema";
import type { Attachment, ChatMessage } from "@/lib/types";
import { fetcher } from "@/lib/utils";
import { ArtifactActions } from "./artifact-actions";
import { ArtifactCloseButton } from "./artifact-close-button";
import { LoaderIcon } from "./icons";
import { ProjectRuntimePreview } from "./project-runtime-preview";
import { Toolbar } from "./toolbar";
import { VersionFooter } from "./version-footer";
import type { VisibilityType } from "./visibility-selector";

export const artifactDefinitions = [
  textArtifact,
  codeArtifact,
  imageArtifact,
  sheetArtifact,
];
export type ArtifactKind = (typeof artifactDefinitions)[number]["kind"];

export type ArtifactViewMode = "preview" | "code";

export function useArtifactViewMode() {
  const { data, mutate } = useSWR<ArtifactViewMode>(
    "artifact-view-mode",
    null,
    { fallbackData: "preview" }
  );
  return { viewMode: data ?? "preview", setViewMode: mutate };
}

export type UIArtifact = {
  title: string;
  documentId: string;
  kind: ArtifactKind;
  content: string;
  isVisible: boolean;
  status: "streaming" | "idle";
  generationStage?: {
    phase: "generating" | "repairing" | "finalizing" | "preview_ready" | "hard_failed";
    attempt: number;
    maxAttempts: number;
    message: string;
  };
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

function PreviewSurface({
  raw,
  isStreaming,
  generationStage,
}: {
  raw: string;
  isStreaming: boolean;
  generationStage?: UIArtifact["generationStage"];
}) {
  const { data: viewport } = useSWR<'desktop' | 'tablet' | 'mobile'>(
    'preview-viewport', null, { fallbackData: 'desktop' }
  );
  const { data: reloadCounter } = useSWR<number>(
    'preview-reload-counter', null, { fallbackData: 0 }
  );

  const parsed = useMemo(() => {
    if (isProjectContent(raw)) {
      return parseProjectContent(raw);
    }
    return null;
  }, [raw]);

  // Project content path
  if (parsed) {
    console.debug("[preview-render]", {
      isStreaming,
      rawLength: raw.length,
      files: parsed.files.length,
      legacyHtmlLength: getPreviewHtml(raw)?.length ?? 0,
    });

    const stagePhase = generationStage?.phase;

    // Detect if the content is scaffold fallback — must NEVER render as preview
    const isFallbackContent = raw.includes("__CENATE_SCAFFOLD_FALLBACK__");

    // Show failure state FIRST — before file-based preview rendering.
    // This prevents fallback scaffold from appearing as the "generated site".
    if (stagePhase === "hard_failed" || isFallbackContent) {
      return (
        <div className="flex h-full min-h-[200px] items-center justify-center bg-background px-6 text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Preview unavailable
            </p>
            <p className="text-xs text-muted-foreground">
              {isFallbackContent
                ? "Generation did not produce a complete site. Your project files are available in the code panel."
                : generationStage?.message ?? "Automatic repair exhausted."}
            </p>
          </div>
        </div>
      );
    }

    if (
      parsed.files.length > 0 &&
      stagePhase !== "generating" &&
      stagePhase !== "repairing" &&
      stagePhase !== "finalizing"
    ) {
      const isConstrained = viewport === 'mobile' || viewport === 'tablet';
      const maxWidth =
        viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : null;
      return (
        <div
          className={`flex h-full w-full items-start justify-center overflow-hidden ${
            isConstrained ? 'bg-muted/40 p-4' : ''
          }`}
        >
          <div
            key={reloadCounter}
            className={isConstrained ? 'overflow-hidden rounded-xl border border-border shadow-lg' : ''}
            style={
              maxWidth
                ? { width: `${maxWidth}px`, maxWidth: '100%', height: '100%' }
                : { width: '100%', height: '100%' }
            }
          >
            <ProjectRuntimePreview files={parsed.files} />
          </div>
        </div>
      );
    }

    if (isStreaming || generationStage) {
      return (
        <div className="flex h-full min-h-[200px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {generationStage?.message ?? "Building preview from project files..."}
            </p>
            {generationStage && (
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {generationStage.phase.replace("_", " ")}
              </p>
            )}
            {parsed.files.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {parsed.files.length} files ready
              </p>
            )}
          </div>
        </div>
      );
    }
    // Legacy fallback: old artifacts that only have PREVIEW_HTML
    const legacyHtml = getPreviewHtml(raw);
    if (legacyHtml) {
      return (
        <iframe
          className="h-full w-full border-0 bg-white"
          sandbox="allow-scripts"
          srcDoc={legacyHtml}
          title="Live Preview"
        />
      );
    }
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center bg-background text-sm text-muted-foreground">
        Preview failed to mount.
      </div>
    );
  }

  // Non-project code (single-file HTML scripts, etc.)
  return (
    <iframe
      className="h-full w-full border-0 bg-white"
      sandbox="allow-scripts"
      srcDoc={raw}
      title="Live Preview"
    />
  );
}

function PureArtifact({
  addToolApprovalResponse: _addToolApprovalResponse,
  chatId,
  input: _input,
  setInput: _setInput,
  status,
  stop,
  attachments: _attachments,
  setAttachments: _setAttachments,
  sendMessage,
  messages: _messages,
  setMessages,
  regenerate: _regenerate,
  votes: _votes,
  isReadonly: _isReadonly,
  selectedVisibilityType: _selectedVisibilityType,
  selectedModelId: _selectedModelId,
}: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  votes: Vote[] | undefined;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
}) {
  const { artifact, setArtifact, metadata, setMetadata } = useArtifact();
  const { viewMode, setViewMode } = useArtifactViewMode();

  const {
    data: documents,
    isLoading: isDocumentsFetching,
    mutate: mutateDocuments,
  } = useSWR<Document[]>(
    artifact.documentId !== "init" && artifact.status !== "streaming"
      ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/document?id=${artifact.documentId}`
      : null,
    fetcher
  );

  const [mode, setMode] = useState<"edit" | "diff">("edit");
  const [document, setDocument] = useState<Document | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  const artifactContentRef = useRef<HTMLDivElement>(null);
  const userScrolledArtifact = useRef(false);
  const [isContentDirty, setIsContentDirty] = useState(false);
  const failureAutoSwitchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (artifact.status !== "streaming") {
      userScrolledArtifact.current = false;
      return;
    }
    if (userScrolledArtifact.current) {
      return;
    }
    const el = artifactContentRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight });
  }, [artifact.status]);

  // Reset to preview mode when a new generation starts (cleans up stale code-mode from prior hard_failed)
  useEffect(() => {
    if (
      artifact.generationStage?.phase === "generating" &&
      artifact.kind === "code"
    ) {
      failureAutoSwitchedRef.current = null;
      if (viewMode === "code") {
        setViewMode("preview");
      }
    }
  }, [artifact.generationStage, artifact.kind, viewMode, setViewMode]);

  // Auto-switch to code view ONCE when generation fails or fallback is active.
  // Uses a ref guard so clicking the preview tab afterwards is not trapped —
  // the user can freely toggle back to preview to see the error message.
  useEffect(() => {
    if (artifact.kind !== "code") return;

    const isHardFailed = artifact.generationStage?.phase === "hard_failed";
    const isFallback = artifact.content.includes("__CENATE_SCAFFOLD_FALLBACK__");

    if ((isHardFailed || isFallback) && isProjectContent(artifact.content)) {
      if (failureAutoSwitchedRef.current !== artifact.documentId) {
        failureAutoSwitchedRef.current = artifact.documentId;
        setViewMode("code");
      }
    }
  }, [artifact.generationStage, artifact.kind, artifact.content, artifact.documentId, setViewMode]);

  // Safety net: if the chat stream has finished ("ready") but the artifact
  // is still stuck in "streaming" (e.g. data-finish was never received due
  // to a dropped connection or server crash), force it to idle and clear
  // non-terminal generationStage to prevent stuck loading/generating UI.
  useEffect(() => {
    if (status === "ready" && artifact.status === "streaming") {
      setArtifact((current) => ({
        ...current,
        status: "idle",
        generationStage:
          current.generationStage?.phase === "preview_ready" ||
          current.generationStage?.phase === "hard_failed"
            ? current.generationStage
            : undefined,
      }));
    }
  }, [status, artifact.status, setArtifact]);

  useEffect(() => {
    if (documents && documents.length > 0) {
      const mostRecentDocument = documents.at(-1);

      if (mostRecentDocument) {
        setDocument(mostRecentDocument);
        setCurrentVersionIndex(documents.length - 1);
        // Don't overwrite content while streaming or during active generation
        // (prevents stale SWR fetches from replacing pipeline output)
        const isGenerating = artifact.generationStage &&
          artifact.generationStage.phase !== "preview_ready" &&
          artifact.generationStage.phase !== "hard_failed";
        if (!isGenerating && (artifact.status === "streaming" || !isContentDirty)) {
          setArtifact((currentArtifact) => ({
            ...currentArtifact,
            content: mostRecentDocument.content ?? "",
          }));
        }
      }
    }
  }, [documents, setArtifact, artifact.status, isContentDirty, artifact.generationStage]);

  useEffect(() => {
    mutateDocuments();
  }, [mutateDocuments]);

  const { mutate } = useSWRConfig();

  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!artifact) {
        return;
      }

      mutate<Document[]>(
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/document?id=${artifact.documentId}`,
        async (currentDocuments) => {
          if (!currentDocuments) {
            return [];
          }

          const currentDocument = currentDocuments.at(-1);

          if (!currentDocument || !currentDocument.content) {
            setIsContentDirty(false);
            return currentDocuments;
          }

          if (currentDocument.content === updatedContent) {
            setIsContentDirty(false);
            return currentDocuments;
          }

          await fetch(
            `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/document?id=${artifact.documentId}`,
            {
              method: "POST",
              body: JSON.stringify({
                title: artifact.title,
                content: updatedContent,
                kind: artifact.kind,
                isManualEdit: true,
              }),
            }
          );

          setIsContentDirty(false);

          return currentDocuments.map((doc, i) =>
            i === currentDocuments.length - 1
              ? { ...doc, content: updatedContent }
              : doc
          );
        },
        { revalidate: false }
      );
    },
    [artifact, mutate]
  );

  const latestContentRef = useRef<string>("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      latestContentRef.current = updatedContent;
      setIsContentDirty(true);

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      if (debounce) {
        saveTimerRef.current = setTimeout(() => {
          handleContentChange(latestContentRef.current);
          saveTimerRef.current = null;
        }, 2000);
      } else {
        handleContentChange(updatedContent);
      }
    },
    [handleContentChange]
  );

  function getDocumentContentById(index: number) {
    if (!documents) {
      return "";
    }
    if (!documents[index]) {
      return "";
    }
    return documents[index].content ?? "";
  }

  const handleVersionChange = (type: "next" | "prev" | "toggle" | "latest") => {
    if (!documents) {
      return;
    }

    if (type === "latest") {
      setCurrentVersionIndex(documents.length - 1);
      setMode("edit");
    }

    if (type === "toggle") {
      setMode((currentMode) => (currentMode === "edit" ? "diff" : "edit"));
    }

    if (type === "prev") {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex((index) => index - 1);
      }
    } else if (type === "next" && currentVersionIndex < documents.length - 1) {
      setCurrentVersionIndex((index) => index + 1);
    }
  };

  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const isCurrentVersion =
    documents && documents.length > 0
      ? currentVersionIndex === documents.length - 1
      : true;

  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  const artifactDefinition = artifactDefinitions.find(
    (definition) => definition.kind === artifact.kind
  );

  if (!artifactDefinition) {
    throw new Error("Artifact definition not found!");
  }

  useEffect(() => {
    if (artifact.documentId !== "init" && artifactDefinition.initialize) {
      artifactDefinition.initialize({
        documentId: artifact.documentId,
        setMetadata,
      });
    }
  }, [artifact.documentId, artifactDefinition, setMetadata]);

  if (!artifact.isVisible && artifact.content.length === 0 && artifact.documentId === "init") {
    return null;
  }

  const consoleError =
    metadata?.outputs
      ?.filter((o: { status: string }) => o.status === "failed")
      .flatMap((o: { contents: { type: string; value: string }[] }) =>
        o.contents.filter((c) => c.type === "text").map((c) => c.value)
      )
      .join("\n") || undefined;

  const isCodeArtifact = artifact.kind === "code";

  const artifactPanel = (
    <>
      <div className="flex h-[calc(3.5rem+1px)] shrink-0 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-3">
          <ArtifactCloseButton />
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-semibold leading-tight tracking-tight">
              {artifact.title}
            </div>
            <div className="flex items-center gap-2">
              {isContentDirty ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                  Saving...
                </div>
              ) : document ? (
                <div className="text-xs text-muted-foreground">
                  {`Updated ${formatDistance(new Date(document.createdAt), new Date(), { addSuffix: true })}`}
                </div>
              ) : artifact.generationStage ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {artifact.generationStage.phase !== "hard_failed" &&
                    artifact.generationStage.phase !== "preview_ready" && (
                    <div className="animate-spin">
                      <LoaderIcon size={12} />
                    </div>
                  )}
                  {artifact.generationStage.message}
                </div>
              ) : artifact.status === "streaming" ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="animate-spin">
                    <LoaderIcon size={12} />
                  </div>
                  Generating...
                </div>
              ) : (
                <div className="h-3 w-24 animate-pulse rounded bg-muted-foreground/10" />
              )}
              {documents && documents.length > 1 && (
                <div className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  v{currentVersionIndex + 1}/{documents.length}
                </div>
              )}
            </div>
          </div>
        </div>
        {isCodeArtifact && (
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "code"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="h-3 w-3" />
              Code
            </button>
          </div>
        )}
      </div>
      <div
        className="relative flex-1 overflow-y-auto bg-background"
        data-slot="artifact-content"
        onScroll={() => {
          const el = artifactContentRef.current;
          if (!el) {
            return;
          }
          const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          userScrolledArtifact.current = !atBottom;
        }}
        ref={artifactContentRef}
      >
        {isCodeArtifact && viewMode === "preview" ? (
          <PreviewSurface
            generationStage={artifact.generationStage}
            isStreaming={artifact.status === "streaming"}
            raw={
              isCurrentVersion
                ? artifact.content
                : getDocumentContentById(currentVersionIndex)
            }
          />
        ) : (
          <>
            <artifactDefinition.content
              content={
                isCurrentVersion
                  ? artifact.content
                  : getDocumentContentById(currentVersionIndex)
              }
              currentVersionIndex={currentVersionIndex}
              getDocumentContentById={getDocumentContentById}
              isCurrentVersion={isCurrentVersion}
              isInline={false}
              isLoading={isDocumentsFetching && !artifact.content}
              metadata={metadata}
              mode={mode}
              onSaveContent={saveContent}
              setMetadata={setMetadata}
              status={artifact.status}
              suggestions={[]}
              title={artifact.title}
            />
            <AnimatePresence>
              {isCurrentVersion && (
                <Toolbar
                  artifactActions={
                    <ArtifactActions
                      artifact={artifact}
                      currentVersionIndex={currentVersionIndex}
                      handleVersionChange={handleVersionChange}
                      isCurrentVersion={isCurrentVersion}
                      metadata={metadata}
                      mode={mode}
                      setMetadata={setMetadata}
                    />
                  }
                  artifactKind={artifact.kind}
                  consoleError={consoleError}
                  documentId={artifact.documentId}
                  isToolbarVisible={isToolbarVisible}
                  onClose={() => {
                    setArtifact((prev) => ({ ...prev, isVisible: false }));
                  }}
                  sendMessage={sendMessage}
                  setIsToolbarVisible={setIsToolbarVisible}
                  setMessages={setMessages}
                  status={status}
                  stop={stop}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      <AnimatePresence>
        {!isCurrentVersion && (
          <VersionFooter
            currentVersionIndex={currentVersionIndex}
            documents={documents}
            handleVersionChange={handleVersionChange}
            mode={mode}
            setMode={setMode}
          />
        )}
      </AnimatePresence>
    </>
  );

  if (isMobile) {
    return (
      <motion.div
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          height: windowHeight,
          width: "100dvw",
          borderRadius: 0,
        }}
        className="fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-sidebar"
        data-testid="artifact"
        exit={{ opacity: 0, scale: 0.95 }}
        initial={{
          opacity: 1,
          x: artifact.boundingBox.left,
          y: artifact.boundingBox.top,
          height: artifact.boundingBox.height,
          width: artifact.boundingBox.width,
          borderRadius: 50,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {artifactPanel}
      </motion.div>
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-background"
      data-testid="artifact"
    >
      {artifactPanel}
    </div>
  );
}

export const Artifact = memo(PureArtifact, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }
  if (prevProps.input !== nextProps.input) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
    return false;
  }

  return true;
});
