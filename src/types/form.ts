export enum InputType {
  TextLine = "TextLine",
  MultiLineText = "MultiLineText",
  SingleChoice = "SingleChoice",
  MultiChoice = "MultiChoice",
  BooleanChoice = "BooleanChoice",
  SingleChoiceInFolder = "SingleChoiceInFolder",
}

export interface InputValue {
  value: string;
  display?: string;
  isDefault?: boolean;
  extraInputs?: string[];
}

export interface DescriptionConfig {
  expression: string;
  value: string;
}

export interface InputConfig {
  inputType: InputType;
  label: string;
  id: string;
  required?: boolean;
  default?: string | boolean;
  description?: string | DescriptionConfig[];
  values?: InputValue[];
  singleLine?: boolean;
  isExtraInput?: boolean;
  folder?: string;
  valueItemType?: 0 | 1 | 2; // 0=目录和文件(默认), 1=仅目录, 2=仅文件
  regIncludeFilter?: string; // 正则表达式包含过滤器
  regExcludeFilter?: string; // 正则表达式排除过滤器
}

export interface FormConfig {
  title: string;
  inputs: InputConfig[];
}

export interface FormValues {
  [key: string]: string | string[] | boolean;
}

export interface JsonInputConfig {
  inputType: keyof typeof InputType;
  [key: string]: unknown;
}

export interface JsonFormConfig {
  title: string;
  inputs: JsonInputConfig[];
}
