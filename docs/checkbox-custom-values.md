# Checkbox 自定义值功能

## 概述

Checkbox 组件现在支持自定义 `trueValue` 和 `falseValue`，允许你配置 checkbox 选中和未选中时的输出值。

## 使用方法

在 Markdown 文件的 frontmatter 中，为 checkbox 类型的 input 添加 `trueValue` 和 `falseValue` 属性：

```yaml
---
title: 示例配置
inputs:
  - id: agree
    label: 同意条款
    type: checkbox
    trueValue: "已同意"
    falseValue: "未同意"
---

用户{{agree}}服务条款
```

## 默认行为

如果不配置 `trueValue` 和 `falseValue`，系统会使用默认值：

- **模板替换**（粘贴/复制内容）：`true` → "是"，`false` → "否"
- **命令执行**（command）：`true` → "true"，`false` → "false"
- **API 请求**（request）：`true` → "true"，`false` → "false"

## 示例 1：模板替换

### 配置文件
```markdown
---
title: 用户协议确认
inputs:
  - id: privacy
    label: 同意隐私政策
    type: checkbox
    trueValue: "已阅读并同意"
    falseValue: "未同意"
  - id: terms
    label: 同意服务条款
    type: checkbox
    trueValue: "YES"
    falseValue: "NO"
---

隐私政策: {{privacy}}
服务条款: {{terms}}
```

### 输出结果

当两个 checkbox 都选中时：
```
隐私政策: 已阅读并同意
服务条款: YES
```

当两个 checkbox 都未选中时：
```
隐私政策: 未同意
服务条款: NO
```

## 示例 2：命令执行

### 配置文件
```markdown
---
title: 部署配置
inputs:
  - id: production
    label: 生产环境
    type: checkbox
    trueValue: "prod"
    falseValue: "dev"
  - id: enableCache
    label: 启用缓存
    type: checkbox
    trueValue: "1"
    falseValue: "0"
  - id: verboseMode
    label: 详细输出
    type: checkbox
    trueValue: "--verbose"
    falseValue: ""

command:
  commandLine: /path/to/deploy.sh
  args:
    - "--env={{production}}"
    - "--cache={{enableCache}}"
    - "{{verboseMode}}"
---

部署到{{production}}环境，缓存状态：{{enableCache}}
```

### 命令执行

当全部选中时，执行：
```bash
/path/to/deploy.sh --env=prod --cache=1 --verbose
```

当只选中"生产环境"时，执行：
```bash
/path/to/deploy.sh --env=prod --cache=0
```

**注意**：`verboseMode` 使用空字符串作为 `falseValue`，未选中时不会添加任何参数。

## 示例 3：API 请求

### 配置文件
```markdown
---
title: 创建用户
inputs:
  - id: name
    label: 用户名
    type: text
    required: true
  - id: isAdmin
    label: 管理员权限
    type: checkbox
    trueValue: "admin"
    falseValue: "user"
  - id: emailNotify
    label: 邮件通知
    type: checkbox
    trueValue: "enabled"
    falseValue: "disabled"

request:
  method: POST
  url: https://api.example.com/users
  headers:
    Content-Type: application/json
  body:
    name: "{{name}}"
    role: "{{isAdmin}}"
    notifications: "{{emailNotify}}"
---

创建用户 {{name}}，角色：{{isAdmin}}，通知：{{emailNotify}}
```

### 请求体

当选中管理员权限和邮件通知时：
```json
{
  "name": "张三",
  "role": "admin",
  "notifications": "enabled"
}
```

当都未选中时：
```json
{
  "name": "张三",
  "role": "user",
  "notifications": "disabled"
}
```

## 示例 4：URL 中使用变量

变量也可以在 URL 中使用，包括 checkbox 自定义值：

### 配置文件
```markdown
---
title: 获取用户信息
inputs:
  - id: userId
    label: 用户 ID
    type: text
    required: true
  - id: includeDetails
    label: 包含详细信息
    type: checkbox
    trueValue: "true"
    falseValue: "false"

request:
  method: GET
  url: https://api.example.com/users/{{userId}}?details={{includeDetails}}
---

查询用户 {{userId}} 的信息
```

### 实际请求

当选中"包含详细信息"时：
```
GET https://api.example.com/users/123?details=true
```

当未选中时：
```
GET https://api.example.com/users/123?details=false
```

**注意**：执行结果页面会显示替换后的完整 URL，方便调试。

## 注意事项

1. `trueValue` 和 `falseValue` 都是可选的
2. 如果只配置其中一个，另一个将使用默认值
3. 配置的值会在所有场景下生效（模板替换、命令执行、API 请求）
4. 值类型为字符串，会直接替换到模板、命令参数或请求体中
5. **支持空字符串**：可以将 `trueValue` 或 `falseValue` 设置为空字符串 `""`，在 URL 等场景下非常有用

## 使用空字符串示例

在某些场景下，你可能希望某个选项不输出任何内容，可以使用空字符串：

### 配置文件
```markdown
---
title: Webhook 通知
inputs:
  - id: enableTest
    label: 使用测试环境
    type: checkbox
    trueValue: "-test"
    falseValue: ""

request:
  method: GET
  url: "http://localhost:5678/webhook{{enableTest}}/endpoint-id"
---
```

### 实际 URL

当选中"使用测试环境"时：
```
http://localhost:5678/webhook-test/endpoint-id
```

当未选中时：
```
http://localhost:5678/webhook/endpoint-id
```

注意：未选中时不会输出 "false"，而是完全不输出任何内容。

## 技术实现

- 类型定义：`src/types/prompt.ts` - 添加了 `trueValue` 和 `falseValue` 属性
- 值转换：`src/utils/valueConverter.ts` - 提供统一的值转换函数
- 模板替换：`src/utils/template.ts` - 使用 `valueToTemplateString`
- 命令执行：`src/utils/commandExecutor.ts` - 使用 `valueToCommandString`
- API 请求：`src/utils/requestExecutor.ts` - 使用 `valueToCommandString`
