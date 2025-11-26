import { LocalStorage } from "@raycast/api";
import { ProcessorConfig } from "../types/processor";

const STORAGE_KEY = "processors";

/**
 * 读取所有 processor 配置
 */
export async function listProcessors(): Promise<ProcessorConfig[]> {
  const data = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!data) {
    return [];
  }

  try {
    const processors = JSON.parse(data);
    return Array.isArray(processors) ? processors : [];
  } catch (error) {
    console.error("Failed to parse processors from LocalStorage:", error);
    return [];
  }
}

/**
 * 添加新的 processor 配置
 */
export async function addProcessor(config: ProcessorConfig): Promise<void> {
  const processors = await listProcessors();
  processors.push(config);
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(processors));
}

/**
 * 删除 processor 配置
 */
export async function removeProcessor(id: string): Promise<void> {
  const processors = await listProcessors();
  const filtered = processors.filter((p) => p.id !== id);
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * 获取单个 processor 配置
 */
export async function getProcessor(
  id: string,
): Promise<ProcessorConfig | undefined> {
  const processors = await listProcessors();
  return processors.find((p) => p.id === id);
}
