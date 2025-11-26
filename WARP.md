# Aurora Raycast Plugin

Aurora 的 Raycast 扩展插件 - 提示词管理器。

## 项目结构

```
aurora-raycast-plugin/
├── assets/                    # 资源文件
│   └── icon.png              # 插件图标 (512x512)
├── src/                      # 源代码
│   ├── index.tsx             # 主命令入口
│   ├── types/                # 类型定义
│   │   ├── form.ts           # 旧表单类型（兼容）
│   │   └── prompt.ts         # 提示词相关类型
│   ├── components/           # React 组件
│   │   ├── PromptForm.tsx    # 提示词表单组件
│   │   └── PromptField.tsx   # 提示词字段组件
│   ├── config/               # 配置加载
│   │   └── prompts.ts        # 提示词配置加载器
│   └── utils/                # 工具函数
│       ├── extraInputs.ts    # 条件字段显示逻辑
│       ├── template.ts       # 变量替换引擎
│       ├── configWriter.ts   # 将配置保存回 Markdown
│       └── execScript.ts     # 执行外部脚本并传递环境变量
├── .eslintrc.json            # ESLint 配置
├── .gitignore                # Git 忽略文件
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 项目说明
```

## 功能特性

✅ **Markdown 配置** - 使用 Markdown 文件（YAML frontmatter + 正文）定义提示词
✅ **动态变量输入** - 根据 frontmatter 中定义的变量生成表单
✅ **多种输入类型** - 支持 text、textarea、select、multiselect、checkbox
✅ **条件字段** - 支持 extraInputs 机制，根据选项动态显示字段
✅ **模板替换** - {{variable}} 语法替换变量生成最终提示词
✅ **多种输出方式** - Enter 键粘贴到前台应用，Cmd+Enter 复制到剪贴板
✅ **脚本执行（execScript）** - 将用户输入转为环境变量并执行外部脚本
✅ **可配置目录** - 通过 Preferences 设置提示词存放目录
✅ **表单验证** - 支持必填项验证

## 技术栈

- **框架**: Raycast API v1.103.7
- **语言**: TypeScript 5.7+
- **UI**: React (JSX)
- **包管理器**: pnpm
- **代码质量**: ESLint + Prettier
- **依赖库**: gray-matter (Markdown frontmatter 解析)

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式 (热重载)
pnpm dev

# 构建生产版本
pnpm build

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm run fix-lint
```

## 开发状态

✅ 项目初始化完成
✅ 依赖安装成功
✅ 构建流程正常
✅ 开发服务器可运行
✅ Lint 验证通过
✅ 提示词管理器功能实现完成
✅ Markdown 配置读取功能完成
✅ 变量替换引擎实现完成
✅ 示例提示词配置完成

## 核心概念

### 提示词配置 (PromptConfig)
提示词由 Markdown 文件定义，包含:
- **frontmatter** (YAML): 定义 title 和 inputs 变量
- **content** (正文): 包含 {{variable}} 占位符的模板文本

### 字段类型 (PromptInputType)
- **text**: 单行文本输入 (Form.TextField)
- **textarea**: 多行文本输入 (Form.TextArea)
- **select**: 单选下拉框 (Form.Dropdown)
- **multiselect**: 多选标签选择器 (Form.TagPicker)
- **checkbox**: 复选框 (Form.Checkbox)

### 条件字段 (Extra Inputs)
通过 `extraInputs` 属性实现:
- 在选项中定义 `extraInputs: [field_id1, field_id2]`
- 字段配置中设置 `isExtraInput: true`
- 选中该选项时自动显示关联字段
- multiselect 类型支持合并多个选项的 extraInputs

### 变量替换 (Template Replacement)
- 使用 `{{variable}}` 语法在正文中引用变量
- multiselect 类型的值自动转换为逗号分隔的字符串
- checkbox 类型转换为 "是" 或 "否"
- 未显示的 extraInput 字段替换为空字符串

### 脚本执行 (execScript)
- 在 frontmatter 中配置 `execScript: /path/to/script.sh`
- 提交时将可见字段的值转换为环境变量：`id` → `ID`（大写）
- multiselect → 逗号分隔字符串，checkbox → "true"/"false"
- 使用 `execFile` 执行脚本（30s 超时），显示执行结果 Toast
```

## 注意事项

### Author 字段
当前 `package.json` 中的 `author` 字段已设置为 `"wheat2021"`。如果需要发布到商店:
1. 确保已注册 Raycast 账号
2. 将 author 字段更新为你的 Raycast 用户名

### 图标要求
- 尺寸: 512x512 像素
- 格式: PNG
- 当前使用占位图标,可根据需要替换

## 提示词配置示例

查看 `/Users/terrychen/Notes/Prompts/raycast/` 目录下的示例文件:
- `个人信息.md` - 基础的文本和选择类型
- `工作信息.md` - 简单的信息收集
- `偏好设置.md` - 包含 extraInputs 的复杂示例

## 下一步开发

1. 添加更多实用的提示词配置
2. 支持提示词分组和搜索
3. 实现提示词历史记录
4. 添加提示词变量预览
5. 准备发布材料

## 参考资料

- [Raycast API 文档](https://developers.raycast.com)
- [Raycast 扩展商店](https://raycast.com/store)
- [Raycast Extensions GitHub](https://github.com/raycast/extensions)
