import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import { CommandConfig, PromptValues, PromptInput } from "../types/prompt";
import { valueToCommandString } from "./valueConverter";
import { replaceUserVariables } from "./variableReplacer";

const execFileAsync = promisify(execFile);

/**
 * 将字段 ID 转换为环境变量名称（用于向后兼容旧的 execScript）
 * 规则：转大写，保持字母、数字、下划线，其他字符转为下划线
 * @param id 字段 ID
 * @returns 环境变量名称
 */
function toEnvVarName(id: string): string {
  return id.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

/**
 * 将表单值转换为环境变量对象（用于向后兼容旧的 execScript）
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的字段 ID 集合（隐藏字段不设置环境变量）
 * @param inputs 输入字段配置列表
 * @returns 环境变量对象
 */
function valuesToEnv(
  values: PromptValues,
  visibleInputIds: Set<string>,
  inputs: PromptInput[],
): Record<string, string> {
  const env: Record<string, string> = {};

  // 创建 input 配置的快速查找映射
  const inputMap = new Map<string, PromptInput>();
  inputs.forEach((input) => {
    inputMap.set(input.id, input);
  });

  for (const [id, value] of Object.entries(values)) {
    // 只为可见字段设置环境变量
    if (!visibleInputIds.has(id)) {
      continue;
    }

    const envName = toEnvVarName(id);

    if (value === undefined || value === null) {
      continue;
    }

    const input = inputMap.get(id);
    env[envName] = valueToCommandString(value, input);
  }

  return env;
}

/**
 * 判断字符串是否为 shell 命令（而非脚本路径）
 * 通过检查是否包含 shell 特殊字符来判断
 * @param command 命令字符串
 * @returns 是否为 shell 命令
 */
function isShellCommand(command: string): boolean {
  // 包含 shell 操作符或通配符的认为是 shell 命令
  const shellPatterns = [
    /&&/, // 逻辑与
    /\|\|/, // 逻辑或
    /\|(?!\|)/, // 管道（排除 ||）
    /;/, // 命令分隔符
    /`/, // 命令替换
    /\$\(/, // 命令替换
    />/, // 重定向
    /</, // 重定向
    /\*/, // 通配符
    /\?/, // 通配符
    /\[.*\]/, // 通配符或测试
  ];

  return shellPatterns.some((pattern) => pattern.test(command));
}

/**
 * 执行命令或脚本
 * 支持三种调用方式：
 * 1. 传入 CommandConfig 对象（推荐）
 * 2. 传入字符串路径（向后兼容旧的 execScript）
 * 3. 传入 shell 命令字符串（包含管道、重定向等）
 *
 * @param commandOrPath CommandConfig 对象、脚本路径字符串或 shell 命令字符串
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的字段 ID 集合
 * @param inputs 输入字段配置列表
 * @returns Promise，包含 stdout 和 stderr
 * @throws 如果脚本不存在、不可执行或执行失败
 */
export async function executeCommand(
  commandOrPath: CommandConfig | string,
  values: PromptValues,
  visibleInputIds: Set<string>,
  inputs: PromptInput[],
): Promise<{ stdout: string; stderr: string }> {
  // 向后兼容：如果传入的是字符串，转换为 CommandConfig 对象
  const config: CommandConfig =
    typeof commandOrPath === "string"
      ? { commandLine: commandOrPath }
      : commandOrPath;

  // 替换 commandLine 中的变量
  const commandLine = replaceUserVariables(
    config.commandLine,
    values,
    visibleInputIds,
    inputs,
    valueToCommandString,
  );

  // 判断是否为 shell 命令
  const isShell = isShellCommand(commandLine);

  // 如果不是 shell 命令，进行文件验证
  if (!isShell) {
    // 验证命令文件存在
    if (!fs.existsSync(commandLine)) {
      throw new Error(`命令或脚本文件不存在: ${commandLine}`);
    }

    // 检查是否可执行（Unix-like 系统）
    try {
      fs.accessSync(commandLine, fs.constants.X_OK);
    } catch {
      throw new Error(`文件不可执行: ${commandLine}`);
    }
  }

  // 替换 args 中的变量
  const args: string[] = [];
  if (config.args) {
    for (const arg of config.args) {
      args.push(
        replaceUserVariables(
          arg,
          values,
          visibleInputIds,
          inputs,
          valueToCommandString,
        ),
      );
    }
  }

  // 处理环境变量
  let scriptEnv: Record<string, string>;

  if (config.envs) {
    // 使用配置中指定的 envs，并替换变量
    scriptEnv = {};
    for (const [key, value] of Object.entries(config.envs)) {
      scriptEnv[key] = replaceUserVariables(
        value,
        values,
        visibleInputIds,
        inputs,
        valueToCommandString,
      );
    }
  } else {
    // 向后兼容：如果没有配置 envs，自动将所有可见字段转为环境变量（旧行为）
    scriptEnv = valuesToEnv(values, visibleInputIds, inputs);
  }

  // 合并当前进程的环境变量和命令专用环境变量
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...scriptEnv,
    // 统一注入常用环境变量（避免 Raycast 不继承 shell 环境变量）
    LIB_SH: process.env.LIB_SH || "/Users/terrychen/code/sh/lib.sh",
    SCRIPT_DIR: process.env.SCRIPT_DIR || "/Users/terrychen/code/sh",
  };

  // 确保 PATH 包含常用路径（Raycast 可能不继承完整的 shell PATH）
  const pathDirs = [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ];

  // 如果当前 PATH 中没有这些路径,添加它们
  const currentPath = env.PATH || "";
  const missingPaths = pathDirs.filter(
    (dir) => !currentPath.split(":").includes(dir),
  );

  if (missingPaths.length > 0) {
    env.PATH = currentPath
      ? `${missingPaths.join(":")}:${currentPath}`
      : missingPaths.join(":");
  }

  // 替换 cwd 中的变量
  const cwd = config.cwd
    ? replaceUserVariables(
        config.cwd,
        values,
        visibleInputIds,
        inputs,
        valueToCommandString,
      )
    : undefined;

  // 如果指定了 cwd，验证目录存在
  if (cwd && !fs.existsSync(cwd)) {
    throw new Error(`工作目录不存在: ${cwd}`);
  }

  try {
    // 执行命令，设置超时
    const timeout = config.timeout || 30000;
    let stdout: string;
    let stderr: string;

    if (isShell) {
      // 对于 shell 命令，使用 sh -c 执行
      const result = await execFileAsync("/bin/sh", ["-c", commandLine], {
        env,
        cwd,
        timeout,
        maxBuffer: 1024 * 1024, // 1MB
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } else {
      // 对于脚本文件，直接执行
      const result = await execFileAsync(commandLine, args, {
        env,
        cwd,
        timeout,
        maxBuffer: 1024 * 1024, // 1MB
      });
      stdout = result.stdout;
      stderr = result.stderr;
    }

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

      // 构建详细的错误信息,包含所有可用的输出
      const errorParts: string[] = [];

      // 添加基本错误信息
      errorParts.push(
        `命令执行失败 (exit code ${execError.code || "unknown"})`,
      );

      // 添加 stderr(如果有)
      if (execError.stderr && execError.stderr.trim()) {
        errorParts.push(`\n\n标准错误输出:\n${execError.stderr.trim()}`);
      }

      // 添加 stdout(如果有)
      if (execError.stdout && execError.stdout.trim()) {
        errorParts.push(`\n\n标准输出:\n${execError.stdout.trim()}`);
      }

      // 如果既没有 stderr 也没有 stdout,使用原始错误消息
      if (
        (!execError.stderr || !execError.stderr.trim()) &&
        (!execError.stdout || !execError.stdout.trim())
      ) {
        errorParts.push(`\n\n${execError.message}`);
      }

      // 创建增强的错误对象,包含原始的 stdout 和 stderr
      const enhancedError = new Error(errorParts.join(""));
      (enhancedError as unknown as typeof execError).code = execError.code;
      (enhancedError as unknown as typeof execError).stdout = execError.stdout;
      (enhancedError as unknown as typeof execError).stderr = execError.stderr;

      throw enhancedError;
    }
    throw error;
  }
}

/**
 * @deprecated 使用 executeCommand 替代
 * 向后兼容函数，将被重定向到 executeCommand
 */
export const executeScript = executeCommand;
