import {
  Action,
  ActionPanel,
  Alert,
  Color,
  confirmAlert,
  Form,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { useForm } from "@raycast/utils";
import { AIProvider } from "./types/ai";
import {
  getAIConfig,
  addAIProvider,
  removeAIProvider,
  setDefaultAIProvider,
  DEFAULT_AI_PROVIDERS,
} from "./utils/aiStorage";

export default function Command() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [defaultProviderId, setDefaultProviderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    try {
      const config = await getAIConfig();
      setProviders(config.providers);
      setDefaultProviderId(config.defaultProviderId || "");
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "加载失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetDefault(providerId: string) {
    try {
      await setDefaultAIProvider(providerId);
      setDefaultProviderId(providerId);
      showToast({
        style: Toast.Style.Success,
        title: "已设为默认",
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "设置失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    }
  }

  async function handleDelete(provider: AIProvider) {
    if (
      await confirmAlert({
        title: "删除 AI",
        message: `确定要删除 ${provider.name} 吗？`,
        primaryAction: {
          title: "删除",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      try {
        await removeAIProvider(provider.id);
        await loadProviders();
        showToast({
          style: Toast.Style.Success,
          title: "删除成功",
        });
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "删除失败",
          message: error instanceof Error ? error.message : "未知错误",
        });
      }
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="搜索 AI...">
      <List.Section title="已配置的 AI" subtitle={`${providers.length} 个`}>
        {providers.map((provider) => {
          const isDefault = provider.id === defaultProviderId;
          return (
            <List.Item
              key={provider.id}
              title={provider.name}
              subtitle={provider.description}
              icon={provider.icon || "🤖"}
              accessories={[
                ...(isDefault
                  ? [{ tag: { value: "默认", color: Color.Green } }]
                  : []),
                { text: provider.id },
              ]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.Push
                      title="编辑"
                      icon={Icon.Pencil}
                      target={
                        <EditAIView
                          provider={provider}
                          onUpdate={loadProviders}
                        />
                      }
                    />
                    {!isDefault && (
                      <Action
                        title="设为默认"
                        icon={Icon.Star}
                        onAction={() => handleSetDefault(provider.id)}
                        shortcut={{ modifiers: ["cmd"], key: "d" }}
                      />
                    )}
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser
                      title="在浏览器中打开"
                      url={provider.url.replace("{query}", "test")}
                      shortcut={{ modifiers: ["cmd"], key: "o" }}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action.Push
                      title="添加新 AI"
                      icon={Icon.Plus}
                      target={<AddAIView onAdd={loadProviders} />}
                      shortcut={{ modifiers: ["cmd"], key: "n" }}
                    />
                    <Action
                      title="删除"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      onAction={() => handleDelete(provider)}
                      shortcut={{ modifiers: ["cmd"], key: "delete" }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
      {providers.length === 0 && !isLoading && (
        <List.EmptyView
          title="暂无 AI 配置"
          description="点击下方添加按钮来添加 AI"
          icon={Icon.Plus}
          actions={
            <ActionPanel>
              <Action.Push
                title="添加 AI"
                icon={Icon.Plus}
                target={<AddAIView onAdd={loadProviders} />}
              />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}

// Add AI View
function AddAIView({ onAdd }: { onAdd: () => Promise<void> }) {
  const { handleSubmit, itemProps, reset } = useForm<AIProvider>({
    async onSubmit(values) {
      try {
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
        if (!/^[a-z0-9-]+$/.test(value)) {
          return "ID 只能包含小写字母、数字和连字符";
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

  function loadPreset(preset: AIProvider) {
    reset(preset);
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="添加"
            icon={Icon.Plus}
            onSubmit={handleSubmit}
          />
          <ActionPanel.Submenu title="使用预设" icon={Icon.Layers}>
            {DEFAULT_AI_PROVIDERS.map((preset) => (
              <Action
                key={preset.id}
                title={`${preset.icon || "🤖"} ${preset.name}`}
                onAction={() => loadPreset(preset)}
              />
            ))}
          </ActionPanel.Submenu>
        </ActionPanel>
      }
    >
      <Form.Description text="添加新的 AI 工具配置" />
      <Form.TextField
        title="ID"
        placeholder="例如: my-ai"
        info="唯一标识符，只能使用小写字母、数字和连字符"
        {...itemProps.id}
      />
      <Form.TextField
        title="名称"
        placeholder="例如: My AI"
        {...itemProps.name}
      />
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
        info="可选，应用程序 URL scheme，必须包含 {query} 占位符"
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

// Edit AI View
function EditAIView({
  provider,
  onUpdate,
}: {
  provider: AIProvider;
  onUpdate: () => Promise<void>;
}) {
  const { handleSubmit, itemProps } = useForm<AIProvider>({
    async onSubmit(values) {
      try {
        await addAIProvider(values);
        showToast({
          style: Toast.Style.Success,
          title: "更新成功",
        });
        await onUpdate();
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "更新失败",
          message: error instanceof Error ? error.message : "未知错误",
        });
      }
    },
    initialValues: provider,
    validation: {
      id: (value) => {
        if (!value || value.length === 0) {
          return "ID 不能为空";
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return "ID 只能包含小写字母、数字和连字符";
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
          <Action.SubmitForm
            title="保存"
            icon={Icon.Check}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Description text={`编辑 ${provider.name}`} />
      <Form.TextField
        title="ID"
        placeholder="例如: my-ai"
        info="唯一标识符，只能使用小写字母、数字和连字符"
        {...itemProps.id}
      />
      <Form.TextField
        title="名称"
        placeholder="例如: My AI"
        {...itemProps.name}
      />
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
        info="可选，应用程序 URL scheme，必须包含 {query} 占位符"
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
