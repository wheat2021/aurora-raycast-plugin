import { Form } from "@raycast/api";
import { PromptInput } from "../types/prompt";
import { readFolderValues } from "../utils/folderReader";

interface PromptFieldProps {
  config: PromptInput;
  value?: string | string[] | boolean;
  onChange: (id: string, value: string | string[] | boolean) => void;
  error?: string;
  warning?: string;
}

export function PromptField({
  config,
  value,
  onChange,
  error,
  warning,
}: PromptFieldProps) {
  const requiredLabel = config.required ? `${config.label} *` : config.label;
  const description = config.description || "";

  // 如果有警告，显示在 placeholder 中；否则显示 description
  const placeholder = warning
    ? `⚠️ Deeplink 参数无效：${warning}`
    : description;

  switch (config.type) {
    case "text":
      return (
        <Form.TextField
          id={config.id}
          title={requiredLabel}
          placeholder={placeholder}
          info={description}
          value={value as string | undefined}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    case "textarea":
      return (
        <Form.TextArea
          id={config.id}
          title={requiredLabel}
          placeholder={placeholder}
          info={description}
          value={value as string | undefined}
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
          value={value as string | undefined}
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
      const folderOptions = config.folder
        ? readFolderValues(config.folder, {
            valueItemType: config.valueItemType,
            regIncludeFilter: config.regIncludeFilter,
            regExcludeFilter: config.regExcludeFilter,
          })
        : [];
      return (
        <Form.Dropdown
          id={config.id}
          title={requiredLabel}
          info={description}
          value={value as string | undefined}
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
          value={value as string[] | undefined}
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
          value={value as boolean | undefined}
          error={error}
          onChange={(value) => onChange(config.id, value)}
        />
      );

    default:
      return null;
  }
}
