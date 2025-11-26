# execScript 功能测试说明

## 功能概述
插件现在支持在提示词配置中添加 `execScript` 参数。当该参数存在时，表单提交将执行指定的脚本而非粘贴/复制内容。

## 实现详情

### 核心功能
- **类型定义**：`PromptConfig` 接口新增 `execScript?: string` 字段
- **配置加载**：`src/config/prompts.ts` 读取 frontmatter 中的 execScript
- **配置保存**：`src/utils/configWriter.ts` 保存 execScript 到 MD 文件
- **脚本执行**：`src/utils/execScript.ts` 提供脚本执行功能
- **表单逻辑**：`src/components/PromptForm.tsx` 根据 execScript 决定执行路径

### 环境变量转换规则
1. **字段 ID 转大写**：`name` → `NAME`
2. **multiselect 类型**：数组值转为逗号分隔字符串 `["选项1", "选项2"]` → `"选项1, 选项2"`
3. **checkbox 类型**：布尔值转为字符串 `true` → `"true"`, `false` → `"false"`
4. **隐藏字段**：extraInputs 未触发显示的字段不设置环境变量

## 测试配置文件

### 1. 个人信息.md（带 execScript）
- 路径：`/Users/terrychen/Notes/Prompts/raycast/个人信息.md`
- 包含字段：name, gender, introduction
- execScript: `/Users/terrychen/code/sh/exapmpe_exec_script.sh`

### 2. 测试脚本执行.md（带 execScript）
- 路径：`/Users/terrychen/Notes/Prompts/raycast/测试脚本执行.md`
- 包含字段：test_text, test_multiselect, test_checkbox
- 用于测试多种字段类型的环境变量转换
- execScript: `/Users/terrychen/code/sh/exapmpe_exec_script.sh`

### 3. 工作信息.md（不带 execScript）
- 路径：`/Users/terrychen/Notes/Prompts/raycast/工作信息.md`
- 包含字段：company, position
- 用于测试原有逻辑（粘贴/复制）仍正常工作

### 4. 偏好设置.md（不带 execScript，有 extraInputs）
- 路径：`/Users/terrychen/Notes/Prompts/raycast/偏好设置.md`
- 包含 extraInputs 逻辑
- 用于测试原有复杂功能不受影响

## 测试步骤

### 步骤 1：测试带 execScript 的配置
1. 在 Raycast 中运行 Aurora 插件（`pnpm dev` 启动开发模式）
2. 选择"个人信息"提示词
3. 填写表单字段（或使用默认值）
4. 按 **Enter** 键提交
5. **预期结果**：
   - 显示 "正在执行脚本..." 的 Toast
   - 弹出 MacOS 系统对话框，显示用户输入的所有字段
   - Toast 更新为 "脚本执行成功"

### 步骤 2：测试 multiselect 和 checkbox 转换
1. 选择"测试脚本执行"提示词
2. 修改各字段的值
3. 按 **Enter** 键提交
4. **预期结果**：
   - 系统对话框显示：
     - 文本字段：显示输入的文本
     - 多选字段：显示逗号分隔的选项（如 "选项1, 选项2"）
     - 复选框：显示 "true" 或 "false"

### 步骤 3：测试不带 execScript 的配置
1. 选择"工作信息"提示词
2. 填写表单字段
3. 按 **Enter** 键提交
4. **预期结果**：
   - 生成的提示词内容被粘贴到前台应用
   - 显示 "已粘贴到当前应用" 的 Toast
   - **不会**执行任何脚本

### 步骤 4：测试复制到剪贴板（Cmd+Enter）
1. 选择任意提示词
2. 填写表单
3. 按 **Cmd+Enter**
4. **预期结果**：
   - 如果有 execScript：执行脚本（与 Enter 相同）
   - 如果无 execScript：复制内容到剪贴板，显示 "已复制到剪贴板"

### 步骤 5：测试脚本执行错误处理
1. 修改"个人信息.md"，将 execScript 路径改为不存在的文件：
   ```yaml
   execScript: /tmp/nonexistent_script.sh
   ```
2. 提交表单
3. **预期结果**：
   - 显示 "脚本执行失败" 的 Toast
   - Toast message 显示错误详情（如 "脚本文件不存在: /tmp/nonexistent_script.sh"）

### 步骤 6：测试 extraInputs 隐藏字段
1. 为"偏好设置.md"添加 execScript 参数
2. 仅选择"阅读"兴趣（不选"运动"）
3. 提交表单
4. **预期结果**：
   - 环境变量中应包含 `FAVORITEBOOKTYPES`
   - 环境变量中**不应包含** `FAVORITESPORTS`（因为字段被隐藏）

## 示例脚本说明

### 脚本路径
`/Users/terrychen/code/sh/exapmpe_exec_script.sh`

### 脚本功能
- 读取环境变量（NAME, GENDER, INTRODUCTION, TEST_TEXT 等）
- 使用 `osascript` 显示 MacOS 系统对话框
- 在对话框中展示所有传入的字段值
- 返回 exit code 0 表示成功

### 脚本权限
- 已设置可执行权限：`chmod +x exapmpe_exec_script.sh`
- 验证：`ls -la /Users/terrychen/code/sh/exapmpe_exec_script.sh` 应显示 `-rwxr-xr-x`

## 命令行测试

在集成到 Raycast 之前，可以通过命令行测试脚本：

```bash
# 测试基本功能
export NAME="张三" GENDER="男" INTRODUCTION="测试用户" && \
  /Users/terrychen/code/sh/exapmpe_exec_script.sh

# 测试多选和复选框
export TEST_TEXT="文本值" TEST_MULTISELECT="选项1, 选项2" TEST_CHECKBOX="true" && \
  /Users/terrychen/code/sh/exapmpe_exec_script.sh
```

## 安全特性

1. **使用 execFile 而非 exec**：避免 shell 注入攻击
2. **脚本路径验证**：检查文件是否存在且可执行
3. **超时设置**：30 秒超时防止脚本挂起
4. **环境变量隔离**：只传递可见字段的值
5. **错误处理**：捕获并显示详细错误信息

## 已知限制

1. **平台限制**：示例脚本使用 `osascript` 仅支持 MacOS
2. **同步执行**：脚本执行期间 UI 会等待（最多 30 秒）
3. **输出限制**：脚本输出（stdout/stderr）仅记录到控制台日志

## 扩展建议

### 自定义脚本
用户可以创建自己的脚本处理表单数据：
- 发送到 API 端点
- 保存到数据库
- 生成文件
- 触发自动化流程

### 脚本模板示例

```bash
#!/usr/bin/env bash

# 读取环境变量
name="$NAME"
email="$EMAIL"

# 发送到 API
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$name\", \"email\": \"$email\"}"

# 返回结果
exit $?
```

## 问题排查

### 问题 1：脚本未执行
- 检查 MD 文件 frontmatter 是否包含 execScript
- 验证脚本路径是否正确
- 确认脚本有可执行权限

### 问题 2：环境变量未传递
- 检查字段 ID 转换规则（转大写）
- 确认字段在 visibleInputIds 中（未被 extraInputs 隐藏）
- 查看控制台日志中的环境变量信息

### 问题 3：系统对话框未显示
- 确认脚本中的 `osascript` 命令正确
- 检查脚本输出是否有错误（查看 stderr）
- 验证 MacOS 权限设置允许显示对话框

## 开发环境

### 启动开发模式
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm run build
```

### 代码检查
```bash
pnpm run lint
pnpm run fix-lint
```
