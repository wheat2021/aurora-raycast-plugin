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
import { executeScript } from "../utils/execScript";
import { executeRequest } from "../utils/requestExecutor";
import { RequestResult } from "./RequestResult";

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

export function PromptForm({ config: initialConfig }: PromptFormProps) {
  // 使用状态管理配置，以便保存后能刷新
  const [config, setConfig] = useState<PromptConfig>(initialConfig);
  const [formValues, setFormValues] = useState<PromptValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestResult, setRequestResult] = useState<RequestResultState | null>(
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
      selection,
      clipboard,
    );
  };

  // Enter 键触发：验证表单 → 根据配置决定执行 API 请求、脚本或粘贴内容
  const handlePaste = async (values: PromptValues) => {
    if (!validateForm(values)) {
      return;
    }

    // 如果配置了 request，执行 REST API 请求而非粘贴内容
    if (config.request) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "正在发送请求...",
      });

      try {
        const visibleInputIds = getVisibleInputIds(config.inputs, values);
        const response = await executeRequest(
          config.request,
          values,
          visibleInputIds,
        );

        toast.style = Toast.Style.Success;
        toast.title = `请求成功 (${response.status})`;

        // 设置请求结果状态，显示结果页面
        setRequestResult({
          success: true,
          method: config.request.method,
          url: config.request.url,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
        });
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "请求失败";

        // 设置请求结果状态，显示错误页面
        setRequestResult({
          success: false,
          method: config.request.method,
          url: config.request.url,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
      return;
    }

    // 如果配置了 execScript，执行脚本而非粘贴内容
    if (config.execScript) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "正在执行脚本...",
      });

      try {
        const visibleInputIds = getVisibleInputIds(config.inputs, values);
        const { stdout, stderr } = await executeScript(
          config.execScript,
          values,
          visibleInputIds,
        );

        toast.style = Toast.Style.Success;
        toast.title = "脚本执行成功";

        // 如果有输出，记录到日志
        if (stdout) {
          console.log("Script stdout:", stdout);
        }
        if (stderr) {
          console.warn("Script stderr:", stderr);
        }

        // 返回文件列表
        await popToRoot();
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "脚本执行失败";
        toast.message = error instanceof Error ? error.message : "未知错误";
        console.error("Script execution error:", error);
      }
      return;
    }

    // 原有逻辑：生成提示词并粘贴
    const prompt = await generatePrompt(values);
    await Clipboard.paste(prompt);
    await showToast({
      style: Toast.Style.Success,
      title: "已粘贴到当前应用",
    });

    // 返回文件列表
    await popToRoot();
  };

  // Cmd+Enter 快捷键触发：验证表单 → 根据配置决定执行 API 请求、脚本或复制内容
  const handleCopy = async (values: PromptValues) => {
    if (!validateForm(values)) {
      return;
    }

    // 如果配置了 request，执行 REST API 请求而非复制内容
    if (config.request) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "正在发送请求...",
      });

      try {
        const visibleInputIds = getVisibleInputIds(config.inputs, values);
        const response = await executeRequest(
          config.request,
          values,
          visibleInputIds,
        );

        toast.style = Toast.Style.Success;
        toast.title = `请求成功 (${response.status})`;

        // 设置请求结果状态，显示结果页面
        setRequestResult({
          success: true,
          method: config.request.method,
          url: config.request.url,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
        });
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "请求失败";

        // 设置请求结果状态，显示错误页面
        setRequestResult({
          success: false,
          method: config.request.method,
          url: config.request.url,
          error: error instanceof Error ? error.message : "未知错误",
        });
      }
      return;
    }

    // 如果配置了 execScript，执行脚本而非复制内容
    if (config.execScript) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "正在执行脚本...",
      });

      try {
        const visibleInputIds = getVisibleInputIds(config.inputs, values);
        const { stdout, stderr } = await executeScript(
          config.execScript,
          values,
          visibleInputIds,
        );

        toast.style = Toast.Style.Success;
        toast.title = "脚本执行成功";

        // 如果有输出，记录到日志
        if (stdout) {
          console.log("Script stdout:", stdout);
        }
        if (stderr) {
          console.warn("Script stderr:", stderr);
        }

        // 返回文件列表
        await popToRoot();
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "脚本执行失败";
        toast.message = error instanceof Error ? error.message : "未知错误";
        console.error("Script execution error:", error);
      }
      return;
    }

    // 原有逻辑：生成提示词并复制
    const prompt = await generatePrompt(values);
    await Clipboard.copy(prompt);
    await showToast({
      style: Toast.Style.Success,
      title: "已复制到剪贴板",
    });

    // 返回文件列表
    await popToRoot();
  };

  // 如果有请求结果，显示结果页面
  if (requestResult) {
    return <RequestResult {...requestResult} />;
  }

  // 根据当前表单值和 extraInputs 配置，实时计算应该显示的字段列表（某些字段仅在特定选项被选中时显示）
  const visibleInputs = getVisibleInputs(config.inputs, formValues);

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
            title="粘贴到应用"
            onSubmit={handlePaste}
            shortcut={{ modifiers: [], key: "return" }}
          />
          <Action.SubmitForm
            title="复制到剪贴板"
            onSubmit={handleCopy}
            shortcut={{ modifiers: ["cmd"], key: "return" }}
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
