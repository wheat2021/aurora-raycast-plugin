#!/bin/bash

# 简单的测试脚本，用于验证 command 功能
# 该脚本会：
# 1. 输出接收到的命令行参数
# 2. 输出接收到的环境变量
# 3. 显示当前工作目录

echo "=== Command 功能测试脚本 ==="
echo ""

echo "命令行参数："
echo "  参数数量: $#"
for i in "$@"; do
  echo "  - $i"
done
echo ""

echo "环境变量："
echo "  USER_NAME: ${USER_NAME:-未设置}"
echo "  USER_EMAIL: ${USER_EMAIL:-未设置}"
echo "  PROJECT_NAME: ${PROJECT_NAME:-未设置}"
echo "  DEBUG_MODE: ${DEBUG_MODE:-未设置}"
echo ""

echo "工作目录："
echo "  当前目录: $(pwd)"
echo ""

echo "执行结果："
echo "  状态: 成功 ✓"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "=== 测试完成 ==="

# 返回成功状态
exit 0
