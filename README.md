# Aurora Input Processor

Aurora Input Processor - 支持多文件夹的提示词处理器。

## 功能特性

✅ **Markdown 配置** - 使用 Markdown 文件（YAML frontmatter + 正文）定义提示词
✅ **动态变量输入** - 根据 frontmatter 中定义的变量生成表单
✅ **多种输入类型** - 支持 text、textarea、select、multiselect、checkbox
✅ **条件字段** - 支持 extraInputs 机制，根据选项动态显示字段
✅ **模板替换** - {{variable}} 语法替换变量生成最终提示词
✅ **多种输出方式** - Enter 键粘贴到前台应用，Cmd+Enter 复制到剪贴板
✅ **脚本执行** - 支持执行自定义脚本处理用户输入
✅ **配置编辑** - 在 Raycast 界面直接编辑提示词配置
✅ **表单验证** - 支持必填项验证
✅ **多文件夹支持** - 支持创建多个 Processor，每个指向不同目录
✅ **独立命令** - 每个 Processor 都是独立的 Raycast 命令，可单独设置快捷键
✅ **智能搜索** - 命令副标题自动显示 Processor 名称，方便快速搜索和识别

## 安装

1. 克隆本仓库
2. 运行 `pnpm install` 安装依赖
3. 运行 `pnpm dev` 启动开发模式

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# Lint
pnpm lint
```

## 快速开始

### 第一步：创建 Processor

1. **运行命令**
   - 在 Raycast 中运行 "Create Input Processor" 命令

2. **填写信息**
   - 名称：为你的 Processor 起一个易识别的名称（例如："工作提示词"）
   - 目录路径：选择存放 Markdown 提示词文件的目录（例如：`/Users/yourname/prompts`）
   - 图标：可选，选择一个喜欢的图标

3. **创建成功**
   - Processor ID 会自动复制到剪贴板
   - 记下这个 ID，接下来配置时需要使用

### 第二步：配置命令快捷键

1. **打开 Raycast 设置**
   - 按 `Cmd + ,` 或点击 Raycast 菜单 → Preferences

2. **找到扩展**
   - 在左侧导航栏找到 "Extensions"
   - 找到 "Aurora Input Processor" 扩展

3. **选择命令槽位**
   - 插件提供 10 个独立命令："Processor 1" 到 "Processor 10"
   - 选择任意一个尚未使用的命令（默认都是禁用状态）

4. **配置 Processor ID**
   - 在 "Processor ID" 字段粘贴刚才复制的 ID
   - 勾选 "Enable Command" 启用该命令
   - ✨ 配置后，命令的副标题会自动显示为你的 Processor 名称，方便搜索时识别

5. **设置快捷键（可选但推荐）**
   - 点击 "Record Hotkey" 设置快捷键
   - 例如：`Cmd + Shift + P`
   - 这样就可以通过快捷键快速调用该 Processor

### 第三步：使用 Processor

1. **打开 Processor**
   - 通过刚才设置的快捷键，或
   - 在 Raycast 搜索 "Processor N"（你配置的那个）或直接搜索你的 Processor 名称

2. **选择提示词**
   - 会显示该目录下所有的 Markdown 提示词文件
   - 选择需要使用的提示词

3. **填写表单**
   - 根据提示词定义的字段填写信息
   - 必填字段会有验证提示

4. **执行**
   - `Enter`：将生成的内容粘贴到当前活动应用
   - `Cmd + Enter`：复制到剪贴板

## 管理 Processors

### 查看所有 Processors

运行 "Manage Input Processors" 命令，可以：
- 查看所有已创建的 Processor
- 打开某个 Processor 的提示词列表
- 复制 Processor ID（按 `Cmd + C`）
- 查看配置说明（按 `Cmd + H`）
- 删除不需要的 Processor（按 `Cmd + Delete`）

### 添加新提示词

1. 在 Processor 对应的目录下创建新的 Markdown 文件
2. 文件包含 YAML frontmatter（定义 title、inputs 等）和正文模板
3. 重启插件或重新加载配置

### Markdown 配置格式

```markdown
---
title: 代码审查
formDescription: 请填写以下信息，生成代码审查提示词
inputs:
  - id: code
    label: 代码内容
    type: textarea
    required: true
  - id: language
    label: 编程语言
    type: select
    options:
      - value: typescript
        label: TypeScript
      - value: python
---
请审查以下 {{language}} 代码：

```{{language}}
{{code}}
```

请提供改进建议。
```

### 支持的输入类型

- `text`: 单行文本输入 (Form.TextField)
- `textarea`: 多行文本输入 (Form.TextArea)
- `select`: 单选下拉框 (Form.Dropdown)
- `multiselect`: 多选标签选择器 (Form.TagPicker)
- `checkbox`: 复选框 (Form.Checkbox)

### 条件字段 (Extra Inputs)

可以根据选项选择动态显示额外字段：

```markdown
---
title: 兴趣爱好
inputs:
  - id: hobbies
    label: 选择兴趣
    type: multiselect
    options:
      - value: 阅读
        extraInputs: [bookType]
      - value: 运动
        extraInputs: [sportType]
  - id: bookType
    label: 喜欢的书籍类型
    type: text
    isExtraInput: true
  - id: sportType
    label: 喜欢的运动类型
    type: text
    isExtraInput: true
---
我的兴趣爱好：{{hobbies}}
喜欢的书籍类型：{{bookType}}
喜欢的运动类型：{{sportType}}
```

### 脚本执行 (execScript)

支持执行自定义脚本处理用户输入，而非粘贴/复制内容：

```markdown
---
title: 个人信息
execScript: /path/to/your/script.sh
inputs:
  - id: name
    label: 姓名
    type: text
    required: true
  - id: email
    label: 邮箱
    type: text
---
姓名：{{name}}
邮箱：{{email}}
```

**功能说明：**
- 当配置了 `execScript` 参数时，提交表单将执行指定的脚本
- 用户输入的字段值会转换为环境变量传递给脚本
- 字段 ID 转大写作为环境变量名（如 `name` → `NAME`）
- multiselect 类型转为逗号分隔字符串
- checkbox 类型转为 "true" 或 "false"
- 隐藏字段（extraInputs 未触发）不设置环境变量

**示例脚本：**
```bash
#!/usr/bin/env bash

# 读取环境变量
name="$NAME"
email="$EMAIL"

# 发送到 API
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$name\", \"email\": \"$email\"}"

exit $?
```

详细测试说明请查看 [EXEC_SCRIPT_TEST.md](./EXEC_SCRIPT_TEST.md)

## 常见问题（FAQ）

### Q: 创建 Processor 后在哪里使用？

A: 创建 Processor 后需要在 Raycast Preferences 中配置。插件提供了 10 个独立命令槽位（"Input Processor 1" 到 "Input Processor 10"），你需要：
1. 打开 Raycast Preferences（`Cmd + ,`）
2. 找到 Aurora Input Processor 扩展
3. 选择一个 "Input Processor N" 命令
4. 粘贴 Processor ID 并启用
5. 可以为该命令设置独立的快捷键

💡 这样设计的好处是每个 Processor 都是独立的命令，可以设置不同的快捷键快速访问。

### Q: 最多可以创建多少个 Processor？

A: 目前最多支持 10 个独立的 Processor 命令。如果需要更多，可以修改代码添加更多 processor-N 命令。但对于大多数使用场景，10 个应该足够了。

### Q: 如何管理现有的 Processors？

A: 使用 "Manage Input Processors" 命令可以：
- 查看所有 Processor 及其配置
- 打开 Processor 的提示词列表
- 复制 Processor ID 用于配置新命令
- 删除不需要的 Processor

### Q: Processor ID 丢失了怎么办？

A: 运行 "Manage Input Processors" 命令，选择对应的 Processor，按 `Cmd + C` 即可复制其 ID。

### Q: 为什么我配置的命令显示 "未配置"？

A: 请检查：
1. 是否在命令设置中正确粘贴了 Processor ID
2. 是否启用了该命令（勾选 "Enable Command"）
3. Processor ID 对应的 Processor 是否还存在（可在 Manage Processors 中查看）

点击 "打开命令设置" 按钮可以快速进入配置页面。

### Q: 如何在提示词中使用条件字段？

A: 使用 `extraInputs` 机制。在选项中指定 `extraInputs` 数组，当选中该选项时，对应的字段会自动显示。详见文档中的 "条件字段" 示例。

### Q: 可以执行自定义脚本吗？

A: 可以。在 frontmatter 中配置 `execScript` 参数指向你的脚本文件。用户输入会转换为环境变量传递给脚本。详见 "脚本执行" 部分。

### Q: 提示词文件支持哪些格式？

A: 目前只支持 Markdown 格式（`.md` 文件），文件需要包含 YAML frontmatter 和正文模板两部分。

### Q: 如何分享我的提示词配置？

A: 直接分享 Markdown 文件即可。其他用户创建 Processor 指向包含这些文件的目录，就可以使用你的提示词了。

## 技术架构

### Processor 配置存储

Processor 配置使用 Raycast 的 LocalStorage API 持久化存储，包含以下信息：
- `id`: 唯一标识符
- `name`: 显示名称
- `directory`: 目标目录路径
- `icon`: 可选图标
- `createdAt`: 创建时间戳

### 命令槽位机制

插件预定义了 10 个通用命令（processor-1 到 processor-10），每个命令：
- 默认禁用（`disabledByDefault: true`）
- 有独立的命令级 preference: `processorId`
- 运行时从 LocalStorage 读取对应的 Processor 配置
- 可单独设置快捷键和别名

这种设计平衡了灵活性和简单性，避免了动态命令生成的复杂性。

## 许可证

MIT
