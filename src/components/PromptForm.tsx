import {
  ActionPanel,
  Action,
  Form,
  showToast,
  Toast,
  Clipboard,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { PromptConfig, PromptValues } from "../types/prompt";
import { PromptField } from "./PromptField";
import { getVisibleInputIds, getVisibleInputs } from "../utils/extraInputs";
import { replaceTemplate } from "../utils/template";

interface PromptFormProps {
  config: PromptConfig;
}

export function PromptForm({ config }: PromptFormProps) {
  const [formValues, setFormValues] = useState<PromptValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单值
  useEffect(() => {
    const initialValues: PromptValues = {};
    config.inputs.forEach((input) => {
      if (input.default !== undefined) {
        initialValues[input.id] = input.default;
      } else if (input.options) {
        // 为选择类型设置默认值
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
  }, [config]);

  // 处理字段值变化
  const handleFieldChange = (
    id: string,
    value: string | string[] | boolean,
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    // 清除该字段的错误
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // 验证表单
  const validateForm = (values: PromptValues): boolean => {
    const newErrors: Record<string, string> = {};
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

  // 生成最终提示词
  const generatePrompt = (values: PromptValues): string => {
    const visibleInputIds = getVisibleInputIds(config.inputs, values);
    return replaceTemplate(config.content, values, visibleInputIds);
  };

  // 处理粘贴（默认 Action，Enter 键）
  const handlePaste = async (values: PromptValues) => {
    if (!validateForm(values)) {
      return;
    }

    const prompt = generatePrompt(values);
    await Clipboard.paste(prompt);
    await showToast({
      style: Toast.Style.Success,
      title: "已粘贴到当前应用",
    });
  };

  // 处理复制（Cmd+Enter）
  const handleCopy = async (values: PromptValues) => {
    if (!validateForm(values)) {
      return;
    }

    const prompt = generatePrompt(values);
    await Clipboard.copy(prompt);
    await showToast({
      style: Toast.Style.Success,
      title: "已复制到剪贴板",
    });
  };

  // 获取可见的输入字段
  const visibleInputs = getVisibleInputs(config.inputs, formValues);

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
        </ActionPanel>
      }
    >
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
