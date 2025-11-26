import {
  List,
  getPreferenceValues,
  Icon,
  ActionPanel,
  Action,
  openCommandPreferences,
  launchCommand,
  LaunchType,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { getProcessor } from "./utils/storage";
import { ProcessorConfig } from "./types/processor";
import { PromptList } from "./components/PromptList";
import { ConfigGuide } from "./components/ConfigGuide";

interface Preferences {
  processorId?: string;
}

export default function Command() {
  const [processor, setProcessor] = useState<ProcessorConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProcessor();
  }, []);

  async function loadProcessor() {
    setIsLoading(true);
    try {
      const preferences = getPreferenceValues<Preferences>();

      if (!preferences.processorId) {
        setError("未配置 Processor ID");
        setIsLoading(false);
        return;
      }

      const config = await getProcessor(preferences.processorId);
      if (!config) {
        setError(`找不到 Processor: ${preferences.processorId}`);
        setIsLoading(false);
        return;
      }

      setProcessor(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    const isNotConfigured = error === "未配置 Processor ID";
    return (
      <List>
        <List.EmptyView
          title={isNotConfigured ? "未配置" : "配置错误"}
          description={
            isNotConfigured
              ? "请在命令设置中配置 Processor ID。\n\n1. 点击下方的 '打开命令设置' 按钮\n2. 粘贴 Processor ID\n3. 启用命令\n\n💡 可以从 'Manage Input Processors' 复制 Processor ID"
              : error
          }
          icon={isNotConfigured ? Icon.Gear : Icon.XMarkCircle}
          actions={
            <ActionPanel>
              <Action
                title="打开命令设置"
                icon={Icon.Gear}
                onAction={openCommandPreferences}
                shortcut={{ modifiers: ["cmd"], key: "," }}
              />
              <Action
                title="查看所有 Processors"
                icon={Icon.List}
                onAction={async () => {
                  await launchCommand({
                    name: "manage-processors",
                    type: LaunchType.UserInitiated,
                  });
                }}
              />
              <Action.Push
                title="查看配置说明"
                icon={Icon.QuestionMark}
                target={<ConfigGuide showOpenCommandPreferences={true} />}
                shortcut={{ modifiers: ["cmd"], key: "h" }}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (!processor) {
    return (
      <List isLoading={isLoading}>
        <List.EmptyView title="正在加载..." icon={Icon.Circle} />
      </List>
    );
  }

  return <PromptList processor={processor} />;
}
