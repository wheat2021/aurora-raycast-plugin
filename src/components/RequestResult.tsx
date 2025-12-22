import { Detail, ActionPanel, Action, Icon } from "@raycast/api";

interface RequestResultProps {
  success: boolean;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: unknown;
  error?: string;
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
    const sections: string[] = [];

    // 标题
    if (success) {
      sections.push(`# ✅ 请求成功\n`);
    } else {
      sections.push(`# ❌ 请求失败\n`);
    }

    // 请求信息
    sections.push(`## 📤 请求信息\n`);
    sections.push(`- **方法**: \`${method}\``);
    sections.push(`- **URL**: \`${url}\``);

    if (status !== undefined) {
      sections.push(`- **状态码**: \`${status} ${statusText || ""}\``);
    }

    sections.push("");

    // 错误信息（如果失败）
    if (!success && error) {
      sections.push(`## ⚠️ 错误信息\n`);
      sections.push("```");
      sections.push(error);
      sections.push("```");
      sections.push("");
    }

    // 响应头
    if (headers && Object.keys(headers).length > 0) {
      sections.push(`## 📋 响应头\n`);
      sections.push("```json");
      sections.push(JSON.stringify(headers, null, 2));
      sections.push("```");
      sections.push("");
    }

    // 响应数据
    if (data !== undefined && data !== null) {
      sections.push(`## 📦 响应数据\n`);

      const formattedData = formatData(data);

      // 判断是否为 JSON 格式
      if (typeof data === "object") {
        sections.push("```json");
        sections.push(formattedData);
        sections.push("```");
      } else {
        sections.push("```");
        sections.push(formattedData);
        sections.push("```");
      }
    }

    return sections.join("\n");
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
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="请求方法" text={method} />
          <Detail.Metadata.Label title="请求 URL" text={url} icon={Icon.Link} />
          <Detail.Metadata.Label
            title="💡 提示"
            text={
              success ? "⌘C 复制数据 | ⌘U 复制URL" : "⌘E 复制错误 | ⌘U 复制URL"
            }
          />
          {headers && Object.keys(headers).length > 0 && (
            <>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label
                title="响应头数量"
                text={`${Object.keys(headers).length} 个`}
              />
            </>
          )}
          {data !== undefined && data !== null && (
            <>
              <Detail.Metadata.Separator />
              <Detail.Metadata.Label
                title="响应数据大小"
                text={`${formatData(data).length} 字符`}
              />
            </>
          )}
        </Detail.Metadata>
      }
    />
  );
}
