import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import { PromptValues } from "../types/prompt";

const execFileAsync = promisify(execFile);

/**
 * 将字段 ID 转换为环境变量名称
 * 规则：转大写，保持字母、数字、下划线，其他字符转为下划线
 * @param id 字段 ID
 * @returns 环境变量名称
 */
function toEnvVarName(id: string): string {
  return id.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

/**
 * 将表单值转换为环境变量对象
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的字段 ID 集合（隐藏字段不设置环境变量）
 * @returns 环境变量对象
 */
function valuesToEnv(
  values: PromptValues,
  visibleInputIds: Set<string>,
): Record<string, string> {
  const env: Record<string, string> = {};

  for (const [id, value] of Object.entries(values)) {
    // 只为可见字段设置环境变量
    if (!visibleInputIds.has(id)) {
      continue;
    }

    const envName = toEnvVarName(id);

    if (value === undefined || value === null) {
      continue;
    }

    // 处理数组类型（multiselect）
    if (Array.isArray(value)) {
      env[envName] = value.join(", ");
    }
    // 处理布尔类型（checkbox）
    else if (typeof value === "boolean") {
      env[envName] = value ? "true" : "false";
    }
    // 处理字符串类型
    else {
      env[envName] = String(value);
    }
  }

  return env;
}

/**
 * 执行指定的脚本，将表单值作为环境变量传递
 * @param scriptPath 脚本文件路径
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的字段 ID 集合
 * @returns Promise，包含 stdout 和 stderr
 * @throws 如果脚本不存在、不可执行或执行失败
 */
export async function executeScript(
  scriptPath: string,
  values: PromptValues,
  visibleInputIds: Set<string>,
): Promise<{ stdout: string; stderr: string }> {
  // 验证脚本文件存在
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`脚本文件不存在: ${scriptPath}`);
  }

  // 检查脚本是否可执行（Unix-like 系统）
  try {
    fs.accessSync(scriptPath, fs.constants.X_OK);
  } catch {
    throw new Error(`脚本文件不可执行: ${scriptPath}`);
  }

  // 将表单值转换为环境变量
  const scriptEnv = valuesToEnv(values, visibleInputIds);

  // 合并当前进程的环境变量和脚本专用环境变量
  const env = {
    ...process.env,
    ...scriptEnv,
    // 统一注入常用环境变量（避免 Raycast 不继承 shell 环境变量）
    LIB_SH: process.env.LIB_SH || "/Users/terrychen/code/sh/lib.sh",
    SCRIPT_DIR: process.env.SCRIPT_DIR || "/Users/terrychen/code/sh",
  };

  try {
    // 执行脚本，设置 30 秒超时
    const { stdout, stderr } = await execFileAsync(scriptPath, [], {
      env,
      timeout: 30000,
      maxBuffer: 1024 * 1024, // 1MB
    });

    return { stdout, stderr };
  } catch (error) {
    // 处理执行错误
    if (error instanceof Error) {
      // execFile 错误包含 stdout 和 stderr
      const execError = error as {
        code?: number;
        stdout?: string;
        stderr?: string;
        message: string;
      };

      throw new Error(
        `脚本执行失败 (exit code ${execError.code || "unknown"}): ${
          execError.stderr || execError.message
        }`,
      );
    }
    throw error;
  }
}
