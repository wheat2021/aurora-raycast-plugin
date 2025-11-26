import { Action, ActionPanel, List, Icon } from "@raycast/api";
import { loadPromptsFromDirectory } from "../config/prompts";
import { PromptForm } from "./PromptForm";
import { ProcessorConfig } from "../types/processor";

interface PromptListProps {
  processor: ProcessorConfig;
}

export function PromptList({ processor }: PromptListProps) {
  const prompts = loadPromptsFromDirectory(processor.directory);

  return (
    <List navigationTitle={processor.name}>
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
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
