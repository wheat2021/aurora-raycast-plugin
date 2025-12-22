import { LocalStorage } from "@raycast/api";

/**
 * 请求结果缓存数据结构
 */
export interface CachedRequestResult {
  timestamp: number;
  promptId: string; // 用于标识是哪个 prompt 的请求
  result: {
    success: boolean;
    method: string;
    url: string;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    data?: unknown;
    error?: string;
  };
}

const CACHE_KEY_PREFIX = "request_result_";
const LATEST_CACHE_KEY = "latest_request_result";
const MAX_CACHE_ITEMS = 10;

/**
 * 保存请求结果到缓存
 */
export async function saveRequestResult(
  promptId: string,
  result: CachedRequestResult["result"],
): Promise<void> {
  const cached: CachedRequestResult = {
    timestamp: Date.now(),
    promptId,
    result,
  };

  // 保存到特定 prompt 的缓存
  await LocalStorage.setItem(
    `${CACHE_KEY_PREFIX}${promptId}`,
    JSON.stringify(cached),
  );

  // 保存为最新的请求结果
  await LocalStorage.setItem(LATEST_CACHE_KEY, JSON.stringify(cached));

  // 清理过期缓存（保留最近的 MAX_CACHE_ITEMS 个）
  await cleanupOldCache();
}

/**
 * 获取指定 prompt 的最新请求结果
 */
export async function getRequestResult(
  promptId: string,
): Promise<CachedRequestResult | null> {
  const cached = await LocalStorage.getItem<string>(
    `${CACHE_KEY_PREFIX}${promptId}`,
  );

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as CachedRequestResult;
  } catch {
    return null;
  }
}

/**
 * 获取最新的请求结果（不限 prompt）
 */
export async function getLatestRequestResult(): Promise<CachedRequestResult | null> {
  const cached = await LocalStorage.getItem<string>(LATEST_CACHE_KEY);

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as CachedRequestResult;
  } catch {
    return null;
  }
}

/**
 * 清除指定 prompt 的缓存结果
 */
export async function clearRequestResult(promptId: string): Promise<void> {
  await LocalStorage.removeItem(`${CACHE_KEY_PREFIX}${promptId}`);

  // 如果清除的是最新结果，也清除 latest
  const latest = await getLatestRequestResult();
  if (latest?.promptId === promptId) {
    await LocalStorage.removeItem(LATEST_CACHE_KEY);
  }
}

/**
 * 清除所有缓存结果
 */
export async function clearAllRequestResults(): Promise<void> {
  const allItems = await LocalStorage.allItems();

  for (const key of Object.keys(allItems)) {
    if (key.startsWith(CACHE_KEY_PREFIX) || key === LATEST_CACHE_KEY) {
      await LocalStorage.removeItem(key);
    }
  }
}

/**
 * 清理过期的缓存（保留最近的 MAX_CACHE_ITEMS 个）
 */
async function cleanupOldCache(): Promise<void> {
  const allItems = await LocalStorage.allItems();

  // 获取所有缓存项
  const cacheItems: Array<{ key: string; cached: CachedRequestResult }> = [];

  for (const [key, value] of Object.entries(allItems)) {
    if (key.startsWith(CACHE_KEY_PREFIX) && key !== LATEST_CACHE_KEY) {
      try {
        const cached = JSON.parse(value) as CachedRequestResult;
        cacheItems.push({ key, cached });
      } catch {
        // 忽略解析错误的项
      }
    }
  }

  // 按时间戳降序排序
  cacheItems.sort((a, b) => b.cached.timestamp - a.cached.timestamp);

  // 删除超出限制的旧缓存
  const itemsToDelete = cacheItems.slice(MAX_CACHE_ITEMS);
  for (const item of itemsToDelete) {
    await LocalStorage.removeItem(item.key);
  }
}
