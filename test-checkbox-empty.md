---
title: 测试 Checkbox 空字符串
formDescription: 测试在 commandLine、args 和 URL 中使用空字符串的 checkbox
inputs:
  - id: test_mode
    label: 测试模式
    type: checkbox
    default: false
    trueValue: "-test"
    falseValue: ""
    description: 启用时添加 -test 后缀，禁用时不添加任何内容
  - id: verbose
    label: 详细输出
    type: checkbox
    default: false
    trueValue: "--verbose"
    falseValue: ""
    description: 启用时添加 --verbose 参数
  - id: environment
    label: 生产环境
    type: checkbox
    default: false
    trueValue: "production"
    falseValue: "development"
---

测试结果：
- 模式: {{test_mode}}（空字符串表示不添加后缀）
- 详细: {{verbose}}（空字符串表示不添加参数）
- 环境: {{environment}}

## 测试场景

### 场景 1：在 URL 中使用
如果配置了 request：
```yaml
request:
  method: GET
  url: "http://localhost:5678/webhook{{test_mode}}/endpoint"
```

- 选中测试模式：`http://localhost:5678/webhook-test/endpoint`
- 未选中测试模式：`http://localhost:5678/webhook/endpoint`

### 场景 2：在命令参数中使用
如果配置了 command：
```yaml
command:
  commandLine: /path/to/script.sh
  args:
    - "{{verbose}}"
    - "--env={{environment}}"
```

- 全部选中：`/path/to/script.sh --verbose --env=production`
- 全部未选中：`/path/to/script.sh  --env=development`（注意第一个参数是空字符串）

### 场景 3：在 commandLine 中使用（不推荐）
```yaml
command:
  commandLine: /path/to/script{{test_mode}}.sh
```

- 选中：`/path/to/script-test.sh`
- 未选中：`/path/to/script.sh`
