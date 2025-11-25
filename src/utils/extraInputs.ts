import { PromptValues, PromptInput } from "../types/prompt";
import { FormValues, InputConfig } from "../types/form";

// 计算应该显示的字段 IDs（Prompt 版本）
export function getVisibleInputIds(
  inputs: PromptInput[],
  formValues: PromptValues,
): Set<string> {
  const visibleIds = new Set<string>();

  // 首先添加所有非 extraInput 的字段
  inputs.forEach((input) => {
    if (!input.isExtraInput) {
      visibleIds.add(input.id);
    }
  });

  // 遍历所有字段，检查是否需要显示 extraInputs
  inputs.forEach((input) => {
    if (!visibleIds.has(input.id)) {
      return;
    }

    const value = formValues[input.id];
    if (!input.options || !value) {
      return;
    }

    // 处理单选（字符串）
    if (typeof value === "string") {
      const selectedOption = input.options.find((opt) => opt.value === value);
      if (selectedOption?.extraInputs) {
        selectedOption.extraInputs.forEach((id) => visibleIds.add(id));
      }
    }

    // 处理多选（数组）
    if (Array.isArray(value)) {
      value.forEach((selectedValue) => {
        const selectedOption = input.options?.find(
          (opt) => opt.value === selectedValue,
        );
        if (selectedOption?.extraInputs) {
          selectedOption.extraInputs.forEach((id) => visibleIds.add(id));
        }
      });
    }
  });

  return visibleIds;
}

// 获取应该显示的字段配置列表（Prompt 版本）
export function getVisibleInputs(
  inputs: PromptInput[],
  formValues: PromptValues,
): PromptInput[] {
  const visibleIds = getVisibleInputIds(inputs, formValues);
  return inputs.filter((input) => visibleIds.has(input.id));
}

// 旧版本兼容（Form 版本）
export function getVisibleInputIdsForm(
  inputs: InputConfig[],
  formValues: FormValues,
): Set<string> {
  const visibleIds = new Set<string>();

  inputs.forEach((input) => {
    if (!input.isExtraInput) {
      visibleIds.add(input.id);
    }
  });

  inputs.forEach((input) => {
    if (!visibleIds.has(input.id)) {
      return;
    }

    const value = formValues[input.id];
    if (!input.values || !value) {
      return;
    }

    if (typeof value === "string") {
      const selectedOption = input.values.find((v) => v.value === value);
      if (selectedOption?.extraInputs) {
        selectedOption.extraInputs.forEach((id) => visibleIds.add(id));
      }
    }

    if (Array.isArray(value)) {
      value.forEach((selectedValue) => {
        const selectedOption = input.values?.find(
          (v) => v.value === selectedValue,
        );
        if (selectedOption?.extraInputs) {
          selectedOption.extraInputs.forEach((id) => visibleIds.add(id));
        }
      });
    }
  });

  return visibleIds;
}

export function getVisibleInputsForm(
  inputs: InputConfig[],
  formValues: FormValues,
): InputConfig[] {
  const visibleIds = getVisibleInputIdsForm(inputs, formValues);
  return inputs.filter((input) => visibleIds.has(input.id));
}
