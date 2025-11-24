# Aurora Raycast Plugin

Aurora 的 Raycast 扩展插件项目。

## 项目结构

```
aurora-raycast-plugin/
├── assets/                    # 资源文件
│   └── icon.png              # 插件图标 (512x512)
├── src/                      # 源代码
│   ├── index.tsx             # 主命令入口
│   ├── types/                # 类型定义
│   │   └── form.ts           # 表单相关类型
│   ├── components/           # React 组件
│   │   ├── DynamicForm.tsx   # 动态表单组件
│   │   └── FormField.tsx     # 表单字段组件
│   ├── config/               # 配置加载
│   │   └── forms.ts          # 表单配置加载器
│   ├── configs/              # JSON 配置文件
│   │   ├── personal-info.json
│   │   ├── work-info.json
│   │   └── preferences.json
│   └── utils/                # 工具函数
│       ├── extraInputs.ts    # 条件字段显示逻辑
│       ├── results.ts        # 表单提交处理
│       └── description.ts    # 动态描述计算
├── .eslintrc.json            # ESLint 配置
├── .gitignore                # Git 忽略文件
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
└── README.md                 # 项目说明
```

## 功能特性

✅ **动态表单系统** - 基于 JSON 配置生成表单界面
✅ **多种输入类型** - 支持文本、多行、下拉、多选、复选框
✅ **条件字段** - 根据选项动态显示/隐藏字段
✅ **动态描述** - 根据表达式计算字段描述
✅ **表单验证** - 支持必填项验证
✅ **结果复制** - 提交后自动复制到剪贴板

## 技术栈

- **框架**: Raycast API v1.103.7
- **语言**: TypeScript 5.7+
- **UI**: React (JSX)
- **包管理器**: pnpm
- **代码质量**: ESLint + Prettier

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
✅ 核心功能实现完成
✅ 示例表单配置完成

## 核心概念

### 表单配置 (FormConfig)
表单由 JSON 文件定义,包含:
- `title`: 表单标题
- `inputs`: 字段数组

### 字段类型 (InputType)
- **TextLine**: 单行文本输入 (Form.TextField)
- **MultiLineText**: 多行文本输入 (Form.TextArea)
- **SingleChoice**: 单选下拉框 (Form.Dropdown)
- **MultiChoice**: 多选标签选择器 (Form.TagPicker)
- **BooleanChoice**: 复选框 (Form.Checkbox)

### 条件字段 (Extra Inputs)
通过 `extraInputs` 属性实现:
- 在选项中定义 `extraInputs: ["field_id"]`
- 字段配置中设置 `isExtraInput: true`
- 选中该选项时自动显示关联字段

### 动态描述 (Dynamic Description)
支持两种模式:
1. **静态字符串**: `description: "请输入..."`
2. **条件表达式**:
```json
"description": [
  {
    "expression": "field1 === 'value'",
    "value": "描述一"
  },
  {
    "expression": "field2 > 10",
    "value": "描述二"
  }
]
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

## 下一步开发

1. 实现具体的 Aurora 功能
2. 添加更多命令
3. 完善用户界面
4. 编写测试
5. 准备发布材料

## 参考资料

- [Raycast API 文档](https://developers.raycast.com)
- [Raycast 扩展商店](https://raycast.com/store)
- [Raycast Extensions GitHub](https://github.com/raycast/extensions)
