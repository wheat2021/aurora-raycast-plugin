import { PromptValues } from "../types/prompt";

/**
 * 将表单值替换到模板内容中
 * @param content 包含 {{variable}} 占位符的模板内容
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的输入字段 ID 集合（用于判断 extraInput 字段是否显示）
 * @returns 替换后的内容
 */
export function replaceTemplate(
  content: string,
  values: PromptValues,
  visibleInputIds: Set<string>,
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    // 如果变量对应的字段不在可见字段列表中，返回空字符串
    if (!visibleInputIds.has(varName)) {
      return "";
    }

    const value = values[varName];

    // 如果值未定义，返回空字符串
    if (value === undefined || value === null) {
      return "";
    }

    // 处理数组类型（multiselect）
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    // 处理布尔类型（checkbox）
    if (typeof value === "boolean") {
      return value ? "是" : "否";
    }

    // 处理字符串类型
    return String(value);
  });
}
