---
title: Command 功能测试
formDescription: 测试 command 功能的各项特性
command:
  commandLine: "{{script_path}}"
  args:
    - "{{arg1}}"
    - "{{arg2}}"
    - "{{arg3}}"
  envs:
    USER_NAME: "{{user_name}}"
    USER_EMAIL: "{{user_email}}"
    PROJECT_NAME: "{{project_name}}"
    DEBUG_MODE: "{{enable_debug}}"
  cwd: "{{working_dir}}"
  timeout: 30000
inputs:
  - id: script_path
    label: 脚本路径
    type: text
    required: true
    default: /opt/code/aurora-raycast-plugin/docs/examples/test-command.sh
    description: 测试脚本的绝对路径
  - id: working_dir
    label: 工作目录
    type: text
    required: true
    default: /tmp
    description: 脚本执行的工作目录
  - id: arg1
    label: 参数 1
    type: text
    default: "Hello"
    description: 第一个命令行参数
  - id: arg2
    label: 参数 2
    type: text
    default: "World"
    description: 第二个命令行参数
  - id: arg3
    label: 参数 3
    type: text
    default: "Test"
    description: 第三个命令行参数
  - id: user_name
    label: 用户名
    type: text
    default: "Terry Chen"
    description: 将设置为 USER_NAME 环境变量
  - id: user_email
    label: 用户邮箱
    type: text
    default: "terry@example.com"
    description: 将设置为 USER_EMAIL 环境变量
  - id: project_name
    label: 项目名称
    type: text
    default: "Aurora"
    description: 将设置为 PROJECT_NAME 环境变量
  - id: enable_debug
    label: 启用调试模式
    type: checkbox
    default: true
    description: 将设置为 DEBUG_MODE 环境变量（"true"/"false"）
---

# Command 功能测试

这个配置用于测试 `command` 功能的各项特性。

## 测试前准备

1. 确保测试脚本存在且有执行权限：
   ```bash
   chmod +x /opt/code/aurora-raycast-plugin/docs/examples/test-command.sh
   ```

2. 或者将脚本复制到你喜欢的位置：
   ```bash
   cp /opt/code/aurora-raycast-plugin/docs/examples/test-command.sh ~/test-command.sh
   chmod +x ~/test-command.sh
   ```
   然后在"脚本路径"字段中填写新的路径。

## 测试内容

这个测试会验证以下功能：

1. ✅ **commandLine 变量替换** - 脚本路径支持 `{{script_path}}` 变量
2. ✅ **args 数组参数** - 传递多个命令行参数
3. ✅ **envs 环境变量** - 设置自定义环境变量
4. ✅ **cwd 工作目录** - 在指定目录下执行命令
5. ✅ **变量类型转换**:
   - text → 字符串
   - checkbox → "true"/"false"
6. ✅ **输出展示** - 在界面中展示 stdout 和 stderr

## 执行测试

1. 在 Raycast 中运行对应的 Processor 命令
2. 选择这个测试配置
3. 填写表单（可以使用默认值）
4. 按 Enter 或 Cmd+Enter 执行
5. 查看结果页面

## 预期结果

你应该看到一个结果页面，显示：

- ✅ 命令执行成功
- 命令：完整的命令行（脚本路径 + 参数）
- 退出码：0
- 标准输出：
  - 接收到的命令行参数
  - 设置的环境变量
  - 当前工作目录
  - 执行时间

## 故障排查

### 问题：文件不可执行

**错误信息**：`文件不可执行: /path/to/test-command.sh`

**解决方案**：
```bash
chmod +x /opt/code/aurora-raycast-plugin/docs/examples/test-command.sh
```

### 问题：脚本文件不存在

**错误信息**：`命令或脚本文件不存在: /path/to/test-command.sh`

**解决方案**：
1. 检查脚本路径是否正确
2. 确保脚本文件已创建
3. 使用绝对路径而不是相对路径

### 问题：工作目录不存在

**错误信息**：`工作目录不存在: /path/to/dir`

**解决方案**：
1. 创建工作目录：`mkdir -p /path/to/dir`
2. 或使用已存在的目录，如 `/tmp`

## 进阶测试

修改配置测试其他功能：

1. **测试不同的工作目录**：将 `working_dir` 改为不同路径
2. **测试更多参数**：添加更多 args 数组元素
3. **测试失败情况**：在脚本中添加 `exit 1` 查看错误处理
4. **测试超时**：在脚本中添加 `sleep 40` 查看超时处理
