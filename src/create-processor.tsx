import {
  ActionPanel,
  Action,
  Form,
  showToast,
  Toast,
  Clipboard,
  Icon,
} from "@raycast/api";
import { useState } from "react";
import { addProcessor } from "./utils/storage";
import { ConfigGuide } from "./components/ConfigGuide";
import * as fs from "fs";

export default function Command() {
  const [nameError, setNameError] = useState<string | undefined>();
  const [directoryError, setDirectoryError] = useState<string | undefined>();

  async function handleSubmit(values: {
    name: string;
    directory: string;
    icon?: string;
  }) {
    // 验证
    if (!values.name) {
      setNameError("名称不能为空");
      return;
    }

    if (!values.directory) {
      setDirectoryError("目录不能为空");
      return;
    }

    // 验证目录存在
    if (!fs.existsSync(values.directory)) {
      setDirectoryError("目录不存在");
      return;
    }

    if (!fs.statSync(values.directory).isDirectory()) {
      setDirectoryError("路径不是一个目录");
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "正在创建...",
    });

    try {
      // 生成唯一 ID (使用时间戳 + 随机数)
      const id = `proc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 保存配置
      await addProcessor({
        id,
        name: values.name,
        directory: values.directory,
        icon: values.icon,
        createdAt: Date.now(),
      });

      // 复制 ID 到剪贴板
      await Clipboard.copy(id);

      toast.style = Toast.Style.Success;
      toast.title = "创建成功!";
      toast.message = "请在 Raycast Preferences 中配置 Processor ID";

      // 不自动 popToRoot，而是推送到配置向导页面
      // await popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "创建失败";
      toast.message = error instanceof Error ? error.message : "未知错误";
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="创建 Processor"
            icon={Icon.Plus}
            onSubmit={handleSubmit}
          />
          <Action.Push
            title="查看配置说明"
            icon={Icon.QuestionMark}
            target={<ConfigGuide />}
            shortcut={{ modifiers: ["cmd"], key: "h" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="创建一个新的 Input Processor，用于管理特定目录下的提示词。" />

      <Form.TextField
        id="name"
        title="名称"
        placeholder="例如: 工作提示词"
        error={nameError}
        onChange={() => setNameError(undefined)}
      />

      <Form.TextField
        id="directory"
        title="目录路径"
        placeholder="/Users/username/prompts"
        error={directoryError}
        onChange={() => setDirectoryError(undefined)}
      />

      <Form.Dropdown id="icon" title="图标 (可选)" defaultValue="">
        <Form.Dropdown.Item value="" title="默认" icon={Icon.Folder} />
        <Form.Dropdown.Item value="folder" title="文件夹" icon={Icon.Folder} />
        <Form.Dropdown.Item
          value="document"
          title="文档"
          icon={Icon.Document}
        />
        <Form.Dropdown.Item value="star" title="星标" icon={Icon.Star} />
        <Form.Dropdown.Item value="code" title="代码" icon={Icon.Code} />
        <Form.Dropdown.Item
          value="terminal"
          title="终端"
          icon={Icon.Terminal}
        />
      </Form.Dropdown>

      <Form.Description
        text="创建后需要配置：
1. Processor ID 会自动复制到剪贴板
2. 打开 Raycast Preferences (Cmd+,)
3. 找到 Aurora Input Processor 扩展
4. 选择任意一个 Input Processor N 命令
5. 粘贴 Processor ID 并启用命令
6. 设置快捷键（可选）

💡 按 Cmd+H 查看详细配置说明"
      />
    </Form>
  );
}
