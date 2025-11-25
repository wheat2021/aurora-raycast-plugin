# 问题陈述
需要将现有的动态表单插件改造为功能完善的提示词（Prompt）管理器，支持：
1. 从 Markdown 文件读取配置（包含 YAML frontmatter 和正文）
2. 动态输入 frontmatter 中定义的变量
3. 组合生成最终提示词
4. 支持 Enter 插入到上一个应用，Cmd+Enter 复制到剪贴板
5. 可配置的提示词目录
6. 将现有 JSON 配置迁移为 MD 文件
# 当前状态
项目当前实现了一个动态表单系统：
* 使用 JSON 配置驱动表单生成
* 支持多种输入类型：TextLine、MultiLineText、SingleChoice、MultiChoice、BooleanChoice
* 支持条件显示（extraInputs）和动态描述
* 配置文件位于 `src/configs/` 目录，包含 personal-info.json、work-info.json、preferences.json
* 使用 Raycast Form 组件渲染表单
* 提交时通过 toast 显示成功消息
目标提示词目录：`/Users/terrychen/Notes/Prompts/raycast/`（当前为空）
# 实现方案
## 1. Markdown 配置格式设计
### Frontmatter 结构
```yaml
---
title: 提示词标题
inputs:
  - id: variable_name
    label: 显示标签
    type: text|textarea|select|multiselect|checkbox
    required: true|false
    default: 默认值
    description: 帮助文本
    isExtraInput: true|false  # 是否为条件显示字段
    options:  # 仅用于 select/multiselect
      - value: 选项值
        label: 显示文本（可选，默认等于value）
        isDefault: true|false  # 是否默认选中
        extraInputs: [field_id1, field_id2]  # 选中时显示的额外字段
---
```
### 正文内容
* 支持变量插值：`{{variable_name}}`
* 变量名必须对应 frontmatter 中定义的 input id
* 可以多次引用同一变量
* 如果引用的变量对应的 input 因 extraInputs 逻辑未显示（用户未输入），则使用空字符串替换
示例1（基础使用）：
```md
---
title: 代码审查
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
      - value: python  # label可省略，默认为"python"
---
请审查以下 {{language}} 代码：
```{{language}}
{{code}}
```
请提供改进建议。
```warp-runnable-command
示例2（extraInputs使用）：
```md
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
# 如果用户只选了"阅读"，sportType为空字符串
```
## 2. 核心模块改造
### 2.1 类型定义 (src/types/prompt.ts)
新建类型定义，替代现有的 form.ts：
* PromptInputType 枚举
* PromptInput 接口（对应 frontmatter inputs）
* PromptConfig 接口（包含 title, inputs, content）
* PromptValues 接口（用户输入的值）
### 2.2 配置加载器 (src/config/prompts.ts)
替代现有的 forms.ts：
* 从插件 Preferences 读取提示词目录路径
* 扫描目录下所有 .md 文件
* 使用 gray-matter 解析 frontmatter 和正文
* 验证配置格式
* 返回 PromptConfig 数组
### 2.3 变量替换引擎 (src/utils/template.ts)
新建模块：
* 解析正文中的变量引用 `{{variable}}`
* 将用户输入值替换到正文
* 对于 extraInput 字段，如果未显示（用户未触发显示条件），使用空字符串替换
* 对于数组类型的值（multiselect），转换为逗号分隔的字符串
* 返回最终生成的提示词文本
### 2.4 表单组件改造 (src/components/PromptForm.tsx)
改造 DynamicForm.tsx：
* 根据 PromptConfig 渲染输入表单
* 类型映射简化（text→TextField, textarea→TextArea, select→Dropdown, multiselect→TagPicker, checkbox→Checkbox）
* 实时预览生成的提示词（可选）
* ActionPanel 改造：
    * 默认 Action：粘贴到前台应用（使用 Action.Paste）
    * Cmd+Enter：复制到剪贴板（使用 Action.CopyToClipboard）
    * Esc：返回列表
### 2.5 字段渲染器改造 (src/components/PromptField.tsx)
改造 FormField.tsx：
* 保留基础输入类型渲染逻辑
* 支持 required 和 description
* 简化 options 处理：label 为可选，默认使用 value
* 移除动态描述（DescriptionConfig）功能，只支持静态 description 字符串
### 2.6 主界面改造 (src/index.tsx)
* 显示提示词列表（而非表单列表）
* 使用 icon 区分不同类型的提示词
* 显示提示词标题和变量数量
* 点击打开 PromptForm
### 2.7 插件配置 (package.json)
添加 Preference：
```json
"preferences": [
  {
    "name": "promptsDirectory",
    "type": "textfield",
    "required": true,
    "title": "提示词目录",
    "description": "存放提示词 Markdown 文件的目录路径",
    "default": "/Users/terrychen/Notes/Prompts/raycast"
  }
]
```
## 3. 配置迁移
将 src/configs/ 下的 3 个 JSON 文件转换为 MD 格式，保存到 `/Users/terrychen/Notes/Prompts/raycast/`：
### personal-info.json → 个人信息.md
```md
---
title: 个人信息
inputs:
  - id: name
    label: 姓名
    type: text
    required: true
    default: 张三
    description: 请输入您的真实姓名
  - id: introduction
    label: 自我介绍
    type: textarea
    default: 我是一名软件开发者。
    description: 简要介绍一下自己
  - id: gender
    label: 性别
    type: select
    required: true
    default: 男
    options:
      - value: 男
        label: 男
      - value: 女
        label: 女
      - value: 其他
        label: 其他
---
姓名：{{name}}
性别：{{gender}}
自我介绍：
{{introduction}}
```
### work-info.json → 工作信息.md
```md
---
title: 工作信息
inputs:
  - id: company
    label: 公司名称
    type: text
    required: true
    default: ABC科技有限公司
    description: 请输入您当前就职的公司名称
  - id: position
    label: 职位
    type: text
    default: 软件工程师
    description: 请输入您在公司中的职位或角色
---
公司：{{company}}
职位：{{position}}
```
### preferences.json → 偏好设置.md
保留 extraInputs 逻辑的简化版本：
```md
---
title: 偏好设置
inputs:
  - id: hobbies
    label: 兴趣爱好
    type: multiselect
    required: true
    options:
      - value: 阅读
        extraInputs: [favoriteBookTypes]
        isDefault: true
      - value: 运动
        extraInputs: [favoriteSports]
        isDefault: true
      - value: 音乐
        isDefault: true
      - value: 电影
      - value: 旅行
  - id: favoriteBookTypes
    label: 喜爱的书籍类型
    type: multiselect
    isExtraInput: true
    options:
      - value: 推理
      - value: 历史
        isDefault: true
      - value: 理论
      - value: 旅行
        isDefault: true
  - id: favoriteSports
    label: 喜爱的运动
    type: multiselect
    isExtraInput: true
    options:
      - value: 跑步
        isDefault: true
      - value: 足球
      - value: 篮球
        isDefault: true
      - value: 游泳
        isDefault: true
  - id: notifications
    label: 接收通知
    type: checkbox
    default: true
    description: 开启后，您将收到系统更新和推荐通知
---
我的兴趣爱好：{{hobbies}}
喜爱的书籍类型：{{favoriteBookTypes}}
喜爱的运动：{{favoriteSports}}
接收通知：{{notifications}}
```
## 4. 依赖管理
需要添加的依赖：
* `gray-matter`: 解析 Markdown frontmatter
命令：`pnpm add gray-matter`
## 5. 清理旧代码
保留和改造：
* src/utils/extraInputs.ts（保留，条件显示逻辑仍然需要）
移除的功能：
* src/utils/description.ts（移除，不再支持动态描述）
* src/utils/results.ts（移除，旧的结果处理）
* src/configs/ 目录（迁移后可删除 JSON 配置文件）
## 6. 测试验证
1. 验证从目录读取 MD 文件
2. 验证 frontmatter 解析正确
3. 验证表单渲染和输入
4. 验证 extraInputs 条件显示逻辑
5. 验证变量替换生成正确的提示词（包括未显示字段的空字符串替换）
6. 验证 Enter 键粘贴到前台应用
7. 验证 Cmd+Enter 复制到剪贴板
8. 验证 Preferences 中的目录配置生效
