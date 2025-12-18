---
title: Git 快速提交
formDescription: 在指定仓库中执行 git commit
command:
  commandLine: /usr/bin/git
  args:
    - "commit"
    - "-m"
    - "{{commit_message}}"
  cwd: "{{repo_path}}"
  envs:
    GIT_AUTHOR_NAME: "{{author_name}}"
    GIT_AUTHOR_EMAIL: "{{author_email}}"
  timeout: 60000
inputs:
  - id: repo_path
    label: 仓库路径
    type: text
    required: true
    default: /opt/code/my-project
    description: Git 仓库的绝对路径
  - id: commit_message
    label: 提交信息
    type: text
    required: true
    description: Commit message
  - id: author_name
    label: 作者名称
    type: text
    default: Terry Chen
  - id: author_email
    label: 作者邮箱
    type: text
    default: terry@example.com
  - id: add_all
    label: 提交前执行 git add .
    type: checkbox
    default: true
    description: 自动添加所有更改的文件
---

# Git 快速提交

这个配置允许你快速在指定仓库中执行 git commit。

## 使用说明

1. 填写仓库路径
2. 输入提交信息
3. 如果需要，可以修改作者信息
4. 按 Enter 或 Cmd+Enter 执行提交

## 配置说明

- **commandLine**: 使用系统的 git 命令
- **args**: 传递 commit 参数和提交信息
- **cwd**: 在指定的仓库目录下执行命令
- **envs**: 设置 Git 作者信息
- **timeout**: 设置 60 秒超时

## 注意事项

- 确保仓库路径存在且是有效的 Git 仓库
- 提交前确保已执行 `git add` 添加文件
- 如果需要推送，请在脚本中添加相应逻辑
