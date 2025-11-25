import { ActionPanel, Action, Form, useNavigation } from "@raycast/api";
import { useState } from "react";
import { PromptOption } from "../types/prompt";

interface OptionEditFormProps {
  option?: PromptOption; // 如果提供，则是编辑模式；否则是新增模式
  allInputIds: string[]; // 所有可用的字段 ID，用于 extraInputs 选择
  onSave: (option: PromptOption) => void;
}

export function OptionEditForm({
  option,
  allInputIds,
  onSave,
}: OptionEditFormProps) {
  const { pop } = useNavigation();
  const [value, setValue] = useState(option?.value || "");
  const [label, setLabel] = useState(option?.label || "");
  const [isDefault, setIsDefault] = useState(option?.isDefault || false);
  const [extraInputs, setExtraInputs] = useState<string[]>(
    option?.extraInputs || [],
  );

  // 表单验证并提交
  const handleSubmit = () => {
    if (!value.trim()) {
      return; // value 不能为空
    }

    const newOption: PromptOption = {
      value: value.trim(),
      label: label.trim() || undefined, // 如果 label 为空，则不设置
      isDefault,
      extraInputs: extraInputs.length > 0 ? extraInputs : undefined,
    };

    onSave(newOption);
    pop(); // 返回上一级
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={option ? "保存修改" : "添加选项"}
            onSubmit={handleSubmit}
          />
          <Action
            title="取消"
            shortcut={{ modifiers: ["cmd"], key: "escape" }}
            onAction={() => pop()}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="value"
        title="选项值 *"
        placeholder="选项的唯一值"
        value={value}
        onChange={setValue}
        info="必填，作为选项的唯一标识"
      />
      <Form.TextField
        id="label"
        title="显示文本"
        placeholder="留空则使用选项值"
        value={label}
        onChange={setLabel}
        info="可选，显示给用户的文本"
      />
      <Form.Checkbox
        id="isDefault"
        label="设为默认选中"
        value={isDefault}
        onChange={setIsDefault}
      />
      <Form.Separator />
      <Form.TagPicker
        id="extraInputs"
        title="关联字段"
        value={extraInputs}
        onChange={setExtraInputs}
        info="选中此选项时显示的额外字段"
      >
        {allInputIds.map((id) => (
          <Form.TagPicker.Item key={id} value={id} title={id} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
