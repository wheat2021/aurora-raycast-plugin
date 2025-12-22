/**
 * Markdown Builder - 用于构建 Markdown 内容的工具类
 *
 * 提供链式调用的 API 来构建格式化的 Markdown 文本
 *
 * @example
 * ```typescript
 * const markdown = new MarkdownBuilder()
 *   .title('请求成功', 1, '✅')
 *   .heading('响应数据', '📦')
 *   .codeBlock(JSON.stringify(data, null, 2), 'json')
 *   .separator()
 *   .build();
 * ```
 */
export class MarkdownBuilder {
  private sections: string[] = [];

  /**
   * 添加标题
   * @param text - 标题文本
   * @param level - 标题级别 (1-6)，默认为 1
   * @param emoji - 可选的 emoji 前缀
   * @returns this - 支持链式调用
   */
  title(text: string, level: number = 1, emoji?: string): this {
    const prefix = '#'.repeat(Math.max(1, Math.min(6, level)));
    this.sections.push(`${prefix} ${emoji ? emoji + ' ' : ''}${text}\n`);
    return this;
  }

  /**
   * 添加二级标题（快捷方法）
   * @param text - 标题文本
   * @param emoji - 可选的 emoji 前缀
   * @returns this - 支持链式调用
   */
  heading(text: string, emoji?: string): this {
    this.sections.push(`## ${emoji ? emoji + ' ' : ''}${text}\n`);
    return this;
  }

  /**
   * 添加代码块
   * @param content - 代码内容
   * @param language - 可选的语言标识符（如 'json', 'bash', 'typescript'）
   * @returns this - 支持链式调用
   */
  codeBlock(content: string, language?: string): this {
    const lang = language || '';
    this.sections.push(`\`\`\`${lang}`);
    this.sections.push(content);
    this.sections.push('```');
    return this;
  }

  /**
   * 添加普通文本
   * @param content - 文本内容
   * @returns this - 支持链式调用
   */
  text(content: string): this {
    this.sections.push(content);
    return this;
  }

  /**
   * 添加无序列表
   * @param items - 列表项数组
   * @returns this - 支持链式调用
   */
  list(items: string[]): this {
    items.forEach(item => this.sections.push(`- ${item}`));
    return this;
  }

  /**
   * 添加单个列表项
   * @param item - 列表项内容
   * @returns this - 支持链式调用
   */
  listItem(item: string): this {
    this.sections.push(`- ${item}`);
    return this;
  }

  /**
   * 添加空行分隔符
   * @returns this - 支持链式调用
   */
  separator(): this {
    this.sections.push('');
    return this;
  }

  /**
   * 添加内联代码
   * @param code - 代码文本
   * @returns 格式化的内联代码字符串
   */
  static inlineCode(code: string): string {
    return `\`${code}\``;
  }

  /**
   * 添加粗体文本
   * @param text - 文本内容
   * @returns 格式化的粗体字符串
   */
  static bold(text: string): string {
    return `**${text}**`;
  }

  /**
   * 添加斜体文本
   * @param text - 文本内容
   * @returns 格式化的斜体字符串
   */
  static italic(text: string): string {
    return `_${text}_`;
  }

  /**
   * 条件添加内容
   * @param condition - 条件判断
   * @param callback - 当条件为真时执行的回调函数
   * @returns this - 支持链式调用
   */
  if(condition: boolean, callback: (builder: this) => void): this {
    if (condition) {
      callback(this);
    }
    return this;
  }

  /**
   * 构建最终的 Markdown 字符串
   * @returns 完整的 Markdown 内容
   */
  build(): string {
    return this.sections.join('\n');
  }
}
