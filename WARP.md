# Aurora Raycast Plugin

Aurora 的 Raycast 扩展插件项目。

## 项目结构

```
aurora-raycast-plugin/
├── assets/           # 资源文件
│   └── icon.png     # 插件图标 (512x512)
├── src/             # 源代码
│   └── index.tsx    # 主命令入口
├── .eslintrc.json   # ESLint 配置
├── .gitignore       # Git 忽略文件
├── package.json     # 项目配置
├── tsconfig.json    # TypeScript 配置
└── README.md        # 项目说明
```

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
⚠️ Lint 验证存在 author 字段警告(不影响开发)

## 注意事项

### Author 字段
当前 `package.json` 中的 `author` 字段设置为 `"developer"`,这会导致 lint 验证失败,因为 Raycast 要求使用已注册的用户名。发布到商店前需要:
1. 注册 Raycast 账号
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
