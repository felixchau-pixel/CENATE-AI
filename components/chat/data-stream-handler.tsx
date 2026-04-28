"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";
import { artifactDefinitions } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { getChatHistoryPaginationKey } from "./sidebar-history";

export function DataStreamHandler({ chatId: chatIdProp }: { chatId?: string } = {}) {
  const pathname = usePathname();
  const chatIdFromUrl = pathname.match(/\/chat\/([^/]+)/)?.[1] ?? null;
  const chatId = chatIdProp ?? chatIdFromUrl;

  const { dataStream, setDataStream } = useDataStream();
  const { mutate } = useSWRConfig();

  const { artifact, setArtifact, setMetadata } = useArtifact();
  useEffect(() => {
    if (!dataStream?.length) {
      return;
    }

    const newDeltas = dataStream.slice();
    setDataStream([]);

    for (const delta of newDeltas) {
      if (delta.type === "data-chat-title") {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
        continue;
      }
      const artifactDefinition = artifactDefinitions.find(
        (currentArtifactDefinition) =>
          currentArtifactDefinition.kind === artifact.kind
      );

      if (artifactDefinition?.onStreamPart) {
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          return { ...initialArtifactData, status: "streaming" };
        }

        switch (delta.type) {
          case "data-id":
            return {
              ...draftArtifact,
              documentId: delta.data,
              status: "streaming",
              isVisible: true,
            };

          case "data-title":
            return {
              ...draftArtifact,
              title: delta.data,
              status: "streaming",
            };

          case "data-kind":
            return {
              ...draftArtifact,
              kind: delta.data,
              status: "streaming",
            };

          case "data-clear":
            return {
              ...draftArtifact,
              content: "",
              status: "streaming",
              generationStage: undefined,
            };

          case "data-generationStage":
            // Do NOT transition status to "idle" here.  The document has
            // not been saved to the DB yet when this event arrives — if
            // we go idle now, the SWR document fetch fires and 404s.
            // Status transitions to idle on "data-finish" which is sent
            // AFTER the document is persisted.
            return {
              ...draftArtifact,
              isVisible: true,
              generationStage: delta.data,
            };

          case "data-finish":
            return {
              ...draftArtifact,
              status: "idle",
              generationStage:
                draftArtifact.generationStage?.phase === "preview_ready" ||
                draftArtifact.generationStage?.phase === "hard_failed"
                  ? draftArtifact.generationStage
                  : undefined,
            };

          default:
            return draftArtifact;
        }
      });
    }
  }, [dataStream, setArtifact, setMetadata, artifact, setDataStream, mutate, chatId]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || e.data.chatId !== chatId) return;
      if (e.data.type === "cenate-capture-result" && e.data.dataUrl) {
        fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, imageData: e.data.dataUrl }),
        }).catch((err) => console.error("[preview-capture] upload failed:", err));
      } else if (e.data.type === "cenate-capture-error") {
        console.warn("[preview-capture] capture failed:", e.data.error);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [chatId]);

  return null;
}
