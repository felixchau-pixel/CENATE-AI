import { OPENAI_DISABLED } from "../constants";

export const DEFAULT_CHAT_MODEL = "anthropic/claude-sonnet-4-20250514";

export const titleModel = {
  id: "anthropic/claude-haiku-4-5-20251001",
  name: "Claude Haiku 4.5",
  provider: "anthropic",
  description: "Fast model for title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

const ALL_CHAT_MODELS: ChatModel[] = [
  {
    id: "anthropic/claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    description: "Balanced speed and intelligence with tool use",
  },
  {
    id: "anthropic/claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and efficient with tool use",
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Fast and capable with tool use",
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Most capable OpenAI model with tool use",
  },
];

export const chatModels: ChatModel[] = OPENAI_DISABLED
  ? ALL_CHAT_MODELS.filter((m) => m.provider !== "openai")
  : ALL_CHAT_MODELS;

const knownCapabilities: Record<string, ModelCapabilities> = {
  "anthropic/claude-sonnet-4-20250514": { tools: true, vision: true, reasoning: false },
  "anthropic/claude-haiku-4-5-20251001": { tools: true, vision: true, reasoning: false },
  "openai/gpt-4.1-mini": { tools: true, vision: true, reasoning: false },
  "openai/gpt-4.1": { tools: true, vision: true, reasoning: false },
};

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      knownCapabilities[model.id] ?? { tools: true, vision: false, reasoning: false },
    ])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  return chatModels.map((model) => ({
    ...model,
    capabilities: knownCapabilities[model.id] ?? {
      tools: true,
      vision: false,
      reasoning: false,
    },
  }));
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
