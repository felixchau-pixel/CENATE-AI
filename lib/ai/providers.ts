import { customProvider } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { isTestEnvironment, OPENAI_DISABLED } from "../constants";
import { titleModel, DEFAULT_CHAT_MODEL } from "./models";

if (!isTestEnvironment && !process.env.ANTHROPIC_API_KEY) {
  console.error(
    "[providers] ANTHROPIC_API_KEY is not set. All Anthropic model calls will fail with 401."
  );
}

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

function resolveModel(modelId: string) {
  const slashIndex = modelId.indexOf("/");
  const provider = slashIndex !== -1 ? modelId.slice(0, slashIndex) : "";
  const modelName = slashIndex !== -1 ? modelId.slice(slashIndex + 1) : modelId;

  // Hard guard: when OPENAI_DISABLED, never route to OpenAI regardless of
  // the requested modelId (e.g. stale cookie).  Fall back to the default
  // Anthropic model instead.
  if (OPENAI_DISABLED && (provider === "openai" || modelName.startsWith("gpt"))) {
    const fallbackName = DEFAULT_CHAT_MODEL.split("/").pop() ?? DEFAULT_CHAT_MODEL;
    console.warn(
      `[providers] OpenAI disabled — redirecting ${modelId} → ${DEFAULT_CHAT_MODEL}`
    );
    return anthropic(fallbackName);
  }

  if (provider === "openai" || modelName.startsWith("gpt")) {
    return openai(modelName);
  }

  return anthropic(modelName);
}

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return resolveModel(modelId);
}

export function getImageModel(modelId = "gpt-image-1") {
  return openai.image(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return resolveModel(titleModel.id);
}
