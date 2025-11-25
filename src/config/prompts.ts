import { getPreferenceValues } from "@raycast/api";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { PromptConfig, PromptInput } from "../types/prompt";

interface Preferences {
  promptsDirectory: string;
}

/**
 * 从指定目录加载所有提示词配置
 */
export function loadPrompts(): PromptConfig[] {
  const preferences = getPreferenceValues<Preferences>();
  const promptsDir = preferences.promptsDirectory;

  // 检查目录是否存在
  if (!fs.existsSync(promptsDir)) {
    console.error(`Prompts directory does not exist: ${promptsDir}`);
    return [];
  }

  const prompts: PromptConfig[] = [];

  // 读取目录下所有 .md 文件
  const files = fs
    .readdirSync(promptsDir)
    .filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const filePath = path.join(promptsDir, file);
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = matter(fileContent);

      // 验证 frontmatter 是否包含必要字段
      if (!parsed.data.title || !parsed.data.inputs) {
        console.warn(`Skipping invalid prompt file: ${file}`);
        continue;
      }

      const promptConfig: PromptConfig = {
        title: parsed.data.title,
        inputs: validateInputs(parsed.data.inputs),
        content: parsed.content.trim(),
        filePath,
      };

      prompts.push(promptConfig);
    } catch (error) {
      console.error(`Error loading prompt file ${file}:`, error);
    }
  }

  return prompts;
}

/**
 * 验证并规范化输入字段配置
 */
function validateInputs(inputs: unknown[]): PromptInput[] {
  if (!Array.isArray(inputs)) {
    return [];
  }

  return inputs
    .filter((input) => {
      // 必须包含 id, label, type
      return (
        input &&
        typeof input === "object" &&
        "id" in input &&
        "label" in input &&
        "type" in input
      );
    })
    .map((input) => {
      const promptInput = input as PromptInput;

      // 规范化 options
      if (promptInput.options) {
        promptInput.options = promptInput.options.map((option) => ({
          value: option.value,
          label: option.label || option.value, // 默认使用 value 作为 label
          isDefault: option.isDefault,
          extraInputs: option.extraInputs,
        }));
      }

      return promptInput;
    });
}
