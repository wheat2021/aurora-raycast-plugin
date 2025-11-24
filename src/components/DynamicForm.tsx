import { ActionPanel, Action, Form, popToRoot } from "@raycast/api";
import { useState, useEffect } from "react";
import { FormConfig, FormValues } from "../types/form";
import { FormField } from "./FormField";
import { getVisibleInputs } from "../utils/extraInputs";
import { handleFormSubmit } from "../utils/results";

interface DynamicFormProps {
  config: FormConfig;
}

export function DynamicForm({ config }: DynamicFormProps) {
  const [formValues, setFormValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单值
  useEffect(() => {
    const initialValues: FormValues = {};
    config.inputs.forEach((input) => {
      if (input.default !== undefined) {
        initialValues[input.id] = input.default;
      } else if (input.values) {
        // 为选择类型设置默认值
        const defaultOptions = input.values.filter((v) => v.isDefault);
        if (defaultOptions.length > 0) {
          if (input.inputType.toString() === "MultiChoice") {
            initialValues[input.id] = defaultOptions.map((v) => v.value);
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
  const validateForm = (values: FormValues): boolean => {
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

  // 处理提交
  const handleSubmit = async (values: FormValues) => {
    if (!validateForm(values)) {
      return;
    }

    const success = await handleFormSubmit(values, config.title);
    if (success) {
      popToRoot();
    }
  };

  // 获取可见的输入字段
  const visibleInputs = getVisibleInputs(config.inputs, formValues);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="提交" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {visibleInputs.map((input) => (
        <FormField
          key={input.id}
          config={input}
          formValues={formValues}
          onChange={handleFieldChange}
          error={errors[input.id]}
        />
      ))}
    </Form>
  );
}
