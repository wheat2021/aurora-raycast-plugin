#!/usr/bin/env python3
"""
Aurora Input Processor Deeplink 测试脚本
"""

import json
import subprocess
from urllib.parse import quote

def open_deeplink(prompt_path: str, inputs: dict = None):
    """
    打开 Aurora Input Processor deeplink

    Args:
        prompt_path: 提示词配置文件的绝对路径
        inputs: 输入参数字典（可选）
    """
    # 构建 arguments 对象
    args = {"promptPath": prompt_path}

    # 如果提供了 inputs，将其转为 JSON 字符串
    if inputs:
        args["inputs"] = json.dumps(inputs, ensure_ascii=False)

    # 编码整个 arguments 对象
    args_json = json.dumps(args, ensure_ascii=False)
    args_encoded = quote(args_json)

    # 构建完整的 deeplink URL
    url = f"raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments={args_encoded}"

    print(f"打开 deeplink URL:")
    print(f"  Prompt: {prompt_path}")
    if inputs:
        print(f"  Inputs: {inputs}")
    print(f"\nURL: {url}\n")

    # 打开 URL
    subprocess.run(["open", url])


if __name__ == "__main__":
    # 配置文件路径
    prompt_path = "/opt/Notes/Prompts/exec/git modify last.md"

    # 测试 1: 仅传递 promptPath（会打开表单，显示默认值）
    print("=" * 60)
    print("测试 1: 仅传递 promptPath")
    print("=" * 60)
    open_deeplink(prompt_path)

    # 取消注释下面的代码来测试其他场景

    # # 测试 2: 传递部分参数（会打开表单，显示警告）
    # print("=" * 60)
    # print("测试 2: 传递部分参数")
    # print("=" * 60)
    # open_deeplink(prompt_path, {
    #     "commit_msg": "测试提交信息"
    # })

    # # 测试 3: 传递所有必填参数（会自动执行）
    # print("=" * 60)
    # print("测试 3: 传递所有必填参数（自动执行）")
    # print("=" * 60)
    # open_deeplink(prompt_path, {
    #     "repo_path": "/opt/code/aurora-raycast-plugin",
    #     "commit_msg": "完整的提交信息"
    # })
