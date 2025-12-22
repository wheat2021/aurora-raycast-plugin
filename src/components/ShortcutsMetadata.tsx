import { Detail } from "@raycast/api";

/**
 * 快捷键定义
 */
export interface Shortcut {
  /** 快捷键组合，如 "⌘C" */
  key: string;
  /** 快捷键描述，如 "复制数据" */
  description: string;
}

/**
 * 快捷键 Metadata 组件属性
 */
interface ShortcutsMetadataProps {
  /** 快捷键列表 */
  shortcuts: Shortcut[];
  /** 标题，默认为 "💡 快捷键" */
  title?: string;
}

/**
 * 统一的快捷键 Metadata 组件
 *
 * 以无序列表形式展示当前 UI 可用的快捷键，确保各个 UI 模块统一使用
 *
 * @example
 * ```tsx
 * <ShortcutsMetadata
 *   shortcuts={[
 *     { key: "⌘C", description: "复制数据" },
 *     { key: "⌘U", description: "复制URL" }
 *   ]}
 * />
 * ```
 */
export function ShortcutsMetadata({
  shortcuts,
  title = "💡 快捷键",
}: ShortcutsMetadataProps) {
  // 将快捷键数组格式化为无序列表文本
  const formattedText = shortcuts
    .map((shortcut) => `• ${shortcut.key} ${shortcut.description}`)
    .join("\n");

  return <Detail.Metadata.Label title={title} text={formattedText} />;
}
