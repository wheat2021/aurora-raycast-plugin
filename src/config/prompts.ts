import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { PromptConfig, PromptInput, PromptInputType } from "../types/prompt";
import { mergeInputsWithTemplates } from "./inputTemplates";

/**
 * 解析 Obsidian 引用格式 ![[filename]]
 * 从 rules 目录读取对应文件内容并递归处理嵌套引用
 * @param content 包含引用的内容
 * @param rulesDir 规则文件所在目录
 * @param processedFiles 已处理的文件集合（防止循环引用）
 * @returns 解析后的内容
 */
function resolveObsidianReferences(
  content: string,
  rulesDir: string,
  processedFiles: Set<string> = new Set(),
): string {
  // 匹配 ![[filename]] 格式的引用
  const referencePattern = /!\[\[([^\]]+)\]\]/g;
  let resolvedContent = content;
  const matches = Array.from(content.matchAll(referencePattern));

  for (const match of matches) {
    const referenceName = match[0]; // 完整的引用文本，如 "![[md-frontmatter]]"
    const fileName = match[1]; // 文件名，如 "md-frontmatter"
    const filePath = path.join(rulesDir, `${fileName}.md`);

    // 防止循环引用
    if (processedFiles.has(filePath)) {
      console.warn(`Circular reference detected: ${filePath}`);
      continue;
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.warn(`Referenced file not found: ${filePath}`);
      continue;
    }

    try {
      // 读取引用的文件内容
      const referencedContent = fs.readFileSync(filePath, "utf-8").trim();

      // 递归处理嵌套引用
      const newProcessedFiles = new Set(processedFiles);
      newProcessedFiles.add(filePath);
      const resolvedReference = resolveObsidianReferences(
        referencedContent,
        rulesDir,
        newProcessedFiles,
      );

      // 替换引用为实际内容
      resolvedContent = resolvedContent.replace(
        referenceName,
        resolvedReference,
      );
    } catch (error) {
      console.error(`Error reading referenced file ${filePath}:`, error);
    }
  }

  return resolvedContent;
}

/**
 * 从指定目录加载所有提示词配置
 */
export async function loadPromptsFromDirectory(
  directory: string,
): Promise<PromptConfig[]> {
  const promptsDir = directory;

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

      // 解析 Obsidian 引用
      // 假设 rules 目录在提示词目录的父目录下
      const rulesDir = path.join(path.dirname(promptsDir), "rules");
      const resolvedContent = resolveObsidianReferences(
        parsed.content.trim(),
        rulesDir,
      );

      // 验证并处理 inputs（现在是异步的）
      const validatedInputs = await validateInputs(parsed.data.inputs);

      const promptConfig: PromptConfig = {
        title: parsed.data.title,
        formDescription: parsed.data.formDescription,
        execScript: parsed.data.execScript,
        command: parsed.data.command,
        request: parsed.data.request,
        inputs: validatedInputs,
        content: resolvedContent,
        filePath,
        lastUseTime: parsed.data.lastUseTime,
      };

      prompts.push(promptConfig);
    } catch (error) {
      console.error(`Error loading prompt file ${file}:`, error);
    }
  }

  // 按 lastUseTime 降序排序（最近使用的排在前面）
  // 没有 lastUseTime 的项排在后面
  prompts.sort((a, b) => {
    const timeA = a.lastUseTime ?? 0;
    const timeB = b.lastUseTime ?? 0;
    return timeB - timeA;
  });

  return prompts;
}

/**
 * 验证并规范化输入字段配置
 * 支持通过 copy 属性从模板复制配置
 */
async function validateInputs(inputs: unknown[]): Promise<PromptInput[]> {
  if (!Array.isArray(inputs)) {
    return [];
  }

  // 第一步：处理 copy 属性，合并模板
  const inputsWithCopy = inputs.map((input) => {
    if (
      input &&
      typeof input === "object" &&
      "copy" in input &&
      typeof input.copy === "string"
    ) {
      // 包含 copy 属性
      return input as Partial<PromptInput> & { copy: PromptInputType };
    }
    // 没有 copy 属性，直接返回
    return input as Partial<PromptInput>;
  });

  // 使用模板合并工具批量处理
  const mergedInputs = await mergeInputsWithTemplates(inputsWithCopy);

  // 第二步：规范化和验证
  return mergedInputs
    .filter((input) => {
      // 确保必填字段存在
      return input && input.id && input.label && input.type;
    })
    .map((input) => {
      // 规范化 options
      if (input.options) {
        input.options = input.options.map((option) => ({
          value: option.value,
          label: option.label || option.value, // 默认使用 value 作为 label
          isDefault: option.isDefault,
          extraInputs: option.extraInputs,
        }));
      }

      // 移除 copy 属性（如果还存在）
      const { copy, ...cleanInput } = input as PromptInput & {
        copy?: PromptInputType;
      };

      return cleanInput as PromptInput;
    });
}
