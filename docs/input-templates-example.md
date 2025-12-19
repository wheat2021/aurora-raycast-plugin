---
title: Git 提交信息生成器（使用 copy 模板）
formDescription: 这是一个使用 copy 属性的示例配置
inputs:
  - copy: select
    id: commit_type
    label: 提交类型
    required: true
    description: 选择提交的类型
    options:
      - value: feat
        label: ✨ 新功能 (feat)
        isDefault: true
      - value: fix
        label: 🐛 修复 (fix)
      - value: docs
        label: 📝 文档 (docs)
      - value: style
        label: 💄 样式 (style)
      - value: refactor
        label: ♻️ 重构 (refactor)
      - value: perf
        label: ⚡️ 性能 (perf)
      - value: test
        label: ✅ 测试 (test)
      - value: chore
        label: 🔧 构建/工具 (chore)

  - copy: text
    id: scope
    label: 影响范围
    required: false
    description: 例如：api, ui, auth, core

  - copy: textarea
    id: description
    label: 提交描述
    required: true
    description: 简短描述本次提交的内容

  - copy: textarea
    id: body
    label: 详细说明
    required: false
    description: 提供更详细的变更说明（可选）

  - copy: checkbox
    id: breaking_change
    label: 包含破坏性变更
    required: false
    description: 是否包含不兼容的 API 变更
---

{{commit_type}}{{#if scope}}({{scope}}){{/if}}: {{description}}{{#if body}}

{{body}}{{/if}}{{#if breaking_change}}

BREAKING CHANGE: 此提交包含破坏性变更，可能影响现有功能。{{/if}}
