/**
 * Processor 配置信息
 */
export interface ProcessorConfig {
  id: string; // 唯一标识
  name: string; // 显示名称
  directory: string; // 目标目录路径
  icon?: string; // 可选图标
  createdAt: number; // 创建时间戳
}
