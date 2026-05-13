/**
 * 教材PDFの各ページをPNGサムネイルとして生成し Supabase Storage にアップロードする。
 * カード一覧用: {id}.png (1ページ目)
 * モーダル用:   {id}-p1.png, {id}-p2.png, {id}-p3.png (最大3ページ)
 * 実行: node scripts/generate-thumbnails.mjs
 * 既存サムネイルはスキップするので、新規教材追加時も安全に再実行できる。
 *
 * ページ数の保存は別スクリプト: node scripts/update-page-counts.mjs
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
const MAX_PAGES = 3;

Object.entries(env).forEach(([k, v]) => { process.env[k] = v; });

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const FORCE = process.argv.includes('--force');
const ID_ARG = process.argv.find(a => a.startsWith('--id='))?.slice(5);

async function fetchMaterials() {
  const { getMaterials } = await import('../lib/notion.ts').catch(() => null)
    ?? await import('../lib/notion.js').catch(() => null)
    ?? { getMaterials: null };

  if (!getMaterials) {
    const res = await fetch('http://localhost:3000/api/materials');
    if (!res.ok) throw new Error('API から教材を取得できませんでした。先に dev サーバーを起動してください: npm run dev');
    return res.json();
  }
  return getMaterials();
}

async function fileExists(name) {
  const { data } = await supabase.storage.from(BUCKET).list('', { search: name });
  return data?.some(f => f.name === name) ?? false;
}

async function uploadPng(name, buf) {
  const { error } = await supabase.storage.from(BUCKET).upload(name, buf, {
    contentType: 'image/png',
    upsert: FORCE,
    cacheControl: FORCE ? '1' : '3600',
  });
  if (error) throw error;
}

async function generatePages(pdfUrl) {
  const proxyUrl = `http://localhost:3000/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`PDF取得失敗: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const pages = [];
  const doc = await pdf(buf, { scale: 1.5 });
  for await (const page of doc) {
    if (pages.length < MAX_PAGES) pages.push(page);
  }
  return pages;
}

async function main() {
  if (FORCE) console.log('⚠️  --force モード: 既存サムネイルを上書きします\n');
  console.log('教材一覧を取得中...');
  const materials = await fetchMaterials();
  let withPdf = materials.filter(m => m.pdfFile);
  if (ID_ARG) {
    withPdf = withPdf.filter(m => m.id.startsWith(ID_ARG));
    if (!withPdf.length) { console.log(`❌ ID "${ID_ARG}" に一致する教材が見つかりません`); process.exit(1); }
  }
  console.log(`PDF付き教材: ${withPdf.length}件\n`);

  let generated = 0, skipped = 0, failed = 0;

  for (const mat of withPdf) {
    const label = `[${mat.id.slice(0, 8)}] ${mat.title?.slice(0, 25) ?? ''}`;
    process.stdout.write(`${label}... `);

    const cardExists = !FORCE && await fileExists(`${mat.id}.png`);
    const p1Exists = !FORCE && await fileExists(`${mat.id}-p1.png`);

    if (cardExists && p1Exists) {
      console.log('スキップ（既存）');
      skipped++;
      continue;
    }

    try {
      const pages = await generatePages(mat.pdfFile);
      let uploadCount = 0;

      if (!cardExists) {
        await uploadPng(`${mat.id}.png`, pages[0]);
        uploadCount++;
      }

      for (let i = 0; i < pages.length; i++) {
        const name = `${mat.id}-p${i + 1}.png`;
        if (FORCE || !(await fileExists(name))) {
          await uploadPng(name, pages[i]);
          uploadCount++;
        }
      }

      console.log(`✅ ${uploadCount}枚アップロード`);
      generated++;
    } catch (e) {
      console.log(`❌ 失敗: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n完了 — 生成: ${generated}件 / スキップ: ${skipped}件 / 失敗: ${failed}件`);
  console.log('ページ数を保存するには: node scripts/update-page-counts.mjs');
}

main().catch(e => { console.error(e); process.exit(1); });
