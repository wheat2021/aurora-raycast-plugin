# Command 功能使用说明

## 概述

`command` 是一个类似于 `request` 的配置参数，允许你在提示词配置中定义命令执行。当用户提交表单时，插件会执行配置的命令而不是粘贴/复制内容。

`command` 是 `execScript` 的升级版本，提供了更强大和灵活的命令执行能力。

## 优先级

当提示词配置同时包含 `request`、`command`、`execScript` 和普通模板内容时，执行优先级为：

1. **request** - 如果配置了 `request`，执行 REST API 请求
2. **command** - 如果配置了 `command`，执行命令
3. **execScript** - 如果配置了 `execScript`（向后兼容），执行脚本
4. **template** - 否则，使用模板生成内容并粘贴/复制

## CommandConfig 配置结构

```yaml
command:
  commandLine: string          # 必填：命令或脚本路径，支持变量替换 {{variable}}
  args:                        # 可选：命令行参数数组，支持变量替换
    - "{{arg1}}"
    - "{{arg2}}"
    - "fixed-value"
  envs:                        # 可选：环境变量，支持变量替换
    API_TOKEN: "{{api_token}}"
    DEBUG: "true"
  cwd: string                  # 可选：工作目录，支持变量替换 {{variable}}
  timeout: 30000               # 可选：超时时间（毫秒），默认 30000
```

## 变量替换

所有支持变量替换的字段都使用 `{{variable}}` 语法，引用 `inputs` 中定义的字段 ID。

### 替换规则

1. **字符串值**：直接替换为用户输入的值
2. **multiselect 字段**：转换为逗号分隔的字符串（如 `"value1, value2"`）
3. **checkbox 字段**：转换为 `"true"` 或 `"false"`
4. **隐藏字段**：未显示的 extraInput 字段替换为空字符串

### commandLine 中的变量替换

```yaml
command:
  commandLine: /usr/local/bin/{{script_name}}
```

### args 中的变量替换

```yaml
command:
  commandLine: /path/to/script.sh
  args:
    - "{{repo_path}}"
    - "{{branch_name}}"
    - "--verbose"
```

### envs 中的变量替换

```yaml
command:
  commandLine: /path/to/script.sh
  envs:
    REPO_PATH: "{{repo_path}}"
    BRANCH: "{{branch_name}}"
    DEBUG: "{{enable_debug}}"  # checkbox 会转为 "true" 或 "false"
```

### cwd 中的变量替换

```yaml
command:
  commandLine: ./build.sh
  cwd: "{{project_path}}"  # 在指定目录下执行命令
```

## 完整示例

### 示例 1：Git 操作命令

```markdown
---
title: Git 快速提交
formDescription: 快速执行 git add、commit 和 push
command:
  commandLine: /usr/bin/git
  args:
    - "commit"
    - "-m"
    - "{{commit_message}}"
    - "{{additional_flags}}"
  cwd: "{{repo_path}}"
  envs:
    GIT_AUTHOR_NAME: "{{author_name}}"
    GIT_AUTHOR_EMAIL: "{{author_email}}"
  timeout: 60000
inputs:
  - id: repo_path
    label: 仓库路径
    type: text
    required: true
    default: /opt/code/my-project
  - id: commit_message
    label: 提交信息
    type: text
    required: true
  - id: author_name
    label: 作者名称
    type: text
    default: Terry Chen
  - id: author_email
    label: 作者邮箱
    type: text
    default: terry@example.com
  - id: additional_flags
    label: 额外标志
    type: text
    description: 例如：--amend, --no-verify
---

# Git 快速提交

这会在指定仓库中执行 git commit。
```

### 示例 2：Python 脚本执行

```markdown
---
title: 数据处理脚本
formDescription: 执行数据处理 Python 脚本
command:
  commandLine: /usr/local/bin/python3
  args:
    - "/opt/scripts/process_data.py"
    - "--input"
    - "{{input_file}}"
    - "--output"
    - "{{output_file}}"
    - "{{enable_verbose}}"
  envs:
    DATA_SOURCE: "{{data_source}}"
    API_KEY: "{{api_key}}"
  timeout: 120000
inputs:
  - id: input_file
    label: 输入文件
    type: text
    required: true
  - id: output_file
    label: 输出文件
    type: text
    required: true
  - id: data_source
    label: 数据源
    type: select
    options:
      - value: database
        label: 数据库
        isDefault: true
      - value: api
        label: API
      - value: file
        label: 文件
  - id: api_key
    label: API Key
    type: text
    description: 如果数据源是 API，需要提供
  - id: enable_verbose
    label: 详细输出
    type: checkbox
    default: false
---

# 数据处理

执行数据处理脚本。
```

### 示例 3：构建脚本（使用自定义环境变量）

```markdown
---
title: 项目构建
formDescription: 执行项目构建脚本
command:
  commandLine: /opt/code/my-project/build.sh
  args:
    - "{{build_type}}"
    - "{{platform}}"
  envs:
    NODE_ENV: "{{environment}}"
    BUILD_VERSION: "{{version}}"
    ENABLE_SOURCEMAP: "{{enable_sourcemap}}"
  cwd: /opt/code/my-project
  timeout: 300000
inputs:
  - id: build_type
    label: 构建类型
    type: select
    required: true
    options:
      - value: release
        label: Release
        isDefault: true
      - value: debug
        label: Debug
  - id: platform
    label: 目标平台
    type: multiselect
    required: true
    options:
      - value: linux
        label: Linux
        isDefault: true
      - value: darwin
        label: macOS
      - value: windows
        label: Windows
  - id: environment
    label: 环境
    type: select
    required: true
    options:
      - value: production
        label: 生产环境
        isDefault: true
      - value: development
        label: 开发环境
  - id: version
    label: 版本号
    type: text
    required: true
    default: "1.0.0"
  - id: enable_sourcemap
    label: 启用 Sourcemap
    type: checkbox
    default: true
---

# 项目构建

执行项目构建脚本，支持多种构建类型和平台。
```

### 示例 4：Shell 脚本（向后兼容 execScript）

```markdown
---
title: 部署脚本
formDescription: 执行部署脚本
command:
  commandLine: /opt/scripts/deploy.sh
  # 不指定 envs，会自动将所有可见字段转为环境变量（向后兼容行为）
inputs:
  - id: app_name
    label: 应用名称
    type: text
    required: true
  - id: environment
    label: 环境
    type: select
    required: true
    options:
      - value: staging
        label: Staging
        isDefault: true
      - value: production
        label: Production
  - id: skip_tests
    label: 跳过测试
    type: checkbox
    default: false
---

# 部署

执行部署脚本。脚本中可以使用环境变量：
- $APP_NAME
- $ENVIRONMENT
- $SKIP_TESTS (值为 "true" 或 "false")
```

## 响应处理

### 成功响应

当命令成功执行（退出码为 0）时：
- 显示成功 Toast 消息：`命令执行成功`
- stdout 和 stderr 输出记录到控制台日志
- 自动返回到文件列表

### 失败响应

当命令执行失败时：
- 显示失败 Toast 消息：`命令执行失败`
- 显示错误详情（退出码、错误消息等）
- 错误详情记录到控制台日志

## 与 execScript 的对比

| 特性 | command | execScript |
|------|---------|------------|
| 配置方式 | 对象（commandLine, args, envs, cwd, timeout） | 字符串路径 |
| 传递参数 | 命令行参数（args）+ 环境变量（envs） | 仅环境变量 |
| 环境变量控制 | 可精确指定需要的环境变量 | 自动将所有可见字段转为环境变量 |
| 工作目录 | 可配置 cwd | 默认当前工作目录 |
| 变量替换 | 支持 `{{variable}}` | 不支持（仅转为环境变量） |
| 超时控制 | 可配置 timeout | 固定 30s |
| 向后兼容 | ✅ 兼容 execScript | - |
| 推荐使用 | ✅ 推荐 | ⚠️ 已废弃 |

## 向后兼容说明

### execScript 仍然可用

旧的 `execScript` 配置仍然可以正常工作：

```yaml
execScript: /path/to/script.sh
```

等同于：

```yaml
command:
  commandLine: /path/to/script.sh
  # 自动将所有可见字段转为环境变量
```

### 自动环境变量转换

当使用 `command` 但不指定 `envs` 时，会自动将所有可见字段转为环境变量（与 `execScript` 行为一致）：

- 字段 ID 转为大写并替换特殊字符为下划线
- 例如：`repo_path` → `REPO_PATH`

当明确指定 `envs` 时，只会设置配置中列出的环境变量。

### 迁移建议

建议将旧的 `execScript` 配置迁移到 `command`：

**迁移前（execScript）：**

```yaml
execScript: /opt/scripts/deploy.sh
inputs:
  - id: app_name
    type: text
  - id: environment
    type: select
```

**迁移后（command）：**

```yaml
command:
  commandLine: /opt/scripts/deploy.sh
  # 可选：明确指定需要的环境变量
  envs:
    APP_NAME: "{{app_name}}"
    ENVIRONMENT: "{{environment}}"
inputs:
  - id: app_name
    type: text
  - id: environment
    type: select
```

或者使用命令行参数：

```yaml
command:
  commandLine: /opt/scripts/deploy.sh
  args:
    - "{{app_name}}"
    - "{{environment}}"
inputs:
  - id: app_name
    type: text
  - id: environment
    type: select
```

## 测试步骤

1. **创建测试配置文件**

   在你的 Processor 目录中创建一个 `.md` 文件，使用上面的示例配置。

2. **配置 Processor**

   在 Raycast Preferences 中配置一个 Processor，指向包含测试文件的目录。

3. **运行测试**

   - 在 Raycast 中运行该 Processor 命令
   - 选择测试配置文件
   - 填写表单
   - 按 Enter 或 Cmd+Enter 提交（两者效果相同，都会执行命令）

4. **查看结果**

   - 观察 Toast 消息显示的执行结果
   - 如需查看详细输出，可以打开 Raycast 的开发者控制台查看日志

## 注意事项

1. **文件权限**：确保 commandLine 指向的文件具有可执行权限（`chmod +x`）

2. **超时时间**：默认超时为 30 秒，可通过 `timeout` 参数调整（单位：毫秒）

3. **工作目录**：
   - 如果指定了 `cwd`，命令会在该目录下执行
   - 确保 `cwd` 指向的目录存在

4. **环境变量**：
   - 如果不指定 `envs`，会自动转换所有可见字段为环境变量（向后兼容行为）
   - 如果指定了 `envs`，只会设置配置中列出的环境变量

5. **变量替换**：
   - commandLine、args、envs、cwd 中的 `{{variable}}` 都会被替换
   - multiselect 字段在替换时会转为逗号分隔的字符串
   - checkbox 字段会转为 "true" 或 "false"

6. **错误处理**：命令执行失败时会显示详细的错误信息，包括退出码和错误输出

## 高级用法

### 条件字段与命令参数

结合 `extraInputs` 功能，可以根据用户选择动态显示字段，并在命令中使用这些字段：

```yaml
inputs:
  - id: action
    label: 操作类型
    type: select
    options:
      - value: build
        label: 构建
        extraInputs: [build_type, platform]
      - value: deploy
        label: 部署
        extraInputs: [environment, skip_tests]
  - id: build_type
    label: 构建类型
    type: select
    isExtraInput: true
    options:
      - value: release
        label: Release
      - value: debug
        label: Debug
  - id: platform
    label: 平台
    type: text
    isExtraInput: true
  - id: environment
    label: 环境
    type: select
    isExtraInput: true
    options:
      - value: staging
        label: Staging
      - value: production
        label: Production
  - id: skip_tests
    label: 跳过测试
    type: checkbox
    isExtraInput: true

command:
  commandLine: /opt/scripts/ci.sh
  args:
    - "{{action}}"
    - "{{build_type}}"
    - "{{platform}}"
    - "{{environment}}"
  envs:
    SKIP_TESTS: "{{skip_tests}}"
```

未显示的字段（如选择 "构建" 时的 `environment` 和 `skip_tests`）会被替换为空字符串。

### 动态命令路径

```yaml
inputs:
  - id: tool
    label: 工具
    type: select
    options:
      - value: npm
        label: npm
      - value: pnpm
        label: pnpm
      - value: yarn
        label: yarn

command:
  commandLine: /usr/local/bin/{{tool}}
  args:
    - "install"
```

## 故障排查

### 问题：命令超时

**解决方案**：增加 `timeout` 值

```yaml
command:
  commandLine: /path/to/long-running-script.sh
  timeout: 120000  # 120 秒
```

### 问题：变量未替换

**原因**：
1. 字段 ID 拼写错误
2. 字段被隐藏（extraInput 未触发显示）

**解决方案**：
1. 检查 `{{variable}}` 中的变量名与 `inputs[].id` 是否一致
2. 确保字段在提交时是可见的

### 问题：文件不可执行

**错误信息**：`文件不可执行: /path/to/script.sh`

**解决方案**：
```bash
chmod +x /path/to/script.sh
```

### 问题：工作目录不存在

**错误信息**：`工作目录不存在: /path/to/dir`

**解决方案**：
1. 检查 `cwd` 路径是否正确
2. 确保目录已创建

### 问题：命令执行失败但不知道原因

**解决方案**：
1. 打开 Raycast 开发者控制台（Cmd+Shift+D）
2. 查看 "Command stdout/stderr" 日志
3. 检查完整的错误堆栈和输出内容

## 总结

`command` 功能为 Aurora Input Processor 提供了强大的命令执行能力，让你可以：

✅ 执行任何命令或脚本
✅ 灵活传递命令行参数和环境变量
✅ 动态构建命令参数（commandLine、args、envs、cwd）
✅ 精确控制执行环境（工作目录、超时时间）
✅ 使用表单输入进行变量替换
✅ 向后兼容旧的 execScript 配置
✅ 获取清晰的成功/失败反馈

结合 `extraInputs`、`multiselect`、`checkbox` 等字段类型，你可以构建出功能强大且用户友好的命令执行界面。
