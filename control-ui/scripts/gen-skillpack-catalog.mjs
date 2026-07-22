#!/usr/bin/env node
/**
 * 从仓库 skill-packs/ 汇总生成前端技能页使用的岗位包目录：
 *   control-ui/public/data/skill-packs.json
 *
 * 数据源为 51-posts.json + 各岗位 post.json（技能名、触发词、描述）。
 * 岗位包内容变更后运行 `npm run gen:catalog` 重新生成。
 */
import fs from 'node:fs';
import path from 'node:path';

const PACK_ROOT = path.resolve(import.meta.dirname, '../../skill-packs');
const OUT_FILE = path.resolve(import.meta.dirname, '../public/data/skill-packs.json');

const indexFile = path.join(PACK_ROOT, '51-posts.json');
const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

const packs = index.posts.map((p) => {
  const post = JSON.parse(fs.readFileSync(path.join(PACK_ROOT, p.dir, 'post.json'), 'utf8'));
  return {
    id: post.id,
    name: post.name,
    icon: post.icon,
    category: post.category,
    priority: post.priority,
    version: post.version,
    description: post.description,
    skills: post.skills.map((s) => ({ name: s.name, triggers: s.triggers })),
    knowledge: post.knowledge,
  };
});

const catalog = {
  version: index.version,
  total: packs.length,
  generatedFrom: 'skill-packs/51-posts.json + post.json（由 gen-skillpack-catalog.mjs 生成，勿手改）',
  packs,
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`✅ 已生成 ${path.relative(process.cwd(), OUT_FILE)}（${packs.length} 个岗位包）`);
