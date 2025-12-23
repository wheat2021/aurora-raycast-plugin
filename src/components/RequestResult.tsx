import { Detail, ActionPanel, Action, Icon } from "@raycast/api";
import { ShortcutsMetadata } from "./ShortcutsMetadata";
import { MarkdownBuilder } from "../utils/markdownBuilder";

interface RequestResultProps {
  success: boolean;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: unknown;
  error?: string;
  onBack?: () => void; // 回调函数，用于返回表单
}

export function RequestResult(props: RequestResultProps) {
  const { success, method, url, status, statusText, headers, data, error } =
    props;

  // 格式化响应数据
  const formatData = (data: unknown): string => {
    if (data === undefined || data === null) {
      return "";
    }

    if (typeof data === "string") {
      return data;
    }

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // 构建 Markdown 内容
  const buildMarkdown = (): string => {
    const builder = new MarkdownBuilder();

    // 标题
    builder.title(success ? '请求成功' : '请求失败', 1, success ? '✅' : '❌');

    // 响应数据
    if (data !== undefined && data !== null) {
      const formattedData = formatData(data);
      const language = typeof data === "object" ? "json" : undefined;

      builder
        .heading('响应数据', '📦')
        .codeBlock(formattedData, language);
    }

    // 错误信息（如果失败）
    if (!success && error) {
      builder
        .heading('错误信息', '⚠️')
        .codeBlock(error)
        .separator();
    }

    // 请求信息
    const requestInfoItems = [
      `${MarkdownBuilder.bold('方法')}: ${MarkdownBuilder.inlineCode(method)}`,
      `${MarkdownBuilder.bold('URL')}: ${MarkdownBuilder.inlineCode(url)}`,
    ];

    if (status !== undefined) {
      requestInfoItems.push(
        `${MarkdownBuilder.bold('状态码')}: ${MarkdownBuilder.inlineCode(`${status} ${statusText || ""}`)}`
      );
    }

    builder
      .heading('请求信息', '📤')
      .list(requestInfoItems)
      .separator();

    // 响应头
    if (headers && Object.keys(headers).length > 0) {
      builder
        .heading('响应头', '📋')
        .codeBlock(JSON.stringify(headers, null, 2), 'json')
        .separator();
    }

    return builder.build();
  };

  const markdown = buildMarkdown();

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
          {/* 响应数据复制 - 成功时优先显示 */}
          {success && data !== undefined && data !== null && (
            <>
              <Action.CopyToClipboard
                title="复制响应数据"
                content={formatData(data)}
                icon={Icon.Text}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
              <Action.Paste
                title="粘贴响应数据"
                content={formatData(data)}
                icon={Icon.Clipboard}
                shortcut={{ modifiers: ["cmd"], key: "v" }}
              />
            </>
          )}
          <Action.CopyToClipboard
            title="复制 URL"
            content={url}
            icon={Icon.Link}
            shortcut={{ modifiers: ["cmd"], key: "u" }}
          />
          {/* 其他复制选项 */}
          {!success && data !== undefined && data !== null && (
            <Action.CopyToClipboard
              title="复制响应数据"
              content={formatData(data)}
              icon={Icon.Text}
            />
          )}
          <Action.CopyToClipboard
            title="复制完整结果"
            content={markdown}
            icon={Icon.Document}
            shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
          />
          {/* 导航操作 */}
          {props.onBack && (
            <ActionPanel.Section title="导航">
              <Action
                title="返回表单"
                icon={Icon.ArrowLeft}
                shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                onAction={props.onBack}
              />
            </ActionPanel.Section>
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
          {status !== undefined && (
            <Detail.Metadata.Label
              title="HTTP 状态码"
              text={`${status} ${statusText || ""}`}
            />
          )}
          <ShortcutsMetadata
            shortcuts={
              success
                ? [
                    { key: "⌘C", description: "复制数据" },
                    { key: "⌘V", description: "粘贴数据" },
                    { key: "⌘U", description: "复制URL" },
                    { key: "⌘⇧A", description: "复制完整结果" },
                  ]
                : [
                    { key: "⌘E", description: "复制错误" },
                    { key: "⌘U", description: "复制URL" },
                    { key: "⌘⇧A", description: "复制完整结果" },
                  ]
            }
          />
        </Detail.Metadata>
      }
    />
  );
}
