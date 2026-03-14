#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname);

// OpenClaw 配置路径
const OPENCLAW_CONFIG_DIR = path.join(process.env.HOME || '/Users/hunter', '.openclaw');
const OPENCLAW_CONFIG_FILE = path.join(OPENCLAW_CONFIG_DIR, 'openclaw.json');
const OPENCLAW_SKILLS_DIR = path.join(process.env.HOME || '/Users/hunter', '.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/skills');

// 获取项目中的所有 skills
function getProjectSkills() {
  const pluginsDir = path.join(PROJECT_ROOT, 'plugins');
  const skills = [];

  if (!fs.existsSync(pluginsDir)) {
    return skills;
  }

  const pluginDirs = fs.readdirSync(pluginsDir, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

  for (const pluginName of pluginDirs) {
    const skillDir = path.join(pluginsDir, pluginName, 'skills');
    if (fs.existsSync(skillDir)) {
      const skillDirs = fs.readdirSync(skillDir, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

      for (const skillName of skillDirs) {
        const skillPath = path.join(skillDir, skillName);
        const skillMdPath = path.join(skillPath, 'SKILL.md');

        if (fs.existsSync(skillMdPath)) {
          // 读取 SKILL.md 获取 name
          const content = fs.readFileSync(skillMdPath, 'utf-8');
          const nameMatch = content.match(/^---\nname:\s*(.+)/m);
          const name = nameMatch ? nameMatch[1].trim() : skillName;

          // 读取 description
          const descMatch = content.match(/^---\n[\s\S]*?description:\s*(.+)/m);
          const description = descMatch ? descMatch[1].trim().replace(/["']/g, '') : '';

          skills.push({
            pluginName,
            skillName,
            skillPath,
            skillMdPath,
            name,
            description: description.substring(0, 100)
          });
        }
      }
    }
  }

  return skills;
}

// 读取 OpenClaw 配置
function getOpenClawConfig() {
  if (fs.existsSync(OPENCLAW_CONFIG_FILE)) {
    const content = fs.readFileSync(OPENCLAW_CONFIG_FILE, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (e) {
      return {};
    }
  }
  return {};
}

// 保存 OpenClaw 配置
function saveOpenClawConfig(config) {
  if (!fs.existsSync(OPENCLAW_CONFIG_DIR)) {
    fs.mkdirSync(OPENCLAW_CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(OPENCLAW_CONFIG_FILE, JSON.stringify(config, null, 2));
}

// 同步 skill 到 OpenClaw
function syncSkillToOpenClaw(skill, targetDir) {
  const destPath = path.join(targetDir, skill.name);

  if (fs.existsSync(destPath)) {
    console.log(`  [SKIP] ${skill.name} already exists at ${destPath}`);
    return false;
  }

  // 复制整个 skill 目录
  fs.cpSync(skill.skillPath, destPath, { recursive: true });
  console.log(`  [SYNC] ${skill.name} -> ${destPath}`);
  return true;
}

// 检查 skill 是否已在 OpenClaw 中
function isSkillInOpenClaw(skillName) {
  const skillPath = path.join(OPENCLAW_SKILLS_DIR, skillName);
  return fs.existsSync(skillPath);
}

// 列出所有 skills
function listSkills(skills) {
  console.log(`\nFound ${skills.length} skills in project:\n`);
  skills.forEach((s, i) => {
    const exists = isSkillInOpenClaw(s.name) ? ' [already in OpenClaw]' : '';
    console.log(`  ${i + 1}. ${s.name} (${s.pluginName})${exists}`);
    console.log(`     ${s.description}`);
    console.log();
  });
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  // 帮助信息
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node sync2claw.js [options] [skill-names...]

Options:
  -l, --list          List all available skills
  -a, --all           Sync all skills
  -t, --target DIR    Target directory (default: ./openclaw-skills)
  -b, --builtin       Sync to OpenClaw built-in skills dir (requires write permission)
  -h, --help          Show this help

Examples:
  node sync2claw.js --list
  node sync2claw.js kv_skill string_skill
  node sync2claw.js --all
  node sync2claw.js -b kv_skill
`);
    return;
  }

  console.log('\n=== Sync Skills to OpenClaw ===\n');

  // 1. 获取项目中的所有 skills
  const skills = getProjectSkills();

  if (skills.length === 0) {
    console.log('No skills found in project.');
    return;
  }

  // --list 模式
  if (args.includes('--list') || args.includes('-l')) {
    listSkills(skills);
    return;
  }

  // 确定要同步的 skills
  let selectedSkills = [];

  if (args.includes('--all') || args.includes('-a')) {
    selectedSkills = skills;
  } else if (args.length > 0) {
    // 根据名称过滤
    const targetNames = args.filter(a => !a.startsWith('-'));
    selectedSkills = skills.filter(s => targetNames.includes(s.name));
  }

  if (selectedSkills.length === 0) {
    console.log('No skills selected. Use --list to see available skills, or specify skill names.');
    console.log('Example: node sync2claw.js kv_skill string_skill');
    return;
  }

  // 确定目标目录
  let targetDir;
  let addToExtraDirs = false;

  if (args.includes('--builtin') || args.includes('-b')) {
    targetDir = OPENCLAW_SKILLS_DIR;
  } else {
    const customDir = path.join(PROJECT_ROOT, 'openclaw-skills');
    if (!fs.existsSync(customDir)) {
      fs.mkdirSync(customDir, { recursive: true });
    }
    targetDir = customDir;
    addToExtraDirs = true;
  }

  console.log(`Target: ${targetDir}`);
  console.log(`\n=== Syncing ${selectedSkills.length} skill(s) ===\n`);

  let syncedCount = 0;
  for (const skill of selectedSkills) {
    if (syncSkillToOpenClaw(skill, targetDir)) {
      syncedCount++;
    }
  }

  console.log(`\nSynced ${syncedCount} skill(s).`);

  // 如果是自定义目录，更新配置
  if (addToExtraDirs) {
    const config = getOpenClawConfig();
    if (!config.skills) config.skills = {};
    if (!config.skills.load) config.skills.load = {};

    const extraDirs = config.skills.load.extraDirs || [];
    if (!extraDirs.includes(targetDir)) {
      extraDirs.push(targetDir);
      config.skills.load.extraDirs = extraDirs;
      saveOpenClawConfig(config);
      console.log(`\nUpdated ${OPENCLAW_CONFIG_FILE} to include extraDirs.`);
    } else {
      console.log(`\n${targetDir} already in extraDirs.`);
    }
  }

  console.log('\n=== Done ===\n');
}

main().catch(console.error);
