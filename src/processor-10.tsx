import {
  Action,
  ActionPanel,
  Form,
  Icon,
  LaunchProps,
  open,
  popToRoot,
  showToast,
  Toast,
  getPreferenceValues,
} from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useState, useEffect } from "react";
import { getAIConfig } from "./utils/aiStorage";
import { AIProvider } from "./types/ai";

type Values = {
  query: string;
  provider: string;
};

interface Preferences {
  useAppWhenAvailable?: boolean;
}

interface Arguments {
  query?: string;
  provider?: string;
}

export default function Command(props: LaunchProps<{ draftValues: Values; arguments: Arguments }>) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [defaultProviderId, setDefaultProviderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      const config = await getAIConfig();
      setProviders(config.providers);
      setDefaultProviderId(config.defaultProviderId || config.providers[0]?.id || "");
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "加载 AI 配置失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const { handleSubmit, itemProps } = useForm<Values>({
    async onSubmit({ query, provider }) {
      const selectedProvider = providers.find((p) => p.id === provider);
      if (!selectedProvider) {
        showToast({
          style: Toast.Style.Failure,
          title: "未找到选中的 AI",
        });
        return;
      }

      // Determine which URL to use
      const useApp = preferences.useAppWhenAvailable && selectedProvider.appUrl;
      const urlTemplate = useApp ? selectedProvider.appUrl! : selectedProvider.url;

      // Replace {query} placeholder with actual query (URL encoded)
      const finalUrl = urlTemplate.replace("{query}", encodeURIComponent(query));

      try {
        await open(finalUrl);
        popToRoot();
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "打开 AI 失败",
          message: error instanceof Error ? error.message : "未知错误",
        });
      }
    },
    initialValues: {
      query: props.draftValues?.query ?? props.fallbackText ?? props.arguments?.query ?? "",
      provider: props.draftValues?.provider ?? props.arguments?.provider ?? defaultProviderId,
    },
    validation: {
      query: (value) => {
        if (!value || value.length === 0) {
          return "查询内容不能为空";
        }
      },
      provider: (value) => {
        if (!value) {
          return "请选择一个 AI";
        }
      },
    },
  });

  // Auto-submit if both query and provider are provided
  if (props.arguments?.query && (props.arguments?.provider || defaultProviderId) && !isLoading) {
    handleSubmit({
      query: props.arguments.query,
      provider: props.arguments.provider || defaultProviderId,
    });
    return null;
  }

  // Auto-submit if fallbackText is provided
  if (props.fallbackText && defaultProviderId && !isLoading) {
    handleSubmit({
      query: props.fallbackText,
      provider: defaultProviderId,
    });
    return null;
  }

  return (
    <Form
      isLoading={isLoading}
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Ask AI" icon={Icon.Message} onSubmit={handleSubmit} />
          <Action.Push
            title="管理 AI 配置"
            icon={Icon.Gear}
            target={<ManageAIView onUpdate={loadProviders} />}
            shortcut={{ modifiers: ["cmd"], key: "," }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown title="AI Provider" {...itemProps.provider}>
        {providers.map((provider) => (
          <Form.Dropdown.Item
            key={provider.id}
            value={provider.id}
            title={provider.name}
            icon={provider.icon}
          />
        ))}
      </Form.Dropdown>
      <Form.TextArea title="Ask Anything" placeholder="输入你的问题..." {...itemProps.query} />
      <Form.Description text="💡 提示：可以在下方管理 AI 配置中添加更多 AI 工具" />
    </Form>
  );
}

// AI Management View Component
function ManageAIView({ onUpdate }: { onUpdate: () => void }) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      const config = await getAIConfig();
      setProviders(config.providers);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "加载失败",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.Push
            title="添加 AI"
            icon={Icon.Plus}
            target={
              <AddAIView
                onAdd={async () => {
                  await loadProviders();
                  onUpdate();
                }}
              />
            }
          />
        </ActionPanel>
      }
    >
      <Form.Description
        title="当前 AI 配置"
        text={`已配置 ${providers.length} 个 AI 工具\n\n点击下方 "添加 AI" 来添加新的 AI 工具`}
      />
      {providers.map((provider, index) => (
        <Form.Description
          key={provider.id}
          text={`${index + 1}. ${provider.icon || "🤖"} ${provider.name}\n   URL: ${provider.url}`}
        />
      ))}
    </Form>
  );
}

// Add AI View Component
function AddAIView({ onAdd }: { onAdd: () => Promise<void> }) {
  const { handleSubmit, itemProps } = useForm<AIProvider>({
    async onSubmit(values) {
      try {
        const { addAIProvider } = await import("./utils/aiStorage");
        await addAIProvider(values);
        showToast({
          style: Toast.Style.Success,
          title: "添加成功",
        });
        await onAdd();
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "添加失败",
          message: error instanceof Error ? error.message : "未知错误",
        });
      }
    },
    validation: {
      id: (value) => {
        if (!value || value.length === 0) {
          return "ID 不能为空";
        }
      },
      name: (value) => {
        if (!value || value.length === 0) {
          return "名称不能为空";
        }
      },
      url: (value) => {
        if (!value || value.length === 0) {
          return "URL 不能为空";
        }
        if (!value.includes("{query}")) {
          return "URL 必须包含 {query} 占位符";
        }
      },
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="添加" icon={Icon.Plus} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="ID"
        placeholder="例如: my-ai"
        info="唯一标识符，使用小写字母和连字符"
        {...itemProps.id}
      />
      <Form.TextField title="名称" placeholder="例如: My AI" {...itemProps.name} />
      <Form.TextField
        title="图标"
        placeholder="例如: 🤖"
        info="可选，使用 emoji"
        {...itemProps.icon}
      />
      <Form.TextField
        title="URL"
        placeholder="例如: https://example.com/chat?q={query}"
        info="必须包含 {query} 占位符"
        {...itemProps.url}
      />
      <Form.TextField
        title="App URL"
        placeholder="例如: myapp://chat?q={query}"
        info="可选，应用程序 URL scheme"
        {...itemProps.appUrl}
      />
      <Form.TextArea
        title="描述"
        placeholder="简短描述这个 AI 工具"
        info="可选"
        {...itemProps.description}
      />
    </Form>
  );
}
