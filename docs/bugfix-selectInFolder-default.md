# Bug 修复：selectInFolder 字段初始化时未载入 default 值

## 问题描述

在使用 `selectInFolder` 类型的输入字段时，表单打开后显示的不是配置文件中设置的 `default` 值，而是文件夹中的第一个选项。

例如，配置文件中设置了：
```yaml
- id: repo_path
  label: 仓库路径
  type: selectInFolder
  folder: /opt/code
  default: /opt/code/aurora-raycast-plugin
```

但打开表单后，`repo_path` 字段显示的是 `/opt/code/aurora-obsidian-plugin`（文件夹中的第一个目录），而不是配置的 default 值。

## 根本原因

问题的根本原因是 **React 状态初始化的时序问题**：

1. `formValues` 状态初始化为空对象 `{}`：
   ```tsx
   const [formValues, setFormValues] = useState<PromptValues>({});
   ```

2. 组件首次渲染时，`PromptField` 接收到的 `value` 是 `formValues[input.id]`，也就是 `undefined`

3. `Form.Dropdown` 看到 `value={undefined}`，根据 Raycast 的默认行为，会自动选中第一个选项

4. 然后 `useEffect` 才执行，设置正确的 default 值

5. 但这时用户已经看到了错误的初始值（第一个选项）

## 解决方案

将默认值的计算逻辑从 `useEffect` 移到 `useState` 的初始化函数中，确保组件首次渲染时就有正确的值：

### 修改前
```tsx
const [formValues, setFormValues] = useState<PromptValues>({});

useEffect(() => {
  // 初始化逻辑...
  const defaultValues: PromptValues = {};
  config.inputs.forEach((input) => {
    if (input.default !== undefined) {
      defaultValues[input.id] = input.default;
    }
    // ...
  });
  setFormValues(defaultValues);
}, [config, initialValues]);
```

### 修改后
```tsx
const [formValues, setFormValues] = useState<PromptValues>(() => {
  if (initialValues) {
    return initialValues;
  }
  
  const defaultValues: PromptValues = {};
  initialConfig.inputs.forEach((input) => {
    if (input.default !== undefined) {
      defaultValues[input.id] = input.default;
    } else if (input.options) {
      const defaultOptions = input.options.filter((opt) => opt.isDefault);
      if (defaultOptions.length > 0) {
        if (input.type === "multiselect") {
          defaultValues[input.id] = defaultOptions.map((opt) => opt.value);
        } else {
          defaultValues[input.id] = defaultOptions[0].value;
        }
      }
    }
  });
  return defaultValues;
});
```

## 关键改进

1. **使用 useState 的初始化函数**：`useState(() => { ... })` 确保初始化逻辑只在组件挂载时执行一次
2. **同步初始化**：在首次渲染之前就计算好默认值，避免 `Form.Dropdown` 看到 `undefined`
3. **保留 useEffect**：仍然需要 `useEffect` 来处理配置变化（比如用户编辑了字段配置）

## 影响范围

- 修改文件：`src/components/PromptForm.tsx`
- 影响功能：所有输入字段类型的初始化，特别是 `selectInFolder` 类型

## 测试建议

1. 打开 `/opt/Notes/Prompts/exec/git commit.md` 对应的表单
2. 确认 `repo_path` 字段显示的是配置的 default 值 `/opt/code/aurora-raycast-plugin`
3. 选择另一个目录并提交表单
4. 重新打开表单，确认 `repo_path` 显示的是上次选择的目录（因为 default 值会被更新）

## 技术细节

### 为什么之前的实现会失败？

Raycast 的 `Form.Dropdown` 组件在 `value` 为 `undefined` 时，会默认选中第一个 `Form.Dropdown.Item`。这是一个合理的默认行为，但在我们的场景中导致了问题：

1. 首次渲染：`formValues = {}`，所以 `formValues.repo_path = undefined`
2. `Form.Dropdown` 看到 `value={undefined}`，选中第一个选项
3. `useEffect` 执行，设置 `formValues.repo_path = "/opt/code/aurora-raycast-plugin"`
4. 重新渲染，但用户已经看到了第一个选项被选中

### 为什么新的实现能解决问题？

使用 `useState` 的初始化函数可以确保：

1. 初始化函数在组件挂载时**同步**执行
2. 首次渲染时，`formValues.repo_path` 已经是 `"/opt/code/aurora-raycast-plugin"`
3. `Form.Dropdown` 看到正确的 `value`，选中对应的选项
4. 用户看到的始终是正确的默认值
