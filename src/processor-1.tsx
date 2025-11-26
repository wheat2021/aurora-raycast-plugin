import { List, getPreferenceValues, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { getProcessor } from "./utils/storage";
import { ProcessorConfig } from "./types/processor";
import { PromptList } from "./components/PromptList";

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
