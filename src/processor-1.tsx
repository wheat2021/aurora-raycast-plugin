import {
  List,
  getPreferenceValues,
  Icon,
  LaunchProps,
  showToast,
  Toast,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { ProcessorConfig } from "./types/processor";
import { PromptList } from "./components/PromptList";
import { PromptForm } from "./components/PromptForm";
import { loadPromptConfig } from "./config/prompts";
import { validateAndMergeInputs } from "./utils/deeplinkValidator";
import { PromptConfig, PromptValues } from "./types/prompt";

interface Preferences {
  name?: string;
  directory: string;
}

interface Arguments {
  promptPath?: string;
  inputs?: string; // JSON 字符串
}

interface DeeplinkConfig {
  config: PromptConfig;
  initialValues: PromptValues;
  warnings: Record<string, string>;
  autoExecute: boolean;
}

export default function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const { arguments: args } = props;
  const [processor, setProcessor] = useState<ProcessorConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deeplinkMode, setDeeplinkMode] = useState(false);
  const [deeplinkConfig, setDeeplinkConfig] = useState<DeeplinkConfig | null>(
    null,
  );

  useEffect(() => {
    handleLaunch();
  }, []);

  async function handleLaunch() {
    // 检查是否是 deeplink 模式
    if (args.promptPath) {
      await handleDeeplinkLaunch();
    } else {
      await loadProcessor();
    }
  }

  async function handleDeeplinkLaunch() {
    setDeeplinkMode(true);
    setIsLoading(true);

    try {
      // 1. 验证文件是否存在并加载配置
      const config = await loadPromptConfig(args.promptPath!);
      if (!config) {
        await showToast({
          style: Toast.Style.Failure,
          title: "配置文件不存在或无效",
          message: args.promptPath,
        });
        setError("配置文件不存在或无效");
        setIsLoading(false);
        return;
      }

      // 2. 解析 inputs 参数
      let deeplinkInputs: Record<string, unknown> = {};
      if (args.inputs) {
        try {
          deeplinkInputs = JSON.parse(args.inputs);
        } catch (parseError) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Deeplink 参数解析失败",
            message:
              parseError instanceof Error
                ? parseError.message
                : "JSON 格式错误",
          });
          setError("Deeplink 参数解析失败");
          setIsLoading(false);
          return;
        }
      }

      // 3. 验证并合并参数
      const { values, warnings, isComplete } = validateAndMergeInputs(
        config,
        deeplinkInputs,
      );

      // 4. 根据完整性决定执行方式
      setDeeplinkConfig({
        config,
        initialValues: values,
        warnings,
        autoExecute: isComplete,
      });
    } catch (err) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Deeplink 处理失败",
        message: err instanceof Error ? err.message : "未知错误",
      });
      setError(err instanceof Error ? err.message : "Deeplink 处理失败");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProcessor() {
    setIsLoading(true);
    try {
      const preferences = getPreferenceValues<Preferences>();

      if (!preferences.directory) {
        setError("请在 Preferences 中配置 Prompts Directory");
        setIsLoading(false);
        return;
      }

      // 直接从 preferences 创建 ProcessorConfig
      const config: ProcessorConfig = {
        id: preferences.directory, // 使用目录作为 ID
        name: preferences.name || "Prompts",
        directory: preferences.directory,
        createdAt: Date.now(),
      };

      setProcessor(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }

  // Deeplink 模式：直接跳转到表单或自动执行
  if (deeplinkMode) {
    if (isLoading) {
      return (
        <List isLoading={true}>
          <List.EmptyView title="正在加载配置..." icon={Icon.Circle} />
        </List>
      );
    }

    if (error || !deeplinkConfig) {
      return (
        <List>
          <List.EmptyView
            title="Deeplink 错误"
            description={error || "未知错误"}
            icon={Icon.XMarkCircle}
          />
        </List>
      );
    }

    return (
      <PromptForm
        config={deeplinkConfig.config}
        initialValues={deeplinkConfig.initialValues}
        warnings={deeplinkConfig.warnings}
        autoExecute={deeplinkConfig.autoExecute}
      />
    );
  }

  // 普通模式：显示提示词列表
  if (error) {
    return (
      <List>
        <List.EmptyView
          title="配置错误"
          description={error}
          icon={Icon.XMarkCircle}
        />
      </List>
    );
  }

  if (!processor) {
    return (
      <List isLoading={isLoading}>
        <List.EmptyView title="正在加载..." icon={Icon.Circle} />
      </List>
    );
  }

  return <PromptList processor={processor} />;
}
