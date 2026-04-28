import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { documentHandlersByArtifactKind } from "@/lib/artifacts/server";
import { FALLBACK_APP_SIGNATURE } from "@/lib/ai/website/scaffold-files";
import { evaluateProjectPreviewReadiness } from "@/lib/ai/website/preview-readiness";
import { getDocumentById } from "@/lib/db/queries";
import type { ChatMessage } from "@/lib/types";

type UpdateDocumentProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  modelId: string;
};

export const updateDocument = ({
  session,
  dataStream,
  modelId,
}: UpdateDocumentProps) =>
  tool({
    description:
      "Full rewrite of an existing artifact. Only use for major changes where most content needs replacing. Prefer editDocument for targeted changes.",
    inputSchema: z.object({
      id: z.string().describe("The ID of the artifact to rewrite"),
      description: z
        .string()
        .default("Improve the content")
        .describe("The description of changes that need to be made"),
    }),
    execute: async ({ id, description }) => {
      const document = await getDocumentById({ id });

      if (!document) {
        return {
          error: "Document not found",
        };
      }

      if (document.userId !== session.user?.id) {
        return { error: "Forbidden" };
      }

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === document.kind
      );

      if (!documentHandler) {
        try { dataStream.write({ type: "data-finish", data: null, transient: true }); } catch (_) {}
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }

      let updatedContent: string | undefined;
      try {
        updatedContent = await documentHandler.onUpdateDocument({
          document,
          description,
          dataStream,
          session,
          modelId,
        });
      } finally {
        try {
          dataStream.write({ type: "data-finish", data: null, transient: true });
        } catch (_) {
          // Stream already closed
        }
      }

      const isFallback = updatedContent?.includes(FALLBACK_APP_SIGNATURE) ?? false;
      const previewReadiness =
        document.kind === "code" && updatedContent
          ? evaluateProjectPreviewReadiness(updatedContent)
          : null;
      const isPreviewReady =
        document.kind === "code" && !!previewReadiness?.previewReady && !isFallback;

      return {
        id,
        title: document.title,
        kind: document.kind,
        content:
          document.kind === "code"
            ? isPreviewReady
              ? `Updated successfully. Preview runtime passed and the artifact "${document.title}" is rendered in the preview panel. Respond with ONLY a 1-2 sentence neutral confirmation that the preview is ready. Do not mention code, errors, alternatives, or technical details.`
              : isFallback
                ? `Update for "${document.title}" did not produce a complete site — scaffold fallback is active. The code panel shows the project files. Respond with ONLY: "Update produced partial results. Your project files are available in the code panel." Do NOT say the preview is ready.`
                : `Project files updated for "${document.title}" but preview could not be verified. The code is available in the code panel. Respond with ONLY: "Project files are updated in the code panel. Preview could not be confirmed." Do NOT say the preview is ready.`
            : "The document has been updated successfully.",
      };
    },
  });
