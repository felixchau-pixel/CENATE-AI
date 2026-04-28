import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from "@/lib/artifacts/server";
import { FALLBACK_APP_SIGNATURE } from "@/lib/ai/website/scaffold-files";
import { evaluateProjectPreviewReadiness } from "@/lib/ai/website/preview-readiness";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

type CreateDocumentProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  modelId: string;
  uploadedImageUrls?: string[];
};

export const createDocument = ({
  session,
  dataStream,
  modelId,
  uploadedImageUrls,
}: CreateDocumentProps) =>
  tool({
    description:
      "Create an artifact. You MUST specify kind: use 'code' for any programming/algorithm request (creates a script), 'text' for essays/writing (creates a document), 'sheet' for spreadsheets/data.",
    inputSchema: z.object({
      title: z.string().describe("The title of the artifact"),
      description: z
        .string()
        .optional()
        .describe(
          "The full user request / brief that describes what to build. For websites, include all details about design, sections, content, and style the user mentioned. This is critical — the generation model needs the complete brief, not just the title."
        ),
      kind: z
        .enum(artifactKinds)
        .describe(
          "REQUIRED. 'code' for programming/algorithms, 'text' for essays/writing, 'sheet' for spreadsheets"
        ),
    }),
    execute: async ({ title, description, kind }) => {
      const id = generateUUID();

      dataStream.write({
        type: "data-kind",
        data: kind,
        transient: true,
      });

      dataStream.write({
        type: "data-id",
        data: id,
        transient: true,
      });

      dataStream.write({
        type: "data-title",
        data: title,
        transient: true,
      });

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind
      );

      if (!documentHandler) {
        // Must send data-finish even on early error so the client
        // transitions out of "streaming" status.
        try { dataStream.write({ type: "data-finish", data: null, transient: true }); } catch (_) {}
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      // Wrap in try/finally so data-finish is ALWAYS sent.  If the
      // pipeline throws (timeout, model error, stream closed), the
      // client must still transition to idle — otherwise the artifact
      // status is stuck at "streaming" and subsequent requests show
      // stale generation state.
      let generatedContent: string | undefined;
      try {
        generatedContent = await documentHandler.onCreateDocument({
          id,
          title,
          description,
          dataStream,
          session,
          modelId,
          uploadedImageUrls,
        });
      } finally {
        try {
          dataStream.write({ type: "data-finish", data: null, transient: true });
        } catch (_) {
          // Stream already closed — nothing we can do
        }
      }

      // Determine if the generated content is a valid project with real content
      const isFallback = generatedContent?.includes(FALLBACK_APP_SIGNATURE) ?? false;
      const previewReadiness =
        kind === "code" && generatedContent
          ? evaluateProjectPreviewReadiness(generatedContent)
          : null;
      const isPreviewReady =
        kind === "code" && !!previewReadiness?.previewReady && !isFallback;

      return {
        id,
        title,
        kind,
        content:
          kind === "code"
            ? isPreviewReady
              ? `Generated successfully. Preview runtime passed and the artifact "${title}" is rendered in the preview panel. Respond with ONLY a 1-2 sentence neutral confirmation that the preview is ready. Do not mention code, errors, alternatives, or technical details.`
              : isFallback
                ? `Generation for "${title}" did not produce a complete site — scaffold fallback is active. The code panel shows the project files. Respond with ONLY: "Generation produced partial results. Your project files are available in the code panel." Do NOT say the preview is ready. Do NOT say generation was successful.`
                : `Project files generated for "${title}" but preview could not be verified. The code is available in the code panel. Respond with ONLY: "Project files are available in the code panel. Preview could not be confirmed." Do NOT say the preview is ready or that generation was fully successful.`
            : "A document was created and is now visible to the user.",
      };
    },
  });
