import { Detail, ActionPanel, Action, Icon } from "@raycast/api";

interface ConfigGuideProps {
  processorId?: string;
  showOpenCommandPreferences?: boolean;
}

export function ConfigGuide({
  processorId,
  showOpenCommandPreferences = false,
}: ConfigGuideProps) {
  const markdown = `
# 如何配置 Input Processor 命令

${processorId ? `✅ Processor ID: \`${processorId}\` 已复制到剪贴板\n` : ""}

## 配置步骤

1. **打开 Raycast 设置**
   - 快捷键：\`Cmd + ,\`
   - 或者点击下方的 "打开扩展设置" 按钮

2. **找到扩展**
   - 在左侧导航栏找到 "Extensions"
   - 找到 "Aurora Input Processor" 扩展

3. **选择命令槽位**
   - 找到任意一个 "Input Processor N" 命令 (N = 1-10)
   - 选择尚未使用的命令

4. **配置 Processor ID**
   - 在 "Processor ID" 字段粘贴 ID
   ${processorId ? `- 粘贴值：\`${processorId}\`` : ""}

5. **启用命令**
   - 勾选 "Enable Command" 复选框

6. **设置快捷键（可选）**
   - 点击 "Record Hotkey" 设置你喜欢的快捷键
   - 这样就可以通过快捷键直接打开该 Processor

## 提示

- 最多可以配置 **10 个独立的 Processor 命令**
- 每个命令都可以设置不同的快捷键
- 如需更多命令槽位，可以在项目中添加更多 processor-N 命令

## 获取 Processor ID

使用 "Create Input Processor" 命令创建新 Processor 后，ID 会自动复制到剪贴板。

或者使用 "Manage Input Processors" 命令查看所有已创建的 Processor，选择一个并使用 \`Cmd + C\` 复制其 ID。
`;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          {showOpenCommandPreferences && (
            <Action
              title="打开命令设置"
              icon={Icon.Gear}
              onAction={async () => {
                const { openCommandPreferences } = await import("@raycast/api");
                openCommandPreferences();
              }}
              shortcut={{ modifiers: ["cmd"], key: "," }}
            />
          )}
          <Action
            title="打开扩展设置"
            icon={Icon.Cog}
            onAction={async () => {
              const { openExtensionPreferences } = await import("@raycast/api");
              openExtensionPreferences();
            }}
            shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
          />
        </ActionPanel>
      }
    />
  );
}
