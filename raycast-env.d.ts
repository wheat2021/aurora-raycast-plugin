/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `manage-ai` command */
  export type ManageAi = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-input-templates` command */
  export type ManageInputTemplates = ExtensionPreferences & {}
  /** Preferences accessible in the `processor-1` command */
  export type Processor1 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-2` command */
  export type Processor2 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-3` command */
  export type Processor3 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-4` command */
  export type Processor4 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-5` command */
  export type Processor5 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-6` command */
  export type Processor6 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-7` command */
  export type Processor7 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-8` command */
  export type Processor8 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `processor-9` command */
  export type Processor9 = ExtensionPreferences & {
  /** Processor Name - Display name for this processor */
  "name"?: string,
  /** Prompts Directory - Absolute path to the directory containing prompt files */
  "directory": string
}
  /** Preferences accessible in the `ask-ai` command */
  export type AskAi = ExtensionPreferences & {
  /** Use App When Available - Use native app instead of web browser when available */
  "useAppWhenAvailable": boolean
}
}

declare namespace Arguments {
  /** Arguments passed to the `manage-ai` command */
  export type ManageAi = {}
  /** Arguments passed to the `manage-input-templates` command */
  export type ManageInputTemplates = {}
  /** Arguments passed to the `processor-1` command */
  export type Processor1 = {}
  /** Arguments passed to the `processor-2` command */
  export type Processor2 = {}
  /** Arguments passed to the `processor-3` command */
  export type Processor3 = {}
  /** Arguments passed to the `processor-4` command */
  export type Processor4 = {}
  /** Arguments passed to the `processor-5` command */
  export type Processor5 = {}
  /** Arguments passed to the `processor-6` command */
  export type Processor6 = {}
  /** Arguments passed to the `processor-7` command */
  export type Processor7 = {}
  /** Arguments passed to the `processor-8` command */
  export type Processor8 = {}
  /** Arguments passed to the `processor-9` command */
  export type Processor9 = {}
  /** Arguments passed to the `ask-ai` command */
  export type AskAi = {
  /** Ask anything... */
  "query": string,
  /** AI provider ID */
  "provider": string
}
}

