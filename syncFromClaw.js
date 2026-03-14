#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname);

const OPENCLAW_SKILLS_DIR = '/Users/hunter/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/skills';
const PLUGIN_DIR = path.join(PROJECT_ROOT, 'plugins', 'openclaw');

// 获取 OpenClaw 中的所有 skills
function getOpenClawSkills() {
  const skills = [];

  if (!fs.existsSync(OPENCLAW_SKILLS_DIR)) {
    console.error(`OpenClaw skills dir not found: ${OPENCLAW_SKILLS_DIR}`);
    return skills;
  }

  const skillDirs = fs.readdirSync(OPENCLAW_SKILLS_DIR, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

  for (const skillName of skillDirs) {
    const skillPath = path.join(OPENCLAW_SKILLS_DIR, skillName);
    const skillMdPath = path.join(skillPath, 'SKILL.md');

    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf-8');

      // 提取 name
      const nameMatch = content.match(/^---\nname:\s*(.+)/m);
      const name = nameMatch ? nameMatch[1].trim() : skillName;

      // 提取 description
      const descMatch = content.match(/^---\n[\s\S]*?description:\s*(.+)/m);
      const description = descMatch ? descMatch[1].trim().replace(/["']/g, '') : '';

      skills.push({
        skillName,
        skillPath,
        skillMdPath,
        name,
        description: description.substring(0, 100)
      });
    }
  }

  return skills;
}

// 同步 skill 到本地项目
function syncSkillToProject(skill) {
  // 创建插件目录结构
  const pluginPath = PLUGIN_DIR;

  if (!fs.existsSync(pluginPath)) {
    fs.mkdirSync(pluginPath, { recursive: true });
  }

  const destPath = path.join(pluginPath, skill.skillName);

  if (fs.existsSync(destPath)) {
    console.log(`  [SKIP] ${skill.skillName} already exists at ${destPath}`);
    return false;
  }

  // 复制整个 skill 目录
  fs.cpSync(skill.skillPath, destPath, { recursive: true });
  console.log(`  [SYNC] ${skill.skillName} -> ${destPath}`);
  return true;
}

// 刷新/覆盖同步 skill
function refreshSkillToProject(skill) {
  const pluginPath = PLUGIN_DIR;
  const destPath = path.join(pluginPath, skill.skillName);

  if (!fs.existsSync(destPath)) {
    console.log(`  [ERROR] ${skill.skillName} not found at ${destPath}, syncing...`);
    return syncSkillToProject(skill);
  }

  // 删除旧目录
  fs.rmSync(destPath, { recursive: true, force: true });
  // 复制新的
  fs.cpSync(skill.skillPath, destPath, { recursive: true });
  console.log(`  [REFRESH] ${skill.skillName} -> ${destPath}`);
  return true;
}

// 删除已同步的 skill
function deleteSyncedSkill(skill) {
  const pluginPath = PLUGIN_DIR;
  const destPath = path.join(pluginPath, skill.skillName);

  if (!fs.existsSync(destPath)) {
    console.log(`  [SKIP] ${skill.skillName} not found at ${destPath}`);
    return false;
  }

  fs.rmSync(destPath, { recursive: true, force: true });
  console.log(`  [DELETE] ${skill.skillName}`);
  return true;
}

// 列出所有 skills
function listSkills(skills) {
  console.log(`\nFound ${skills.length} skills in OpenClaw:\n`);
  skills.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.skillName}`);
    console.log(`     ${s.description}`);
    console.log();
  });
}

// 获取已同步的 skills - 检查 plugins/openclaw 目录
function getSyncedSkills() {
  const synced = new Set();
  const openclawDir = path.join(PROJECT_ROOT, 'plugins', 'openclaw');

  if (!fs.existsSync(openclawDir)) {
    return synced;
  }
  const dirs = fs.readdirSync(openclawDir, { withFileTypes: true });
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      synced.add(dir.name);
    }
  }
  return synced;
}

// 交互式选择 skills (使用 inquirer)
async function interactiveSelect(skills, syncedSkills) {
  // 分离未同步和已同步
  const unsynced = skills.filter(s => !syncedSkills.has(s.skillName));
  const alreadySynced = skills.filter(s => syncedSkills.has(s.skillName));

  // 第一步：选择操作类型
  const unsyncedCount = unsynced.length;
  const syncedCount = alreadySynced.length;

  const operationChoices = [
    { name: `1. 同步新 skill (${unsyncedCount}个未同步)`, value: 'sync', description: '从 OpenClaw 同步新的 skills' },
  ];
  if (syncedCount > 0) {
    operationChoices.push(
      { name: `2. 刷新已同步 (${syncedCount}个) - 覆盖更新`, value: 'refresh', description: '重新同步已存在的 skills (源可能已更新)' },
      { name: `3. 删除已同步 (${syncedCount}个)`, value: 'delete', description: '删除已同步的 skills' }
    );
  }

  const helpText = `
说明:
  1. 同步新 skill - 从 OpenClaw 下载未同步的 skills
  2. 刷新已同步 - 重新下载已存在的 skills (如果源文件已更新)
  3. 删除已同步 - 删除本地已同步的 skills (不是从 OpenClaw 删除)

当前状态: ${unsyncedCount}个未同步, ${syncedCount}个已同步
`;

  console.log(helpText);

  const operationAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'operation',
      message: '选择操作类型 (输入数字或上下键选择):',
      choices: operationChoices,
      default: 0
    }
  ]);

  // 处理用户输入 "1", "2", "3" 或 value 'sync', 'refresh', 'delete'
  let operation = operationAnswer.operation;
  if (operation === '1' || operation === 'sync') operation = 'sync';
  else if (operation === '2' || operation === 'refresh') operation = 'refresh';
  else if (operation === '3' || operation === 'delete') operation = 'delete';

  // 第二步：根据操作类型选择具体的 skills
  let targetSkills = [];
  if (operation === 'sync') {
    targetSkills = unsynced;
  } else if (operation === 'refresh' || operation === 'delete') {
    targetSkills = alreadySynced;
  }

  if (targetSkills.length === 0) {
    console.log('\n没有可操作的 skills。');
    return null;
  }

  // 构建 choices
  const choices = targetSkills.map(s => ({
    name: s.skillName,
    value: s.skillName,
    short: s.skillName,
    description: s.description
  }));

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'skills',
      message: `选择要${operation === 'sync' ? '同步' : operation === 'refresh' ? '刷新' : '删除'}的 skills:`,
      choices: choices,
      default: [],
      pageSize: 20
    }
  ]);

  if (answers.skills.length === 0) {
    console.log('\n未选择任何 skill。');
    return null;
  }

  // 返回带操作类型的结果
  return answers.skills.map(name => ({
    skill: skills.find(s => s.skillName === name),
    action: operation
  }));
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  // 帮助信息
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node syncFromClaw.js [options] [skill-names...]

Options:
  -l, --list          List all available skills in OpenClaw
  -a, --all           Sync all skills
  -h, --help          Show this help

Examples:
  node syncFromClaw.js --list
  node syncFromClaw.js github slack discord
  node syncFromClaw.js --all
`);
    return;
  }

  console.log('\n=== Sync Skills from OpenClaw ===\n');

  // 获取 OpenClaw 中的 skills
  const skills = getOpenClawSkills();

  if (skills.length === 0) {
    console.log('No skills found in OpenClaw.');
    return;
  }

  // --list 模式
  if (args.includes('--list') || args.includes('-l')) {
    listSkills(skills);
    return;
  }

  // --interactive 模式 (默认)
  const syncedSkills = getSyncedSkills();

  let selectedSkills = [];

  // 如果有命令行参数，使用命令行模式，否则进入交互模式
  if (args.includes('--all') || args.includes('-a')) {
    selectedSkills = skills;
  } else if (args.length > 0) {
    // 根据名称过滤
    selectedSkills = skills.filter(s => args.includes(s.skillName));
  } else {
    // 交互模式
    selectedSkills = await interactiveSelect(skills, syncedSkills);
    if (selectedSkills === null) {
      console.log('\n已退出。');
      return;
    }
    if (selectedSkills.length === 0) {
      console.log('\n未选择任何 skill。');
      return;
    }
  }

  if (selectedSkills.length === 0) {
    console.log('No skills selected. Use --list to see available skills, or specify skill names.');
    console.log('Example: node syncFromClaw.js github slack');
    return;
  }

  console.log(`Target: ${PLUGIN_DIR}`);

  // 统计各操作数量
  const syncItems = selectedSkills.filter(item => item.action === 'sync');
  const refreshItems = selectedSkills.filter(item => item.action === 'refresh');
  const deleteItems = selectedSkills.filter(item => item.action === 'delete');

  if (syncItems.length > 0) {
    console.log(`\n=== Syncing ${syncItems.length} skill(s) ===\n`);
    for (const item of syncItems) {
      syncSkillToProject(item.skill);
    }
  }

  if (refreshItems.length > 0) {
    console.log(`\n=== Refreshing ${refreshItems.length} skill(s) ===\n`);
    for (const item of refreshItems) {
      refreshSkillToProject(item.skill);
    }
  }

  if (deleteItems.length > 0) {
    console.log(`\n=== Deleting ${deleteItems.length} skill(s) ===\n`);
    for (const item of deleteItems) {
      deleteSyncedSkill(item.skill);
    }
  }

  const totalCount = selectedSkills.length;
  console.log(`\nProcessed ${totalCount} skill(s)`);

  // 创建 package.json（如果不存在）
  const pkgPath = path.join(PLUGIN_DIR, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    const pkg = {
      name: 'openclaw',
      version: '1.0.0',
      description: 'Skills synced from OpenClaw',
      type: 'module'
    };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log(`Created ${pkgPath}`);
  }

  console.log('\n=== Done ===\n');
}

main().catch(console.error);
