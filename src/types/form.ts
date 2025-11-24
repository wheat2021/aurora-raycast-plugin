export enum InputType {
  TextLine = "TextLine",
  MultiLineText = "MultiLineText",
  SingleChoice = "SingleChoice",
  MultiChoice = "MultiChoice",
  BooleanChoice = "BooleanChoice",
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
