import { DescriptionConfig, FormValues, InputConfig } from "../types/form";

// 计算动态描述
export function getDescription(
  config: InputConfig,
  formValues: FormValues,
): string {
  if (!config.description) {
    return "";
  }

  // 如果是字符串，直接返回
  if (typeof config.description === "string") {
    return config.description;
  }

  // 如果是条件描述数组，评估表达式
  const descriptions = config.description as DescriptionConfig[];
  for (const desc of descriptions) {
    if (evaluateExpression(desc.expression, formValues)) {
      return desc.value;
    }
  }

  return "";
}

// 安全地评估表达式
function evaluateExpression(
  expression: string,
  formValues: FormValues,
): boolean {
  try {
    // 创建一个受限的求值环境，只允许访问 formValues 中的变量
    const fn = new Function(
      ...Object.keys(formValues),
      `return ${expression};`,
    );
    return fn(...Object.values(formValues));
  } catch (error) {
    console.error("Expression evaluation error:", error);
    return false;
  }
}
