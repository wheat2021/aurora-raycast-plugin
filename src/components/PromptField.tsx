import { Form } from "@raycast/api";
import { PromptInput } from "../types/prompt";
import { readFolderValues } from "../utils/folderReader";

interface PromptFieldProps {
  config: PromptInput;
  onChange: (id: string, value: string | string[] | boolean) => void;
  error?: string;
}

export function PromptField({ config, onChange, error }: PromptFieldProps) {
  const requiredLabel = config.required ? `${config.label} *` : config.label;
  const description = config.description || "";

  // 获取默认值
  const getDefaultValue = () => {
    if (config.default !== undefined) {
      return config.default;
    }

    // 对于选择类型，查找默认选中项
    if (config.options) {
      const defaultOptions = config.options.filter((opt) => opt.isDefault);
      if (config.type === "multiselect") {
        return defaultOptions.map((opt) => opt.value);
      } else if (config.type === "select" && defaultOptions.length > 0) {
        return defaultOptions[0].value;
      }
    }

    return undefined;
  };

  const defaultValue = getDefaultValue();

  switch (config.type) {
    case "text":
      return (
        <Form.TextField
          id={config.id}
          title={requiredLabel}
          placeholder={description}
          info={description}
          defaultValue={defaultValue as string}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    case "textarea":
      return (
        <Form.TextArea
          id={config.id}
          title={requiredLabel}
          placeholder={description}
          info={description}
          defaultValue={defaultValue as string}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    case "select":
      return (
        <Form.Dropdown
          id={config.id}
          title={requiredLabel}
          info={description}
          defaultValue={defaultValue as string}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        >
          {config.options?.map((option) => (
            <Form.Dropdown.Item
              key={option.value}
              value={option.value}
              title={option.label || option.value}
            />
          ))}
        </Form.Dropdown>
      );

    case "selectInFolder": {
      // 从 folder 路径读取文件和目录
      const folderOptions = config.folder ? readFolderValues(config.folder) : [];
      return (
        <Form.Dropdown
          id={config.id}
          title={requiredLabel}
          info={description}
          defaultValue={defaultValue as string}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        >
          {folderOptions.map((option) => (
            <Form.Dropdown.Item
              key={option.value}
              value={option.value}
              title={option.display || option.value}
            />
          ))}
        </Form.Dropdown>
      );
    }

    case "multiselect":
      return (
        <Form.TagPicker
          id={config.id}
          title={requiredLabel}
          info={description}
          defaultValue={defaultValue as string[]}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        >
          {config.options?.map((option) => (
            <Form.TagPicker.Item
              key={option.value}
              value={option.value}
              title={option.label || option.value}
            />
          ))}
        </Form.TagPicker>
      );

    case "checkbox":
      return (
        <Form.Checkbox
          id={config.id}
          label={requiredLabel}
          info={description}
          defaultValue={defaultValue as boolean}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    default:
      return null;
  }
}
