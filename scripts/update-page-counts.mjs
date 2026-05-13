/**
 * 教材PDFのページ数を取得して material_page_counts テーブルに保存する。
 * pdf-lib を使いメタデータのみ読むため軽量・高速。devサーバー不要。
 * 実行: node scripts/update-page-counts.mjs
 * 特定教材のみ: node scripts/update-page-counts.mjs --id=<id>
 */

import { PDFDocument } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(__dirname, '../.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

Object.entries(env).forEach(([k, v]) => { process.env[k] = v; });

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const ID_ARG = process.argv.find(a => a.startsWith('--id='))?.slice(5);

async function fetchMaterials() {
  const { getMaterials } = await import('../lib/notion.ts').catch(() => null)
    ?? await import('../lib/notion.js').catch(() => null)
    ?? (() => { throw new Error('notion.ts/js が見つかりません'); })();
  return getMaterials();
}

async function getPageCount(pdfUrl) {
  const res = await fetch(pdfUrl);
  if (!res.ok) throw new Error(`PDF取得失敗: ${res.status}`);
  const buf = await res.arrayBuffer();
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  return doc.getPageCount();
}

async function savePageCount(matId, pageCount) {
  const { error } = await supabase.from('material_page_counts').upsert(
    { material_id: matId, page_count: pageCount },
    { onConflict: 'material_id' }
  );
  if (error) throw error;
}

async function main() {
  console.log('教材一覧を取得中...');
  let materials = (await fetchMaterials()).filter(m => m.pdfFile);
  if (ID_ARG) {
    materials = materials.filter(m => m.id.startsWith(ID_ARG));
    if (!materials.length) { console.log(`❌ ID "${ID_ARG}" に一致する教材が見つかりません`); process.exit(1); }
  }
  console.log(`PDF付き教材: ${materials.length}件\n`);

  let ok = 0, failed = 0;
  for (const mat of materials) {
    const label = `[${mat.id.slice(0, 8)}] ${mat.title?.slice(0, 30) ?? ''}`;
    process.stdout.write(`${label}... `);
    try {
      const count = await getPageCount(mat.pdfFile);
      await savePageCount(mat.id, count);
      console.log(`✅ ${count}ページ`);
      ok++;
    } catch (e) {
      console.log(`❌ ${e.message}`);
      failed++;
    }
  }

  console.log(`\n完了 — 成功: ${ok}件 / 失敗: ${failed}件`);
}

main().catch(e => { console.error(e); process.exit(1); });
