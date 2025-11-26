# Aurora Raycast Plugin

Aurora 的 Raycast 扩展插件 - 提示词管理器。

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
✅ **可配置目录** - 通过 Preferences 设置提示词存放目录

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

## 使用说明

### 添加新提示词

1. 在配置的提示词目录下（默认 `~/Notes/Prompts/raycast/`）创建新的 Markdown 文件
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

## 许可证

MIT
