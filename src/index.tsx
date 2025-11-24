import { Action, ActionPanel, List, Icon } from "@raycast/api";
import { loadFormConfigs } from "./config/forms";
import { DynamicForm } from "./components/DynamicForm";

export default function Command() {
  const formConfigs = loadFormConfigs();

  return (
    <List>
      {formConfigs.map((config, index) => (
        <List.Item
          key={index}
          icon={Icon.Document}
          title={config.title}
          subtitle={`${config.inputs.length} 个字段`}
          accessories={[{ text: "动态表单" }]}
          actions={
            <ActionPanel>
              <Action.Push
                title="打开表单"
                icon={Icon.Pencil}
                target={<DynamicForm config={config} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
