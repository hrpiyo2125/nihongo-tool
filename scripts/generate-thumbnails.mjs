/**
 * 教材PDFの1ページ目をPNGサムネイルとして生成し Supabase Storage にアップロードする。
 * 実行: node scripts/generate-thumbnails.mjs
 * 既存サムネイルはスキップするので、新規教材追加時も安全に再実行できる。
 */

import { pdf } from 'pdf-to-img';
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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'thumbnails';

// notion.ts が読む環境変数をセット
Object.entries(env).forEach(([k, v]) => { process.env[k] = v; });

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fetchMaterials() {
  const { getMaterials } = await import('../lib/notion.ts').catch(() => null)
    ?? await import('../lib/notion.js').catch(() => null)
    ?? { getMaterials: null };

  if (!getMaterials) {
    // notion.ts が直接 import できない場合は API から取得
    const res = await fetch('http://localhost:3000/api/materials');
    if (!res.ok) throw new Error('API から教材を取得できませんでした。先に dev サーバーを起動してください: npm run dev');
    return res.json();
  }
  return getMaterials();
}

async function thumbnailExists(id) {
  const { data } = await supabase.storage.from(BUCKET).list('', { search: `${id}.png` });
  return data?.some(f => f.name === `${id}.png`) ?? false;
}

async function generateThumbnail(pdfUrl) {
  const proxyUrl = `http://localhost:3000/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`PDF取得失敗: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const doc = await pdf(buf, { scale: 1.5 });
  // 最初のページだけ取得
  for await (const page of doc) {
    return page; // PNG Buffer
  }
  throw new Error('ページが取得できませんでした');
}

async function main() {
  console.log('教材一覧を取得中...');
  const materials = await fetchMaterials();
  const withPdf = materials.filter(m => m.pdfFile);
  console.log(`PDF付き教材: ${withPdf.length}件`);

  let generated = 0, skipped = 0, failed = 0;

  for (const mat of withPdf) {
    process.stdout.write(`[${mat.id.slice(0, 8)}] ${mat.title?.slice(0, 30) ?? ''}... `);

    if (await thumbnailExists(mat.id)) {
      console.log('スキップ（既存）');
      skipped++;
      continue;
    }

    try {
      const png = await generateThumbnail(mat.pdfFile, mat.id);
      const { error } = await supabase.storage.from(BUCKET).upload(`${mat.id}.png`, png, {
        contentType: 'image/png',
        upsert: false,
      });
      if (error) throw error;
      console.log('✅ 生成完了');
      generated++;
    } catch (e) {
      console.log(`❌ 失敗: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n完了 — 生成: ${generated}件 / スキップ: ${skipped}件 / 失敗: ${failed}件`);
}

main().catch(e => { console.error(e); process.exit(1); });
