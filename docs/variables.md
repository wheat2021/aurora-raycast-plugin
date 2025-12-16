# 变量替换功能

Aurora Input Processor 支持两种类型的变量替换，让你的提示词模板更加强大和灵活。

## 变量类型

### 1. 用户自定义变量 `{{variable}}`

使用双花括号 `{{variable}}` 语法引用在 frontmatter 中定义的输入字段。

**示例配置：**

```markdown
---
title: 代码审查
inputs:
  - id: code
    label: 代码
    type: textarea
    required: true
  - id: language
    label: 编程语言
    type: select
    options:
      - value: javascript
        label: JavaScript
      - value: python
        label: Python
---

请审查以下 {{language}} 代码：

{{code}}

请提供改进建议。
```

**替换规则：**
- **字符串类型** (`text`, `textarea`, `select`)：直接替换为值
- **数组类型** (`multiselect`)：转换为逗号分隔的字符串，例如 `["选项1", "选项2"]` → `"选项1, 选项2"`
- **布尔类型** (`checkbox`)：`true` → `"是"`，`false` → `"否"`
- **隐藏字段**：如果字段因 `extraInputs` 机制未显示，则替换为空字符串
- **未填写字段**：替换为空字符串

### 2. Raycast 内置变量 `{variable}`

使用单花括号 `{variable}` 语法引用 Raycast 提供的内置变量。

#### 可用的内置变量

| 变量 | 说明 | 示例用途 |
|------|------|---------|
| `{selection}` | 当前选中的文本 | 对选中文本进行处理、翻译、解释等 |
| `{clipboard}` | 剪贴板内容 | 使用剪贴板中的内容作为输入 |

**示例配置：**

```markdown
---
title: 翻译选中文本
inputs:
  - id: target_language
    label: 目标语言
    type: select
    options:
      - value: 中文
        label: 中文
      - value: English
        label: 英文
---

请将以下文本翻译成{{target_language}}：

{selection}
```

**使用场景：**

1. **翻译选中文本**
   ```markdown
   将以下内容翻译成{{language}}：
   {selection}
   ```

2. **解释选中代码**
   ```markdown
   请解释以下代码的功能：
   {selection}
   ```

3. **处理剪贴板内容**
   ```markdown
   请将以下内容格式化为Markdown表格：
   {clipboard}
   ```

4. **结合使用**
   ```markdown
   对比分析：

   选中的文本：
   {selection}

   剪贴板的文本：
   {clipboard}

   分析角度：{{analysis_type}}
   ```

## 完整示例

### 示例 1：代码注释生成器

```markdown
---
title: 生成代码注释
inputs:
  - id: comment_style
    label: 注释风格
    type: select
    options:
      - value: JSDoc
        label: JSDoc
      - value: Python Docstring
        label: Python Docstring
      - value: JavaDoc
        label: JavaDoc
---

请为以下代码生成{{comment_style}}风格的注释：

{selection}
```

**使用方式：**
1. 在编辑器中选中需要注释的代码
2. 运行此提示词
3. 选择注释风格
4. 按 Enter 将生成的注释粘贴到当前位置

### 示例 2：文本处理工具

```markdown
---
title: 文本处理
inputs:
  - id: operation
    label: 操作类型
    type: select
    options:
      - value: 大写转换
        label: 转换为大写
      - value: 小写转换
        label: 转换为小写
      - value: 标题化
        label: 标题化（首字母大写）
      - value: 去除空格
        label: 去除多余空格
---

对以下文本执行「{{operation}}」操作：

{clipboard}
```

**使用方式：**
1. 复制需要处理的文本到剪贴板
2. 运行此提示词
3. 选择处理方式
4. 获得处理后的结果

### 示例 3：多输入综合处理

```markdown
---
title: 内容对比分析
inputs:
  - id: aspect
    label: 对比维度
    type: multiselect
    options:
      - value: 语气
        label: 语气
      - value: 专业性
        label: 专业性
      - value: 简洁度
        label: 简洁度
      - value: 准确性
        label: 准确性
  - id: output_format
    label: 输出格式
    type: select
    options:
      - value: 表格
        label: 表格
      - value: 列表
        label: 列表
---

请从以下维度对比分析两段文本：{{aspect}}

**文本A（选中内容）：**
{selection}

**文本B（剪贴板内容）：**
{clipboard}

请以{{output_format}}形式输出分析结果。
```

## 注意事项

1. **变量获取失败处理**
   - 如果无法获取选中文本（如没有选中内容），`{selection}` 会被替换为空字符串
   - 如果无法读取剪贴板（如剪贴板为空或无权限），`{clipboard}` 会被替换为空字符串
   - 这确保了提示词始终能够生成，不会因为缺少变量而报错

2. **变量优先级**
   - Raycast 内置变量 `{selection}` 和 `{clipboard}` 会先被替换
   - 然后才处理用户自定义变量 `{{variable}}`
   - 这意味着你不能用自定义变量覆盖内置变量

3. **性能考虑**
   - 读取选中文本和剪贴板是异步操作
   - 在生成提示词时会自动等待这些操作完成
   - 通常这个过程非常快，不会影响用户体验

4. **隐私提示**
   - 使用 `{clipboard}` 时要注意剪贴板可能包含敏感信息
   - 确保你的提示词不会意外泄露这些信息

## 最佳实践

1. **清晰的提示词结构**
   - 在使用内置变量时，添加清晰的标题和说明
   - 帮助 AI 理解内容的上下文

2. **提供回退方案**
   - 考虑变量可能为空的情况
   - 在提示词中提供相应的说明

3. **组合使用**
   - 善用自定义变量和内置变量的组合
   - 创建更灵活和强大的提示词模板

4. **测试验证**
   - 创建提示词后，测试各种情况：
     - 有选中内容 vs 无选中内容
     - 剪贴板有内容 vs 剪贴板为空
     - 不同的输入组合

## 故障排除

### `{selection}` 总是空的

**可能原因：**
- 运行提示词前没有选中文本
- 在某些应用中无法获取选中文本

**解决方案：**
- 确保在运行提示词前选中了文本
- 尝试先复制到剪贴板，使用 `{clipboard}` 代替

### `{clipboard}` 总是空的

**可能原因：**
- 剪贴板中没有文本内容
- 剪贴板权限问题

**解决方案：**
- 检查剪贴板中是否有内容
- 确保 Raycast 有剪贴板访问权限

### 变量没有被替换

**可能原因：**
- 语法错误（花括号数量或拼写错误）
- 变量名不匹配

**解决方案：**
- 检查语法：内置变量用 `{variable}`，自定义变量用 `{{variable}}`
- 确保变量名与 frontmatter 中的 `id` 完全匹配
