import { LocalStorage } from "@raycast/api";
import { PromptInput, PromptInputType, InputTemplate } from "../types/prompt";

/**
 * Input 模板缓存键（旧版，兼容保留）
 */
const TEMPLATES_CACHE_KEY = "aurora_input_templates";

/**
 * Input 模板列表缓存键（新版）
 */
const TEMPLATES_LIST_CACHE_KEY = "aurora_input_templates_v2";

/**
 * 默认 Input 模板配置
 * 包含每种类型的所有可配置属性及合理的示例值
 */
const DEFAULT_TEMPLATES: Record<PromptInputType, Partial<PromptInput>> = {
  text: {
    id: "example_text",
    label: "文本输入",
    type: "text",
    required: false,
    default: "",
    description: "请输入文本内容",
    isExtraInput: false,
  },

  textarea: {
    id: "example_textarea",
    label: "多行文本",
    type: "textarea",
    required: false,
    default: "",
    description: "请输入多行文本内容",
    isExtraInput: false,
  },

  select: {
    id: "example_select",
    label: "单选下拉框",
    type: "select",
    required: false,
    description: "请选择一个选项",
    isExtraInput: false,
    options: [
      {
        value: "option1",
        label: "选项 1",
        isDefault: true,
      },
      {
        value: "option2",
        label: "选项 2",
      },
      {
        value: "option3",
        label: "选项 3",
        extraInputs: [], // 选中时显示的额外字段 ID 数组
      },
    ],
  },

  multiselect: {
    id: "example_multiselect",
    label: "多选标签",
    type: "multiselect",
    required: false,
    description: "可以选择多个选项",
    isExtraInput: false,
    default: [],
    options: [
      {
        value: "tag1",
        label: "标签 1",
      },
      {
        value: "tag2",
        label: "标签 2",
        isDefault: true,
      },
      {
        value: "tag3",
        label: "标签 3",
        extraInputs: [], // 选中时显示的额外字段 ID 数组
      },
    ],
  },

  checkbox: {
    id: "example_checkbox",
    label: "复选框",
    type: "checkbox",
    required: false,
    default: false,
    description: "勾选表示同意",
    isExtraInput: false,
    trueValue: "true", // 命令/请求模式默认值
    falseValue: "false", // 命令/请求模式默认值
    // 注意：在模板模式下，trueValue 默认为 "是"，falseValue 默认为 "否"
  },

  selectInFolder: {
    id: "example_select_in_folder",
    label: "文件夹选择",
    type: "selectInFolder",
    required: false,
    description: "从指定文件夹中选择",
    isExtraInput: false,
    folder: "/Users/yourname/Documents", // 必填：指定读取的目录路径
    valueItemType: 0, // 0=目录和文件(默认), 1=仅目录, 2=仅文件
    regIncludeFilter: "", // 可选：正则表达式包含过滤器，例如 "\\.(ts|js)$"
    regExcludeFilter: "", // 可选：正则表达式排除过滤器，例如 "node_modules"
    default: "",
  },
};

/**
 * 将默认模板转换为 InputTemplate 数组
 */
function getBuiltInTemplates(): InputTemplate[] {
  const types: PromptInputType[] = [
    "text",
    "textarea",
    "select",
    "multiselect",
    "checkbox",
    "selectInFolder",
  ];

  return types.map((type) => ({
    id: type, // 预设模板使用 type 作为 ID
    name: getTypeName(type),
    type,
    isBuiltIn: true,
    config: DEFAULT_TEMPLATES[type],
  }));
}

/**
 * 获取类型的中文名称
 */
function getTypeName(type: PromptInputType): string {
  const names: Record<PromptInputType, string> = {
    text: "文本输入",
    textarea: "多行文本",
    select: "单选下拉框",
    multiselect: "多选标签",
    checkbox: "复选框",
    selectInFolder: "文件夹选择",
  };
  return names[type];
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ==================== 新版多模板管理 API ====================

/**
 * 加载所有 Input 模板（预设 + 自定义）
 */
export async function loadAllTemplates(): Promise<InputTemplate[]> {
  try {
    const cached = await LocalStorage.getItem<string>(TEMPLATES_LIST_CACHE_KEY);
    let customTemplates: InputTemplate[] = [];

    if (cached) {
      customTemplates = JSON.parse(cached);
    }

    // 合并预设模板和自定义模板
    const builtInTemplates = getBuiltInTemplates();
    return [...builtInTemplates, ...customTemplates];
  } catch (error) {
    console.error("加载 Input 模板列表失败:", error);
    // 出错时只返回预设模板
    return getBuiltInTemplates();
  }
}

/**
 * 保存自定义模板列表
 */
async function saveCustomTemplates(templates: InputTemplate[]): Promise<void> {
  const customTemplates = templates.filter((t) => !t.isBuiltIn);
  await LocalStorage.setItem(
    TEMPLATES_LIST_CACHE_KEY,
    JSON.stringify(customTemplates),
  );
}

/**
 * 根据 ID 获取模板
 */
export async function getTemplateById(
  id: string,
): Promise<InputTemplate | undefined> {
  const templates = await loadAllTemplates();
  return templates.find((t) => t.id === id);
}

/**
 * 根据类型获取所有模板
 */
export async function getTemplatesByType(
  type: PromptInputType,
): Promise<InputTemplate[]> {
  const templates = await loadAllTemplates();
  return templates.filter((t) => t.type === type);
}

/**
 * 创建新的自定义模板
 */
export async function createTemplate(
  name: string,
  type: PromptInputType,
  config: Partial<PromptInput>,
): Promise<InputTemplate> {
  const templates = await loadAllTemplates();

  const newTemplate: InputTemplate = {
    id: generateId(),
    name,
    type,
    isBuiltIn: false,
    config,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updatedTemplates = [...templates, newTemplate];
  await saveCustomTemplates(updatedTemplates);

  return newTemplate;
}

/**
 * 更新模板
 */
export async function updateTemplate(
  id: string,
  updates: Partial<InputTemplate>,
): Promise<void> {
  const templates = await loadAllTemplates();
  const index = templates.findIndex((t) => t.id === id);

  if (index === -1) {
    throw new Error(`模板 ${id} 不存在`);
  }

  const template = templates[index];

  // 预设模板不允许修改某些字段
  if (template.isBuiltIn) {
    // 只允许修改 config
    if (updates.config) {
      templates[index] = {
        ...template,
        config: { ...template.config, ...updates.config },
        updatedAt: Date.now(),
      };
    }
  } else {
    // 自定义模板可以修改所有字段
    templates[index] = {
      ...template,
      ...updates,
      id: template.id, // ID 不可修改
      isBuiltIn: false, // isBuiltIn 不可修改
      updatedAt: Date.now(),
    };
  }

  await saveCustomTemplates(templates);
}

/**
 * 删除自定义模板
 */
export async function deleteTemplate(id: string): Promise<void> {
  const templates = await loadAllTemplates();
  const template = templates.find((t) => t.id === id);

  if (!template) {
    throw new Error(`模板 ${id} 不存在`);
  }

  if (template.isBuiltIn) {
    throw new Error("不能删除预设模板");
  }

  const updatedTemplates = templates.filter((t) => t.id !== id);
  await saveCustomTemplates(updatedTemplates);
}

/**
 * 重置预设模板为默认值
 */
export async function resetBuiltInTemplate(
  type: PromptInputType,
): Promise<void> {
  // 预设模板直接从 DEFAULT_TEMPLATES 读取，无需重置
  // 这个函数为了保持 API 一致性而保留
  await updateTemplate(type, { config: DEFAULT_TEMPLATES[type] });
}

// ==================== 旧版 API（兼容保留）====================

/**
 * 从缓存加载 Input 模板（旧版格式）
 */
export async function loadInputTemplates(): Promise<
  Record<PromptInputType, Partial<PromptInput>>
> {
  try {
    const cached = await LocalStorage.getItem<string>(TEMPLATES_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // 合并缓存和默认模板，确保总是有完整的类型覆盖
      return { ...DEFAULT_TEMPLATES, ...parsed };
    }
  } catch (error) {
    console.error("加载 Input 模板缓存失败:", error);
  }

  // 如果缓存不存在或加载失败，返回默认模板
  return DEFAULT_TEMPLATES;
}

/**
 * 保存 Input 模板到缓存（旧版格式）
 */
export async function saveInputTemplates(
  templates: Record<PromptInputType, Partial<PromptInput>>,
): Promise<void> {
  try {
    await LocalStorage.setItem(TEMPLATES_CACHE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("保存 Input 模板缓存失败:", error);
    throw error;
  }
}

/**
 * 获取指定类型的模板（旧版，返回预设模板）
 */
export async function getInputTemplate(
  type: PromptInputType,
): Promise<Partial<PromptInput> | undefined> {
  const templates = await loadInputTemplates();
  return templates[type];
}

/**
 * 更新指定类型的模板（旧版）
 */
export async function updateInputTemplate(
  type: PromptInputType,
  template: Partial<PromptInput>,
): Promise<void> {
  const templates = await loadInputTemplates();
  templates[type] = template;
  await saveInputTemplates(templates);
}

/**
 * 重置所有模板为默认值（旧版）
 */
export async function resetInputTemplates(): Promise<void> {
  await saveInputTemplates(DEFAULT_TEMPLATES);
}

/**
 * 从用户配置和模板合并生成完整的 Input 配置
 * @param userInput 用户配置的 Input（可能包含 copy 属性）
 * @returns 合并后的完整 Input 配置
 */
export async function mergeInputWithTemplate(
  userInput: Partial<PromptInput> & { copy?: PromptInputType },
): Promise<PromptInput | null> {
  // 如果包含 copy 属性，从缓存加载模板
  if (userInput.copy) {
    const template = await getInputTemplate(userInput.copy);
    if (!template) {
      console.warn(`未找到类型为 "${userInput.copy}" 的模板`);
      return null;
    }

    // 从用户配置中移除 copy 属性
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { copy, ...userConfig } = userInput;

    // 合并模板和用户配置（用户配置优先）
    const merged = {
      ...template,
      ...userConfig,
    } as PromptInput;

    // 确保必填字段存在
    if (!merged.id || !merged.label || !merged.type) {
      console.warn("合并后的配置缺少必填字段 (id, label, type)");
      return null;
    }

    return merged;
  }

  // 如果没有 copy 属性，直接返回用户配置
  if (userInput.id && userInput.label && userInput.type) {
    return userInput as PromptInput;
  }

  return null;
}

/**
 * 批量合并多个 Input 配置
 */
export async function mergeInputsWithTemplates(
  userInputs: Array<Partial<PromptInput> & { copy?: PromptInputType }>,
): Promise<PromptInput[]> {
  const results = await Promise.all(
    userInputs.map((input) => mergeInputWithTemplate(input)),
  );

  // 过滤掉 null 值
  return results.filter((input): input is PromptInput => input !== null);
}
