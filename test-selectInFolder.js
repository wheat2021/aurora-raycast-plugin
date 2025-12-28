#!/usr/bin/env node

/**
 * 测试脚本：验证 selectInFolder 的初始化逻辑
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 读取配置文件
const configPath = '/opt/Notes/Prompts/exec/git commit.md';
const fileContent = fs.readFileSync(configPath, 'utf-8');
const { data: frontmatter } = matter(fileContent);

console.log('=== 配置文件内容 ===');
console.log('Title:', frontmatter.title);
console.log('\n=== Inputs 配置 ===');
frontmatter.inputs.forEach((input, index) => {
    console.log(`\n[${index}] ${input.id}:`);
    console.log('  - type:', input.type);
    console.log('  - default:', input.default);
    console.log('  - preserveDefault:', input.preserveDefault);
});

// 模拟初始化逻辑
console.log('\n=== 模拟初始化逻辑 ===');
const defaultValues = {};
frontmatter.inputs.forEach((input) => {
    if (input.default !== undefined) {
        defaultValues[input.id] = input.default;
        console.log(`✓ 字段 ${input.id} (${input.type}) 设置 default:`, input.default);
    }
});

console.log('\n=== 最终初始化的 defaultValues ===');
console.log(JSON.stringify(defaultValues, null, 2));

// 检查 repo_path 字段
console.log('\n=== repo_path 字段检查 ===');
const repoPathInput = frontmatter.inputs.find(i => i.id === 'repo_path');
console.log('配置中的 default 值:', repoPathInput.default);
console.log('初始化后的值:', defaultValues.repo_path);
console.log('两者是否一致:', repoPathInput.default === defaultValues.repo_path);

// 读取文件夹选项
console.log('\n=== 文件夹选项 ===');
const folder = repoPathInput.folder;
if (fs.existsSync(folder)) {
    const entries = fs.readdirSync(folder, { withFileTypes: true });
    const dirs = entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.'))
        .map(e => path.join(folder, e.name))
        .sort();

    console.log(`文件夹 ${folder} 中的目录 (${dirs.length} 个):`);
    dirs.forEach((dir, index) => {
        const isDefault = dir === repoPathInput.default;
        console.log(`  ${isDefault ? '→' : ' '} [${index}] ${dir}`);
    });

    console.log('\ndefault 值是否在选项中:', dirs.includes(repoPathInput.default));
} else {
    console.log(`文件夹不存在: ${folder}`);
}
