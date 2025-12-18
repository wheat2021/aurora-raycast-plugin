import { PromptInput } from "../types/prompt";

/**
 * 将字段值转换为字符串（用于模板替换）
 * @param value 字段值
 * @param input 字段配置（可选，用于 checkbox 自定义值）
 * @returns 字符串表示
 */
export function valueToTemplateString(
  value: string | string[] | boolean,
  input?: PromptInput,
): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    // 如果是 checkbox 类型且配置了自定义值，使用自定义值
    if (input?.type === "checkbox") {
      if (value) {
        return input.trueValue !== undefined ? input.trueValue : "是";
      } else {
        return input.falseValue !== undefined ? input.falseValue : "否";
      }
    }
    // 默认行为
    return value ? "是" : "否";
  }

  return String(value);
}

/**
 * 将字段值转换为字符串（用于命令执行和 API 请求）
 * @param value 字段值
 * @param input 字段配置（可选，用于 checkbox 自定义值）
 * @returns 字符串表示
 */
export function valueToCommandString(
  value: string | string[] | boolean,
  input?: PromptInput,
): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    // 如果是 checkbox 类型且配置了自定义值，使用自定义值
    if (input?.type === "checkbox") {
      if (value) {
        return input.trueValue !== undefined ? input.trueValue : "true";
      } else {
        return input.falseValue !== undefined ? input.falseValue : "false";
      }
    }
    // 默认行为
    return value ? "true" : "false";
  }

  return String(value);
}
