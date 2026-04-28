import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { codeDocumentHandler } from "@/artifacts/code/server";
import { sheetDocumentHandler } from "@/artifacts/sheet/server";
import { textDocumentHandler } from "@/artifacts/text/server";
import type { ArtifactKind } from "@/components/chat/artifact";
import { saveDocument } from "../db/queries";
import type { Document } from "../db/schema";
import type { ChatMessage } from "../types";

export type SaveDocumentProps = {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
};

export type CreateDocumentCallbackProps = {
  id: string;
  title: string;
  description?: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  session: Session;
  modelId: string;
  uploadedImageUrls?: string[];
};

export type UpdateDocumentCallbackProps = {
  document: Document;
  description: string;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  session: Session;
  modelId: string;
};

export type DocumentHandler<T = ArtifactKind> = {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<string>;
};

export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      const draftContent = await config.onCreateDocument({
        id: args.id,
        title: args.title,
        description: args.description,
        dataStream: args.dataStream,
        session: args.session,
        modelId: args.modelId,
        uploadedImageUrls: args.uploadedImageUrls,
      });

      console.log("[save-guard:create]", {
        userId: args.session?.user?.id ?? "MISSING",
        docId: args.id,
      });

      if (!args.session?.user?.id) {
        // This should never fire for authenticated users — the chat route already
        // guards on session.user. If it does fire, it means the JWT was issued
        // without a user id and the auth.ts fallback didn't catch it.
        throw new Error(
          "Cannot save document: session user ID is not available. The user may need to sign out and back in."
        );
      }

      await saveDocument({
        id: args.id,
        title: args.title,
        content: draftContent,
        kind: config.kind,
        userId: args.session.user.id,
      });

      return draftContent;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      const draftContent = await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
        session: args.session,
        modelId: args.modelId,
      });

      console.log("[save-guard:update]", {
        userId: args.session?.user?.id ?? "MISSING",
        docId: args.document.id,
      });

      if (!args.session?.user?.id) {
        throw new Error(
          "Cannot save document: session user ID is not available. The user may need to sign out and back in."
        );
      }

      await saveDocument({
        id: args.document.id,
        title: args.document.title,
        content: draftContent,
        kind: config.kind,
        userId: args.session.user.id,
      });

      return draftContent;
    },
  };
}

export const documentHandlersByArtifactKind: DocumentHandler[] = [
  textDocumentHandler,
  codeDocumentHandler,
  sheetDocumentHandler,
];

export const artifactKinds = ["text", "code", "sheet"] as const;
