import { PromptValues, PromptInput } from "../types/prompt";

/**
 * 用户自定义变量的正则表达式：{{variable}} 或 {{variable-name}}
 * 支持字母、数字、下划线和连字符
 */
export const USER_VARIABLE_REGEX = /\{\{([\w-]+)\}\}/g;

/**
 * Raycast 内置变量：{selection}
 */
export const RAYCAST_SELECTION_REGEX = /\{selection\}/g;

/**
 * Raycast 内置变量：{clipboard}
 */
export const RAYCAST_CLIPBOARD_REGEX = /\{clipboard\}/g;

/**
 * 值转换函数类型
 * 用于将表单值转换为字符串（不同场景可能有不同的转换逻辑）
 */
export type ValueConverter = (
  value: string | string[] | boolean,
  input?: PromptInput,
) => string;

/**
 * 替换用户自定义变量 {{variable}}
 *
 * @param template 包含 {{variable}} 占位符的模板字符串
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的输入字段 ID 集合（隐藏字段将被替换为空字符串）
 * @param inputs 输入字段配置列表（用于获取字段类型等信息）
 * @param valueConverter 值转换函数（将表单值转换为字符串）
 * @returns 替换后的字符串
 */
export function replaceUserVariables(
  template: string,
  values: PromptValues,
  visibleInputIds: Set<string>,
  inputs: PromptInput[],
  valueConverter: ValueConverter,
): string {
  // 创建 input 配置的快速查找映射
  const inputMap = new Map<string, PromptInput>();
  inputs.forEach((input) => {
    inputMap.set(input.id, input);
  });

  // 替换所有用户变量
  return template.replace(USER_VARIABLE_REGEX, (match, varName) => {
    // 如果变量对应的字段不在可见字段列表中，返回空字符串
    if (!visibleInputIds.has(varName)) {
      return "";
    }

    const value = values[varName];

    // 如果值未定义，返回空字符串
    if (value === undefined || value === null) {
      return "";
    }

    // 获取对应的 input 配置
    const input = inputMap.get(varName);

    // 使用传入的值转换函数进行转换
    return valueConverter(value, input);
  });
}

/**
 * 替换 Raycast 内置变量 {selection} 和 {clipboard}
 *
 * @param content 包含 {selection} 或 {clipboard} 的内容
 * @param selection 当前选中的文本（可选）
 * @param clipboard 剪贴板内容（可选）
 * @returns 替换后的内容
 */
export function replaceRaycastVariables(
  content: string,
  selection?: string,
  clipboard?: string,
): string {
  let result = content;

  // 替换 {selection}
  result = result.replace(RAYCAST_SELECTION_REGEX, selection || "");

  // 替换 {clipboard}
  result = result.replace(RAYCAST_CLIPBOARD_REGEX, clipboard || "");

  return result;
}
