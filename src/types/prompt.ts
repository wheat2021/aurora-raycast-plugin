/**
 * 提示词输入类型
 */
export type PromptInputType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "selectInFolder";

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
  folder?: string; // 用于 selectInFolder，指定读取的目录路径
  valueItemType?: 0 | 1 | 2; // 用于 selectInFolder: 0=目录和文件(默认), 1=仅目录, 2=仅文件
  regIncludeFilter?: string; // 用于 selectInFolder，正则表达式包含过滤器
  regExcludeFilter?: string; // 用于 selectInFolder，正则表达式排除过滤器
}

/**
 * HTTP 请求方法
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * REST API 请求配置
 */
export interface RequestConfig {
  method: HttpMethod; // HTTP 请求方法
  url: string; // 请求 URL，支持变量替换 {{variable}}
  query?: Record<string, string | number | boolean>; // Query 参数，支持变量替换
  headers?: Record<string, string>; // 请求头，支持变量替换
  body?: string | Record<string, unknown>; // 请求体，支持变量替换
  timeout?: number; // 超时时间（毫秒），默认 30000
}

/**
 * 提示词配置（从 Markdown frontmatter 解析）
 */
export interface PromptConfig {
  title: string;
  formDescription?: string; // 可选：表单整体说明文字
  execScript?: string; // 可选：指定脚本路径，存在时执行脚本而非粘贴/复制内容
  request?: RequestConfig; // 可选：REST API 请求配置，存在时执行请求而非粘贴/复制内容
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
