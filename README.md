# Aurora Raycast Plugin

Aurora 的 Raycast 扩展插件，基于动态表单系统快速创建和管理各类表单。

## 功能特性

✅ **动态表单系统** - 基于 JSON 配置生成表单界面
✅ **多种输入类型** - 支持文本、多行、下拉、多选、复选框
✅ **条件字段** - 根据选项动态显示/隐藏字段
✅ **动态描述** - 根据表达式计算字段描述
✅ **表单验证** - 支持必填项验证
✅ **结果复制** - 提交后自动复制到剪贴板

## 安装

1. 克隆本仓库
2. 运行 `pnpm install` 安装依赖
3. 运行 `pnpm dev` 启动开发模式

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# Lint
pnpm lint
```

## 使用说明

### 添加新表单

1. 在 `src/configs/` 目录下创建新的 JSON 配置文件
2. 在 `src/config/forms.ts` 中导入并添加到配置列表
3. 运行 `pnpm dev` 查看效果

### JSON 配置格式

```json
{
  "title": "表单标题",
  "inputs": [
    {
      "inputType": "TextLine",
      "label": "字段标签",
      "id": "field_id",
      "required": true,
      "description": "字段描述"
    }
  ]
}
```

### 支持的输入类型

- `TextLine`: 单行文本输入 (Form.TextField)
- `MultiLineText`: 多行文本输入 (Form.TextArea)
- `SingleChoice`: 单选下拉框 (Form.Dropdown)
- `MultiChoice`: 多选标签选择器 (Form.TagPicker)
- `BooleanChoice`: 复选框 (Form.Checkbox)

### 条件字段 (Extra Inputs)

可以根据选项选择动态显示额外字段：

```json
{
  "inputType": "SingleChoice",
  "label": "设备类型",
  "id": "device_type",
  "values": [
    {
      "value": "mobile",
      "display": "移动设备",
      "extraInputs": ["device_model"]
    },
    {
      "value": "desktop",
      "display": "桌面设备"
    }
  ]
}
```

当选择“移动设备”时，会自动显示 `device_model` 字段。

### 动态描述

支持根据表单值动态计算字段描述：

```json
{
  "inputType": "TextLine",
  "label": "数量",
  "id": "quantity",
  "description": [
    {
      "expression": "device_type === 'mobile'",
      "value": "移动设备数量"
    },
    {
      "expression": "device_type === 'desktop'",
      "value": "桌面设备数量"
    }
  ]
}
```

## 许可证

MIT
