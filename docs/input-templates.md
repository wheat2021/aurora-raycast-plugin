# Input 模板功能使用指南

## 功能概述

Input 模板功能允许你通过 `copy` 属性快速从预定义模板复制字段配置，而无需手动编写完整的配置。当你第一次执行该提示词时，完整的配置会自动保存到 Markdown 文件中。

## 工作原理

1. **模板缓存**: 系统内置了所有 input 类型的完整配置模板
2. **智能合并**: 当检测到 `copy` 属性时，自动从缓存加载模板并与用户配置合并
3. **自动保存**: 第一次执行后，完整配置自动写入 Markdown 文件
4. **用户优先**: 用户配置的属性会覆盖模板中的默认值

## 使用方法

### 基础示例

在 Markdown frontmatter 中使用 `copy` 属性：

```yaml
---
title: 示例提示词
inputs:
  - copy: select
    id: repo_type
    label: 仓库类型
  - copy: selectInFolder
    id: repo_path
    label: 仓库路径
    folder: /opt/code
  - copy: text
    id: author_name
    label: 作者名称
---

这是提示词内容，使用 {{repo_type}}、{{repo_path}} 和 {{author_name}} 变量。
```

### 第一次执行后

当你第一次在 Raycast 中执行这个提示词并提交表单后，配置会自动扩展并保存：

```yaml
---
title: 示例提示词
inputs:
  - id: repo_type
    label: 仓库类型
    type: select
    required: false
    description: 请选择一个选项
    isExtraInput: false
    options:
      - value: option1
        label: 选项 1
        isDefault: true
      - value: option2
        label: 选项 2
      - value: option3
        label: 选项 3
        extraInputs: []
    default: option1  # 你提交表单时选择的值
  - id: repo_path
    label: 仓库路径
    type: selectInFolder
    required: false
    description: 从指定文件夹中选择
    isExtraInput: false
    folder: /opt/code
    valueItemType: 0
    regIncludeFilter: ""
    regExcludeFilter: ""
    default: /opt/code/some-repo  # 你提交表单时选择的路径
  - id: author_name
    label: 作者名称
    type: text
    required: false
    default: Terry Chen  # 你提交表单时输入的值
    description: 请输入文本内容
    isExtraInput: false
lastUseTime: 1234567890000  # 自动添加最后使用时间
---

这是提示词内容，使用 {{repo_type}}、{{repo_path}} 和 {{author_name}} 变量。
```

## 支持的类型模板

### 1. text - 单行文本输入

```yaml
- copy: text
  id: your_id
  label: 你的标签
  # 其他属性可选...
```

**模板包含的默认属性**:
- `type: text`
- `required: false`
- `default: ""`
- `description: "请输入文本内容"`
- `isExtraInput: false`

### 2. textarea - 多行文本输入

```yaml
- copy: textarea
  id: your_id
  label: 你的标签
```

**模板包含的默认属性**:
- `type: textarea`
- `required: false`
- `default: ""`
- `description: "请输入多行文本内容"`
- `isExtraInput: false`

### 3. select - 单选下拉框

```yaml
- copy: select
  id: your_id
  label: 你的标签
```

**模板包含的默认属性**:
- `type: select`
- `required: false`
- `description: "请选择一个选项"`
- `isExtraInput: false`
- `options`: 包含 3 个示例选项的数组

### 4. multiselect - 多选标签

```yaml
- copy: multiselect
  id: your_id
  label: 你的标签
```

**模板包含的默认属性**:
- `type: multiselect`
- `required: false`
- `description: "可以选择多个选项"`
- `isExtraInput: false`
- `default: []`
- `options`: 包含 3 个示例选项的数组

### 5. checkbox - 复选框

```yaml
- copy: checkbox
  id: your_id
  label: 你的标签
```

**模板包含的默认属性**:
- `type: checkbox`
- `required: false`
- `default: false`
- `description: "勾选表示同意"`
- `isExtraInput: false`
- `trueValue: "true"`
- `falseValue: "false"`

### 6. selectInFolder - 文件夹选择

```yaml
- copy: selectInFolder
  id: your_id
  label: 你的标签
  folder: /your/path  # 必须覆盖这个属性
```

**模板包含的默认属性**:
- `type: selectInFolder`
- `required: false`
- `description: "从指定文件夹中选择"`
- `isExtraInput: false`
- `folder: "/Users/yourname/Documents"`  # 建议覆盖
- `valueItemType: 0`  # 0=目录和文件, 1=仅目录, 2=仅文件
- `regIncludeFilter: ""`
- `regExcludeFilter: ""`
- `default: ""`

## 覆盖模板属性

你可以在配置中覆盖模板的任何属性：

```yaml
inputs:
  - copy: select
    id: priority
    label: 优先级
    required: true  # 覆盖模板的 required: false
    description: 选择任务优先级  # 覆盖模板的描述
    options:  # 覆盖模板的选项
      - value: high
        label: 高优先级
        isDefault: true
      - value: medium
        label: 中优先级
      - value: low
        label: 低优先级
```

## 高级用法：extraInputs

模板支持条件字段显示（extraInputs）：

```yaml
inputs:
  - copy: select
    id: deployment_type
    label: 部署类型
    options:
      - value: docker
        label: Docker 部署
        extraInputs: [docker_image, docker_port]
      - value: manual
        label: 手动部署
        extraInputs: [manual_path]

  - copy: text
    id: docker_image
    label: Docker 镜像
    isExtraInput: true  # 只有选择 docker 时才显示

  - copy: text
    id: docker_port
    label: Docker 端口
    isExtraInput: true

  - copy: text
    id: manual_path
    label: 手动部署路径
    isExtraInput: true  # 只有选择 manual 时才显示
```

## 优势总结

✅ **快速开发**: 只需指定 `copy` 和必要属性，无需手动构造完整配置
✅ **自动补全**: 首次执行后自动保存完整配置，方便后续调整
✅ **降低错误**: 使用经过验证的模板，避免配置错误
✅ **灵活覆盖**: 可以覆盖模板的任何属性以满足特定需求
✅ **保持可读**: 初始配置简洁易读，完整配置自动生成

## 注意事项

1. **必填字段**: 使用 `copy` 时，仍需提供 `id` 和 `label` 字段
2. **首次执行**: 必须执行一次提示词（提交表单）才会保存完整配置
3. **覆盖生效**: 用户配置的属性优先级高于模板
4. **模板缓存**: 模板存储在 Raycast 的 LocalStorage 中，首次加载使用默认模板

## 完整示例

创建一个 Git 提交信息生成器：

```yaml
---
title: Git 提交信息生成器
formDescription: 根据提交类型和描述生成规范的提交信息
inputs:
  - copy: select
    id: commit_type
    label: 提交类型
    required: true
    options:
      - value: feat
        label: ✨ 新功能
        isDefault: true
      - value: fix
        label: 🐛 修复
      - value: docs
        label: 📝 文档
      - value: refactor
        label: ♻️ 重构

  - copy: text
    id: scope
    label: 影响范围
    description: 例如：api, ui, auth

  - copy: textarea
    id: description
    label: 提交描述
    required: true

  - copy: checkbox
    id: breaking_change
    label: 包含破坏性变更
---

{{commit_type}}{{#if scope}}({{scope}}){{/if}}: {{description}}{{#if breaking_change}}

BREAKING CHANGE: 此提交包含破坏性变更{{/if}}
```

首次执行并提交后，完整配置会自动保存到文件中，包括你输入的默认值和所有模板属性。
