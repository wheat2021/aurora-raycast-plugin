import { List, getPreferenceValues, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { ProcessorConfig } from "./types/processor";
import { PromptList } from "./components/PromptList";

interface Preferences {
  name?: string;
  directory: string;
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

      if (!preferences.directory) {
        setError("请在 Preferences 中配置 Prompts Directory");
        setIsLoading(false);
        return;
      }

      // 直接从 preferences 创建 ProcessorConfig
      const config: ProcessorConfig = {
        id: preferences.directory, // 使用目录作为 ID
        name: preferences.name || "Prompts",
        directory: preferences.directory,
        createdAt: Date.now(),
      };

      setProcessor(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    return (
      <List>
        <List.EmptyView
          title="配置错误"
          description={error}
          icon={Icon.XMarkCircle}
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
