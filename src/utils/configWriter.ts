import * as fs from "fs";
import matter from "gray-matter";
import { PromptConfig } from "../types/prompt";

/**
 * 清理对象中的 undefined 值（递归）
 * gray-matter 的 YAML 序列化器不接受 undefined 值
 */
function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefined(item)) as T;
  }

  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

/**
 * 将 PromptConfig 保存回 Markdown 文件
 * @param config 提示词配置对象
 * @throws 如果文件路径不存在或写入失败
 */
export async function savePromptConfig(config: PromptConfig): Promise<void> {
  if (!config.filePath) {
    throw new Error("配置文件路径不存在，无法保存");
  }

  try {
    // 清理 inputs 中的 undefined 值
    const cleanedInputs = removeUndefined(config.inputs);

    // 构建 frontmatter 对象
    const frontmatter: Record<string, unknown> = {
      title: config.title,
      inputs: cleanedInputs,
    };

    // 添加可选字段
    if (config.formDescription) {
      frontmatter.formDescription = config.formDescription;
    }
    if (config.execScript) {
      frontmatter.execScript = config.execScript;
    }
    if (config.request) {
      frontmatter.request = removeUndefined(config.request);
    }
    if (config.command) {
      frontmatter.command = removeUndefined(config.command);
    }

    // 使用 gray-matter 生成 MD 内容
    const fileContent = matter.stringify(config.content, frontmatter);

    // 写入文件
    fs.writeFileSync(config.filePath, fileContent, "utf-8");
  } catch (error) {
    console.error("保存配置文件失败:", error);
    throw new Error(
      `保存配置失败: ${error instanceof Error ? error.message : "未知错误"}`,
    );
  }
}
