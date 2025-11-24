# Aurora Raycast 插件使用指南

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动开发模式
```bash
pnpm dev
```

### 3. 在 Raycast 中使用
- 打开 Raycast (⌘ + Space)
- 输入 "Aurora" 找到插件
- 选择要填写的表单
- 填写表单后提交，结果会自动复制到剪贴板

## 项目结构

```
src/
├── index.tsx                 # 主入口，显示表单列表
├── types/
│   └── form.ts              # TypeScript 类型定义
├── config/
│   └── forms.ts             # 配置加载器
├── configs/                 # JSON 配置文件目录
│   ├── personal-info.json   # 个人信息表单
│   ├── preferences.json     # 偏好设置表单
│   └── work-info.json       # 工作信息表单
├── components/
│   ├── DynamicForm.tsx      # 动态表单主组件
│   └── FormField.tsx        # 字段渲染器
└── utils/
    ├── extraInputs.ts       # 条件显示逻辑
    ├── description.ts       # 动态描述处理
    └── results.ts           # 结果处理
```

## 添加新表单

### 步骤 1: 创建 JSON 配置文件

在 `src/configs/` 目录下创建新的 JSON 文件，例如 `my-form.json`:

```json
{
  "title": "我的表单",
  "inputs": [
    {
      "inputType": "TextLine",
      "label": "用户名",
      "id": "username",
      "required": true,
      "description": "请输入您的用户名"
    },
    {
      "inputType": "SingleChoice",
      "label": "角色",
      "id": "role",
      "required": true,
      "values": [
        { "value": "admin", "display": "管理员", "isDefault": false },
        { "value": "user", "display": "普通用户", "isDefault": true }
      ]
    }
  ]
}
```

### 步骤 2: 在配置加载器中注册

编辑 `src/config/forms.ts`:

```typescript
import myFormJson from "../configs/my-form.json";

export function loadFormConfigs(): FormConfig[] {
  const configs: JsonFormConfig[] = [
    personalInfoJson as JsonFormConfig,
    workInfoJson as JsonFormConfig,
    preferencesJson as JsonFormConfig,
    myFormJson as JsonFormConfig,  // 添加这行
  ];

  return configs.map(mapJsonToFormConfig);
}
```

### 步骤 3: 测试
```bash
pnpm dev
```

## 输入类型说明

### 1. TextLine - 单行文本
```json
{
  "inputType": "TextLine",
  "label": "姓名",
  "id": "name",
  "required": true,
  "default": "张三",
  "description": "请输入您的姓名"
}
```

映射到 Raycast 的 `Form.TextField`

### 2. MultiLineText - 多行文本
```json
{
  "inputType": "MultiLineText",
  "label": "自我介绍",
  "id": "bio",
  "description": "简要介绍一下自己"
}
```

映射到 Raycast 的 `Form.TextArea`

### 3. SingleChoice - 单选
```json
{
  "inputType": "SingleChoice",
  "label": "性别",
  "id": "gender",
  "values": [
    { "value": "male", "display": "男", "isDefault": true },
    { "value": "female", "display": "女" }
  ]
}
```

映射到 Raycast 的 `Form.Dropdown`

### 4. MultiChoice - 多选
```json
{
  "inputType": "MultiChoice",
  "label": "兴趣爱好",
  "id": "hobbies",
  "values": [
    { "value": "reading", "display": "阅读", "isDefault": true },
    { "value": "sports", "display": "运动" },
    { "value": "music", "display": "音乐", "isDefault": true }
  ]
}
```

映射到 Raycast 的 `Form.TagPicker`

### 5. BooleanChoice - 布尔选择
```json
{
  "inputType": "BooleanChoice",
  "label": "接收通知",
  "id": "notifications",
  "default": true
}
```

映射到 Raycast 的 `Form.Checkbox`

## 高级特性

### 条件显示 (extraInputs)

当某个选项被选中时，显示额外的输入字段：

```json
{
  "inputType": "SingleChoice",
  "label": "是否需要配送",
  "id": "need_delivery",
  "values": [
    {
      "value": "yes",
      "display": "是",
      "extraInputs": ["delivery_address"]  // 选中时显示地址字段
    },
    { "value": "no", "display": "否" }
  ]
},
{
  "inputType": "TextLine",
  "label": "配送地址",
  "id": "delivery_address",
  "isExtraInput": true  // 标记为条件字段
}
```

### 动态描述

根据其他字段的值动态改变描述文本：

```json
{
  "inputType": "TextLine",
  "label": "交付内容",
  "id": "delivery_content",
  "description": [
    {
      "expression": "story_type === 'design'",
      "value": "请填写设计方案描述"
    },
    {
      "expression": "story_type === 'development'",
      "value": "请填写开发成果描述"
    }
  ]
}
```

## 配置属性参考

### 通用属性
- `inputType`: 输入类型（必填）
- `label`: 字段标签（必填）
- `id`: 字段唯一标识（必填）
- `required`: 是否必填（可选，默认 false）
- `default`: 默认值（可选）
- `description`: 描述文本（可选，可以是字符串或条件数组）
- `isExtraInput`: 是否为条件显示字段（可选）

### 选择类型专用属性
- `values`: 选项列表（必填）
- `singleLine`: 是否单行显示（可选，仅用于 SingleChoice）

### InputValue 属性
- `value`: 选项值（必填）
- `display`: 显示文本（可选，默认使用 value）
- `isDefault`: 是否默认选中（可选）
- `extraInputs`: 选中时显示的额外字段 ID 数组（可选）

## 表单验证

插件会自动验证：
- 所有标记为 `required: true` 的字段必须填写
- 空值、空数组会被视为未填写
- 验证失败时会显示错误提示，阻止提交

## 表单结果

提交后：
1. 表单数据会被格式化为易读的文本
2. 自动复制到剪贴板
3. 显示成功提示
4. 自动返回表单列表

格式示例：
```
name: 张三
introduction: 我是一名软件开发者。
gender: 男
```

## 常见问题

### Q: 如何修改现有表单？
A: 直接编辑 `src/configs/` 目录下对应的 JSON 文件，保存后重新运行 `pnpm dev` 即可。

### Q: 条件显示的字段不显示？
A: 确保：
1. 字段标记了 `isExtraInput: true`
2. 在父字段的 values 中正确配置了 `extraInputs` 数组
3. ID 拼写正确

### Q: 如何实现多层条件显示？
A: extraInputs 支持链式依赖，extraInput 字段本身也可以有 extraInputs。

### Q: 动态描述不生效？
A: 检查：
1. description 是否为数组格式
2. expression 语法是否正确（使用 JavaScript 表达式）
3. 引用的字段 ID 是否正确

## 调试技巧

### 1. 查看表单值
在浏览器开发者工具的 Console 中可以看到：
- 表达式求值错误
- 表单提交的值

### 2. 检查配置加载
确保 JSON 文件格式正确，可以使用在线 JSON 验证工具。

### 3. TypeScript 检查
运行 `pnpm run build` 可以提前发现类型错误。

## 下一步

- [ ] 添加更多输入类型（日期、文件等）
- [ ] 支持自定义验证规则
- [ ] 支持表单草稿保存
- [ ] 添加表单预览功能
- [ ] 支持导出为不同格式（JSON、CSV 等）
