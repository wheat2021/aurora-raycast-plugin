import { FormValues, InputConfig } from "../types/form";

// 计算应该显示的字段 IDs
export function getVisibleInputIds(
  inputs: InputConfig[],
  formValues: FormValues,
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
    if (!input.values || !value) {
      return;
    }

    // 处理单选（字符串）
    if (typeof value === "string") {
      const selectedOption = input.values.find((v) => v.value === value);
      if (selectedOption?.extraInputs) {
        selectedOption.extraInputs.forEach((id) => visibleIds.add(id));
      }
    }

    // 处理多选（数组）
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

// 获取应该显示的字段配置列表
export function getVisibleInputs(
  inputs: InputConfig[],
  formValues: FormValues,
): InputConfig[] {
  const visibleIds = getVisibleInputIds(inputs, formValues);
  return inputs.filter((input) => visibleIds.has(input.id));
}
