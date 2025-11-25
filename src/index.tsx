import { Action, ActionPanel, List, Icon } from "@raycast/api";
import { loadPrompts } from "./config/prompts";
import { PromptForm } from "./components/PromptForm";

export default function Command() {
  const prompts = loadPrompts();

  return (
    <List>
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
