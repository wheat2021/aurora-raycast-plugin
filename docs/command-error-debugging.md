# 命令执行错误调试改进

## 问题描述

用户反馈命令执行失败,但错误信息不够详细:
```
命令执行失败 (exit code 1): Command failed: /opt/homebrew/bin/uv run python ccusage_display.py
```

## 根本原因分析

### 1. 环境变量问题
**问题**: Raycast 运行环境不继承完整的 shell PATH
- 手动执行命令成功(Exit code: 0)
- 在 Raycast 中执行失败(Exit code: 1)
- 说明环境差异导致问题

**原因**:
- Raycast 作为独立应用,不会继承 shell 的完整环境变量
- `process.env.PATH` 可能不包含 `/opt/homebrew/bin` 等路径
- `uv` 等工具需要特定的 PATH 才能正常工作

### 2. 错误信息不完整
**问题**: 原错误处理只返回 `stderr` 或简单的 error message
```typescript
// 旧代码
throw new Error(
  `命令执行失败 (exit code ${execError.code || "unknown"}): ${
    execError.stderr || execError.message
  }`,
);
```

**缺陷**:
- 没有包含 `stdout` 输出
- 没有将 `stdout` 和 `stderr` 传递给结果页面
- 用户无法看到完整的调试信息

## 解决方案

### 1. 环境变量增强 (`src/utils/commandExecutor.ts`)

#### 自动补充 PATH
```typescript
// 确保 PATH 包含常用路径（Raycast 可能不继承完整的 shell PATH）
const pathDirs = [
  "/opt/homebrew/bin",      // Homebrew (Apple Silicon)
  "/usr/local/bin",         // Homebrew (Intel)
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
```

**好处**:
- 自动补充常用路径,确保命令能找到
- 不覆盖已有的 PATH,只添加缺失的路径
- 支持 Apple Silicon 和 Intel Mac

### 2. 错误信息增强

#### 详细的错误消息构建
```typescript
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
```

**好处**:
- 包含所有可用的调试信息
- 格式化清晰,易于阅读
- 保留原始的 stdout 和 stderr

#### 传递完整的错误上下文
```typescript
// 创建增强的错误对象,包含原始的 stdout 和 stderr
const enhancedError = new Error(errorParts.join(""));
(enhancedError as unknown as typeof execError).code = execError.code;
(enhancedError as unknown as typeof execError).stdout = execError.stdout;
(enhancedError as unknown as typeof execError).stderr = execError.stderr;
```

**好处**:
- 错误对象包含完整信息
- `PromptForm` 可以提取这些信息展示给用户

### 3. 结果页面改进 (`src/components/PromptForm.tsx`)

#### 提取并展示所有错误信息
```typescript
} catch (error) {
  toast.style = Toast.Style.Failure;
  toast.title = "命令执行失败";

  // 从错误对象中提取 stdout、stderr 和 exitCode
  const execError = error as {
    message: string;
    code?: number;
    stdout?: string;
    stderr?: string;
  };

  setCommandResult({
    success: false,
    commandLine: config.command.commandLine,
    args: config.command.args,
    exitCode: execError.code,       // 显示退出码
    stdout: execError.stdout,       // 显示标准输出
    stderr: execError.stderr,       // 显示标准错误
    error: error instanceof Error ? error.message : "未知错误",
  });
}
```

**好处**:
- 用户可以在结果页面看到所有调试信息
- 包括退出码、标准输出、标准错误
- 每种输出都有专门的复制 Action

## 测试验证

### 正常命令测试
```bash
# 手动测试
cd /opt/code/ccusage-display && /opt/homebrew/bin/uv run python ccusage_display.py

# 预期: Exit code: 0,显示使用情况
```

### Raycast 环境测试
1. 更新插件: `pnpm release`
2. 在 Raycast 中执行 "ccusage view" 命令
3. 预期结果:
   - 如果成功: 显示使用情况,可以按 `⌘C` 复制输出
   - 如果失败: 显示详细错误信息,包括:
     * 退出码
     * 标准错误输出(如果有)
     * 标准输出(如果有)
     * 可以按 `⌘E` 复制错误信息

### 错误场景测试

创建一个会失败的测试命令:
```yaml
---
title: Test Error
inputs: []
formDescription: 测试错误信息展示
command:
  commandLine: /bin/sh
  args:
    - -c
    - "echo 'stdout message'; echo 'stderr message' >&2; exit 1"
---
```

预期结果:
- 退出码: 1
- 标准输出: "stdout message"
- 标准错误: "stderr message"
- 所有信息都可见并可复制

## 调试技巧

### 1. 查看 Raycast 的环境变量
创建调试命令:
```yaml
---
title: Debug Env
inputs: []
command:
  commandLine: /bin/sh
  args:
    - -c
    - "env | sort"
---
```

### 2. 测试 PATH
创建测试命令:
```yaml
---
title: Debug PATH
inputs: []
command:
  commandLine: /bin/sh
  args:
    - -c
    - "echo $PATH"
---
```

### 3. 验证命令可用性
```yaml
---
title: Which UV
inputs: []
command:
  commandLine: /usr/bin/which
  args:
    - uv
---
```

## 相关文件

- `src/utils/commandExecutor.ts` - 命令执行器,包含环境变量和错误处理
- `src/components/PromptForm.tsx` - 表单组件,处理命令执行和错误展示
- `src/components/CommandResult.tsx` - 结果展示组件

## 版本历史

- **v1.0** (2024-12-19): 初始错误处理改进
- **v1.1** (2024-12-19): 添加 PATH 自动补充
- **v1.2** (2024-12-19): 增强错误信息展示,包含 stdout 和 stderr

## 下一步

如果问题仍然存在:
1. 使用调试命令检查 Raycast 环境
2. 检查 `uv` 是否需要特定的环境变量
3. 考虑在配置中显式指定 `envs`
4. 查看 Raycast 日志: `~/Library/Logs/Raycast/`
