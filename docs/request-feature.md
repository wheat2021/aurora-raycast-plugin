# Request 功能使用说明

## 概述

`request` 是一个类似于 `execScript` 的配置参数，允许你在提示词配置中定义 REST API 请求。当用户提交表单时，插件会执行 HTTP 请求而不是粘贴/复制内容。

## 优先级

当提示词配置同时包含 `request`、`execScript` 和普通模板内容时，执行优先级为：

1. **request** - 如果配置了 `request`，执行 REST API 请求
2. **execScript** - 如果配置了 `execScript`，执行外部脚本
3. **template** - 否则，使用模板生成内容并粘贴/复制

## RequestConfig 配置结构

```yaml
request:
  method: GET | POST | PUT | DELETE | PATCH  # 必填：HTTP 请求方法
  url: string                                # 必填：请求 URL，支持变量替换 {{variable}}
  query:                                     # 可选：Query 参数，支持变量替换
    key1: value1
    key2: "{{variable}}"
  headers:                                   # 可选：请求头，支持变量替换
    Authorization: "Bearer {{api_token}}"
    Content-Type: application/json
  body:                                      # 可选：请求体，支持变量替换
    key1: value1                             # 对象形式会自动转为 JSON
    key2: "{{variable}}"
    # 或者使用字符串形式
    # body: "{{raw_body}}"
  timeout: 30000                             # 可选：超时时间（毫秒），默认 30000
```

## 变量替换

所有支持变量替换的字段都使用 `{{variable}}` 语法，引用 `inputs` 中定义的字段 ID。

### 替换规则

1. **字符串值**：直接替换为用户输入的值
2. **multiselect 字段**：转换为逗号分隔的字符串（如 `"value1, value2"`）
3. **checkbox 字段**：转换为 `"true"` 或 `"false"`
4. **隐藏字段**：未显示的 extraInput 字段替换为空字符串

### URL 中的变量替换

```yaml
url: http://example.com/api/{{endpoint}}
```

### Query 参数中的变量替换

```yaml
query:
  repo: "{{repo_path}}"
  branch: "{{branch_name}}"
  count: 10  # 固定值也可以
```

### Headers 中的变量替换

```yaml
headers:
  Authorization: "Bearer {{api_token}}"
  X-Custom-Header: "{{custom_value}}"
```

### Body 中的变量替换

#### 对象形式（自动转为 JSON）

```yaml
body:
  username: "{{username}}"
  email: "{{email}}"
  tags: "{{tags}}"  # multiselect 字段会转为 "tag1, tag2"
```

#### 字符串形式

```yaml
body: "{{raw_json}}"  # 用户可以输入完整的 JSON 字符串
```

## 完整示例

### 示例 1：GET 请求（n8n webhook）

```markdown
---
title: n8n Webhook 测试
formDescription: 测试调用 n8n webhook
request:
  method: GET
  url: http://localhost:5678/webhook/0a90b8ea-1f78-4abe-a918-7d6c5e00c50f
  query:
    repo: "{{repo_path}}"
    cacheAll: "{{cache_all}}"
    commit: "{{do_commit}}"
    push: "{{do_push}}"
inputs:
  - id: repo_path
    label: 仓库路径
    type: text
    required: true
    default: /opt/code/n8n
  - id: cache_all
    label: 缓存所有文件
    type: checkbox
    default: true
  - id: do_commit
    label: 执行 Commit
    type: checkbox
    default: true
  - id: do_push
    label: 推送到远程
    type: checkbox
    default: true
---

# n8n Webhook 请求

这会发送一个 GET 请求到 n8n webhook。
```

### 示例 2：POST 请求（创建用户）

```markdown
---
title: 创建用户
formDescription: 通过 API 创建新用户
request:
  method: POST
  url: https://api.example.com/users
  headers:
    Authorization: "Bearer {{api_token}}"
    Content-Type: application/json
  body:
    name: "{{username}}"
    email: "{{email}}"
    role: "{{role}}"
    active: "{{is_active}}"
inputs:
  - id: api_token
    label: API Token
    type: text
    required: true
    description: 你的 API 访问令牌
  - id: username
    label: 用户名
    type: text
    required: true
  - id: email
    label: 邮箱
    type: text
    required: true
  - id: role
    label: 角色
    type: select
    required: true
    options:
      - value: admin
        label: 管理员
      - value: user
        label: 普通用户
        isDefault: true
  - id: is_active
    label: 激活账户
    type: checkbox
    default: true
---

# 创建用户

提交表单后将创建一个新用户账户。
```

### 示例 3：PUT 请求（更新配置）

```markdown
---
title: 更新服务配置
formDescription: 更新服务的配置项
request:
  method: PUT
  url: https://api.example.com/config
  headers:
    Authorization: "Bearer {{api_token}}"
  body:
    database:
      host: "{{db_host}}"
      port: "{{db_port}}"
    cache:
      enabled: "{{enable_cache}}"
      ttl: "{{cache_ttl}}"
inputs:
  - id: api_token
    label: API Token
    type: text
    required: true
  - id: db_host
    label: 数据库主机
    type: text
    default: localhost
  - id: db_port
    label: 数据库端口
    type: text
    default: "5432"
  - id: enable_cache
    label: 启用缓存
    type: checkbox
    default: true
  - id: cache_ttl
    label: 缓存过期时间（秒）
    type: text
    default: "3600"
---

# 更新服务配置

提交表单后将更新服务的配置。
```

## 响应处理

### 成功响应

当请求成功（HTTP 状态码 2xx）时：
- 显示成功 Toast 消息：`请求成功 (200)`
- 如果响应体是短字符串（≤100 字符），显示在消息中
- 如果响应体是对象，显示 JSON 的前 100 字符
- 完整的响应内容记录到控制台日志

### 失败响应

当请求失败时：
- 显示失败 Toast 消息：`请求失败`
- 显示错误详情（状态码、错误消息等）
- 错误详情记录到控制台日志

## 测试步骤

1. **创建测试配置文件**

   在你的 Processor 目录中创建一个 `.md` 文件，使用上面的示例配置。

2. **配置 Processor**

   在 Raycast Preferences 中配置一个 Processor，指向包含测试文件的目录。

3. **运行测试**

   - 在 Raycast 中运行该 Processor 命令
   - 选择测试配置文件
   - 填写表单
   - 按 Enter 或 Cmd+Enter 提交（两者效果相同，都会执行请求）

4. **查看结果**

   - 观察 Toast 消息显示的请求结果
   - 如需查看详细响应，可以打开 Raycast 的开发者控制台查看日志

## 注意事项

1. **超时时间**：默认超时为 30 秒，可通过 `timeout` 参数调整（单位：毫秒）

2. **Content-Type**：
   - 如果 body 是对象，默认 `Content-Type: application/json`
   - 如果 body 是字符串，默认 `Content-Type: text/plain`
   - 可以通过 headers 显式设置 Content-Type

3. **错误处理**：请求失败时会显示详细的错误信息，包括状态码和响应内容

4. **HTTPS**：推荐在生产环境使用 HTTPS 确保安全

5. **API Token**：如果需要认证，建议将 token 作为一个表单字段让用户输入，或者使用环境变量

## 与 execScript 的对比

| 特性 | request | execScript |
|------|---------|------------|
| 用途 | HTTP API 调用 | 执行外部脚本 |
| 传递数据方式 | URL/Query/Headers/Body | 环境变量 |
| 响应展示 | Toast + 控制台日志 | Toast + 控制台日志 |
| 超时时间 | 默认 30s（可配置） | 固定 30s |
| 变量替换 | `{{variable}}` | 环境变量（大写） |
| 适用场景 | REST API、Webhook | Shell 脚本、复杂逻辑 |

## 高级用法

### 条件字段与请求参数

结合 `extraInputs` 功能，可以根据用户选择动态显示字段，并在请求中使用这些字段：

```yaml
inputs:
  - id: action
    label: 操作类型
    type: select
    options:
      - value: create
        label: 创建
        extraInputs: [name, description]
      - value: delete
        label: 删除
        extraInputs: [id]
  - id: name
    label: 名称
    type: text
    isExtraInput: true
  - id: description
    label: 描述
    type: textarea
    isExtraInput: true
  - id: id
    label: ID
    type: text
    isExtraInput: true

request:
  method: POST
  url: https://api.example.com/{{action}}
  body:
    name: "{{name}}"
    description: "{{description}}"
    id: "{{id}}"
```

未显示的字段（如选择 "创建" 时的 `id`）会被替换为空字符串。

## 故障排查

### 问题：请求超时

**解决方案**：增加 `timeout` 值

```yaml
request:
  timeout: 60000  # 60 秒
```

### 问题：变量未替换

**原因**：
1. 字段 ID 拼写错误
2. 字段被隐藏（extraInput 未触发显示）

**解决方案**：
1. 检查 `{{variable}}` 中的变量名与 `inputs[].id` 是否一致
2. 确保字段在提交时是可见的

### 问题：请求失败但不知道原因

**解决方案**：
1. 打开 Raycast 开发者控制台（Cmd+Shift+D）
2. 查看 "Request error" 日志
3. 检查完整的错误堆栈和响应内容

## 总结

`request` 功能为 Aurora Input Processor 提供了强大的 REST API 集成能力，让你可以：

✅ 直接从 Raycast 调用 HTTP API
✅ 动态构建请求参数（URL、Query、Headers、Body）
✅ 灵活使用表单输入进行变量替换
✅ 处理各种 HTTP 方法（GET、POST、PUT、DELETE、PATCH）
✅ 获取清晰的成功/失败反馈

结合 `extraInputs`、`multiselect`、`checkbox` 等字段类型，你可以构建出功能强大且用户友好的 API 调用界面。
