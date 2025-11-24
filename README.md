# Aurora Raycast Plugin

Aurora 的 Raycast 扩展插件。

## 功能特性

- 待开发

## 安装

1. 克隆本仓库
2. 运行 `pnpm install`
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

- `TextLine`: 单行文本输入
- `MultiLineText`: 多行文本输入
- `SingleChoice`: 单选下拉框
- `MultiChoice`: 多选标签选择器
- `BooleanChoice`: 复选框

## 许可证

MIT
