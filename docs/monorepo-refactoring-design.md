# Aurora Prompt 系统 Monorepo 重构设计文档

**版本**: v1.0
**日期**: 2025-12-26
**作者**: Claude Code
**目标**: 将 Aurora Raycast Plugin 重构为跨平台的 Monorepo 架构，支持 Raycast 和 Obsidian 插件

---

## 目录

1. [概述](#概述)
2. [架构设计](#架构设计)
3. [核心包设计](#核心包设计)
4. [平台适配层设计](#平台适配层设计)
5. [API 参考](#api-参考)
6. [实施步骤](#实施步骤)
7. [代码示例](#代码示例)

---

## 概述

### 项目背景

当前的 `aurora-raycast-plugin` 项目包含了大量与 UI 无关的核心逻辑：
- Markdown 配置解析
- 模板变量替换
- 命令执行
- REST API 请求
- 条件字段逻辑

这些功能可以在其他平台（如 Obsidian）中复用。

### 重构目标

1. **抽取核心逻辑** - 将 UI 无关的代码提取为独立的 npm 包
2. **平台适配** - 通过依赖注入支持不同平台的特定功能
3. **统一管理** - 使用 pnpm workspace monorepo 统一管理多个项目
4. **易于维护** - 核心逻辑修改可同步到所有平台

### 技术选型

- **Monorepo 工具**: pnpm workspace
- **语言**: TypeScript 5.7+
- **运行环境**: Node.js (Raycast 和 Obsidian 均支持)
- **构建工具**: tsc (TypeScript Compiler)
- **包管理器**: pnpm

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Aurora Workspace                           │
│  (pnpm workspace)                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │          aurora-prompt-core (核心包)                       │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  Types   │  Config  │  Executor │  Utils           │  │ │
│  │  │  Loader  │  Platform Interfaces                     │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ▲                                  │
│                              │                                  │
│              ┌───────────────┴───────────────┐                 │
│              │                               │                 │
│  ┌───────────▼────────────┐  ┌──────────────▼──────────────┐  │
│  │ aurora-raycast-plugin  │  │ aurora-obsidian-plugin      │  │
│  │  ┌──────────────────┐  │  │  ┌──────────────────────┐  │  │
│  │  │ Raycast UI       │  │  │  │ Obsidian UI          │  │  │
│  │  │ Platform Impl    │  │  │  │ Platform Impl        │  │  │
│  │  └──────────────────┘  │  │  └──────────────────────┘  │  │
│  └────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 目录结构

```
aurora-workspace/
├── packages/
│   │
│   ├── aurora-prompt-core/              # 核心包
│   │   ├── src/
│   │   │   ├── types/                   # TypeScript 类型定义
│   │   │   │   ├── prompt.ts            # PromptConfig, PromptInput 等
│   │   │   │   ├── executor.ts          # 执行器相关类型
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── config/                  # 配置加载
│   │   │   │   ├── loader.ts            # loadPromptsFromDirectory
│   │   │   │   ├── obsidianRef.ts       # Obsidian 引用解析
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── executor/                # 执行器
│   │   │   │   ├── PromptExecutor.ts    # 主执行器类
│   │   │   │   ├── templateExecutor.ts  # 模板执行
│   │   │   │   ├── commandExecutor.ts   # 命令执行
│   │   │   │   ├── requestExecutor.ts   # REST 请求执行
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── utils/                   # 工具函数
│   │   │   │   ├── variableReplacer.ts  # 变量替换
│   │   │   │   ├── valueConverter.ts    # 值类型转换
│   │   │   │   ├── extraInputs.ts       # 条件字段逻辑
│   │   │   │   ├── folderReader.ts      # 文件夹读取
│   │   │   │   ├── configWriter.ts      # 配置写回
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── platform/                # 平台抽象接口
│   │   │   │   ├── types.ts             # 平台接口定义
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts                 # 导出所有公共 API
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── aurora-raycast-plugin/           # Raycast 插件
│   │   ├── src/
│   │   │   ├── components/              # Raycast React 组件
│   │   │   │   ├── PromptForm.tsx
│   │   │   │   ├── PromptField.tsx
│   │   │   │   └── PromptList.tsx
│   │   │   │
│   │   │   ├── platform/                # Raycast 平台实现
│   │   │   │   ├── RaycastVariableProvider.ts
│   │   │   │   ├── RaycastOutputHandler.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── processor-1.tsx          # 处理器入口
│   │   │   ├── ...                      # 其他 processor
│   │   │   ├── manage-ai.tsx
│   │   │   └── ask-ai.tsx
│   │   │
│   │   ├── assets/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── aurora-obsidian-plugin/          # Obsidian 插件（新建）
│       ├── src/
│       │   ├── ui/                      # Obsidian UI 组件
│       │   │   ├── PromptModal.ts       # 模态框
│       │   │   ├── PromptSuggest.ts     # 提示建议
│       │   │   └── ...
│       │   │
│       │   ├── platform/                # Obsidian 平台实现
│       │   │   ├── ObsidianVariableProvider.ts
│       │   │   ├── ObsidianOutputHandler.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── main.ts                  # 插件入口
│       │   ├── settings.ts              # 设置面板
│       │   └── commands.ts              # 命令注册
│       │
│       ├── manifest.json
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── package.json                         # workspace 根配置
├── pnpm-workspace.yaml                  # pnpm workspace 配置
├── tsconfig.json                        # 共享 TS 配置
└── README.md
```

---

## 核心包设计

### 设计原则

1. **UI 无关** - 核心包不依赖任何 UI 框架
2. **平台抽象** - 通过接口隔离平台特定逻辑
3. **依赖注入** - 执行器接受平台实现作为构造参数
4. **最小依赖** - 仅依赖必要的库（gray-matter）

### 核心模块

#### 1. Types 模块

定义所有核心类型，完全与现有类型兼容：

- `PromptConfig` - 提示词配置
- `PromptInput` - 输入字段配置
- `PromptValues` - 用户输入值
- `RequestConfig` - REST 请求配置
- `CommandConfig` - 命令执行配置

**无需修改现有类型定义。**

#### 2. Config 模块

负责加载和解析配置：

```typescript
// 从目录加载所有提示词
export async function loadPromptsFromDirectory(
  directory: string
): Promise<PromptConfig[]>

// 从文件加载单个提示词
export async function loadPromptConfig(
  filePath: string
): Promise<PromptConfig | null>

// 解析 Obsidian 引用
export function resolveObsidianReferences(
  content: string,
  rulesDir: string,
  processedFiles?: Set<string>
): string
```

**无需修改，直接迁移现有代码。**

#### 3. Executor 模块

执行提示词的核心逻辑，支持三种执行模式：

```typescript
export class PromptExecutor {
  constructor(
    private variableProvider: PlatformVariableProvider,
    private outputHandler: PlatformOutputHandler
  )

  async executePrompt(
    config: PromptConfig,
    values: PromptValues,
    visibleInputIds: Set<string>
  ): Promise<void>
}
```

执行流程：
1. 从 `variableProvider` 获取平台变量
2. 替换模板中的变量
3. 根据配置类型（template/command/request）执行
4. 将结果传递给 `outputHandler` 处理

#### 4. Utils 模块

所有工具函数，保持现有实现：

- `variableReplacer.ts` - 变量替换逻辑
- `valueConverter.ts` - 值类型转换
- `extraInputs.ts` - 条件字段计算
- `folderReader.ts` - 文件夹扫描
- `configWriter.ts` - 配置写回

**无需修改，直接迁移。**

---

## 平台适配层设计

### 平台接口定义

```typescript
// packages/aurora-prompt-core/src/platform/types.ts

/**
 * 平台变量提供者接口
 * 用于提供平台特定的内置变量（如 {selection}, {activeFile}）
 */
export interface PlatformVariableProvider {
  /**
   * 获取变量值
   * @param varName 变量名（不包含 {}）
   * @returns 变量值，如果不支持则返回 undefined
   */
  getVariable(varName: string): Promise<string | undefined>;

  /**
   * 获取所有支持的变量名
   * @returns 变量名数组（用于文档和验证）
   */
  getSupportedVariables(): string[];
}

/**
 * 平台输出处理器接口
 * 用于处理不同执行模式的输出
 */
export interface PlatformOutputHandler {
  /**
   * 处理模板输出
   * Raycast: 粘贴到前台应用或复制到剪贴板
   * Obsidian: 插入到光标处
   */
  handleTemplateOutput(content: string): Promise<void>;

  /**
   * 处理命令执行结果
   * 显示执行结果、错误信息等
   */
  handleCommandResult(result: {
    stdout: string;
    stderr: string;
  }): Promise<void>;

  /**
   * 处理 REST 请求结果
   * 显示响应数据、状态码等
   */
  handleRequestResult(result: {
    url: string;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
  }): Promise<void>;
}

/**
 * 平台上下文接口
 * 提供平台运行时的环境信息
 */
export interface PlatformContext {
  /**
   * 平台名称
   */
  name: 'raycast' | 'obsidian';

  /**
   * 平台版本
   */
  version: string;

  /**
   * 是否支持剪贴板操作
   */
  supportsClipboard: boolean;

  /**
   * 是否支持文件系统访问
   */
  supportsFileSystem: boolean;
}
```

### Raycast 平台实现

```typescript
// packages/aurora-raycast-plugin/src/platform/RaycastVariableProvider.ts

import { PlatformVariableProvider } from 'aurora-prompt-core';
import { getSelectedText, Clipboard } from '@raycast/api';

export class RaycastVariableProvider implements PlatformVariableProvider {
  async getVariable(varName: string): Promise<string | undefined> {
    try {
      switch (varName) {
        case 'selection':
          return await getSelectedText();
        case 'clipboard':
          return await Clipboard.readText();
        default:
          return undefined;
      }
    } catch (error) {
      console.warn(`Failed to get variable ${varName}:`, error);
      return undefined;
    }
  }

  getSupportedVariables(): string[] {
    return ['selection', 'clipboard'];
  }
}
```

```typescript
// packages/aurora-raycast-plugin/src/platform/RaycastOutputHandler.ts

import { PlatformOutputHandler } from 'aurora-prompt-core';
import { Clipboard, closeMainWindow, showToast, Toast, showHUD } from '@raycast/api';

export class RaycastOutputHandler implements PlatformOutputHandler {
  constructor(private mode: 'paste' | 'copy') {}

  async handleTemplateOutput(content: string): Promise<void> {
    if (this.mode === 'paste') {
      await Clipboard.paste(content);
      await closeMainWindow();
      await showHUD('✅ 已粘贴到前台应用');
    } else {
      await Clipboard.copy(content);
      await showHUD('✅ 已复制到剪贴板');
    }
  }

  async handleCommandResult(result: { stdout: string; stderr: string }): Promise<void> {
    if (result.stderr) {
      await showToast({
        style: Toast.Style.Failure,
        title: '命令执行失败',
        message: result.stderr,
      });
    } else {
      await showToast({
        style: Toast.Style.Success,
        title: '命令执行成功',
        message: result.stdout || '无输出',
      });
    }
  }

  async handleRequestResult(result: any): Promise<void> {
    await showToast({
      style: Toast.Style.Success,
      title: `请求成功 (${result.status})`,
      message: result.statusText,
    });
  }
}
```

### Obsidian 平台实现

```typescript
// packages/aurora-obsidian-plugin/src/platform/ObsidianVariableProvider.ts

import { PlatformVariableProvider } from 'aurora-prompt-core';
import { App, Editor, TFile } from 'obsidian';

export class ObsidianVariableProvider implements PlatformVariableProvider {
  constructor(private app: App) {}

  async getVariable(varName: string): Promise<string | undefined> {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const activeFile = activeView?.file;
    const editor = activeView?.editor;

    try {
      switch (varName) {
        case 'activeFile':
          return activeFile?.path;

        case 'selection':
          return editor?.getSelection() || undefined;

        case 'cursor': {
          // 获取光标所在行或周围上下文
          if (!editor) return undefined;
          const cursor = editor.getCursor();
          const line = editor.getLine(cursor.line);
          return line || undefined;
        }

        case 'vault':
          return this.app.vault.adapter.basePath;

        default:
          return undefined;
      }
    } catch (error) {
      console.warn(`Failed to get variable ${varName}:`, error);
      return undefined;
    }
  }

  getSupportedVariables(): string[] {
    return ['activeFile', 'selection', 'cursor', 'vault'];
  }
}
```

```typescript
// packages/aurora-obsidian-plugin/src/platform/ObsidianOutputHandler.ts

import { PlatformOutputHandler } from 'aurora-prompt-core';
import { App, Notice, MarkdownView } from 'obsidian';

export class ObsidianOutputHandler implements PlatformOutputHandler {
  constructor(private app: App) {}

  async handleTemplateOutput(content: string): Promise<void> {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

    if (!activeView) {
      new Notice('❌ 未找到活动编辑器');
      return;
    }

    const editor = activeView.editor;
    editor.replaceSelection(content);
    new Notice('✅ 已插入到光标处');
  }

  async handleCommandResult(result: { stdout: string; stderr: string }): Promise<void> {
    if (result.stderr) {
      new Notice(`❌ 命令执行失败：${result.stderr}`);
    } else {
      new Notice(`✅ 命令执行成功`);

      // 可选：将输出插入到编辑器
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (activeView && result.stdout) {
        activeView.editor.replaceSelection(result.stdout);
      }
    }
  }

  async handleRequestResult(result: any): Promise<void> {
    new Notice(`✅ 请求成功 (${result.status})`);

    // 将响应数据格式化为 Markdown 并插入
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      const formatted = typeof result.data === 'string'
        ? result.data
        : '```json\n' + JSON.stringify(result.data, null, 2) + '\n```';

      activeView.editor.replaceSelection(formatted);
    }
  }
}
```

---

## API 参考

### 核心包导出 API

```typescript
// packages/aurora-prompt-core/src/index.ts

// 类型定义
export * from './types';

// 配置加载
export {
  loadPromptsFromDirectory,
  loadPromptConfig,
  resolveObsidianReferences
} from './config';

// 执行器
export { PromptExecutor } from './executor';
export {
  executeCommand,
  executeRequest,
  replaceTemplate
} from './executor';

// 工具函数
export {
  getVisibleInputIds,
  valueToTemplateString,
  valueToCommandString,
  readFolderItems,
  updatePromptConfig
} from './utils';

// 平台接口
export {
  PlatformVariableProvider,
  PlatformOutputHandler,
  PlatformContext
} from './platform';
```

### 使用示例

#### Raycast 中使用

```typescript
import { PromptExecutor } from 'aurora-prompt-core';
import { RaycastVariableProvider, RaycastOutputHandler } from './platform';

// 创建执行器
const executor = new PromptExecutor(
  new RaycastVariableProvider(),
  new RaycastOutputHandler('paste')
);

// 执行提示词
await executor.executePrompt(promptConfig, values, visibleInputIds);
```

#### Obsidian 中使用

```typescript
import { PromptExecutor } from 'aurora-prompt-core';
import { ObsidianVariableProvider, ObsidianOutputHandler } from './platform';

// 创建执行器
const executor = new PromptExecutor(
  new ObsidianVariableProvider(this.app),
  new ObsidianOutputHandler(this.app)
);

// 执行提示词
await executor.executePrompt(promptConfig, values, visibleInputIds);
```

---

## 实施步骤

### 阶段 1：创建 Monorepo 基础设施（预计 30 分钟）

#### 1.1 创建 workspace 目录结构

```bash
mkdir aurora-workspace
cd aurora-workspace
mkdir -p packages/aurora-prompt-core
mkdir -p packages/aurora-raycast-plugin
mkdir -p packages/aurora-obsidian-plugin
```

#### 1.2 创建根配置文件

**package.json**:
```json
{
  "name": "aurora-workspace",
  "version": "1.0.0",
  "private": true,
  "description": "Aurora Prompt System Monorepo",
  "scripts": {
    "build": "pnpm -r run build",
    "dev": "pnpm -r --parallel run dev",
    "lint": "pnpm -r run lint",
    "clean": "pnpm -r run clean"
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'packages/*'
```

**tsconfig.json** (共享配置):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "exclude": ["node_modules", "dist"]
}
```

#### 1.3 初始化 pnpm

```bash
pnpm install
```

### 阶段 2：创建核心包（预计 2 小时）

#### 2.1 初始化核心包

```bash
cd packages/aurora-prompt-core
pnpm init
```

**package.json**:
```json
{
  "name": "aurora-prompt-core",
  "version": "1.0.0",
  "description": "Core logic for Aurora Prompt System",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "keywords": ["prompt", "template", "executor"],
  "author": "wheat2021",
  "license": "MIT",
  "dependencies": {
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/node": "^22.13.10",
    "typescript": "^5.7.2"
  }
}
```

**tsconfig.json**:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

#### 2.2 迁移代码

将以下文件从 `aurora-raycast-plugin/src` 复制到 `aurora-prompt-core/src`:

1. **types/** - 完整复制
2. **config/prompts.ts** → **config/loader.ts** (重命名)
3. **utils/** - 以下文件：
   - variableReplacer.ts
   - valueConverter.ts
   - extraInputs.ts
   - folderReader.ts
   - configWriter.ts

4. **新建 executor/** 模块：
   - 从 `utils/commandExecutor.ts` 提取 `executeCommand` → `executor/commandExecutor.ts`
   - 从 `utils/requestExecutor.ts` 提取 `executeRequest` → `executor/requestExecutor.ts`
   - 从 `utils/template.ts` 提取 `replaceTemplate` → `executor/templateExecutor.ts`
   - 新建 `executor/PromptExecutor.ts`（见下方代码示例）

5. **新建 platform/** 模块：
   - 创建 `platform/types.ts`（平台接口定义）

#### 2.3 创建 PromptExecutor

```typescript
// packages/aurora-prompt-core/src/executor/PromptExecutor.ts

import {
  PromptConfig,
  PromptValues,
  PromptInput,
} from '../types';
import {
  PlatformVariableProvider,
  PlatformOutputHandler,
} from '../platform';
import { executeCommand } from './commandExecutor';
import { executeRequest } from './requestExecutor';
import { replaceTemplate } from './templateExecutor';

export class PromptExecutor {
  constructor(
    private variableProvider: PlatformVariableProvider,
    private outputHandler: PlatformOutputHandler
  ) {}

  /**
   * 执行提示词配置
   * @param config 提示词配置
   * @param values 用户输入值
   * @param visibleInputIds 可见字段 ID 集合
   */
  async executePrompt(
    config: PromptConfig,
    values: PromptValues,
    visibleInputIds: Set<string>
  ): Promise<void> {
    // 获取平台变量
    const platformVars = await this.getPlatformVariables();

    // 根据配置类型执行
    if (config.request) {
      // 执行 REST 请求
      const result = await executeRequest(
        config.request,
        values,
        visibleInputIds,
        config.inputs,
        platformVars.selection,
        platformVars.clipboard
      );

      await this.outputHandler.handleRequestResult(result);

    } else if (config.command || config.execScript) {
      // 执行命令（支持旧的 execScript）
      const commandConfig = config.command || config.execScript!;

      const result = await executeCommand(
        commandConfig,
        values,
        visibleInputIds,
        config.inputs
      );

      await this.outputHandler.handleCommandResult(result);

    } else {
      // 模板替换
      const processedContent = replaceTemplate(
        config.content,
        values,
        visibleInputIds,
        config.inputs,
        platformVars.selection,
        platformVars.clipboard
      );

      await this.outputHandler.handleTemplateOutput(processedContent);
    }
  }

  /**
   * 获取所有平台变量
   */
  private async getPlatformVariables(): Promise<{
    selection?: string;
    clipboard?: string;
    [key: string]: string | undefined;
  }> {
    const vars: Record<string, string | undefined> = {};

    for (const varName of this.variableProvider.getSupportedVariables()) {
      vars[varName] = await this.variableProvider.getVariable(varName);
    }

    return vars;
  }
}
```

#### 2.4 创建 index.ts

```typescript
// packages/aurora-prompt-core/src/index.ts

// 导出所有类型
export * from './types';

// 导出配置加载
export {
  loadPromptsFromDirectory,
  loadPromptConfig,
  resolveObsidianReferences,
} from './config/loader';

// 导出执行器
export { PromptExecutor } from './executor/PromptExecutor';
export { executeCommand } from './executor/commandExecutor';
export { executeRequest } from './executor/requestExecutor';
export { replaceTemplate } from './executor/templateExecutor';

// 导出工具函数
export {
  getVisibleInputIds,
} from './utils/extraInputs';
export {
  valueToTemplateString,
  valueToCommandString,
} from './utils/valueConverter';
export {
  readFolderItems,
} from './utils/folderReader';
export {
  updatePromptConfig,
} from './utils/configWriter';

// 导出平台接口
export type {
  PlatformVariableProvider,
  PlatformOutputHandler,
  PlatformContext,
} from './platform/types';
```

#### 2.5 构建核心包

```bash
cd packages/aurora-prompt-core
pnpm build
```

### 阶段 3：重构 Raycast 插件（预计 1.5 小时）

#### 3.1 迁移 Raycast 项目

```bash
# 将现有项目复制到 workspace
cp -r /opt/code/aurora-raycast-plugin/* packages/aurora-raycast-plugin/
```

#### 3.2 更新 package.json

```json
{
  "name": "aurora-raycast-plugin",
  "version": "1.0.0",
  "dependencies": {
    "@raycast/api": "^1.103.10",
    "@raycast/utils": "^2.2.2",
    "aurora-prompt-core": "workspace:*"
  },
  ...
}
```

#### 3.3 创建平台实现

创建以下文件：
- `src/platform/RaycastVariableProvider.ts`
- `src/platform/RaycastOutputHandler.ts`
- `src/platform/index.ts`

（参考上文的平台实现代码）

#### 3.4 重构 PromptForm 组件

将执行逻辑替换为使用 `PromptExecutor`:

```typescript
// packages/aurora-raycast-plugin/src/components/PromptForm.tsx

import { PromptExecutor } from 'aurora-prompt-core';
import { RaycastVariableProvider, RaycastOutputHandler } from '../platform';

// 在 handleSubmit 中使用
const handleSubmit = async (values: PromptValues) => {
  const executor = new PromptExecutor(
    new RaycastVariableProvider(),
    new RaycastOutputHandler('paste') // 或 'copy'
  );

  await executor.executePrompt(
    promptConfig,
    values,
    visibleInputIds
  );
};
```

#### 3.5 删除已迁移的代码

删除以下目录/文件（已迁移到核心包）：
- `src/utils/variableReplacer.ts`
- `src/utils/valueConverter.ts`
- `src/utils/extraInputs.ts`
- `src/utils/commandExecutor.ts`
- `src/utils/requestExecutor.ts`
- `src/utils/template.ts`

保留以下文件（Raycast 特定）：
- `src/utils/aiStorage.ts`
- `src/utils/deeplinkValidator.ts`
- `src/utils/markdownBuilder.ts`
- `src/utils/requestCache.ts`
- `src/utils/storage.ts`
- `src/config/inputTemplates.ts`

#### 3.6 更新 import 路径

全局搜索替换：
- 从 `../utils/xxx` 导入的核心功能 → 从 `aurora-prompt-core` 导入
- 从 `../types/xxx` 导入的类型 → 从 `aurora-prompt-core` 导入

#### 3.7 测试构建

```bash
cd packages/aurora-raycast-plugin
pnpm install
pnpm build
```

### 阶段 4：创建 Obsidian 插件骨架（预计 1 小时）

#### 4.1 初始化 Obsidian 插件

```bash
cd packages/aurora-obsidian-plugin
pnpm init
```

**package.json**:
```json
{
  "name": "aurora-obsidian-plugin",
  "version": "1.0.0",
  "description": "Aurora Prompt System for Obsidian",
  "main": "main.js",
  "scripts": {
    "build": "tsc && node esbuild.config.mjs",
    "dev": "node esbuild.config.mjs --watch"
  },
  "keywords": ["obsidian", "plugin"],
  "author": "wheat2021",
  "license": "MIT",
  "dependencies": {
    "aurora-prompt-core": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.13.10",
    "esbuild": "^0.24.2",
    "obsidian": "latest",
    "typescript": "^5.7.2"
  }
}
```

#### 4.2 创建平台实现

参考上文的 Obsidian 平台实现代码。

#### 4.3 创建插件入口

```typescript
// packages/aurora-obsidian-plugin/src/main.ts

import { Plugin } from 'obsidian';
import { loadPromptsFromDirectory, PromptExecutor } from 'aurora-prompt-core';
import { ObsidianVariableProvider, ObsidianOutputHandler } from './platform';

export default class AuroraPromptPlugin extends Plugin {
  async onload() {
    console.log('Loading Aurora Prompt Plugin');

    // 注册命令：选择并执行提示词
    this.addCommand({
      id: 'execute-prompt',
      name: 'Execute Prompt',
      callback: () => this.openPromptSelector(),
    });
  }

  async openPromptSelector() {
    // TODO: 实现提示词选择 UI
    // 1. 加载提示词列表
    // 2. 显示选择器
    // 3. 显示输入表单
    // 4. 执行提示词
  }
}
```

#### 4.4 创建 manifest.json

```json
{
  "id": "aurora-prompt",
  "name": "Aurora Prompt",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "description": "Configurable prompt system for Obsidian",
  "author": "wheat2021",
  "authorUrl": "https://github.com/wheat2021",
  "isDesktopOnly": false
}
```

---

## 代码示例

### 完整的变量替换流程

```typescript
import {
  PromptExecutor,
  PlatformVariableProvider,
  PlatformOutputHandler,
} from 'aurora-prompt-core';

// 1. 实现平台变量提供者
class MyVariableProvider implements PlatformVariableProvider {
  async getVariable(varName: string): Promise<string | undefined> {
    // 根据平台获取变量
    return varName === 'test' ? 'test-value' : undefined;
  }

  getSupportedVariables(): string[] {
    return ['test'];
  }
}

// 2. 实现平台输出处理器
class MyOutputHandler implements PlatformOutputHandler {
  async handleTemplateOutput(content: string): Promise<void> {
    console.log('Template output:', content);
  }

  async handleCommandResult(result: any): Promise<void> {
    console.log('Command result:', result);
  }

  async handleRequestResult(result: any): Promise<void> {
    console.log('Request result:', result);
  }
}

// 3. 创建执行器
const executor = new PromptExecutor(
  new MyVariableProvider(),
  new MyOutputHandler()
);

// 4. 执行提示词
const config = {
  title: 'Test',
  inputs: [
    { id: 'name', label: 'Name', type: 'text' as const }
  ],
  content: 'Hello {{name}}, test variable: {test}',
};

const values = { name: 'World' };
const visibleInputIds = new Set(['name']);

await executor.executePrompt(config, values, visibleInputIds);
// 输出: "Hello World, test variable: test-value"
```

### Obsidian 插件完整示例

```typescript
// packages/aurora-obsidian-plugin/src/main.ts

import { App, Plugin, Modal, Setting } from 'obsidian';
import {
  loadPromptsFromDirectory,
  PromptExecutor,
  PromptConfig,
  PromptValues,
} from 'aurora-prompt-core';
import { ObsidianVariableProvider, ObsidianOutputHandler } from './platform';

export default class AuroraPromptPlugin extends Plugin {
  settings: { promptsDirectory: string };

  async onload() {
    // 加载设置
    await this.loadSettings();

    // 注册命令
    this.addCommand({
      id: 'execute-prompt',
      name: 'Execute Prompt',
      callback: () => this.selectAndExecutePrompt(),
    });

    // 添加设置面板
    this.addSettingTab(new AuroraSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign(
      { promptsDirectory: '' },
      await this.loadData()
    );
  }

  async selectAndExecutePrompt() {
    if (!this.settings.promptsDirectory) {
      new Notice('请先在设置中配置提示词目录');
      return;
    }

    // 加载提示词列表
    const prompts = await loadPromptsFromDirectory(
      this.settings.promptsDirectory
    );

    // 显示选择器（简化版，实际应使用 SuggestModal）
    const modal = new PromptSelectorModal(this.app, prompts, async (config) => {
      await this.executePrompt(config);
    });

    modal.open();
  }

  async executePrompt(config: PromptConfig) {
    // TODO: 显示输入表单，收集用户输入
    // 这里简化为直接使用默认值
    const values: PromptValues = {};
    const visibleInputIds = new Set<string>();

    config.inputs.forEach(input => {
      values[input.id] = input.default || '';
      visibleInputIds.add(input.id);
    });

    // 创建执行器
    const executor = new PromptExecutor(
      new ObsidianVariableProvider(this.app),
      new ObsidianOutputHandler(this.app)
    );

    // 执行
    try {
      await executor.executePrompt(config, values, visibleInputIds);
    } catch (error) {
      new Notice(`执行失败: ${error.message}`);
    }
  }
}

class PromptSelectorModal extends Modal {
  constructor(
    app: App,
    private prompts: PromptConfig[],
    private onSelect: (config: PromptConfig) => void
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: '选择提示词' });

    this.prompts.forEach(prompt => {
      new Setting(contentEl)
        .setName(prompt.title)
        .setDesc(prompt.formDescription || '')
        .addButton(btn => {
          btn.setButtonText('执行');
          btn.onClick(() => {
            this.close();
            this.onSelect(prompt);
          });
        });
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

---

## 迁移检查清单

### 核心包
- [ ] 创建 aurora-prompt-core 项目结构
- [ ] 迁移类型定义
- [ ] 迁移配置加载器
- [ ] 迁移执行器逻辑
- [ ] 迁移工具函数
- [ ] 创建平台抽象接口
- [ ] 编写单元测试
- [ ] 构建成功

### Raycast 插件
- [ ] 迁移到 workspace
- [ ] 添加核心包依赖
- [ ] 实现 Raycast 平台接口
- [ ] 重构 PromptForm 使用 PromptExecutor
- [ ] 删除已迁移代码
- [ ] 更新所有 import 路径
- [ ] 构建成功
- [ ] 功能测试通过

### Obsidian 插件
- [ ] 创建项目骨架
- [ ] 添加核心包依赖
- [ ] 实现 Obsidian 平台接口
- [ ] 创建插件入口
- [ ] 创建基础 UI 组件
- [ ] 构建成功
- [ ] 基础功能验证

---

## 常见问题

### Q1: 核心包如何处理平台特定的依赖？

**A**: 核心包不直接依赖任何平台（Raycast、Obsidian）的 SDK。所有平台特定的功能通过接口抽象，由各个插件实现。

### Q2: 如何在本地开发时调试？

**A**: 使用 pnpm workspace 的好处是可以直接引用本地包。修改核心包后运行 `pnpm build`，插件会自动使用最新版本。

也可以在核心包中使用 `pnpm dev` 开启 watch 模式，自动重新编译。

### Q3: 如果需要发布到 npm 怎么办？

**A**: 核心包可以独立发布到 npm：

```bash
cd packages/aurora-prompt-core
pnpm publish
```

然后在插件的 package.json 中将依赖改为具体版本号：
```json
"dependencies": {
  "aurora-prompt-core": "^1.0.0"
}
```

### Q4: 如何处理版本兼容性？

**A**: 遵循语义化版本（Semver）：
- **Major** (1.x.x → 2.x.x): 破坏性变更，需要插件更新代码
- **Minor** (1.0.x → 1.1.x): 新增功能，向后兼容
- **Patch** (1.0.0 → 1.0.1): Bug 修复，向后兼容

建议核心包和插件保持版本号同步。

### Q5: 平台接口未来是否会扩展？

**A**: 是的。设计时已考虑扩展性：
- 新增方法时保持向后兼容
- 使用可选参数而非新方法
- 通过 `PlatformContext` 提供平台能力查询

---

## 总结

本设计文档提供了完整的 Monorepo 重构方案，包括：

1. ✅ **清晰的架构设计** - 核心包与平台插件分离
2. ✅ **完整的接口定义** - 平台抽象接口易于实现
3. ✅ **详细的实施步骤** - 分阶段逐步迁移
4. ✅ **丰富的代码示例** - 降低实施难度

通过这次重构，您将获得：
- 🎯 **可复用的核心逻辑** - 一次开发，多平台使用
- 🚀 **统一的开发体验** - Monorepo 管理，便于调试
- 🔧 **易于维护** - 核心逻辑修改自动同步到所有平台
- 📦 **灵活的部署** - 可选择发布到 npm 或本地使用

**下一步**: 请审阅本文档，确认无误后，我将开始实施第一阶段的工作。
