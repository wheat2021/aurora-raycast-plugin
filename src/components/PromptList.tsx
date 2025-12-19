import { Action, ActionPanel, List, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { loadPromptsFromDirectory } from "../config/prompts";
import { PromptForm } from "./PromptForm";
import { ProcessorConfig } from "../types/processor";
import { PromptConfig } from "../types/prompt";

interface PromptListProps {
  processor: ProcessorConfig;
}

/**
 * URL 编码路径，保留 / 和 : 字符（与 Python urllib.parse.quote 的 safe='/:' 行为一致）
 */
function encodePathForObsidian(filePath: string): string {
  return filePath
    .split("/")
    .map((segment) => {
      // 对每个路径段进行编码，但保留 :
      return segment
        .split(":")
        .map((part) => encodeURIComponent(part))
        .join(":");
    })
    .join("/");
}

export function PromptList({ processor }: PromptListProps) {
  const [prompts, setPrompts] = useState<PromptConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPrompts() {
      setIsLoading(true);
      try {
        const loadedPrompts = await loadPromptsFromDirectory(
          processor.directory,
        );
        setPrompts(loadedPrompts);
      } catch (error) {
        console.error("加载提示词失败:", error);
        setPrompts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPrompts();
  }, [processor.directory]);

  return (
    <List navigationTitle={processor.name} isLoading={isLoading}>
      {prompts.map((prompt, index) => (
        <List.Item
          key={index}
          icon={Icon.SpeechBubbleActive}
          title={prompt.title}
          subtitle={`${prompt.inputs.length} 个变量`}
          accessories={[{ text: "提示词" }]}
          actions={
            <ActionPanel>
              <Action.Push
                title="打开提示词"
                icon={Icon.Pencil}
                target={<PromptForm config={prompt} />}
              />
              {prompt.filePath && (
                <Action.Open
                  title="在 Obsidian 中打开"
                  icon={Icon.Document}
                  target={`obsidian://open?path=${encodePathForObsidian(prompt.filePath)}`}
                  shortcut={{ modifiers: ["cmd"], key: "l" }}
                />
              )}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
