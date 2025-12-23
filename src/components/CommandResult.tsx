import { Detail, ActionPanel, Action, Icon } from "@raycast/api";
import { ShortcutsMetadata } from "./ShortcutsMetadata";
import { MarkdownBuilder } from "../utils/markdownBuilder";

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
  const builder = new MarkdownBuilder();

  // 标题
  builder.title(
    success ? "命令执行成功" : "命令执行失败",
    1,
    success ? "✅" : "❌",
  );

  // 命令信息
  builder.heading("命令").codeBlock(fullCommand, "bash").separator();

  // 成功时显示输出
  if (success) {
    builder.heading("标准输出 (stdout)");

    if (stdout && stdout.trim()) {
      builder.codeBlock(stdout.trim()).separator();
    } else {
      builder.text("*无输出*").separator();
    }

    if (stderr && stderr.trim()) {
      builder.heading("标准错误 (stderr)").codeBlock(stderr.trim()).separator();
    }
  }
  // 失败时显示错误信息
  else {
    if (error) {
      builder.heading("错误信息").codeBlock(error).separator();
    }

    if (stderr && stderr.trim()) {
      builder.heading("标准错误 (stderr)").codeBlock(stderr.trim()).separator();
    }

    if (stdout && stdout.trim()) {
      builder.heading("标准输出 (stdout)").codeBlock(stdout.trim()).separator();
    }
  }

  const markdown = builder.build();

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
          <ShortcutsMetadata
            shortcuts={
              success
                ? [
                    { key: "⌘C", description: "复制输出" },
                    { key: "⌘L", description: "复制完整命令" },
                    { key: "⌘⇧E", description: "复制标准错误" },
                  ]
                : [
                    { key: "⌘E", description: "复制错误" },
                    { key: "⌘L", description: "复制完整命令" },
                    { key: "⌘⇧E", description: "复制标准错误" },
                  ]
            }
          />
        </Detail.Metadata>
      }
    />
  );
}
