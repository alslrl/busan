// scripts/smoke-cover.mjs — M7(표지+제목) 사전 검증
// gpt-image-2 generations로 ① text-free 커버 ② 흰배경 한글 제목 타이포 락업 2-에셋 생성(PhotoToon 자체 구현)
// 검증 포인트: ①generations 엔드포인트 동작 ②text-free 커버 ③한글 "제목" 타이포 정확/큼직 렌더 ④이후 sharp 흰배경제거·CSS 1:1 크롭은 결정적 코드(M7)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = '/Users/sehosohn/Desktop/사이드프로젝트/부산';
const OUT_DIR = path.join(ROOT, 'verification', 'screenshots');

const TITLE = '국밥 먹고 커밋까지';            // smoke-story가 생성한 실제 제목
const THEME = '부산 미니 랄프톤';

const COVER_PROMPT =
  `Create a text-free Korean webtoon cover illustration. Theme: ${THEME}. ` +
  'Warm slice-of-life tone: young developers at a Busan hackathon, laptops, name tags, warm evening light, sense of camaraderie. ' +
  'Clean Korean webtoon line art, soft cel shading, vibrant readable color, strong vertical composition. ' +
  'No title text, no letters, no logo, no watermark, no speech bubbles. Keep the lower-center area visually clean for a title.';

const TITLE_PROMPT =
  `Create a standalone Korean webtoon title typography lockup for: ${TITLE}. ` +
  'Only render the Korean title text, large and bold and readable. ' +
  'Use a pure flat white (#FFFFFF) background only — the pipeline removes white pixels to transparent. ' +
  'Do NOT use pure white inside the visible lettering; use saturated color, dark outline, drop shadow, or non-white highlights. ' +
  'No characters, no scene art, no extra words, no logo, no watermark.';

async function loadEnv() {
  const txt = await readFile(path.join(ROOT, '.env.local'), 'utf8');
  const env = {};
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

async function gen({ apiKey, model, prompt }) {
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, prompt, size: '1024x1536', quality: 'medium', n: 1 }),
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  return { ok: res.ok, status: res.status, text: await res.text(), elapsed };
}

async function saveOne({ apiKey, label, prompt, out }) {
  for (const model of ['gpt-image-2', 'gpt-image-1']) {
    console.log(`[cover] ${label}: model=${model} ...`);
    const r = await gen({ apiKey, model, prompt });
    if (r.ok) {
      const b64 = JSON.parse(r.text)?.data?.[0]?.b64_json;
      if (!b64) throw new Error(`${label}: 응답에 b64_json 없음: ${r.text.slice(0, 300)}`);
      await mkdir(OUT_DIR, { recursive: true });
      await writeFile(out, Buffer.from(b64, 'base64'));
      console.log(`[cover] ✅ ${label} model=${model} ${r.elapsed}s → ${out}`);
      return;
    }
    console.log(`[cover] ❌ ${label} model=${model} HTTP ${r.status} (${r.elapsed}s): ${r.text.slice(0, 300)}`);
  }
  throw new Error(`${label}: 모든 모델 실패`);
}

const env = await loadEnv();
if (!env.OPENAI_API_KEY) { console.error('❌ OPENAI_API_KEY 없음'); process.exit(1); }

await saveOne({ apiKey: env.OPENAI_API_KEY, label: '커버(text-free)', prompt: COVER_PROMPT, out: path.join(OUT_DIR, 'smoke-cover.png') });
await saveOne({ apiKey: env.OPENAI_API_KEY, label: '제목 타이포', prompt: TITLE_PROMPT, out: path.join(OUT_DIR, 'smoke-title.png') });
console.log('\n[cover] 완료 — smoke-cover.png(커버) + smoke-title.png(제목 타이포) 확인. 흰배경 제거/1:1 크롭은 M7 결정적 코드.');
