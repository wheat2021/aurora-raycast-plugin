import { Detail, ActionPanel, Action, Icon } from "@raycast/api";
import { ShortcutsMetadata } from "./ShortcutsMetadata";

interface CommandResultProps {
  success: boolean;
  commandLine: string;
  args?: string[];
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export function CommandResult({
  success,
  commandLine,
  args,
  exitCode,
  stdout,
  stderr,
  error,
}: CommandResultProps) {
  // 构建完整的命令字符串
  const fullCommand =
    args && args.length > 0 ? `${commandLine} ${args.join(" ")}` : commandLine;

  // 构建 Markdown 内容
  let markdown = `# ${success ? "✅ 命令执行成功" : "❌ 命令执行失败"}\n\n`;

  // 命令信息
  markdown += `## 命令\n\n\`\`\`bash\n${fullCommand}\n\`\`\`\n\n`;

  // 退出码
  if (exitCode !== undefined) {
    markdown += `## 退出码\n\n${exitCode}\n\n`;
  }

  // 成功时显示输出
  if (success) {
    if (stdout && stdout.trim()) {
      markdown += `## 标准输出 (stdout)\n\n\`\`\`\n${stdout.trim()}\n\`\`\`\n\n`;
    } else {
      markdown += `## 标准输出 (stdout)\n\n*无输出*\n\n`;
    }

    if (stderr && stderr.trim()) {
      markdown += `## 标准错误 (stderr)\n\n\`\`\`\n${stderr.trim()}\n\`\`\`\n\n`;
    }
  }
  // 失败时显示错误信息
  else {
    if (error) {
      markdown += `## 错误信息\n\n\`\`\`\n${error}\n\`\`\`\n\n`;
    }

    if (stderr && stderr.trim()) {
      markdown += `## 标准错误 (stderr)\n\n\`\`\`\n${stderr.trim()}\n\`\`\`\n\n`;
    }

    if (stdout && stdout.trim()) {
      markdown += `## 标准输出 (stdout)\n\n\`\`\`\n${stdout.trim()}\n\`\`\`\n\n`;
    }
  }

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          {/* 错误信息复制 - 失败时优先显示 */}
          {!success && error && (
            <Action.CopyToClipboard
              title="复制错误信息"
              content={error}
              icon={Icon.ExclamationMark}
              shortcut={{ modifiers: ["cmd"], key: "e" }}
            />
          )}
          {/* 标准输出复制 - 成功时优先显示 */}
          {success && stdout && stdout.trim() && (
            <Action.CopyToClipboard
              title="复制标准输出"
              content={stdout}
              icon={Icon.Text}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
          )}
          <Action.CopyToClipboard
            title="复制完整命令"
            content={fullCommand}
            icon={Icon.Terminal}
            shortcut={{ modifiers: ["cmd"], key: "l" }}
          />
          <Action.CopyToClipboard
            title="复制命令行路径"
            content={commandLine}
            icon={Icon.Snippets}
            shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
          />
          {/* 其他输出复制选项 */}
          {!success && stdout && stdout.trim() && (
            <Action.CopyToClipboard
              title="复制标准输出"
              content={stdout}
              icon={Icon.Text}
            />
          )}
          {stderr && stderr.trim() && (
            <Action.CopyToClipboard
              title="复制标准错误"
              content={stderr}
              icon={Icon.Warning}
              shortcut={{ modifiers: ["cmd", "shift"], key: "e" }}
            />
          )}
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="状态"
            text={success ? "成功" : "失败"}
            icon={success ? Icon.CheckCircle : Icon.XMarkCircle}
          />
          {exitCode !== undefined && (
            <Detail.Metadata.Label title="退出码" text={String(exitCode)} />
          )}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="命令行路径"
            text={commandLine}
            icon={Icon.Terminal}
          />
          {args && args.length > 0 && (
            <Detail.Metadata.Label title="参数" text={args.join(" ")} />
          )}
          <ShortcutsMetadata
            shortcuts={
              success
                ? [
                    { key: "⌘C", description: "复制输出" },
                    { key: "⌘L", description: "复制完整命令" },
                    { key: "⌘⇧L", description: "复制命令行路径" },
                    { key: "⌘⇧E", description: "复制标准错误" },
                  ]
                : [
                    { key: "⌘E", description: "复制错误" },
                    { key: "⌘L", description: "复制完整命令" },
                    { key: "⌘⇧L", description: "复制命令行路径" },
                    { key: "⌘⇧E", description: "复制标准错误" },
                  ]
            }
          />
        </Detail.Metadata>
      }
    />
  );
}
