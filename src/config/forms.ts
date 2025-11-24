import { FormConfig, InputType, JsonFormConfig, InputConfig } from "../types/form";
import personalInfoJson from "../configs/personal-info.json";
import workInfoJson from "../configs/work-info.json";
import preferencesJson from "../configs/preferences.json";

// 将 JSON 配置转换为 FormConfig
function mapJsonToFormConfig(json: JsonFormConfig): FormConfig {
  return {
    title: json.title,
    inputs: json.inputs.map((input) => ({
      ...input,
      inputType: InputType[input.inputType],
    })) as InputConfig[],
  };
}

// 加载所有表单配置
export function loadFormConfigs(): FormConfig[] {
  const configs: JsonFormConfig[] = [
    personalInfoJson as JsonFormConfig,
    workInfoJson as JsonFormConfig,
    preferencesJson as JsonFormConfig,
  ];

  return configs.map(mapJsonToFormConfig);
}

// 根据索引获取表单配置
export function getFormConfig(index: number): FormConfig | null {
  const configs = loadFormConfigs();
  return configs[index] || null;
}

// 获取表单配置数量
export function getFormConfigCount(): number {
  return loadFormConfigs().length;
}
