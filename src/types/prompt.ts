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
  copy?: PromptInputType; // 从模板复制配置（仅在配置文件中使用，处理后会被移除）
  required?: boolean;
  default?: string | string[] | boolean;
  description?: string;
  isExtraInput?: boolean; // 是否为条件显示字段
  options?: PromptOption[]; // 用于 select/multiselect
  folder?: string; // 用于 selectInFolder，指定读取的目录路径
  valueItemType?: 0 | 1 | 2; // 用于 selectInFolder: 0=目录和文件(默认), 1=仅目录, 2=仅文件
  regIncludeFilter?: string; // 用于 selectInFolder，正则表达式包含过滤器
  regExcludeFilter?: string; // 用于 selectInFolder，正则表达式排除过滤器
  trueValue?: string; // 用于 checkbox，自定义 true 时的输出值，默认为 "true" (命令/请求) 或 "是" (模板)
  falseValue?: string; // 用于 checkbox，自定义 false 时的输出值，默认为 "false" (命令/请求) 或 "否" (模板)
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
 * 命令执行配置
 */
export interface CommandConfig {
  commandLine: string; // 必填：命令或脚本路径，支持变量替换 {{variable}}
  args?: string[]; // 可选：命令行参数数组，支持变量替换 {{variable}}
  envs?: Record<string, string>; // 可选：环境变量，支持变量替换 {{variable}}
  cwd?: string; // 可选：工作目录，支持变量替换 {{variable}}
  timeout?: number; // 可选：超时时间（毫秒），默认 30000
}

/**
 * 提示词配置（从 Markdown frontmatter 解析）
 */
export interface PromptConfig {
  id?: string; // 可选：唯一标识符（通常使用文件路径），用于缓存等功能
  title: string;
  formDescription?: string; // 可选：表单整体说明文字
  execScript?: string; // 可选（已废弃）：指定脚本路径，建议使用 command
  command?: CommandConfig; // 可选：命令执行配置，存在时执行命令而非粘贴/复制内容
  request?: RequestConfig; // 可选：REST API 请求配置，存在时执行请求而非粘贴/复制内容
  inputs: PromptInput[];
  content: string; // Markdown 正文，用于模板替换
  filePath?: string; // 可选：源文件路径，用于调试
  lastUseTime?: number; // 可选：最后使用时间戳（毫秒），用于排序
}

/**
 * 用户输入的表单值
 */
export interface PromptValues {
  [key: string]: string | string[] | boolean;
}

/**
 * Input 模板
 */
export interface InputTemplate {
  id: string; // 唯一标识符，预设模板使用 type，自定义模板使用 UUID
  name: string; // 模板名称
  type: PromptInputType; // 模板类型
  isBuiltIn: boolean; // 是否为预设模板
  config: Partial<PromptInput>; // 模板配置
  createdAt?: number; // 创建时间戳
  updatedAt?: number; // 更新时间戳
}
