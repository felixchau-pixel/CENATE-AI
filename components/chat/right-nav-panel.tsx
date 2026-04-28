'use client';

import { useEffect, useRef, useState } from 'react';
import { useActiveChat } from '@/hooks/use-active-chat';
import { useArtifactSelector } from '@/hooks/use-artifact';
import type { Attachment } from '@/lib/types';
import { Artifact } from './artifact';

export function RightNavPanel() {
  const {
    chatId,
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    addToolApprovalResponse,
    input,
    setInput,
    visibilityType,
    isReadonly,
    votes,
    currentModelId,
  } = useActiveChat();

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const artifactHasContent = useArtifactSelector(
    (state) => state.content.length > 0 || state.documentId !== 'init'
  );
  const shouldRenderArtifact = isArtifactVisible || artifactHasContent;

  // Capture trigger: fires once when artifact reaches idle+code state with a real document.
  // We cannot check content here — data-codeDelta events don't flow through onData,
  // so artifact.content in the SWR cache is always "" after code generation.
  // The iframe renders from a separate /api/document fetch, not from SWR content.
  const captureReady = useArtifactSelector(
    (state) =>
      state.status === 'idle' &&
      state.kind === 'code' &&
      state.documentId !== 'init' &&
      state.generationStage?.phase !== 'hard_failed'
  );
  const capturedChatIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    console.log('[cenate-capture-rnp] effect', { captureReady, chatId, already: capturedChatIdsRef.current.has(chatId ?? '') });

    if (!captureReady || !chatId || capturedChatIdsRef.current.has(chatId)) return;

    capturedChatIdsRef.current.add(chatId);

    const timer = setTimeout(() => {
      const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Live Preview"]');
      if (!iframe?.contentWindow) {
        console.warn('[preview-capture] iframe not found at capture time');
        return;
      }
      iframe.contentWindow.postMessage({ type: 'cenate-capture-request', chatId }, '*');
    }, 4000);

    return () => clearTimeout(timer);
  }, [captureReady, chatId]);

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {shouldRenderArtifact ? (
        <Artifact
          addToolApprovalResponse={addToolApprovalResponse}
          chatId={chatId}
          input={input}
          setInput={setInput}
          status={status}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          sendMessage={sendMessage}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          votes={votes}
          isReadonly={isReadonly}
          selectedVisibilityType={visibilityType}
          selectedModelId={currentModelId}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-center text-sm text-muted-foreground">
          Send a message to generate your preview.
        </div>
      )}
    </section>
  );
}
