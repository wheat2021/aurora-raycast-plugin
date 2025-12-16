---
title: selectInFolder 功能演示
inputs:
  # 示例 1: 基础用法 - 显示所有文件和目录
  - id: all_items
    label: 选择任意项目
    type: selectInFolder
    folder: /Users/terrychen/Notes/Prompts
    description: 显示所有文件和目录（默认 valueItemType=0）

  # 示例 2: 仅显示目录
  - id: only_dirs
    label: 选择目录
    type: selectInFolder
    folder: /Users/terrychen/Notes/Prompts
    valueItemType: 1
    description: 仅显示子目录

  # 示例 3: 仅显示文件
  - id: only_files
    label: 选择文件
    type: selectInFolder
    folder: /Users/terrychen/Notes/Prompts
    valueItemType: 2
    description: 仅显示文件

  # 示例 4: 使用包含过滤器（正则表达式）
  - id: md_files
    label: 选择 Markdown 文件
    type: selectInFolder
    folder: /Users/terrychen/Notes/Prompts
    valueItemType: 2
    regIncludeFilter: \.md$
    description: 仅显示 .md 结尾的文件

  # 示例 5: 使用排除过滤器
  - id: no_temp
    label: 选择非临时文件
    type: selectInFolder
    folder: /Users/terrychen/Notes/Prompts
    regExcludeFilter: ^temp|\.tmp$
    description: 排除 temp 开头或 .tmp 结尾的文件

  # 示例 6: 组合使用包含和排除过滤器
  - id: filtered_files
    label: 选择 Markdown（排除草稿）
    type: selectInFolder
    folder: /Users/terrychen/Notes/Prompts
    valueItemType: 2
    regIncludeFilter: \.md$
    regExcludeFilter: draft|草稿
    description: 显示 .md 文件，但排除包含 draft 或草稿的文件

  # 示例 7: 复杂正则过滤
  - id: special_pattern
    label: 选择特定模式的文件
    type: selectInFolder
    folder: /Users/terrychen/Notes/Prompts
    regIncludeFilter: ^(工作|个人|项目).*\.md$
    description: 仅显示以"工作"、"个人"或"项目"开头的 .md 文件
---

# selectInFolder 参数使用结果

## 基础选择
您选择的项目：{{all_items}}

## 仅目录
您选择的目录：{{only_dirs}}

## 仅文件
您选择的文件：{{only_files}}

## Markdown 文件
您选择的 MD 文件：{{md_files}}

## 非临时文件
您选择的非临时文件：{{no_temp}}

## 过滤后的 Markdown
您选择的 Markdown（非草稿）：{{filtered_files}}

## 特定模式
您选择的特定模式文件：{{special_pattern}}

---

## 参数说明

### valueItemType
- `0` (默认): 显示目录和文件
- `1`: 仅显示目录
- `2`: 仅显示文件

### regIncludeFilter
正则表达式包含过滤器，只显示匹配的项目。
例如：
- `\.md$` - 仅 .md 文件
- `^工作` - 以"工作"开头的项目
- `(文档|笔记)` - 包含"文档"或"笔记"

### regExcludeFilter
正则表达式排除过滤器，隐藏匹配的项目。
例如：
- `^temp` - 排除 temp 开头的项目
- `\.tmp$` - 排除 .tmp 结尾的项目
- `draft|草稿` - 排除包含 draft 或草稿的项目

### 过滤器组合逻辑
1. 先应用 `regIncludeFilter`（如果设置）
2. 再应用 `regExcludeFilter`（如果设置）
3. 可以与 `valueItemType` 同时使用
