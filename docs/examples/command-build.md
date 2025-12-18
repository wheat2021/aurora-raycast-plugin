---
title: 项目构建
formDescription: 执行项目构建命令
command:
  commandLine: "{{package_manager}}"
  args:
    - "run"
    - "build:{{build_type}}"
  cwd: "{{project_path}}"
  envs:
    NODE_ENV: "{{environment}}"
    BUILD_VERSION: "{{version}}"
    ENABLE_SOURCEMAP: "{{enable_sourcemap}}"
    PLATFORMS: "{{platforms}}"
  timeout: 300000
inputs:
  - id: project_path
    label: 项目路径
    type: text
    required: true
    default: /opt/code/my-project
    description: 项目根目录的绝对路径
  - id: package_manager
    label: 包管理器
    type: select
    required: true
    description: 选择使用的包管理器
    options:
      - value: pnpm
        label: pnpm
        isDefault: true
      - value: npm
        label: npm
      - value: yarn
        label: yarn
  - id: build_type
    label: 构建类型
    type: select
    required: true
    options:
      - value: prod
        label: Production
        isDefault: true
      - value: dev
        label: Development
      - value: staging
        label: Staging
  - id: environment
    label: NODE_ENV
    type: select
    required: true
    options:
      - value: production
        label: production
        isDefault: true
      - value: development
        label: development
  - id: version
    label: 版本号
    type: text
    required: true
    default: "1.0.0"
  - id: platforms
    label: 目标平台
    type: multiselect
    required: true
    description: 选择构建的目标平台
    options:
      - value: linux
        label: Linux
        isDefault: true
      - value: darwin
        label: macOS
      - value: windows
        label: Windows
  - id: enable_sourcemap
    label: 启用 Sourcemap
    type: checkbox
    default: true
    description: 生成 sourcemap 文件用于调试
---

# 项目构建

这个配置允许你快速执行项目构建命令。

## 使用说明

1. 选择项目路径
2. 选择包管理器（pnpm/npm/yarn）
3. 选择构建类型（prod/dev/staging）
4. 选择目标平台
5. 设置版本号
6. 按 Enter 或 Cmd+Enter 开始构建

## 配置说明

- **commandLine**: 动态选择包管理器（pnpm/npm/yarn）
- **args**: 执行 `run build:prod` 等构建命令
- **cwd**: 在项目目录下执行命令
- **envs**: 设置构建相关的环境变量
- **timeout**: 设置 5 分钟超时（构建可能需要较长时间）

## 环境变量说明

- `NODE_ENV`: Node.js 环境（production/development）
- `BUILD_VERSION`: 构建版本号
- `ENABLE_SOURCEMAP`: 是否启用 sourcemap（"true"/"false"）
- `PLATFORMS`: 目标平台列表（逗号分隔）

## 前置条件

确保 package.json 中配置了对应的构建脚本：

```json
{
  "scripts": {
    "build:prod": "...",
    "build:dev": "...",
    "build:staging": "..."
  }
}
```
