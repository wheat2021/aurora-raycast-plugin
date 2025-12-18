---
title: n8n Webhook 测试
formDescription: 测试调用 n8n webhook，执行 Git 缓存操作
request:
  method: GET
  url: http://localhost:5678/webhook/0a90b8ea-1f78-4abe-a918-7d6c5e00c50f
  query:
    repo: "{{repo_path}}"
    cacheAll: "{{cache_all}}"
    commit: "{{do_commit}}"
    push: "{{do_push}}"
inputs:
  - id: repo_path
    label: 仓库路径
    type: text
    required: true
    default: /opt/code/n8n
    description: Git 仓库的绝对路径
  - id: cache_all
    label: 缓存所有文件
    type: checkbox
    default: true
    description: 是否缓存所有修改的文件
  - id: do_commit
    label: 执行 Commit
    type: checkbox
    default: true
    description: 是否自动提交
  - id: do_push
    label: 推送到远程
    type: checkbox
    default: true
    description: 是否推送到远程仓库
---

# n8n Webhook 请求

这是一个测试 REST API 请求功能的示例配置。

当你提交表单时，将会发送一个 GET 请求到 n8n webhook，并传递以下参数：
- repo: {{repo_path}}
- cacheAll: {{cache_all}}
- commit: {{do_commit}}
- push: {{do_push}}
