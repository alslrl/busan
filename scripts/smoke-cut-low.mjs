// scripts/smoke-cut-low.mjs — quality "low"에서 한글 말풍선 렌더 검증
// 결정(2026-05-30): 이미지 전부 low. low에서도 native 한글 말풍선이 안 깨지는지 실측.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = '/Users/sehosohn/Desktop/사이드프로젝트/부산';
const REF = path.join(ROOT, 'mock', 'KakaoTalk_Photo_2026-05-30-14-07-18 002.jpeg');
const OUT_DIR = path.join(ROOT, 'verification', 'screenshots');
const OUT = path.join(OUT_DIR, 'smoke-cut-low.png');

const PROMPT =
  'Korean webtoon (만화) style illustration. Turn the two friends from the reference selfie into a single webtoon panel: ' +
  'at a coding hackathon in Busan, laptops in front of them, warm afternoon light, excited expressions. ' +
  'Clean webtoon line art, soft cel shading, vibrant colors, vertical panel composition. ' +
  'Include one Naver-webtoon-style speech bubble with the EXACT Korean text: "국밥 위에 깃허브 올리면 안 되냐." ' +
  'The bubble text must be exactly that Korean, not blank, no gibberish. ' +
  'Keep each person face, hairstyle, and identity faithful to the reference photo. No watermark.';

async function loadEnv() {
  const txt = await readFile(path.join(ROOT, '.env.local'), 'utf8');
  const env = {};
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = await loadEnv();
if (!env.OPENAI_API_KEY) { console.error('❌ OPENAI_API_KEY 없음'); process.exit(1); }

const imageBytes = await readFile(REF);
const form = new FormData();
form.append('model', 'gpt-image-2');
form.append('prompt', PROMPT);
form.append('size', '1024x1536');
form.append('quality', 'low');          // ← 핵심: low
form.append('n', '1');
form.append('image[]', new Blob([imageBytes], { type: 'image/jpeg' }), path.basename(REF));

const t0 = Date.now();
const res = await fetch('https://api.openai.com/v1/images/edits', {
  method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: form,
});
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
const text = await res.text();
if (!res.ok) { console.error(`❌ HTTP ${res.status} (${elapsed}s): ${text.slice(0, 500)}`); process.exit(1); }
const b64 = JSON.parse(text)?.data?.[0]?.b64_json;
if (!b64) { console.error('❌ b64_json 없음: ' + text.slice(0, 300)); process.exit(1); }
await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, Buffer.from(b64, 'base64'));
console.log(`✅ low 컷 생성 ${elapsed}s → ${OUT} (medium 64s 대비 속도 비교 + 한글 말풍선 가독성 확인)`);
