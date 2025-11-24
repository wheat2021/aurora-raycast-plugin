import { showToast, Toast, Clipboard } from "@raycast/api";
import { FormValues } from "../types/form";

// 格式化表单结果为可读字符串
export function formatFormValues(values: FormValues): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: ${value.join(", ")}`);
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value ? "是" : "否"}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.join("\n");
}

// 处理表单提交
export async function handleFormSubmit(values: FormValues, formTitle: string) {
  try {
    // 格式化数据
    const formattedText = formatFormValues(values);

    // 复制到剪贴板
    await Clipboard.copy(formattedText);

    // 显示成功提示
    await showToast({
      style: Toast.Style.Success,
      title: `${formTitle} 提交成功`,
      message: "结果已复制到剪贴板",
    });

    return true;
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "提交失败",
      message: error instanceof Error ? error.message : "未知错误",
    });
    return false;
  }
}
