import { PromptValues, PromptInput } from "../types/prompt";
import { valueToTemplateString } from "./valueConverter";
import {
  replaceUserVariables,
  replaceRaycastVariables,
} from "./variableReplacer";

/**
 * 将表单值替换到模板内容中
 * @param content 包含 {{variable}} 占位符的模板内容
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的输入字段 ID 集合（用于判断 extraInput 字段是否显示）
 * @param inputs 输入字段配置列表（用于获取 checkbox 自定义值配置）
 * @param selection 当前选中的文本（可选）
 * @param clipboard 剪贴板内容（可选）
 * @returns 替换后的内容
 */
export function replaceTemplate(
  content: string,
  values: PromptValues,
  visibleInputIds: Set<string>,
  inputs: PromptInput[],
  selection?: string,
  clipboard?: string,
): string {
  // 1. 先替换 Raycast 内置变量 {selection} 和 {clipboard}
  let result = replaceRaycastVariables(content, selection, clipboard);

  // 2. 替换用户自定义变量 {{variable}}
  result = replaceUserVariables(
    result,
    values,
    visibleInputIds,
    inputs,
    valueToTemplateString,
  );

  return result;
}
