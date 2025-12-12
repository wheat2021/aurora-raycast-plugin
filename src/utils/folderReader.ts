import fs from "fs";
import path from "path";
import { InputValue } from "../types/form";

/**
 * 读取目录中的所有文件和子目录，并构造 InputValue 数组
 * @param folderPath 目录路径
 * @returns InputValue 数组，display 为文件/目录名，value 为完整路径
 */
export function readFolderValues(folderPath: string): InputValue[] {
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

    // 构造 InputValue 数组
    const values: InputValue[] = entries
      .filter((entry) => {
        // 过滤隐藏文件（以 . 开头的文件）
        return !entry.name.startsWith(".");
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
