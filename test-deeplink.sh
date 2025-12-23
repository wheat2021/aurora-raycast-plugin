#!/bin/bash

# Aurora Input Processor Deeplink 测试脚本

# 配置
PROMPT_PATH="/opt/Notes/Prompts/exec/git modify last.md"

# 方法 1: 仅传递 promptPath（会打开表单，显示默认值）
echo "测试 1: 仅传递 promptPath"
ARGS=$(node -e "console.log(encodeURIComponent(JSON.stringify({promptPath: '$PROMPT_PATH'})))")
URL="raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments=$ARGS"
echo "URL: $URL"
echo ""

# 方法 2: 传递 promptPath 和部分 inputs
echo "测试 2: 传递 promptPath 和部分参数"
INPUTS_JSON='{"commit_msg":"测试提交信息"}'
ARGS=$(node -e "
  const args = {
    promptPath: '$PROMPT_PATH',
    inputs: '$INPUTS_JSON'
  };
  console.log(encodeURIComponent(JSON.stringify(args)));
")
URL="raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments=$ARGS"
echo "URL: $URL"
echo ""

# 方法 3: 传递所有必填参数（会自动执行）
echo "测试 3: 传递所有必填参数（自动执行）"
INPUTS_JSON='{"repo_path":"/opt/code/aurora-raycast-plugin","commit_msg":"完整的提交信息"}'
ARGS=$(node -e "
  const args = {
    promptPath: '$PROMPT_PATH',
    inputs: '$INPUTS_JSON'
  };
  console.log(encodeURIComponent(JSON.stringify(args)));
")
URL="raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments=$ARGS"
echo "URL: $URL"
echo ""

# 执行其中一个测试（默认执行测试1）
echo "执行测试 1..."
ARGS=$(node -e "console.log(encodeURIComponent(JSON.stringify({promptPath: '$PROMPT_PATH'})))")
open "raycast://extensions/wheat2021/aurora-input-processor/processor-1?arguments=$ARGS"
