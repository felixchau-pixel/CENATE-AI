'use client';

import { useEffect, useRef, useState } from 'react';
import { useActiveChat } from '@/hooks/use-active-chat';
import {
  initialArtifactData,
  useArtifact,
  useArtifactSelector,
} from '@/hooks/use-artifact';
import type { Attachment, ChatMessage } from '@/lib/types';
import { submitEditedMessage } from './message-editor';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function LeftChatPanel() {
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
    isLoading,
    votes,
    currentModelId,
    setCurrentModelId,
  } = useActiveChat();

  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const { setArtifact } = useArtifact();

  const stopRef = useRef(stop);
  stopRef.current = stop;

  const prevChatIdRef = useRef(chatId);
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId;
      stopRef.current();
      setArtifact(initialArtifactData);
      setEditingMessage(null);
      setAttachments([]);
    }
  }, [chatId, setArtifact]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {/* Messages area */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Messages
          addToolApprovalResponse={addToolApprovalResponse}
          chatId={chatId}
          isArtifactVisible={isArtifactVisible}
          isLoading={isLoading}
          isReadonly={isReadonly}
          messages={messages}
          onEditMessage={(msg) => {
            const text = msg.parts
              ?.filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join('');
            setInput(text ?? '');
            setEditingMessage(msg);
          }}
          regenerate={regenerate}
          selectedModelId={currentModelId}
          setMessages={setMessages}
          status={status}
          votes={votes}
        />
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border/40 bg-background px-4 py-3">
        {!isReadonly && (
          <MultimodalInput
            attachments={attachments}
            chatId={chatId}
            editingMessage={editingMessage}
            input={input}
            isLoading={isLoading}
            messages={messages}
            onCancelEdit={() => {
              setEditingMessage(null);
              setInput('');
            }}
            onModelChange={setCurrentModelId}
            selectedModelId={currentModelId}
            selectedVisibilityType={visibilityType}
            sendMessage={
              editingMessage
                ? async () => {
                    const msg = editingMessage;
                    setEditingMessage(null);
                    await submitEditedMessage({
                      message: msg,
                      text: input,
                      setMessages,
                      regenerate,
                    });
                    setInput('');
                  }
                : sendMessage
            }
            setAttachments={setAttachments}
            setInput={setInput}
            setMessages={setMessages}
            status={status}
            stop={stop}
          />
        )}
      </div>
    </div>
  );
}
