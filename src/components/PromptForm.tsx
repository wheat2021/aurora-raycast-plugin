import {
  ActionPanel,
  Action,
  Form,
  showToast,
  Toast,
  Clipboard,
  Icon,
  popToRoot,
  getSelectedText,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { PromptConfig, PromptValues, PromptInput } from "../types/prompt";
import { PromptField } from "./PromptField";
import { getVisibleInputIds, getVisibleInputs } from "../utils/extraInputs";
import { replaceTemplate } from "../utils/template";
import { InputConfigForm } from "./InputConfigForm";
import { OptionListManager } from "./InputConfigForm";
import { savePromptConfig } from "../utils/configWriter";
import { executeCommand } from "../utils/commandExecutor";
import { executeRequest, generateCurlCommand } from "../utils/requestExecutor";
import { RequestResult } from "./RequestResult";
import { CommandResult } from "./CommandResult";

interface PromptFormProps {
  config: PromptConfig;
}

interface RequestResultState {
  success: boolean;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: unknown;
  error?: string;
}

interface CommandResultState {
  success: boolean;
  commandLine: string;
  args?: string[];
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export function PromptForm({ config: initialConfig }: PromptFormProps) {
  // 使用状态管理配置，以便保存后能刷新
  const [config, setConfig] = useState<PromptConfig>(initialConfig);
  const [formValues, setFormValues] = useState<PromptValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestResult, setRequestResult] = useState<RequestResultState | null>(
    null,
  );
  const [commandResult, setCommandResult] = useState<CommandResultState | null>(
    null,
  );

  // 组件挂载时初始化表单值，按以下优先级：1. 字段配置的 default 属性；2. 选项中 isDefault=true 的项（multiselect 收集所有默认项，其他类型取第一个）
  useEffect(() => {
    const initialValues: PromptValues = {};
    config.inputs.forEach((input) => {
      if (input.default !== undefined) {
        initialValues[input.id] = input.default;
      } else if (input.options) {
        const defaultOptions = input.options.filter((opt) => opt.isDefault);
        if (defaultOptions.length > 0) {
          if (input.type === "multiselect") {
            // multiselect 类型：将所有标记为默认的选项值组成数组
            initialValues[input.id] = defaultOptions.map((opt) => opt.value);
          } else {
            // select 类型：只取第一个默认选项的值
            initialValues[input.id] = defaultOptions[0].value;
          }
        }
      }
    });
    setFormValues(initialValues);
  }, [config]);

  // 保存表单值到配置文件的 default 属性，以及 lastUseTime，以便下次使用
  const saveFormValues = async (values: PromptValues) => {
    // 更新所有字段的 default 值
    const newInputs = config.inputs.map((input) => ({
      ...input,
      default: values[input.id],
    }));

    const newConfig = {
      ...config,
      inputs: newInputs,
      lastUseTime: Date.now(), // 更新最后使用时间戳
    };

    // 保存到配置文件
    await savePromptConfig(newConfig);

    // 更新本地状态
    setConfig(newConfig);
  };

  // 由子组件 PromptField 触发，更新指定字段的值到 formValues 状态，并清除该字段的验证错误信息（如果存在）
  const handleFieldChange = (
    id: string,
    value: string | string[] | boolean,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    // 用户输入时清除该字段的验证错误，提供即时反馈
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // 在表单提交前验证必填字段：仅验证当前可见的字段（基于 extraInputs 逻辑），检查 required=true 的字段是否为空（undefined、空字符串、空数组）
  const validateForm = (values: PromptValues): boolean => {
    const newErrors: Record<string, string> = {};
    // 通过 extraInputs 逻辑过滤出当前应该显示的字段，隐藏字段不参与验证
    const visibleInputs = getVisibleInputs(config.inputs, values);

    visibleInputs.forEach((input) => {
      if (input.required) {
        const value = values[input.id];
        if (
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[input.id] = "此项为必填项";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 将用户输入的值替换到 Markdown 正文模板中的 {{variable}} 占位符，隐藏字段（extraInputs 未触发显示的）替换为空字符串
  // 同时支持 Raycast 内置变量 {selection} 和 {clipboard}
  const generatePrompt = async (values: PromptValues): Promise<string> => {
    const visibleInputIds = getVisibleInputIds(config.inputs, values);

    // 读取当前选中的文本和剪贴板内容
    let selection = "";
    let clipboard = "";

    try {
      selection = await getSelectedText();
    } catch (error) {
      // 如果无法获取选中文本（比如没有选中内容），使用空字符串
      selection = "";
    }

    try {
      clipboard = (await Clipboard.readText()) || "";
    } catch (error) {
      // 如果无法读取剪贴板，使用空字符串
      clipboard = "";
    }

    return replaceTemplate(
      config.content,
      values,
      visibleInputIds,
      config.inputs,
      selection,
      clipboard,
    );
  };

  // Primary Action (Cmd+Enter)：根据配置模式执行不同操作
  // - 普通模式：粘贴到应用
  // - Request 模式：执行请求
  // - Command 模式：执行命令
  const handlePrimaryAction = async (values: PromptValues) => {
    if (!validateForm(values)) {
      return;
    }

    // 保存表单值到 LocalStorage，以便下次使用
    await saveFormValues(values);

    const visibleInputIds = getVisibleInputIds(config.inputs, values);

    // Request 模式：执行 REST API 请求
    if (config.request) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "正在发送请求...",
      });

      try {
        const response = await executeRequest(
          config.request,
          values,
          visibleInputIds,
          config.inputs,
        );

        toast.style = Toast.Style.Success;
        toast.title = `请求成功 (${response.status})`;

        setRequestResult({
          success: true,
          method: config.request.method,
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
        });
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "请求失败";

        const replacedUrl = replaceTemplate(
          config.request.url,
          values,
          visibleInputIds,
          config.inputs,
        );

        setRequestResult({
          success: false,
          method: config.request.method,
          url: replacedUrl,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
      return;
    }

    // Command 模式：执行命令
    if (config.command) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "正在执行命令...",
      });

      try {
        const { stdout, stderr } = await executeCommand(
          config.command,
          values,
          visibleInputIds,
          config.inputs,
        );

        toast.style = Toast.Style.Success;
        toast.title = "命令执行成功";

        setCommandResult({
          success: true,
          commandLine: config.command.commandLine,
          args: config.command.args,
          exitCode: 0,
          stdout,
          stderr,
        });
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "命令执行失败";

        setCommandResult({
          success: false,
          commandLine: config.command.commandLine,
          args: config.command.args,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
      return;
    }

    // 普通模式：生成提示词并粘贴到应用
    const prompt = await generatePrompt(values);
    await Clipboard.paste(prompt);
    await showToast({
      style: Toast.Style.Success,
      title: "已粘贴到当前应用",
    });
    await popToRoot();
  };

  // Secondary Action (Cmd+Shift+Enter)：根据配置模式执行不同操作
  // - 普通模式：复制到剪贴板
  // - Request 模式：复制完整请求信息到剪贴板
  // - Command 模式：复制完整命令到剪贴板
  const handleSecondaryAction = async (values: PromptValues) => {
    if (!validateForm(values)) {
      return;
    }

    // 保存表单值到 LocalStorage，以便下次使用
    await saveFormValues(values);

    const visibleInputIds = getVisibleInputIds(config.inputs, values);

    // Request 模式：复制 curl 命令
    if (config.request) {
      const curlCommand = generateCurlCommand(
        config.request,
        values,
        visibleInputIds,
        config.inputs,
      );

      await Clipboard.copy(curlCommand);
      await showToast({
        style: Toast.Style.Success,
        title: "已复制 curl 命令到剪贴板",
      });
      return;
    }

    // Command 模式：复制完整命令
    if (config.command) {
      const replacedCommandLine = replaceTemplate(
        config.command.commandLine,
        values,
        visibleInputIds,
        config.inputs,
      );

      const replacedArgs = config.command.args?.map((arg) =>
        replaceTemplate(arg, values, visibleInputIds, config.inputs),
      );

      const fullCommand = replacedArgs
        ? `${replacedCommandLine} ${replacedArgs.join(" ")}`
        : replacedCommandLine;

      await Clipboard.copy(fullCommand);
      await showToast({
        style: Toast.Style.Success,
        title: "已复制命令到剪贴板",
      });
      return;
    }

    // 普通模式：复制提示词到剪贴板
    const prompt = await generatePrompt(values);
    await Clipboard.copy(prompt);
    await showToast({
      style: Toast.Style.Success,
      title: "已复制到剪贴板",
    });
    await popToRoot();
  };

  // 如果有请求结果，显示结果页面
  if (requestResult) {
    return <RequestResult {...requestResult} />;
  }

  // 如果有命令结果，显示结果页面
  if (commandResult) {
    return <CommandResult {...commandResult} />;
  }

  // 根据当前表单值和 extraInputs 配置，实时计算应该显示的字段列表（某些字段仅在特定选项被选中时显示）
  const visibleInputs = getVisibleInputs(config.inputs, formValues);

  // 根据配置模式动态确定 Action 标题
  const getActionTitles = () => {
    if (config.request) {
      return {
        primary: "执行请求",
        secondary: "复制 curl 命令",
      };
    }
    if (config.command) {
      return {
        primary: "执行命令",
        secondary: "复制命令",
      };
    }
    return {
      primary: "粘贴到应用",
      secondary: "复制到剪贴板",
    };
  };

  const actionTitles = getActionTitles();

  // 保存字段配置的回调函数
  const handleSaveInput = async (updatedInput: PromptInput) => {
    // 更新配置中的对应字段
    const newInputs = config.inputs.map((input) =>
      input.id === updatedInput.id ? updatedInput : input,
    );

    const newConfig = {
      ...config,
      inputs: newInputs,
    };

    // 保存到文件
    await savePromptConfig(newConfig);

    // 更新本地状态，触发重新渲染
    setConfig(newConfig);

    // 重新初始化表单值（因为配置可能改变了默认值）
    const initialValues: PromptValues = {};
    newInputs.forEach((input) => {
      if (input.default !== undefined) {
        initialValues[input.id] = input.default;
      } else if (input.options) {
        const defaultOptions = input.options.filter((opt) => opt.isDefault);
        if (defaultOptions.length > 0) {
          if (input.type === "multiselect") {
            initialValues[input.id] = defaultOptions.map((opt) => opt.value);
          } else {
            initialValues[input.id] = defaultOptions[0].value;
          }
        }
      }
    });
    setFormValues(initialValues);
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={actionTitles.primary}
            onSubmit={handlePrimaryAction}
            // Form 中 primary action 自动使用 Cmd+Enter
          />
          <Action.SubmitForm
            title={actionTitles.secondary}
            onSubmit={handleSecondaryAction}
            // Form 中 secondary action 自动使用 Cmd+Shift+Enter
          />
          <ActionPanel.Section title="字段配置">
            <ActionPanel.Submenu
              title="编辑字段配置"
              icon={Icon.Gear}
              shortcut={{ modifiers: ["cmd"], key: "e" }}
            >
              {config.inputs.map((input) => (
                <Action.Push
                  key={input.id}
                  title={`${input.label} (${input.id})`}
                  icon={
                    input.type === "text"
                      ? Icon.Text
                      : input.type === "textarea"
                        ? Icon.Paragraph
                        : input.type === "select"
                          ? Icon.ChevronDown
                          : input.type === "multiselect"
                            ? Icon.Tag
                            : Icon.Checkmark
                  }
                  target={
                    <InputConfigForm
                      input={input}
                      allInputIds={config.inputs.map((i) => i.id)}
                      onSave={handleSaveInput}
                    />
                  }
                />
              ))}
            </ActionPanel.Submenu>
            <ActionPanel.Submenu
              title="管理选项"
              icon={Icon.List}
              shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
            >
              {config.inputs
                .filter(
                  (input) =>
                    input.type === "select" || input.type === "multiselect",
                )
                .map((input) => (
                  <Action.Push
                    key={input.id}
                    title={`${input.label} (${input.id})`}
                    icon={input.type === "select" ? Icon.ChevronDown : Icon.Tag}
                    target={
                      <OptionListManager
                        input={input}
                        allInputIds={config.inputs.map((i) => i.id)}
                        onSave={handleSaveInput}
                      />
                    }
                  />
                ))}
            </ActionPanel.Submenu>
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      {config.formDescription && (
        <Form.Description title={config.title} text={config.formDescription} />
      )}
      {visibleInputs.map((input) => (
        <PromptField
          key={input.id}
          config={input}
          onChange={handleFieldChange}
          error={errors[input.id]}
        />
      ))}
    </Form>
  );
}
