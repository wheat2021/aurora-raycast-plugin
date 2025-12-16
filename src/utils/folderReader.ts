import fs from "fs";
import path from "path";
import { InputValue } from "../types/form";

export interface FolderReaderOptions {
  valueItemType?: 0 | 1 | 2; // 0=目录和文件(默认), 1=仅目录, 2=仅文件
  regIncludeFilter?: string; // 正则表达式包含过滤器
  regExcludeFilter?: string; // 正则表达式排除过滤器
}

/**
 * 读取目录中的所有文件和子目录，并构造 InputValue 数组
 * @param folderPath 目录路径
 * @param options 过滤选项
 * @returns InputValue 数组，display 为文件/目录名，value 为完整路径
 */
export function readFolderValues(
  folderPath: string,
  options?: FolderReaderOptions,
): InputValue[] {
  try {
    // 检查路径是否存在
    if (!fs.existsSync(folderPath)) {
      console.error(`目录不存在: ${folderPath}`);
      return [];
    }

    // 检查是否是目录
    const stats = fs.statSync(folderPath);
    if (!stats.isDirectory()) {
      console.error(`路径不是目录: ${folderPath}`);
      return [];
    }

    // 读取目录内容
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    // 解析选项
    const valueItemType = options?.valueItemType ?? 0;
    const includeRegex = options?.regIncludeFilter
      ? new RegExp(options.regIncludeFilter)
      : null;
    const excludeRegex = options?.regExcludeFilter
      ? new RegExp(options.regExcludeFilter)
      : null;

    // 构造 InputValue 数组
    const values: InputValue[] = entries
      .filter((entry) => {
        // 1. 过滤隐藏文件（以 . 开头的文件）
        if (entry.name.startsWith(".")) {
          return false;
        }

        // 2. 根据 valueItemType 过滤
        if (valueItemType === 1 && !entry.isDirectory()) {
          return false; // 仅目录
        }
        if (valueItemType === 2 && !entry.isFile()) {
          return false; // 仅文件
        }

        // 3. 应用包含过滤器
        if (includeRegex && !includeRegex.test(entry.name)) {
          return false;
        }

        // 4. 应用排除过滤器
        if (excludeRegex && excludeRegex.test(entry.name)) {
          return false;
        }

        return true;
      })
      .map((entry) => {
        const fullPath = path.join(folderPath, entry.name);
        return {
          display: entry.name,
          value: fullPath,
        };
      })
      .sort((a, b) => {
        // 按名称排序
        return a.display!.localeCompare(b.display!);
      });

    return values;
  } catch (error) {
    console.error(`读取目录时出错 ${folderPath}:`, error);
    return [];
  }
}
