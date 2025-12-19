import {
  Action,
  ActionPanel,
  Alert,
  Color,
  confirmAlert,
  Form,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { InputTemplate, PromptInputType, PromptInput } from "./types/prompt";
import {
  loadAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "./config/inputTemplates";

export default function Command() {
  const [templates, setTemplates] = useState<InputTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplateList();
  }, []);

  async function loadTemplateList() {
    try {
      const allTemplates = await loadAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "加载模板失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(template: InputTemplate) {
    if (template.isBuiltIn) {
      showToast({
        style: Toast.Style.Failure,
        title: "无法删除预设模板",
      });
      return;
    }

    if (
      await confirmAlert({
        title: "删除模板",
        message: `确定要删除模板 "${template.name}" 吗？`,
        primaryAction: {
          title: "删除",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      try {
        await deleteTemplate(template.id);
        await loadTemplateList();
        showToast({
          style: Toast.Style.Success,
          title: "删除成功",
        });
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "删除失败",
          message: error instanceof Error ? error.message : "未知错误",
        });
      }
    }
  }

  // 按类型分组模板
  const groupedTemplates: Record<PromptInputType, InputTemplate[]> = {
    text: [],
    textarea: [],
    select: [],
    multiselect: [],
    checkbox: [],
    selectInFolder: [],
  };

  templates.forEach((template) => {
    groupedTemplates[template.type].push(template);
  });

  const typeNames: Record<PromptInputType, string> = {
    text: "文本输入",
    textarea: "多行文本",
    select: "单选下拉框",
    multiselect: "多选标签",
    checkbox: "复选框",
    selectInFolder: "文件夹选择",
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="搜索模板...">
      {Object.entries(groupedTemplates).map(([type, typeTemplates]) => {
        if (typeTemplates.length === 0) return null;

        return (
          <List.Section
            key={type}
            title={typeNames[type as PromptInputType]}
            subtitle={`${typeTemplates.length} 个`}
          >
            {typeTemplates.map((template) => (
              <List.Item
                key={template.id}
                title={template.name}
                subtitle={template.isBuiltIn ? "预设模板" : "自定义模板"}
                icon={template.isBuiltIn ? Icon.Star : Icon.Document}
                accessories={[
                  {
                    tag: {
                      value: typeNames[template.type],
                      color: template.isBuiltIn ? Color.Blue : Color.Green,
                    },
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action.Push
                      title="编辑模板"
                      icon={Icon.Pencil}
                      target={
                        <TemplateEditForm
                          template={template}
                          onSave={loadTemplateList}
                        />
                      }
                    />
                    {!template.isBuiltIn && (
                      <Action
                        title="删除模板"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        shortcut={{ modifiers: ["cmd"], key: "delete" }}
                        onAction={() => handleDelete(template)}
                      />
                    )}
                    <Action.Push
                      title="新建模板"
                      icon={Icon.Plus}
                      shortcut={{ modifiers: ["cmd"], key: "n" }}
                      target={<TemplateCreateForm onSave={loadTemplateList} />}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        );
      })}

      <List.EmptyView
        title="暂无模板"
        description="按 Cmd+N 创建新模板"
        actions={
          <ActionPanel>
            <Action.Push
              title="新建模板"
              icon={Icon.Plus}
              shortcut={{ modifiers: ["cmd"], key: "n" }}
              target={<TemplateCreateForm onSave={loadTemplateList} />}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}

// ==================== 创建模板表单 ====================

interface TemplateCreateFormProps {
  onSave: () => void;
}

function TemplateCreateForm({ onSave }: TemplateCreateFormProps) {
  const { pop } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<PromptInputType>("text");

  async function handleSubmit() {
    if (!name.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "请输入模板名称",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 创建基础配置
      const config: Partial<PromptInput> = {
        id: "example_field",
        label: "示例字段",
        type,
      };

      // 根据类型添加默认配置
      switch (type) {
        case "select":
        case "multiselect":
          config.options = [
            { value: "option1", label: "选项 1", isDefault: true },
            { value: "option2", label: "选项 2" },
          ];
          if (type === "multiselect") {
            config.default = [];
          }
          break;
        case "checkbox":
          config.default = false;
          config.trueValue = "true";
          config.falseValue = "false";
          break;
        case "selectInFolder":
          config.folder = "/Users";
          config.valueItemType = 0;
          break;
        default:
          config.default = "";
      }

      await createTemplate(name, type, config);
      showToast({
        style: Toast.Style.Success,
        title: "创建成功",
      });
      onSave();
      pop();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "创建失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="创建模板"
            icon={Icon.Plus}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="模板名称"
        placeholder="例如：我的文本输入"
        value={name}
        onChange={setName}
      />
      <Form.Dropdown
        id="type"
        title="模板类型"
        value={type}
        onChange={(v) => setType(v as PromptInputType)}
      >
        <Form.Dropdown.Item value="text" title="文本输入" />
        <Form.Dropdown.Item value="textarea" title="多行文本" />
        <Form.Dropdown.Item value="select" title="单选下拉框" />
        <Form.Dropdown.Item value="multiselect" title="多选标签" />
        <Form.Dropdown.Item value="checkbox" title="复选框" />
        <Form.Dropdown.Item value="selectInFolder" title="文件夹选择" />
      </Form.Dropdown>
    </Form>
  );
}

// ==================== 编辑模板表单 ====================

interface TemplateEditFormProps {
  template: InputTemplate;
  onSave: () => void;
}

function TemplateEditForm({ template, onSave }: TemplateEditFormProps) {
  const { pop } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(template.name);
  const [type, setType] = useState<PromptInputType>(template.type);
  const config = template.config;

  // 字段配置项
  const [fieldId, setFieldId] = useState(config.id || "");
  const [fieldLabel, setFieldLabel] = useState(config.label || "");
  const [required, setRequired] = useState(config.required || false);
  const [defaultValue, setDefaultValue] = useState(
    String(config.default || ""),
  );
  const [description, setDescription] = useState(config.description || "");
  const [isExtraInput, setIsExtraInput] = useState(
    config.isExtraInput || false,
  );

  // checkbox 特定字段
  const [trueValue, setTrueValue] = useState(config.trueValue || "true");
  const [falseValue, setFalseValue] = useState(config.falseValue || "false");

  // selectInFolder 特定字段
  const [folder, setFolder] = useState(config.folder || "");
  const [valueItemType, setValueItemType] = useState(
    String(config.valueItemType ?? 0),
  );
  const [regIncludeFilter, setRegIncludeFilter] = useState(
    config.regIncludeFilter || "",
  );
  const [regExcludeFilter, setRegExcludeFilter] = useState(
    config.regExcludeFilter || "",
  );

  // select/multiselect 选项
  const [optionsJson, setOptionsJson] = useState(
    JSON.stringify(config.options || [], null, 2),
  );

  async function handleSubmit() {
    if (!fieldId.trim() || !fieldLabel.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "ID 和标签不能为空",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newConfig: Partial<PromptInput> = {
        id: fieldId,
        label: fieldLabel,
        type,
        required,
        description,
        isExtraInput,
      };

      // 处理默认值
      if (type === "checkbox") {
        newConfig.default = defaultValue === "true";
        newConfig.trueValue = trueValue;
        newConfig.falseValue = falseValue;
      } else if (type === "multiselect") {
        try {
          newConfig.default = defaultValue ? JSON.parse(defaultValue) : [];
        } catch {
          newConfig.default = defaultValue.split(",").map((s) => s.trim());
        }
      } else {
        newConfig.default = defaultValue;
      }

      // 处理选项
      if (type === "select" || type === "multiselect") {
        try {
          newConfig.options = JSON.parse(optionsJson);
        } catch (error) {
          showToast({
            style: Toast.Style.Failure,
            title: "选项 JSON 格式错误",
            message: error instanceof Error ? error.message : "未知错误",
          });
          setIsLoading(false);
          return;
        }
      }

      // selectInFolder 特定字段
      if (type === "selectInFolder") {
        newConfig.folder = folder;
        newConfig.valueItemType = parseInt(valueItemType) as 0 | 1 | 2;
        if (regIncludeFilter) newConfig.regIncludeFilter = regIncludeFilter;
        if (regExcludeFilter) newConfig.regExcludeFilter = regExcludeFilter;
      }

      const updates: Partial<InputTemplate> = {
        config: newConfig,
      };

      // 自定义模板可以修改名称和类型
      if (!template.isBuiltIn) {
        updates.name = name;
        updates.type = type;
      }

      await updateTemplate(template.id, updates);
      showToast({
        style: Toast.Style.Success,
        title: "保存成功",
      });
      onSave();
      pop();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "保存失败",
        message: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="保存"
            icon={Icon.Check}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Description text={`编辑模板: ${template.name}`} />

      {/* 模板基础信息 */}
      <Form.Separator />
      {!template.isBuiltIn && (
        <>
          <Form.TextField
            id="name"
            title="模板名称"
            placeholder="例如：我的文本输入"
            value={name}
            onChange={setName}
          />
          <Form.Dropdown
            id="type"
            title="模板类型"
            value={type}
            onChange={(v) => setType(v as PromptInputType)}
          >
            <Form.Dropdown.Item value="text" title="文本输入" />
            <Form.Dropdown.Item value="textarea" title="多行文本" />
            <Form.Dropdown.Item value="select" title="单选下拉框" />
            <Form.Dropdown.Item value="multiselect" title="多选标签" />
            <Form.Dropdown.Item value="checkbox" title="复选框" />
            <Form.Dropdown.Item value="selectInFolder" title="文件夹选择" />
          </Form.Dropdown>
        </>
      )}
      {template.isBuiltIn && (
        <Form.Description text={`类型: ${type} (预设模板不可修改类型)`} />
      )}

      {/* 字段配置 */}
      <Form.Separator />
      <Form.TextField
        id="fieldId"
        title="字段 ID"
        placeholder="field_id"
        value={fieldId}
        onChange={setFieldId}
      />
      <Form.TextField
        id="fieldLabel"
        title="字段标签"
        placeholder="字段显示名称"
        value={fieldLabel}
        onChange={setFieldLabel}
      />
      <Form.Checkbox
        id="required"
        label="必填项"
        value={required}
        onChange={setRequired}
      />
      <Form.TextArea
        id="description"
        title="字段描述"
        placeholder="帮助文本（可选）"
        value={description}
        onChange={setDescription}
      />
      <Form.Checkbox
        id="isExtraInput"
        label="条件显示字段"
        value={isExtraInput}
        onChange={setIsExtraInput}
      />

      {/* 默认值 */}
      {type === "checkbox" ? (
        <Form.Dropdown
          id="defaultValue"
          title="默认值"
          value={defaultValue}
          onChange={setDefaultValue}
        >
          <Form.Dropdown.Item value="true" title="选中" />
          <Form.Dropdown.Item value="false" title="未选中" />
        </Form.Dropdown>
      ) : (
        <Form.TextField
          id="defaultValue"
          title="默认值"
          placeholder={
            type === "multiselect"
              ? '["value1", "value2"] 或 value1, value2'
              : "默认值"
          }
          value={defaultValue}
          onChange={setDefaultValue}
        />
      )}

      {/* checkbox 特定字段 */}
      {type === "checkbox" && (
        <>
          <Form.Separator />
          <Form.TextField
            id="trueValue"
            title="选中时的值"
            placeholder="true"
            value={trueValue}
            onChange={setTrueValue}
          />
          <Form.TextField
            id="falseValue"
            title="未选中时的值"
            placeholder="false"
            value={falseValue}
            onChange={setFalseValue}
          />
        </>
      )}

      {/* select/multiselect 选项 */}
      {(type === "select" || type === "multiselect") && (
        <>
          <Form.Separator />
          <Form.TextArea
            id="options"
            title="选项配置 (JSON)"
            placeholder='[{"value":"val1","label":"标签1","isDefault":true}]'
            value={optionsJson}
            onChange={setOptionsJson}
          />
          <Form.Description text='格式: [{"value":"选项值","label":"显示文本","isDefault":true,"extraInputs":["field_id"]}]' />
        </>
      )}

      {/* selectInFolder 特定字段 */}
      {type === "selectInFolder" && (
        <>
          <Form.Separator />
          <Form.TextField
            id="folder"
            title="文件夹路径"
            placeholder="/Users/username/Documents"
            value={folder}
            onChange={setFolder}
          />
          <Form.Dropdown
            id="valueItemType"
            title="选择类型"
            value={valueItemType}
            onChange={setValueItemType}
          >
            <Form.Dropdown.Item value="0" title="文件和目录" />
            <Form.Dropdown.Item value="1" title="仅目录" />
            <Form.Dropdown.Item value="2" title="仅文件" />
          </Form.Dropdown>
          <Form.TextField
            id="regIncludeFilter"
            title="包含过滤器 (正则)"
            placeholder="例如: \\.(ts|js)$"
            value={regIncludeFilter}
            onChange={setRegIncludeFilter}
          />
          <Form.TextField
            id="regExcludeFilter"
            title="排除过滤器 (正则)"
            placeholder="例如: node_modules"
            value={regExcludeFilter}
            onChange={setRegExcludeFilter}
          />
        </>
      )}
    </Form>
  );
}
