// 模拟 Raycast 环境中的命令执行
const { executeCommand } = require("./dist/utils/commandExecutor.js");

// 模拟配置
const config = {
  commandLine: "/opt/homebrew/bin/uv",
  args: ["run", "python", "ccusage_display.py"],
  cwd: "/opt/code/ccusage-display",
};

// 模拟空的表单值和输入字段(因为 inputs: [])
const values = {};
const visibleInputIds = new Set();
const inputs = [];

console.log("模拟执行命令配置:");
console.log(JSON.stringify(config, null, 2));
console.log("\n开始执行...\n");

executeCommand(config, values, visibleInputIds, inputs)
  .then(({ stdout, stderr }) => {
    console.log("✅ 命令执行成功\n");
    console.log("=== STDOUT ===");
    console.log(stdout);
    if (stderr) {
      console.log("\n=== STDERR ===");
      console.log(stderr);
    }
  })
  .catch((error) => {
    console.error("❌ 命令执行失败\n");
    console.error("错误信息:", error.message);
    console.error("\n完整错误对象:");
    console.error(error);
  });
