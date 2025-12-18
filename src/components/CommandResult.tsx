import { Detail, ActionPanel, Action } from "@raycast/api";

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
          {stdout && stdout.trim() && (
            <Action.CopyToClipboard
              title="复制标准输出"
              content={stdout}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
          )}
          {stderr && stderr.trim() && (
            <Action.CopyToClipboard
              title="复制标准错误"
              content={stderr}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          )}
          <Action.CopyToClipboard
            title="复制完整命令"
            content={fullCommand}
            shortcut={{ modifiers: ["cmd"], key: "l" }}
          />
        </ActionPanel>
      }
    />
  );
}
