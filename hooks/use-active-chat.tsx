"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePathname } from "next/navigation";
import {
  useCallback,
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { getChatHistoryPaginationKey } from "@/components/chat/sidebar-history";
import { toast } from "@/components/chat/toast";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import type { Vote } from "@/lib/db/schema";
import { ChatbotError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import type { UIArtifact } from "@/components/chat/artifact";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";

const HTML_TITLE_MARKERS = ["<!doctype", "<html", "<head>", "<head ", "<body>", "<body "];

function sanitizeChatTitle(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const probe = raw.slice(0, 200).toLowerCase();
  if (HTML_TITLE_MARKERS.some((m) => probe.includes(m))) return null;
  return raw;
}

type ActiveChatContextValue = {
  chatId: string;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  status: UseChatHelpers<ChatMessage>["status"];
  stop: UseChatHelpers<ChatMessage>["stop"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  visibilityType: VisibilityType;
  isReadonly: boolean;
  isLoading: boolean;
  votes: Vote[] | undefined;
  currentModelId: string;
  setCurrentModelId: (id: string) => void;
  showCreditCardAlert: boolean;
  setShowCreditCardAlert: Dispatch<SetStateAction<boolean>>;
  chatTitle: string | null;
};

const ActiveChatContext = createContext<ActiveChatContextValue | null>(null);

function extractChatId(pathname: string): string | null {
  const match = pathname.match(/\/chat\/([^/]+)/);
  return match ? match[1] : null;
}

export function ActiveChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setDataStream } = useDataStream();
  const { mutate } = useSWRConfig();

  const chatIdFromUrl = extractChatId(pathname);
  const isNewChat = !chatIdFromUrl;
  const newChatIdRef = useRef(generateUUID());
  const prevPathnameRef = useRef(pathname);

  if (isNewChat && prevPathnameRef.current !== pathname) {
    newChatIdRef.current = generateUUID();
  }
  prevPathnameRef.current = pathname;

  const chatId = chatIdFromUrl ?? newChatIdRef.current;

  const [currentModelId, setCurrentModelId] = useState(DEFAULT_CHAT_MODEL);
  const currentModelIdRef = useRef(currentModelId);
  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  const [input, setInput] = useState("");
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] =
    useState<ChatMessage | null>(null);

  const { data: chatData, isLoading } = useSWR(
    isNewChat
      ? null
      : `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/messages?chatId=${chatId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const initialMessages: ChatMessage[] = isNewChat
    ? []
    : (chatData?.messages ?? []);
  const visibility: VisibilityType = isNewChat
    ? "private"
    : (chatData?.visibility ?? "private");

  const {
    messages: transportMessages,
    setMessages,
    sendMessage: transportSendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
    addToolApprovalResponse,
  } = useChat<ChatMessage>({
    id: chatId,
    messages: initialMessages,
    generateId: generateUUID,
    sendAutomaticallyWhen: ({ messages: currentMessages }) => {
      const lastMessage = currentMessages.at(-1);
      return (
        lastMessage?.parts?.some(
          (part) =>
            "state" in part &&
            part.state === "approval-responded" &&
            "approval" in part &&
            (part.approval as { approved?: boolean })?.approved === true
        ) ?? false
      );
    },
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/chat`,
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        const lastMessage = request.messages.at(-1);
        const isToolApprovalContinuation =
          lastMessage?.role !== "user" ||
          request.messages.some((msg) =>
            msg.parts?.some((part) => {
              const state = (part as { state?: string }).state;
              return (
                state === "approval-responded" || state === "output-denied"
              );
            })
          );

        return {
          body: {
            id: request.id,
            ...(isToolApprovalContinuation
              ? { messages: request.messages }
              : { message: lastMessage }),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibility,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      setPendingUserMessage(null);
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error.message?.includes("AI Gateway requires a valid credit card")) {
        setShowCreditCardAlert(true);
      } else if (error instanceof ChatbotError) {
        toast({ type: "error", description: error.message });
      } else {
        toast({
          type: "error",
          description: error.message || "Oops, an error occurred!",
        });
      }
    },
  });

  useEffect(() => {
    if (
      pendingUserMessage &&
      transportMessages.some((message) => message.id === pendingUserMessage.id)
    ) {
      setPendingUserMessage(null);
    }
  }, [pendingUserMessage, transportMessages]);

  const messages = useMemo<ChatMessage[]>(() => {
    if (
      pendingUserMessage &&
      !transportMessages.some((message) => message.id === pendingUserMessage.id)
    ) {
      return [...transportMessages, pendingUserMessage];
    }

    return transportMessages;
  }, [pendingUserMessage, transportMessages]);

  const sendMessage = useCallback<UseChatHelpers<ChatMessage>["sendMessage"]>(
    (message, options) => {
      const messageCandidate = message as Partial<ChatMessage> & {
        text?: string;
      };
      const normalizedParts =
        Array.isArray(messageCandidate.parts) && messageCandidate.parts.length > 0
          ? messageCandidate.parts
          : typeof messageCandidate.text === "string"
            ? [{ type: "text" as const, text: messageCandidate.text }]
            : [];
      const normalizedMessage: ChatMessage = {
        ...(messageCandidate as ChatMessage),
        id:
          typeof messageCandidate.id === "string" && messageCandidate.id.length > 0
            ? messageCandidate.id
            : generateUUID(),
        role: messageCandidate.role ?? "user",
        parts: normalizedParts,
      };

      if (normalizedMessage.role === "user") {
        setPendingUserMessage(normalizedMessage);
      }

      return transportSendMessage(normalizedMessage, options);
    },
    [transportSendMessage]
  );

  // Force artifact out of "streaming" when chat request finishes.
  // If the server stream closes before data-finish is sent (timeout,
  // crash, error swallowed), the artifact stays stuck in "streaming"
  // forever — blocking subsequent requests from rendering properly.
  const prevChatStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevChatStatusRef.current;
    prevChatStatusRef.current = status;

    if (
      (prev === "streaming" || prev === "submitted") &&
      (status === "ready" || status === "error")
    ) {
      mutate<UIArtifact>(
        "artifact",
        (current) => {
          if (current && current.status === "streaming") {
            return {
              ...current,
              status: "idle",
              generationStage:
                current.generationStage?.phase === "preview_ready" ||
                current.generationStage?.phase === "hard_failed"
                  ? current.generationStage
                  : undefined,
            };
          }
          return current;
        },
        { revalidate: false }
      );
    }
  }, [status, mutate]);

  const loadedChatIds = useRef(new Set<string>());

  if (isNewChat && !loadedChatIds.current.has(newChatIdRef.current)) {
    loadedChatIds.current.add(newChatIdRef.current);
  }

  useEffect(() => {
    if (loadedChatIds.current.has(chatId)) {
      return;
    }
    const hasPersistedChat =
      Boolean(chatData?.userId) ||
      Boolean(chatData?.title) ||
      (chatData?.messages?.length ?? 0) > 0;

    if (hasPersistedChat && chatData?.messages) {
      loadedChatIds.current.add(chatId);
      setPendingUserMessage(null);
      setMessages(chatData.messages);
    }
  }, [chatId, chatData?.messages, setMessages]);

  const prevChatIdRef = useRef(chatId);
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId;
      setPendingUserMessage(null);
      if (isNewChat) {
        setMessages([]);
      }
    }
  }, [chatId, isNewChat, setMessages]);

  useEffect(() => {
    if (chatData && !isNewChat) {
      const cookieModel = document.cookie
        .split("; ")
        .find((row) => row.startsWith("chat-model="))
        ?.split("=")[1];
      if (cookieModel) {
        setCurrentModelId(decodeURIComponent(cookieModel));
      }
    }
  }, [chatData, isNewChat]);

  const lastBootstrappedQueryKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    const queryKey = query ? `${chatId}:${query}` : null;

    if (query && queryKey && lastBootstrappedQueryKeyRef.current !== queryKey) {
      lastBootstrappedQueryKeyRef.current = queryKey;
      window.history.replaceState(
        {},
        "",
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
      );
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });
    }
  }, [sendMessage, chatId]);

  useAutoResume({
    autoResume: !isNewChat && !!chatData,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const isReadonly = isNewChat ? false : (chatData?.isReadonly ?? false);

  const { data: votes } = useSWR<Vote[]>(
    !isReadonly && messages.length >= 2
      ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/vote?chatId=${chatId}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const value = useMemo<ActiveChatContextValue>(
    () => ({
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
      visibilityType: visibility,
      isReadonly,
      isLoading: !isNewChat && isLoading,
      votes,
      currentModelId,
      setCurrentModelId,
      showCreditCardAlert,
      setShowCreditCardAlert,
      chatTitle: isNewChat ? null : sanitizeChatTitle(chatData?.title),
    }),
    [
      chatId,
      messages,
      setMessages,
      sendMessage,
      status,
      stop,
      regenerate,
      addToolApprovalResponse,
      input,
      visibility,
      isReadonly,
      isNewChat,
      isLoading,
      votes,
      currentModelId,
      showCreditCardAlert,
      chatData?.title,
    ]
  );

  return (
    <ActiveChatContext.Provider value={value}>
      {children}
    </ActiveChatContext.Provider>
  );
}

export function useActiveChat() {
  const context = useContext(ActiveChatContext);
  if (!context) {
    throw new Error("useActiveChat must be used within ActiveChatProvider");
  }
  return context;
}
