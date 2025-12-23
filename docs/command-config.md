# Command 配置说明

Aurora Input Processor 支持两种 `command` 配置形式，适用于不同的使用场景。

## 配置形式对比

### 1. 对象形式（推荐用于复杂命令）

适用于需要精确控制命令参数、环境变量和工作目录的场景。

```yaml
---
title: git command
command:
  commandLine: /usr/bin/git
  args:
    - config
    - user.name
  cwd: '{{repo_path}}'
  timeout: 60000
  envs:
    GIT_AUTHOR_NAME: '{{author_name}}'
---
```

**特点：**
- ✅ 参数独立配置，更清晰
- ✅ 支持自定义环境变量
- ✅ 支持自定义工作目录
- ✅ 支持自定义超时时间
- ✅ 所有字段支持变量替换 `{{variable}}`
- ✅ 参数自动转义，安全性更高

### 2. 字符串形式（适用于简单 shell 命令）

适用于简单的命令组合或需要使用 shell 特性（管道、重定向等）的场景。

```yaml
---
title: git command 1
command: 'cd {{repo_path}} && /usr/bin/git config user.name'
---
```

**特点：**
- ✅ 配置简洁，易于编写
- ✅ 支持 shell 操作符（`&&`, `||`, `|`, `;` 等）
- ✅ 支持管道和重定向
- ✅ 支持变量替换 `{{variable}}`
- ⚠️ 需要手动处理参数转义
- ⚠️ 环境变量使用系统默认环境

## 自动识别机制

系统会自动判断字符串是否为 shell 命令（通过检测 shell 特殊字符）：

### 识别为 Shell 命令的情况

包含以下任一特征时，会使用 `/bin/sh -c` 执行：

- `&&` - 逻辑与（`cmd1 && cmd2`）
- `||` - 逻辑或（`cmd1 || cmd2`）
- `|` - 管道（`cmd1 | cmd2`）
- `;` - 命令分隔符（`cmd1; cmd2`）
- `` ` `` - 命令替换（`` `cmd` ``）
- `$(` - 命令替换（`$(cmd)`）
- `>` - 输出重定向（`cmd > file`）
- `<` - 输入重定向（`cmd < file`）
- `*` - 通配符（`*.txt`）
- `?` - 通配符（`file?.txt`）
- `[...]` - 字符类或测试（`file[0-9].txt`）

### 识别为脚本路径的情况

不包含上述特征时，会作为可执行文件直接执行：

- `/path/to/script.sh`
- `/usr/bin/git`
- `/usr/local/bin/mycommand`

## 使用示例

### 示例 1：简单的 git 命令（字符串形式）

```yaml
---
title: Git Status
command: 'cd {{repo_path}} && git status'
inputs:
  - id: repo_path
    label: 仓库路径
    type: selectInFolder
    folder: /opt/code
---
```

### 示例 2：带参数的命令（对象形式）

```yaml
---
title: Git Config
command:
  commandLine: /usr/bin/git
  args:
    - config
    - --get
    - user.name
  cwd: '{{repo_path}}'
inputs:
  - id: repo_path
    label: 仓库路径
    type: selectInFolder
    folder: /opt/code
---
```

### 示例 3：使用管道（字符串形式）

```yaml
---
title: 查找大文件
command: 'find {{directory}} -type f -size +{{size}}M | head -n {{limit}}'
inputs:
  - id: directory
    label: 目录路径
    type: text
    default: /opt/code
  - id: size
    label: 文件大小（MB）
    type: text
    default: '10'
  - id: limit
    label: 最多显示数量
    type: text
    default: '20'
---
```

### 示例 4：自定义环境变量（对象形式）

```yaml
---
title: Node.js 脚本
command:
  commandLine: /usr/local/bin/node
  args:
    - /path/to/script.js
  envs:
    NODE_ENV: production
    API_KEY: '{{api_key}}'
  timeout: 120000
inputs:
  - id: api_key
    label: API 密钥
    type: text
    required: true
---
```

### 示例 5：条件执行（字符串形式）

```yaml
---
title: 条件构建
command: 'cd {{project_path}} && [ -f package.json ] && npm run build || echo "No package.json found"'
inputs:
  - id: project_path
    label: 项目路径
    type: selectInFolder
    folder: /opt/code
---
```

## 选择建议

| 场景 | 推荐形式 | 原因 |
|------|---------|------|
| 单个命令 + 多个参数 | 对象形式 | 参数清晰，自动转义 |
| 需要自定义环境变量 | 对象形式 | 支持 `envs` 字段 |
| 需要指定工作目录 | 对象形式 | 支持 `cwd` 字段 |
| 使用管道或重定向 | 字符串形式 | shell 特性支持 |
| 多个命令组合 | 字符串形式 | 使用 `&&` 或 `;` 连接 |
| 简单的一行命令 | 字符串形式 | 配置简洁 |

## 注意事项

1. **安全性**：字符串形式需要注意命令注入风险，确保变量值来自可信输入
2. **转义**：字符串形式中的特殊字符需要手动转义，对象形式会自动处理
3. **调试**：对象形式更易于调试和维护
4. **兼容性**：两种形式完全兼容，可以根据需要自由选择

## 变量替换

两种形式都支持 `{{variable}}` 语法进行变量替换：

```yaml
# 字符串形式
command: 'echo "Hello {{name}}"'

# 对象形式
command:
  commandLine: /bin/echo
  args:
    - 'Hello {{name}}'
```

## 错误处理

- **Shell 命令执行失败**：显示命令的退出码、标准输出和标准错误
- **脚本文件不存在**：提示文件路径不存在
- **脚本不可执行**：提示文件没有执行权限
- **超时**：命令执行超过配置的超时时间（默认 30 秒）

## 向后兼容

旧版本的 `execScript` 配置会自动转换为对象形式的 `command`，保持完全兼容：

```yaml
# 旧配置（已废弃但仍支持）
execScript: /path/to/script.sh

# 等同于
command:
  commandLine: /path/to/script.sh
```
