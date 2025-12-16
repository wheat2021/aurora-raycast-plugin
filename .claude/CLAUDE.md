# Aurora Input Processor

Aurora Input Processor - 支持多文件夹的提示词处理器。

## 项目结构

```
aurora-raycast-plugin/
├── assets/                    # 资源文件
│   └── icon.png              # 插件图标 (512x512)
├── src/                      # 源代码
│   ├── manage-ai.tsx         # AI 提供商管理命令
│   ├── ask-ai.tsx            # AI 问答命令
│   ├── processor.tsx         # 通用 Processor 入口模板
│   ├── processor-[1-9].tsx   # 9 个 Processor 命令入口
│   ├── types/                # 类型定义
│   │   ├── form.ts           # 旧表单类型（兼容）
│   │   ├── prompt.ts         # 提示词相关类型
│   │   └── processor.ts      # Processor 配置类型
│   ├── components/           # React 组件
│   │   ├── PromptForm.tsx    # 提示词表单组件
│   │   ├── PromptField.tsx   # 提示词字段组件
│   │   └── PromptList.tsx    # 提示词列表组件
│   ├── config/               # 配置加载
│   │   └── prompts.ts        # 提示词配置加载器
│   └── utils/                # 工具函数
│       ├── extraInputs.ts    # 条件字段显示逻辑
│       ├── template.ts       # 变量替换引擎
│       ├── configWriter.ts   # 将配置保存回 Markdown
│       └── execScript.ts     # 执行外部脚本并传递环境变量
├── .eslintrc.json            # ESLint 配置
├── .gitignore                # Git 忽略文件
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 项目说明
```

## 功能特性

✅ **Markdown 配置** - 使用 Markdown 文件（YAML frontmatter + 正文）定义提示词
✅ **动态变量输入** - 根据 frontmatter 中定义的变量生成表单
✅ **多种输入类型** - 支持 text、textarea、select、multiselect、checkbox
✅ **条件字段** - 支持 extraInputs 机制，根据选项动态显示字段
✅ **模板替换** - {{variable}} 语法替换变量生成最终提示词
✅ **多种输出方式** - Enter 键粘贴到前台应用，Cmd+Enter 复制到剪贴板
✅ **脚本执行（execScript）** - 将用户输入转为环境变量并执行外部脚本
✅ **多文件夹支持** - 支持最多 9 个 Processor，每个指向不同目录
✅ **独立命令** - 每个 Processor 都是独立的 Raycast 命令，可单独设置快捷键
✅ **简化配置** - 直接在 Preferences 中配置目录路径，无需额外管理步骤
✅ **表单验证** - 支持必填项验证

## 技术栈

- **框架**: Raycast API v1.103.7
- **语言**: TypeScript 5.7+
- **UI**: React (JSX)
- **包管理器**: pnpm
- **代码质量**: ESLint + Prettier
- **依赖库**: gray-matter (Markdown frontmatter 解析)

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式 (热重载)
pnpm dev

# 构建生产版本
pnpm build

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm run fix-lint

# 更新本地 Raycast 已导入的插件
pnpm release

# 发布插件到 Raycast Store
pnpm publish
```

### 更新本地插件
当你修改了插件代码后，需要更新 Raycast 中已导入的插件：

1. **使用命令更新** (推荐)
   ```bash
   pnpm release
   ```
   此命令会自动构建并在 Raycast 中重新加载插件

2. **手动更新**
   - 运行 `pnpm build` 构建插件
   - 在 Raycast 中按 `Cmd+R` 重新加载插件
   - 或使用 Raycast 命令：`Reload Extension`

### 发布插件
将插件发布到 Raycast Store 供其他用户使用：

1. **准备发布**
   - 确保 `package.json` 中的 `author` 字段是你的 Raycast 用户名
   - 确保插件图标符合要求 (512x512 PNG)
   - 更新 README.md 和文档
   - 提交所有代码变更到 Git

2. **执行发布**
   ```bash
   pnpm publish
   ```
   此命令会自动执行以下步骤：
   - 运行代码检查 (lint)
   - 构建生产版本
   - 调用 Raycast 发布工具

3. **发布流程**
   - 首次发布需要登录 Raycast 账号
   - 按照命令行提示完成发布
   - 发布后需要等待 Raycast 团队审核
   - 审核通过后插件会出现在 Raycast Store

## 开发状态

✅ 项目初始化完成
✅ 依赖安装成功
✅ 构建流程正常
✅ 开发服务器可运行
✅ Lint 验证通过
✅ 提示词管理器功能实现完成
✅ Markdown 配置读取功能完成
✅ 变量替换引擎实现完成
✅ 示例提示词配置完成
✅ 配置方式简化完成 - 直接通过 Preferences 配置

## 核心概念

### 提示词配置 (PromptConfig)
提示词由 Markdown 文件定义，包含:
- **frontmatter** (YAML): 定义 title 和 inputs 变量
- **content** (正文): 包含 {{variable}} 占位符的模板文本

### 字段类型 (PromptInputType)
- **text**: 单行文本输入 (Form.TextField)
- **textarea**: 多行文本输入 (Form.TextArea)
- **select**: 单选下拉框 (Form.Dropdown)
- **multiselect**: 多选标签选择器 (Form.TagPicker)
- **checkbox**: 复选框 (Form.Checkbox)

### 条件字段 (Extra Inputs)
通过 `extraInputs` 属性实现:
- 在选项中定义 `extraInputs: [field_id1, field_id2]`
- 字段配置中设置 `isExtraInput: true`
- 选中该选项时自动显示关联字段
- multiselect 类型支持合并多个选项的 extraInputs

### 变量替换 (Template Replacement)
- 使用 `{{variable}}` 语法在正文中引用变量
- multiselect 类型的值自动转换为逗号分隔的字符串
- checkbox 类型转换为 "是" 或 "否"
- 未显示的 extraInput 字段替换为空字符串

### 脚本执行 (execScript)
- 在 frontmatter 中配置 `execScript: /path/to/script.sh`
- 提交时将可见字段的值转换为环境变量：`id` → `ID`（大写）
- multiselect → 逗号分隔字符串，checkbox → "true"/"false"
- 使用 `execFile` 执行脚本（30s 超时），显示执行结果 Toast

### Processor 配置 (ProcessorConfig)
Processor 是管理特定目录的配置实体，包含：
- **id**: 唯一标识符
- **name**: 显示名称
- **directory**: 目录路径
- **icon**: 图标（可选）
- **createdAt**: 创建时间戳

## 命令说明

### Manage AI Providers
管理 AI 提供商配置：
- 配置不同的 AI 服务提供商
- 管理 AI 相关设置

### Ask AI
向各种 AI 助手提问（Perplexity、ChatGPT、Claude 等）

### Processor 1-9
9 个通用 Processor 命令：
- 默认禁用，需要在 Preferences 中配置后启用
- 每个命令可单独设置快捷键
- 直接在命令的 Preferences 中配置目录路径和显示名称
- 显示该目录下的所有提示词

## 使用流程

1. **配置 Processor**
   - 打开 Raycast Preferences（Cmd+,）
   - 找到 "Aurora Input Processor" 扩展
   - 选择一个 "Processor N" 命令
   - 配置以下字段：
     - **Processor Name** (可选): 显示名称，默认为 "Prompts"
     - **Prompts Directory** (必填): 提示词文件所在的目录绝对路径
   - 启用该命令
   - （可选）设置快捷键

2. **使用 Processor**
   - 运行配置好的 "Processor N" 命令
   - 选择提示词
   - 填写表单
   - Enter 键粘贴到前台应用，或 Cmd+Enter 复制到剪贴板

## 技术要点

- 使用 `Action.Push` 实现多层导航
- Processor 命令通过命令级 preference 直接配置目录路径
- 最多支持 9 个 Processor
- 无需中间存储层，配置即时生效
```

## 注意事项

### Author 字段
当前 `package.json` 中的 `author` 字段已设置为 `"wheat2021"`。如果需要发布到商店:
1. 确保已注册 Raycast 账号
2. 将 author 字段更新为你的 Raycast 用户名

### 图标要求
- 尺寸: 512x512 像素
- 格式: PNG
- 当前使用占位图标,可根据需要替换

## 提示词配置示例

查看 `/Users/terrychen/Notes/Prompts/raycast/` 目录下的示例文件：
- `个人信息.md` - 基础的文本和选择类型
- `工作信息.md` - 简单的信息收集
- `偏好设置.md` - 包含 extraInputs 的复杂示例

## 参考资料

- [Raycast API 文档](https://developers.raycast.com)
- [Raycast 扩展商店](https://raycast.com/store)
- [Raycast Extensions GitHub](https://github.com/raycast/extensions)
