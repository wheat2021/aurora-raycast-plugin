import {
  ActionPanel,
  Action,
  Form,
  List,
  Icon,
  useNavigation,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import { PromptInput, PromptOption, PromptInputType } from "../types/prompt";
import { OptionEditForm } from "./OptionEditForm";

interface InputConfigFormProps {
  input: PromptInput;
  allInputIds: string[]; // 所有字段 ID，用于验证和 extraInputs 选择
  onSave: (updatedInput: PromptInput) => Promise<void>;
}

export function InputConfigForm({ input, onSave }: InputConfigFormProps) {
  const { pop } = useNavigation();

  // 状态管理
  const [label, setLabel] = useState(input.label);
  const [type, setType] = useState<PromptInputType>(input.type);
  const [required, setRequired] = useState(input.required || false);
  const [defaultValue, setDefaultValue] = useState<string>(
    typeof input.default === "string" ? input.default : "",
  );
  const [defaultCheckbox, setDefaultCheckbox] = useState<boolean>(
    typeof input.default === "boolean" ? input.default : false,
  );
  const [description, setDescription] = useState(input.description || "");
  const [isExtraInput, setIsExtraInput] = useState(input.isExtraInput || false);
  const [preserveDefault, setPreserveDefault] = useState(
    input.preserveDefault || false,
  );

  // 保存字段配置
  const handleSave = async () => {
    // 验证
    if (!label.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "标签不能为空",
      });
      return;
    }

    // 选项由独立的 OptionListManager 管理，此处不验证

    // 构建更新后的字段配置
    const updatedInput: PromptInput = {
      id: input.id, // ID 不可修改
      label: label.trim(),
      type,
      required,
      description: description.trim() || undefined,
      isExtraInput,
      preserveDefault: preserveDefault || undefined,
    };

    // 根据类型设置默认值
    if (type === "checkbox") {
      updatedInput.default = defaultCheckbox;
    } else if (type === "text" || type === "textarea") {
      updatedInput.default = defaultValue.trim() || undefined;
    }

    // 保留原有选项（选项由 OptionListManager 管理）
    if (input.options) {
      updatedInput.options = input.options;
    }

    try {
      await onSave(updatedInput);
      await showToast({
        style: Toast.Style.Success,
        title: "字段配置已保存",
      });
      pop();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "保存失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="保存字段配置" onSubmit={handleSave} />
          <Action
            title="取消"
            shortcut={{ modifiers: ["cmd"], key: "escape" }}
            onAction={() => pop()}
          />
        </ActionPanel>
      }
    >
      <Form.Description title="字段 ID" text={input.id} />
      <Form.TextField
        id="label"
        title="标签 *"
        placeholder="字段显示的标签"
        value={label}
        onChange={setLabel}
      />
      <Form.Dropdown
        id="type"
        title="字段类型 *"
        value={type}
        onChange={(value) => setType(value as PromptInputType)}
      >
        <Form.Dropdown.Item value="text" title="单行文本" />
        <Form.Dropdown.Item value="textarea" title="多行文本" />
        <Form.Dropdown.Item value="select" title="单选下拉" />
        <Form.Dropdown.Item value="multiselect" title="多选标签" />
        <Form.Dropdown.Item value="checkbox" title="复选框" />
      </Form.Dropdown>

      <Form.Checkbox
        id="required"
        label="必填项"
        value={required}
        onChange={setRequired}
      />

      <Form.Checkbox
        id="isExtraInput"
        label="条件显示字段"
        value={isExtraInput}
        onChange={setIsExtraInput}
        info="标记为 extraInput，仅在其他字段触发时显示"
      />

      <Form.Checkbox
        id="preserveDefault"
        label="保留默认值"
        value={preserveDefault}
        onChange={setPreserveDefault}
        info="提交表单时不更新此字段的 default 值（适用于不允许重复的输入等场景）"
      />

      <Form.Separator />

      {/* 根据类型显示不同的默认值编辑器 */}
      {(type === "text" || type === "textarea") && (
        <Form.TextField
          id="default"
          title="默认值"
          placeholder="留空表示无默认值"
          value={defaultValue}
          onChange={setDefaultValue}
        />
      )}

      {type === "checkbox" && (
        <Form.Checkbox
          id="defaultCheckbox"
          label="默认选中"
          value={defaultCheckbox}
          onChange={setDefaultCheckbox}
        />
      )}

      <Form.TextArea
        id="description"
        title="描述文本"
        placeholder="帮助用户理解此字段的用途"
        value={description}
        onChange={setDescription}
      />

      {/* 选项管理提示 */}
      {(type === "select" || type === "multiselect") && (
        <>
          <Form.Separator />
          <Form.Description
            title="选项管理"
            text="选项需要通过主表单的 '管理选项' 菜单（Cmd+Shift+O）进行编辑。"
          />
        </>
      )}
    </Form>
  );
}

// 选项列表管理界面
interface OptionListProps {
  input: PromptInput;
  allInputIds: string[];
  onSave: (updatedInput: PromptInput) => Promise<void>;
}

export function OptionListManager({
  input,
  allInputIds,
  onSave,
}: OptionListProps) {
  const { pop } = useNavigation();
  const [options, setOptions] = useState<PromptOption[]>(input.options || []);

  const handleSaveOptions = async () => {
    const updatedInput = { ...input, options };
    try {
      await onSave(updatedInput);
      await showToast({
        style: Toast.Style.Success,
        title: "选项已保存",
      });
      pop();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "保存失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    }
  };

  return (
    <List
      navigationTitle={`管理选项: ${input.label}`}
      actions={
        <ActionPanel>
          <Action
            title="保存选项"
            icon={Icon.Check}
            onAction={handleSaveOptions}
          />
          <Action.Push
            title="添加选项"
            icon={Icon.Plus}
            target={
              <OptionEditForm
                allInputIds={allInputIds}
                onSave={(option) => setOptions([...options, option])}
              />
            }
            shortcut={{ modifiers: ["cmd"], key: "n" }}
          />
        </ActionPanel>
      }
    >
      {options.map((option, index) => (
        <List.Item
          key={index}
          icon={option.isDefault ? Icon.CheckCircle : Icon.Circle}
          title={option.label || option.value}
          subtitle={option.value !== option.label ? option.value : undefined}
          accessories={[
            ...(option.extraInputs && option.extraInputs.length > 0
              ? [{ text: `+${option.extraInputs.length} 字段` }]
              : []),
          ]}
          actions={
            <ActionPanel>
              <Action
                title="保存选项"
                icon={Icon.Check}
                onAction={handleSaveOptions}
              />
              <Action.Push
                title="编辑选项"
                icon={Icon.Pencil}
                target={
                  <OptionEditForm
                    option={option}
                    allInputIds={allInputIds}
                    onSave={(updatedOption) => {
                      const newOptions = [...options];
                      newOptions[index] = updatedOption;
                      setOptions(newOptions);
                    }}
                  />
                }
              />
              <Action.Push
                title="添加选项"
                icon={Icon.Plus}
                target={
                  <OptionEditForm
                    allInputIds={allInputIds}
                    onSave={(newOption) => setOptions([...options, newOption])}
                  />
                }
                shortcut={{ modifiers: ["cmd"], key: "n" }}
              />
              <Action
                title="删除选项"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                onAction={() => {
                  const newOptions = options.filter((_, i) => i !== index);
                  setOptions(newOptions);
                }}
                shortcut={{ modifiers: ["ctrl"], key: "x" }}
              />
            </ActionPanel>
          }
        />
      ))}
      {options.length === 0 && (
        <List.EmptyView
          title="暂无选项"
          description="按 Cmd+N 添加第一个选项"
        />
      )}
    </List>
  );
}
