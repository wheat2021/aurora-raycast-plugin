import { PromptConfig, PromptValues, PromptInput } from "../types/prompt";

/**
 * Deeplink 验证结果
 */
export interface ValidationResult {
  values: PromptValues; // 合并后的表单值
  warnings: Record<string, string>; // 验证警告信息
  isComplete: boolean; // 是否所有必填项都已填写
}

/**
 * 验证并合并 deeplink 提供的 inputs 参数
 *
 * @param config - 提示词配置
 * @param deeplinkInputs - Deeplink 提供的输入参数
 * @returns 验证结果，包含合并后的值、警告信息和完整性标志
 */
export function validateAndMergeInputs(
  config: PromptConfig,
  deeplinkInputs: Record<string, unknown>,
): ValidationResult {
  const values: PromptValues = {};
  const warnings: Record<string, string> = {};

  for (const input of config.inputs) {
    const deeplinkValue = deeplinkInputs[input.id];

    // 1. Deeplink 未提供该字段，使用配置默认值
    if (deeplinkValue === undefined) {
      const defaultValue = getDefaultValue(input);
      if (defaultValue !== undefined) {
        values[input.id] = defaultValue;
      }
      continue;
    }

    // 2. 验证类型
    const typeValidation = validateType(input, deeplinkValue);
    if (!typeValidation.valid) {
      warnings[input.id] = typeValidation.error;
      const defaultValue = getDefaultValue(input);
      if (defaultValue !== undefined) {
        values[input.id] = defaultValue;
      }
      continue;
    }

    // 3. 验证 options（select/multiselect）
    if (input.options) {
      const optionsValidation = validateOptions(input, deeplinkValue);
      if (!optionsValidation.valid) {
        warnings[input.id] = optionsValidation.error;
        const defaultValue = getDefaultValue(input);
        if (defaultValue !== undefined) {
          values[input.id] = defaultValue;
        }
        continue;
      }
    }

    // 4. 验证通过，使用 deeplink 值
    values[input.id] = deeplinkValue as string | string[] | boolean;
  }

  // 检查是否所有必填项都已填写
  const isComplete = checkCompleteness(config.inputs, values);

  return { values, warnings, isComplete };
}

/**
 * 获取字段的默认值
 */
function getDefaultValue(input: PromptInput): string | string[] | boolean | undefined {
  if (input.default !== undefined) {
    return input.default;
  }

  if (input.options) {
    const defaultOptions = input.options.filter((opt) => opt.isDefault);
    if (defaultOptions.length > 0) {
      if (input.type === "multiselect") {
        return defaultOptions.map((opt) => opt.value);
      } else {
        return defaultOptions[0].value;
      }
    }
  }

  return undefined;
}

/**
 * 验证字段类型
 */
function validateType(
  input: PromptInput,
  value: unknown,
): { valid: boolean; error: string } {
  switch (input.type) {
    case "multiselect":
      if (!Array.isArray(value)) {
        return {
          valid: false,
          error: `类型错误：应为数组，收到 ${typeof value}`,
        };
      }
      // 检查数组元素是否都是字符串
      if (!value.every((item) => typeof item === "string")) {
        return {
          valid: false,
          error: "类型错误：数组元素应为字符串",
        };
      }
      break;

    case "select":
    case "text":
    case "textarea":
    case "selectInFolder":
      if (typeof value !== "string") {
        return {
          valid: false,
          error: `类型错误：应为字符串，收到 ${typeof value}`,
        };
      }
      break;

    case "checkbox":
      if (typeof value !== "boolean") {
        return {
          valid: false,
          error: `类型错误：应为布尔值，收到 ${typeof value}`,
        };
      }
      break;

    default:
      return {
        valid: false,
        error: `未知的字段类型: ${input.type}`,
      };
  }

  return { valid: true, error: "" };
}

/**
 * 验证选项值（用于 select 和 multiselect）
 */
function validateOptions(
  input: PromptInput,
  value: unknown,
): { valid: boolean; error: string } {
  if (!input.options) {
    return { valid: true, error: "" };
  }

  const validValues = input.options.map((opt) => opt.value);
  const valuesToCheck = Array.isArray(value) ? value : [value];

  const invalidValues = valuesToCheck.filter(
    (v) => !validValues.includes(v as string),
  );

  if (invalidValues.length > 0) {
    return {
      valid: false,
      error: `无效选项: ${invalidValues.join(", ")}`,
    };
  }

  return { valid: true, error: "" };
}

/**
 * 检查是否所有必填项都已填写
 */
function checkCompleteness(
  inputs: PromptInput[],
  values: PromptValues,
): boolean {
  return inputs
    .filter((input) => input.required)
    .every((input) => {
      const value = values[input.id];
      return (
        value !== undefined &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
      );
    });
}
