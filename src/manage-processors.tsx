import {
  Action,
  ActionPanel,
  List,
  Icon,
  confirmAlert,
  Alert,
  showToast,
  Toast,
  Clipboard,
  openExtensionPreferences,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { listProcessors, removeProcessor } from "./utils/storage";
import { ProcessorConfig } from "./types/processor";
import { PromptList } from "./components/PromptList";

export default function Command() {
  const [processors, setProcessors] = useState<ProcessorConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProcessors();
  }, []);

  async function loadProcessors() {
    setIsLoading(true);
    const data = await listProcessors();
    setProcessors(data);
    setIsLoading(false);
  }

  async function handleDelete(processor: ProcessorConfig) {
    if (
      await confirmAlert({
        title: "确认删除",
        message: `确定要删除 "${processor.name}" 吗?`,
        primaryAction: {
          title: "删除",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "正在删除...",
      });

      try {
        await removeProcessor(processor.id);
        await loadProcessors();
        toast.style = Toast.Style.Success;
        toast.title = "删除成功";
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "删除失败";
        toast.message = error instanceof Error ? error.message : "未知错误";
      }
    }
  }

  async function handleCopyId(processor: ProcessorConfig) {
    await Clipboard.copy(processor.id);
    await showToast({
      style: Toast.Style.Success,
      title: "已复制 Processor ID",
    });
  }

  function getIconForProcessor(processor: ProcessorConfig): Icon {
    switch (processor.icon) {
      case "folder":
        return Icon.Folder;
      case "document":
        return Icon.Document;
      case "star":
        return Icon.Star;
      case "code":
        return Icon.Code;
      case "terminal":
        return Icon.Terminal;
      default:
        return Icon.Folder;
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="搜索 Processor...">
      <List.EmptyView
        title="没有找到 Processor"
        description="使用 'Create Input Processor' 命令创建第一个 Processor"
        icon={Icon.Folder}
      />

      {processors.map((processor) => (
        <List.Item
          key={processor.id}
          icon={getIconForProcessor(processor)}
          title={processor.name}
          subtitle={processor.directory}
          accessories={[
            { text: new Date(processor.createdAt).toLocaleDateString() },
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="打开提示词列表"
                icon={Icon.List}
                target={<PromptList processor={processor} />}
              />
              <Action
                title="复制 Processor Id"
                icon={Icon.Clipboard}
                onAction={() => handleCopyId(processor)}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
              <Action
                title="打开扩展设置"
                icon={Icon.Gear}
                onAction={openExtensionPreferences}
                shortcut={{ modifiers: ["cmd"], key: "," }}
              />
              <Action
                title="删除 Processor"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={() => handleDelete(processor)}
                shortcut={{ modifiers: ["cmd"], key: "delete" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
