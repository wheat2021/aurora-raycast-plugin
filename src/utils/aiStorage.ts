import { LocalStorage } from "@raycast/api";
import { AIProvider, AIConfig } from "../types/ai";

const AI_CONFIG_KEY = "ai-config";

// Default AI providers
export const DEFAULT_AI_PROVIDERS: AIProvider[] = [
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "🔍",
    url: "https://www.perplexity.ai/search?q={query}",
    appUrl: "perplexity-app://search?q={query}",
    description: "AI-powered search engine",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "💬",
    url: "https://chat.openai.com/?q={query}",
    description: "OpenAI's conversational AI",
  },
  {
    id: "claude",
    name: "Claude",
    icon: "🤖",
    url: "https://claude.ai/new?q={query}",
    description: "Anthropic's AI assistant",
  },
  {
    id: "grok",
    name: "Grok",
    icon: "✨",
    url: "https://x.com/i/grok?q={query}",
    description: "xAI's conversational AI",
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "🌟",
    url: "https://gemini.google.com/app?q={query}",
    description: "Google's AI assistant",
  },
  {
    id: "copilot",
    name: "Copilot",
    icon: "🚀",
    url: "https://copilot.microsoft.com/?q={query}",
    description: "Microsoft's AI assistant",
  },
];

export async function getAIConfig(): Promise<AIConfig> {
  const stored = await LocalStorage.getItem<string>(AI_CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse AI config:", error);
    }
  }

  // Return default config
  const defaultConfig: AIConfig = {
    providers: DEFAULT_AI_PROVIDERS,
    defaultProviderId: "perplexity",
  };

  await saveAIConfig(defaultConfig);
  return defaultConfig;
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  await LocalStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

export async function getAIProvider(
  id: string,
): Promise<AIProvider | undefined> {
  const config = await getAIConfig();
  return config.providers.find((p) => p.id === id);
}

export async function addAIProvider(provider: AIProvider): Promise<void> {
  const config = await getAIConfig();
  const existingIndex = config.providers.findIndex((p) => p.id === provider.id);

  if (existingIndex >= 0) {
    config.providers[existingIndex] = provider;
  } else {
    config.providers.push(provider);
  }

  await saveAIConfig(config);
}

export async function removeAIProvider(id: string): Promise<void> {
  const config = await getAIConfig();
  config.providers = config.providers.filter((p) => p.id !== id);

  // If removed provider was default, reset to first provider
  if (config.defaultProviderId === id && config.providers.length > 0) {
    config.defaultProviderId = config.providers[0].id;
  }

  await saveAIConfig(config);
}

export async function setDefaultAIProvider(id: string): Promise<void> {
  const config = await getAIConfig();
  config.defaultProviderId = id;
  await saveAIConfig(config);
}
