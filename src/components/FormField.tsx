import { Form } from "@raycast/api";
import { InputConfig, InputType, FormValues } from "../types/form";
import { getDescription } from "../utils/description";

interface FormFieldProps {
  config: InputConfig;
  formValues: FormValues;
  onChange: (id: string, value: string | string[] | boolean) => void;
  error?: string;
}

export function FormField({
  config,
  formValues,
  onChange,
  error,
}: FormFieldProps) {
  const description = getDescription(config, formValues);
  const requiredLabel = config.required ? `${config.label} *` : config.label;

  // 获取默认值
  const getDefaultValue = () => {
    if (config.default !== undefined) {
      return config.default;
    }

    // 对于选择类型，查找默认选中项
    if (config.values) {
      const defaultValues = config.values.filter((v) => v.isDefault);
      if (config.inputType === InputType.MultiChoice) {
        return defaultValues.map((v) => v.value);
      } else if (
        config.inputType === InputType.SingleChoice &&
        defaultValues.length > 0
      ) {
        return defaultValues[0].value;
      }
    }

    return undefined;
  };

  const defaultValue = getDefaultValue();

  switch (config.inputType) {
    case InputType.TextLine:
      return (
        <Form.TextField
          id={config.id}
          title={requiredLabel}
          placeholder={description}
          defaultValue={defaultValue as string}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    case InputType.MultiLineText:
      return (
        <Form.TextArea
          id={config.id}
          title={requiredLabel}
          placeholder={description}
          defaultValue={defaultValue as string}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    case InputType.SingleChoice:
      return (
        <Form.Dropdown
          id={config.id}
          title={requiredLabel}
          defaultValue={defaultValue as string}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        >
          {config.values?.map((option) => (
            <Form.Dropdown.Item
              key={option.value}
              value={option.value}
              title={option.display || option.value}
            />
          ))}
        </Form.Dropdown>
      );

    case InputType.MultiChoice:
      return (
        <Form.TagPicker
          id={config.id}
          title={requiredLabel}
          defaultValue={defaultValue as string[]}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        >
          {config.values?.map((option) => (
            <Form.TagPicker.Item
              key={option.value}
              value={option.value}
              title={option.display || option.value}
            />
          ))}
        </Form.TagPicker>
      );

    case InputType.BooleanChoice:
      return (
        <Form.Checkbox
          id={config.id}
          label={requiredLabel}
          defaultValue={defaultValue as boolean}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    default:
      return null;
  }
}
