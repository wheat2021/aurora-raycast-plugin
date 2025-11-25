/**
 * 提示词输入类型
 */
export type PromptInputType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox";

/**
 * 选项配置（用于 select 和 multiselect）
 */
export interface PromptOption {
  value: string;
  label?: string; // 可选，默认使用 value
  isDefault?: boolean;
  extraInputs?: string[]; // 选中时显示的额外字段 ID
}

/**
 * 提示词输入字段配置
 */
export interface PromptInput {
  id: string;
  label: string;
  type: PromptInputType;
  required?: boolean;
  default?: string | string[] | boolean;
  description?: string;
  isExtraInput?: boolean; // 是否为条件显示字段
  options?: PromptOption[]; // 用于 select/multiselect
}

/**
 * 提示词配置（从 Markdown frontmatter 解析）
 */
export interface PromptConfig {
  title: string;
  formDescription?: string; // 可选：表单整体说明文字
  inputs: PromptInput[];
  content: string; // Markdown 正文，用于模板替换
  filePath?: string; // 可选：源文件路径，用于调试
}

/**
 * 用户输入的表单值
 */
export interface PromptValues {
  [key: string]: string | string[] | boolean;
}
