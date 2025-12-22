import { RequestConfig, PromptValues, PromptInput } from "../types/prompt";
import { valueToCommandString } from "./valueConverter";
import {
  replaceUserVariables,
  replaceRaycastVariables,
} from "./variableReplacer";

/**
 * 替换对象中的所有变量
 * @param obj 对象
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的字段 ID 集合
 * @param inputs 输入字段配置列表
 * @param selection 当前选中的文本（可选）
 * @param clipboard 剪贴板内容（可选）
 * @returns 替换后的对象
 */
function replaceObjectVariables(
  obj: Record<string, unknown>,
  values: PromptValues,
  visibleInputIds: Set<string>,
  inputs: PromptInput[],
  selection?: string,
  clipboard?: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // 先替换 Raycast 内置变量，再替换用户变量
      let replaced = replaceRaycastVariables(value, selection, clipboard);
      replaced = replaceUserVariables(
        replaced,
        values,
        visibleInputIds,
        inputs,
        valueToCommandString,
      );
      result[key] = replaced;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      result[key] = replaceObjectVariables(
        value as Record<string, unknown>,
        values,
        visibleInputIds,
        inputs,
        selection,
        clipboard,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 构建 URL 查询字符串
 * @param query 查询参数对象
 * @returns 查询字符串（不包含 ?）
 */
function buildQueryString(
  query: Record<string, string | number | boolean>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    params.append(key, String(value));
  }

  return params.toString();
}

/**
 * 生成 curl 命令
 * @param config 请求配置
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的字段 ID 集合
 * @param inputs 输入字段配置列表
 * @param selection 当前选中的文本（可选）
 * @param clipboard 剪贴板内容（可选）
 * @returns curl 命令字符串
 */
export function generateCurlCommand(
  config: RequestConfig,
  values: PromptValues,
  visibleInputIds: Set<string>,
  inputs: PromptInput[],
  selection?: string,
  clipboard?: string,
): string {
  // 替换 URL 中的变量（先替换 Raycast 内置变量，再替换用户变量）
  let url = replaceRaycastVariables(config.url, selection, clipboard);
  url = replaceUserVariables(
    url,
    values,
    visibleInputIds,
    inputs,
    valueToCommandString,
  );

  // 处理 query 参数
  if (config.query) {
    const query: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(config.query)) {
      if (typeof value === "string") {
        // 先替换 Raycast 内置变量，再替换用户变量
        let replaced = replaceRaycastVariables(value, selection, clipboard);
        replaced = replaceUserVariables(
          replaced,
          values,
          visibleInputIds,
          inputs,
          valueToCommandString,
        );
        query[key] = replaced;
      } else {
        query[key] = value;
      }
    }

    const queryString = buildQueryString(query);
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // 构建 curl 命令
  const curlParts: string[] = ["curl"];

  // 添加 method
  if (config.method !== "GET") {
    curlParts.push(`-X ${config.method}`);
  }

  // 添加 headers
  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      // 先替换 Raycast 内置变量，再替换用户变量
      let replacedValue = replaceRaycastVariables(value, selection, clipboard);
      replacedValue = replaceUserVariables(
        replacedValue,
        values,
        visibleInputIds,
        inputs,
        valueToCommandString,
      );
      // 使用单引号包裹，并转义其中的单引号
      const escapedValue = replacedValue.replace(/'/g, "'\\''");
      curlParts.push(`-H '${key}: ${escapedValue}'`);
    }
  }

  // 添加 body
  if (config.body) {
    let bodyString: string;

    if (typeof config.body === "string") {
      // 如果 body 是字符串，先替换 Raycast 内置变量，再替换用户变量
      bodyString = replaceRaycastVariables(config.body, selection, clipboard);
      bodyString = replaceUserVariables(
        bodyString,
        values,
        visibleInputIds,
        inputs,
        valueToCommandString,
      );
    } else {
      // 如果 body 是对象，递归替换变量后转为 JSON
      const replacedBody = replaceObjectVariables(
        config.body,
        values,
        visibleInputIds,
        inputs,
        selection,
        clipboard,
      );
      bodyString = JSON.stringify(replacedBody);

      // 如果未设置 Content-Type，添加 JSON Content-Type
      if (!config.headers || !config.headers["Content-Type"]) {
        curlParts.push(`-H 'Content-Type: application/json'`);
      }
    }

    // 转义单引号
    const escapedBody = bodyString.replace(/'/g, "'\\''");
    curlParts.push(`-d '${escapedBody}'`);
  }

  // 添加 URL（放在最后）
  curlParts.push(`'${url}'`);

  return curlParts.join(" \\\n  ");
}

/**
 * 执行 REST API 请求
 * @param config 请求配置
 * @param values 用户输入的表单值
 * @param visibleInputIds 当前可见的字段 ID 集合
 * @param inputs 输入字段配置列表
 * @param selection 当前选中的文本（可选）
 * @param clipboard 剪贴板内容（可选）
 * @returns Promise，包含响应数据
 * @throws 如果请求失败
 */
export async function executeRequest(
  config: RequestConfig,
  values: PromptValues,
  visibleInputIds: Set<string>,
  inputs: PromptInput[],
  selection?: string,
  clipboard?: string,
): Promise<{
  url: string; // 替换后的完整 URL
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
}> {
  // 替换 URL 中的变量（先替换 Raycast 内置变量，再替换用户变量）
  let url = replaceRaycastVariables(config.url, selection, clipboard);
  url = replaceUserVariables(
    url,
    values,
    visibleInputIds,
    inputs,
    valueToCommandString,
  );

  // 处理 query 参数
  if (config.query) {
    const query: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(config.query)) {
      if (typeof value === "string") {
        // 先替换 Raycast 内置变量，再替换用户变量
        let replaced = replaceRaycastVariables(value, selection, clipboard);
        replaced = replaceUserVariables(
          replaced,
          values,
          visibleInputIds,
          inputs,
          valueToCommandString,
        );
        query[key] = replaced;
      } else {
        query[key] = value;
      }
    }

    const queryString = buildQueryString(query);
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // 处理 headers
  const headers: Record<string, string> = {};

  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      // 先替换 Raycast 内置变量，再替换用户变量
      let replaced = replaceRaycastVariables(value, selection, clipboard);
      replaced = replaceUserVariables(
        replaced,
        values,
        visibleInputIds,
        inputs,
        valueToCommandString,
      );
      headers[key] = replaced;
    }
  }

  // 处理 body
  let body: string | undefined;
  let contentType: string | undefined;

  if (config.body) {
    if (typeof config.body === "string") {
      // 如果 body 是字符串，先替换 Raycast 内置变量，再替换用户变量
      body = replaceRaycastVariables(config.body, selection, clipboard);
      body = replaceUserVariables(
        body,
        values,
        visibleInputIds,
        inputs,
        valueToCommandString,
      );
      contentType = headers["Content-Type"] || "text/plain";
    } else {
      // 如果 body 是对象，递归替换变量后转为 JSON
      const replacedBody = replaceObjectVariables(
        config.body,
        values,
        visibleInputIds,
        inputs,
        selection,
        clipboard,
      );
      body = JSON.stringify(replacedBody);
      contentType = headers["Content-Type"] || "application/json";
    }

    // 设置 Content-Type（如果未设置）
    if (contentType && !headers["Content-Type"]) {
      headers["Content-Type"] = contentType;
    }
  }

  // 执行请求
  const timeout = config.timeout || 30000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: config.method,
      headers,
      body: body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 解析响应
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 尝试解析 JSON，如果失败则返回文本
    let data: unknown;
    const contentTypeHeader = response.headers.get("content-type");

    if (contentTypeHeader?.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }

    // 如果响应状态不是 2xx，抛出错误
    if (!response.ok) {
      throw new Error(
        `请求失败: ${response.status} ${response.statusText}\n响应内容: ${
          typeof data === "string" ? data : JSON.stringify(data, null, 2)
        }`,
      );
    }

    return {
      url, // 返回替换后的完整 URL
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`请求超时 (${timeout}ms)`);
      }
      throw error;
    }
    throw new Error("请求失败: 未知错误");
  }
}
