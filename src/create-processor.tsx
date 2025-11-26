import {
  ActionPanel,
  Action,
  Form,
  showToast,
  Toast,
  Clipboard,
  Icon,
  popToRoot,
  openExtensionPreferences,
} from "@raycast/api";
import { useState } from "react";
import { addProcessor } from "./utils/storage";
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
      toast.message = "Processor ID 已复制到剪贴板";
      toast.primaryAction = {
        title: "打开扩展设置",
        onAction: async () => {
          await openExtensionPreferences();
        },
      };

      await popToRoot();
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

      <Form.Description text="创建后，请在 Raycast Preferences 中配置 processor-N 命令的 processorId。" />
    </Form>
  );
}
