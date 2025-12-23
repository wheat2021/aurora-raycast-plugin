# Deeplink 功能文档

## 概述

Deeplink 功能允许通过 URL 协议直接调用 Aurora Input Processor 插件，实现外部工具集成和自动化场景。你可以通过构造特定格式的 URL 来打开提示词处理器，预填充参数，甚至自动执行操作。

## 核心概念

### 1. Deeplink URL 格式

```
raycast://extensions/wheat2021/aurora-input-processor/<processor-name>?arguments=<URL_ENCODED_JSON>
```

**组成部分：**
- `raycast://` - Raycast 协议前缀
- `extensions/wheat2021/aurora-input-processor/` - 插件标识
- `<processor-name>` - 处理器名称（processor-1 到 processor-9）
- `arguments=<URL_ENCODED_JSON>` - URL 编码的 JSON 参数

### 2. 参数结构

JSON 参数必须包含以下字段：

```json
{
  "promptPath": "/absolute/path/to/prompt.md",
  "inputs": {
    "field1": "value1",              // text/textarea/select
    "field2": ["value2a", "value2b"], // multiselect
    "field3": true                    // checkbox
  }
}
```

**字段说明：**
- `promptPath` - 提示词配置文件的绝对路径
- `inputs` - 字段值的键值对对象
  - 键：字段 ID（在提示词配置的 frontmatter 中定义）
  - 值：根据字段类型提供相应格式的值

### 3. 执行行为

Deeplink 的执行行为取决于参数的完整性和有效性：

| 场景 | 行为 | 说明 |
|------|------|------|
| ✅ **所有必填参数完整且验证通过** | 自动执行 | 跳过表单 UI，直接执行操作（粘贴/请求/命令） |
| 📝 **部分必填参数缺失** | 打开表单 | 显示表单并预填充已提供的参数，等待用户补充 |
| ⚠️ **参数验证失败** | 显示警告 | 在字段的 placeholder 中显示验证错误信息 |
| ❌ **配置文件不存在** | 显示错误 | Toast 通知："配置文件不存在或无效" |

### 4. 验证规则

系统会对提供的参数进行以下验证：

#### 类型验证
- `text` / `textarea` / `select` / `selectInFolder` → 必须是字符串
- `multiselect` → 必须是字符串数组
- `checkbox` → 必须是布尔值

#### 选项验证
- `select` / `multiselect` → 值必须在配置的 options 列表中

#### 必填验证
- 检查所有 `required: true` 的字段是否非空

#### 默认值合并
- 未提供的字段会使用配置文件中定义的默认值
- 如果既无 deeplink 值也无默认值，该字段保持为空

## 使用示例

### 1. JavaScript/TypeScript

```javascript
import { exec } from "child_process";

function openPromptWithDeeplink(
  promptPath: string,
  inputs: Record<string, any>
) {
  const args = JSON.stringify({ promptPath, inputs });
  const encoded = encodeURIComponent(args);
  const deeplink = `raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments=${encoded}`;

  exec(`open "${deeplink}"`);
}

// 示例 1: 所有必填参数都提供 → 直接执行
openPromptWithDeeplink(
  "/Users/terrychen/Notes/Prompts/raycast/个人信息.md",
  { name: "Terry", age: "30", city: "Shanghai" }
);

// 示例 2: 部分参数提供 → 打开表单并预填充
openPromptWithDeeplink(
  "/Users/terrychen/Notes/Prompts/raycast/个人信息.md",
  { name: "Terry" }  // age 未提供，会打开表单
);

// 示例 3: 参数类型错误 → 显示警告
openPromptWithDeeplink(
  "/Users/terrychen/Notes/Prompts/raycast/个人信息.md",
  { name: "Terry", age: 30 }  // age 应为字符串，会显示警告
);
```

### 2. Shell 脚本

```bash
#!/bin/bash

# 设置参数
PROMPT_PATH="/Users/terrychen/Notes/Prompts/raycast/个人信息.md"
INPUTS='{"name":"Terry","age":"30","city":"Shanghai"}'

# 生成 JSON 参数
ARGS=$(jq -nc --arg path "$PROMPT_PATH" --argjson inputs "$INPUTS" \
  '{promptPath: $path, inputs: $inputs}')

# URL 编码
ENCODED=$(jq -rR @uri <<< "$ARGS")

# 生成 deeplink
DEEPLINK="raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments=${ENCODED}"

# 打开 deeplink
open "$DEEPLINK"
```

### 3. Python

```python
import json
import urllib.parse
import subprocess

def open_prompt_with_deeplink(prompt_path: str, inputs: dict):
    # 构建参数
    args = {
        "promptPath": prompt_path,
        "inputs": inputs
    }

    # JSON 编码
    args_json = json.dumps(args)

    # URL 编码
    encoded = urllib.parse.quote(args_json)

    # 构建 deeplink
    deeplink = f"raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments={encoded}"

    # 打开 deeplink
    subprocess.run(["open", deeplink])

# 使用示例
open_prompt_with_deeplink(
    "/Users/terrychen/Notes/Prompts/raycast/个人信息.md",
    {"name": "Terry", "age": "30", "city": "Shanghai"}
)
```

### 4. AppleScript (Alfred Workflow)

```applescript
set promptPath to "/Users/terrychen/Notes/Prompts/raycast/个人信息.md"
set inputsJSON to "{\"name\":\"Terry\",\"age\":\"30\"}"

-- 构建参数 JSON
set argsJSON to "{\"promptPath\":\"" & promptPath & "\",\"inputs\":" & inputsJSON & "}"

-- URL 编码（简化处理）
set encodedArgs to do shell script "jq -rR @uri <<< " & quoted form of argsJSON

-- 构建 deeplink
set deeplink to "raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments=" & encodedArgs

-- 打开 deeplink
do shell script "open " & quoted form of deeplink
```

## 技术实现

### 修改的文件

1. **package.json** - 添加 arguments 定义
   - 为所有 9 个 processor 命令添加了 `promptPath` 和 `inputs` 参数定义

2. **src/utils/deeplinkValidator.ts** - 验证工具（新增）
   - 验证字段类型
   - 验证选项值
   - 合并 deeplink 值和配置默认值
   - 检查必填项完整性
   - 生成验证警告信息

3. **src/config/prompts.ts** - 配置加载器
   - 添加 `loadPromptConfig()` 函数用于加载单个提示词配置文件

4. **src/processor-1.tsx** - Deeplink 支持
   - 接收 `LaunchProps` 参数
   - 解析 deeplink 参数
   - 验证文件存在性
   - 验证并合并 inputs 参数
   - 根据完整性决定执行方式

5. **src/components/PromptForm.tsx** - 表单增强
   - 接收 `initialValues` 预填充表单
   - 接收 `warnings` 显示验证警告
   - 支持 `autoExecute` 自动执行

6. **src/components/PromptField.tsx** - 警告显示
   - 在 placeholder 中显示警告信息
   - 改为受控组件（value 而非 defaultValue）

### 核心验证逻辑

```typescript
// src/utils/deeplinkValidator.ts
export function validateDeeplinkInputs(
  promptConfig: PromptConfig,
  deeplinkInputs: Record<string, any>
): {
  values: Record<string, any>;
  warnings: Record<string, string>;
  isComplete: boolean;
} {
  // 1. 类型验证
  // 2. 选项验证
  // 3. 默认值合并
  // 4. 必填项检查
  // 5. 生成警告信息
}
```

## 应用场景

### 1. 工具集成

- **Alfred Workflow** - 通过 Alfred 快速触发提示词
- **Keyboard Maestro** - 绑定快捷键一键执行
- **Hammerspoon** - Lua 脚本集成
- **BetterTouchTool** - 手势/触控板触发
- **Shortcuts.app** - iOS/macOS 快捷指令

### 2. 自动化场景

- **定时任务** - cron/launchd 定时执行
- **文件监控** - 文件变化触发
- **Webhook** - 接收外部事件触发
- **脚本集成** - 在自动化脚本中调用

### 3. 多 Processor 支持

所有 processor-1 到 processor-9 都支持 deeplink，你可以：
- 为不同的提示词目录配置不同的 processor
- 在同一个自动化流程中调用多个 processor
- 根据不同场景选择合适的 processor

## 最佳实践

### 1. 错误处理

始终处理可能的错误情况：

```javascript
function safeOpenDeeplink(promptPath, inputs) {
  try {
    // 验证文件存在
    if (!fs.existsSync(promptPath)) {
      console.error("提示词配置文件不存在:", promptPath);
      return;
    }

    // 构建并打开 deeplink
    openPromptWithDeeplink(promptPath, inputs);
  } catch (error) {
    console.error("打开 deeplink 失败:", error);
  }
}
```

### 2. 参数验证

在调用前验证参数类型：

```javascript
function validateInputs(inputs, schema) {
  for (const [key, value] of Object.entries(inputs)) {
    const field = schema[key];
    if (!field) continue;

    if (field.type === "multiselect" && !Array.isArray(value)) {
      throw new Error(`${key} 必须是数组`);
    }

    if (field.type === "checkbox" && typeof value !== "boolean") {
      throw new Error(`${key} 必须是布尔值`);
    }
  }
}
```

### 3. URL 编码

务必正确进行 URL 编码：

```javascript
// ✅ 正确
const encoded = encodeURIComponent(JSON.stringify(args));

// ❌ 错误 - 会导致参数解析失败
const encoded = JSON.stringify(args);
```

### 4. 路径使用

始终使用绝对路径：

```javascript
// ✅ 正确
const promptPath = "/Users/username/prompts/example.md";

// ❌ 错误 - 相对路径可能导致文件找不到
const promptPath = "~/prompts/example.md";
const promptPath = "./prompts/example.md";
```

## 故障排查

### 问题 1: Deeplink 无响应

**可能原因：**
- URL 编码不正确
- Raycast 未运行
- 插件未安装或已禁用

**解决方法：**
```bash
# 检查 URL 编码
echo "$DEEPLINK" | jq -R '@uri'

# 确认 Raycast 正在运行
ps aux | grep Raycast

# 重新安装插件
pnpm release
```

### 问题 2: 参数未生效

**可能原因：**
- JSON 格式错误
- 字段 ID 不匹配
- 参数类型不正确

**解决方法：**
```javascript
// 打印调试信息
console.log("Args:", JSON.stringify(args, null, 2));

// 验证 JSON 格式
JSON.parse(JSON.stringify(args));

// 检查字段 ID
const config = loadPromptConfig(promptPath);
console.log("Available fields:", config.inputs.map(i => i.id));
```

### 问题 3: 自动执行失败

**可能原因：**
- 必填参数缺失
- 参数验证失败
- 配置文件问题

**解决方法：**
- 检查所有 `required: true` 的字段是否都提供了值
- 确认 select/multiselect 的值在 options 列表中
- 验证配置文件的 frontmatter 格式是否正确

## 参考资料

- [Raycast Deeplinks 文档](https://developers.raycast.com/information/deeplinks)
- [Aurora Input Processor 主文档](../README.md)
- [提示词配置格式](./prompt-format.md)
- [变量系统文档](./variables.md)
