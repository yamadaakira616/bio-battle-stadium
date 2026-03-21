/**
 * Wikimedia Commons + iNaturalist から昆虫画像を取得するスクリプト
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/assets/insects');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const TARGETS = [
  { id: 'u06', nameEn: 'Lamprima moellenkampi', genus: 'Lamprima' },
  { id: 's12', nameEn: 'Lucanus binoculatus', genus: 'Lucanus' },
  { id: 's13', nameEn: 'Megasoma elephas', genus: 'Megasoma' },
  { id: 's14', nameEn: 'Odontolabis lacordairei', genus: 'Odontolabis' },
  { id: 's15', nameEn: 'Lucanus moriutii', genus: 'Lucanus' },
  { id: 's17', nameEn: 'Chalcosoma moellenkampi', genus: 'Chalcosoma' },
  { id: 's18', nameEn: 'Rhaetus westwoodi', genus: 'Rhaetus' },
  { id: 'r16', nameEn: 'Eupatorus gracilicornis', genus: 'Eupatorus' },
  { id: 'r17', nameEn: 'Dynastes hyllus', genus: 'Dynastes' },
  { id: 'r18', nameEn: 'Lucanus sasakii', genus: 'Lucanus' },
  { id: 'r19', nameEn: 'Hexarthrius forsteri', genus: 'Hexarthrius' },
  { id: 'r20', nameEn: 'Hymenopus coronatus', genus: 'Hymenopus' },
  { id: 'r21', nameEn: 'Phyllium giganteum', genus: 'Phyllium' },
  { id: 'r22', nameEn: 'Phobaeticus chani', genus: 'Phobaeticus' },
  { id: 'r23', nameEn: 'Morpho peleides', genus: 'Morpho' },
  { id: 'r24', nameEn: 'Dorcus rubrofemoratus', genus: 'Dorcus' },
  { id: 'r25', nameEn: 'Pachyrhynchus infernalis', genus: 'Pachyrhynchus' },
  { id: 'r26', nameEn: 'Camponotus gigas', genus: 'Camponotus' },
  { id: 'r27', nameEn: 'Palpares libelluloides', genus: 'Palpares' },
  { id: 'r28', nameEn: 'Xylocopa tranquebarorum', genus: 'Xylocopa' },
  { id: 'r29', nameEn: 'Chrysochroa buqueti', genus: 'Chrysochroa' },
  { id: 'r30', nameEn: 'Hymenopus coronatus', genus: 'Hymenopus' },
  { id: 'c13', nameEn: 'Papilio xuthus', genus: 'Papilio' },
  { id: 'c14', nameEn: 'Apis cerana', genus: 'Apis' },
  { id: 'c15', nameEn: 'Graptopsaltria nigrofuscata', genus: 'Graptopsaltria' },
  { id: 'c16', nameEn: 'Papilio protenor', genus: 'Papilio' },
  { id: 'c17', nameEn: 'Orthetrum albistylum', genus: 'Orthetrum' },
  { id: 'c18', nameEn: 'Vespa mandarinia', genus: 'Vespa' },
  { id: 'c19', nameEn: 'Cybister chinensis', genus: 'Cybister' },
  { id: 'c20', nameEn: 'Hyalessa maculaticollis', genus: 'Hyalessa' },
  { id: 'c21', nameEn: 'Colias erate', genus: 'Colias' },
  { id: 'c23', nameEn: 'Pseudozizeeria maha', genus: 'Pseudozizeeria' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'insect-flash-app/1.0 (educational non-commercial)' }
      });
      if (res.status === 429) {
        const wait = (i + 1) * 4000;
        console.log(`  429 rate limit, wait ${wait/1000}s...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(2000);
    }
  }
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'insect-flash-app/1.0 (educational non-commercial)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// 1) Wikipedia サムネイル
async function tryWikipedia(name) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=512&origin=*`;
  const data = await fetchJson(url);
  const page = Object.values(data?.query?.pages ?? {})[0];
  return page?.thumbnail?.source ?? null;
}

// 2) iNaturalist API（無料・高品質・豊富）
async function tryINaturalist(name) {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&rank=species&per_page=1`;
  const data = await fetchJson(url);
  const taxon = data?.results?.[0];
  return taxon?.default_photo?.medium_url ?? taxon?.default_photo?.url ?? null;
}

// 3) Wikimedia Commons ファイル検索
async function tryCommonsSearch(name) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srnamespace=6&srlimit=5&format=json&origin=*`;
  const data = await fetchJson(url);
  const results = data?.query?.search ?? [];
  for (const r of results) {
    if (!/\.(jpg|jpeg|png)$/i.test(r.title)) continue;
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(r.title)}&prop=imageinfo&iiprop=url&iiurlwidth=512&format=json&origin=*`;
    const info = await fetchJson(infoUrl);
    const p = Object.values(info?.query?.pages ?? {})[0];
    const imgUrl = p?.imageinfo?.[0]?.thumburl ?? p?.imageinfo?.[0]?.url;
    if (imgUrl) return imgUrl;
  }
  return null;
}

async function getImageUrl(nameEn, genus) {
  // フルネームで順に試す
  for (const fn of [tryINaturalist, tryWikipedia, tryCommonsSearch]) {
    try {
      const url = await fn(nameEn);
      if (url) return url;
    } catch {}
    await sleep(800);
  }
  // 属名のみで iNaturalist 再試行
  try {
    const url = await tryINaturalist(genus);
    if (url) return url;
  } catch {}
  return null;
}

async function main() {
  let ok = 0, fail = 0;
  const failed = [];

  for (const { id, nameEn, genus } of TARGETS) {
    const dest = join(OUT_DIR, `${id}.jpg`);
    if (existsSync(dest)) {
      console.log(`✓ ${id} already exists`);
      ok++;
      continue;
    }

    process.stdout.write(`⬇ ${id} (${nameEn}) ... `);
    try {
      const imgUrl = await getImageUrl(nameEn, genus);
      if (!imgUrl) throw new Error('not found in any source');
      const buf = await fetchBuffer(imgUrl);
      if (buf.length < 5000) throw new Error(`too small (${buf.length}B)`);
      writeFileSync(dest, buf);
      console.log(`OK (${(buf.length / 1024).toFixed(0)}KB)`);
      ok++;
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      failed.push({ id, nameEn });
      fail++;
    }

    await sleep(2000);
  }

  console.log(`\n完了: ${ok}件成功, ${fail}件失敗`);
  if (failed.length) {
    console.log('失敗:', failed.map(f => `${f.id}`).join(', '));
  }
}

main().catch(console.error);
