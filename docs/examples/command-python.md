---
title: Python 数据处理
formDescription: 执行 Python 数据处理脚本
command:
  commandLine: /usr/local/bin/python3
  args:
    - "{{script_path}}"
    - "--input"
    - "{{input_file}}"
    - "--output"
    - "{{output_file}}"
    - "--format"
    - "{{output_format}}"
  envs:
    DATA_SOURCE: "{{data_source}}"
    API_KEY: "{{api_key}}"
    DEBUG_MODE: "{{enable_debug}}"
  cwd: "{{working_dir}}"
  timeout: 120000
inputs:
  - id: working_dir
    label: 工作目录
    type: text
    required: true
    default: /opt/data
    description: 脚本执行的工作目录
  - id: script_path
    label: 脚本路径
    type: text
    required: true
    default: /opt/scripts/process_data.py
    description: Python 脚本的绝对路径
  - id: input_file
    label: 输入文件
    type: text
    required: true
    description: 输入数据文件路径
  - id: output_file
    label: 输出文件
    type: text
    required: true
    description: 输出文件路径
  - id: output_format
    label: 输出格式
    type: select
    required: true
    options:
      - value: json
        label: JSON
        isDefault: true
      - value: csv
        label: CSV
      - value: xml
        label: XML
      - value: parquet
        label: Parquet
  - id: data_source
    label: 数据源
    type: select
    required: true
    options:
      - value: local
        label: 本地文件
        isDefault: true
        extraInputs: []
      - value: database
        label: 数据库
        extraInputs: [db_config]
      - value: api
        label: API
        extraInputs: [api_key]
  - id: db_config
    label: 数据库配置
    type: text
    isExtraInput: true
    description: 数据库连接字符串
  - id: api_key
    label: API Key
    type: text
    isExtraInput: true
    description: API 访问密钥
  - id: enable_debug
    label: 启用调试模式
    type: checkbox
    default: false
    description: 输出详细的调试信息
---

# Python 数据处理

这个配置允许你执行 Python 数据处理脚本，支持多种数据源和输出格式。

## 使用说明

1. 设置工作目录和脚本路径
2. 指定输入和输出文件路径
3. 选择输出格式
4. 选择数据源类型
   - 如果选择"数据库"，会显示数据库配置字段
   - 如果选择"API"，会显示 API Key 字段
5. 按 Enter 或 Cmd+Enter 执行脚本

## 配置说明

- **commandLine**: Python 3 解释器路径
- **args**: 传递脚本路径和命令行参数
- **cwd**: 在指定工作目录下执行
- **envs**: 设置数据源和认证相关的环境变量
- **timeout**: 设置 2 分钟超时

## 条件字段 (Extra Inputs)

根据选择的数据源类型，会动态显示不同的字段：

- **本地文件**: 无额外字段
- **数据库**: 显示"数据库配置"字段
- **API**: 显示"API Key"字段

## Python 脚本示例

```python
#!/usr/bin/env python3
import sys
import os
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--format', required=True)
    args = parser.parse_args()

    # 从环境变量获取配置
    data_source = os.getenv('DATA_SOURCE', 'local')
    api_key = os.getenv('API_KEY', '')
    debug_mode = os.getenv('DEBUG_MODE') == 'true'

    if debug_mode:
        print(f"Data source: {data_source}")
        print(f"Input: {args.input}")
        print(f"Output: {args.output}")
        print(f"Format: {args.format}")

    # 处理数据...

if __name__ == '__main__':
    main()
```

## 注意事项

- 确保 Python 3 已安装且路径正确
- 脚本文件需要有可执行权限（`chmod +x`）
- 确保输入文件存在且可读
- 输出文件的目录需要有写入权限
