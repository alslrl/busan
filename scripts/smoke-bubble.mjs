// 말풍선 포함 스모크 — gpt-image-2가 한글 말풍선(네이버 웹툰 스타일)을 정확히 렌더하는지 검증(R4).
// 사용: node scripts/smoke-bubble.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/sehosohn/Desktop/사이드프로젝트/부산";
const REF = path.join(ROOT, "mock", "KakaoTalk_Photo_2026-05-30-14-07-18 002.jpeg");
const OUT_DIR = path.join(ROOT, "verification", "screenshots");
const OUT = path.join(OUT_DIR, "smoke-bubble.png");

const PROMPT =
  "Korean Naver-webtoon style illustration WITH a speech bubble. " +
  "Turn the two friends from the reference selfie into one webtoon panel at a coding hackathon in Busan: " +
  "laptops, name tags, excited expressions, warm afternoon light. " +
  "Clean webtoon line art, soft cel shading, vibrant colors, vertical panel, Naver-webtoon readability. " +
  "Include ONE clean white speech bubble near the top containing the EXACT Korean text: \"부산 해커톤, 가보자!\" — " +
  "render the Korean letters clearly and correctly, no gibberish, no blank bubble, do not add other text. " +
  "Keep each person's face, hairstyle and identity faithful to the reference photo. No watermark.";

async function loadEnv(file) {
  const txt = await readFile(file, "utf8");
  const env = {};
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function main() {
  const env = await loadEnv(path.join(ROOT, ".env.local"));
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY 없음");
  const imageBytes = await readFile(REF);
  const model = env.IMAGE_MODEL || "gpt-image-2";

  const form = new FormData();
  form.append("model", model);
  form.append("prompt", PROMPT);
  form.append("size", "1024x1536");
  form.append("quality", "medium");
  form.append("n", "1");
  form.append("image[]", new Blob([imageBytes], { type: "image/jpeg" }), path.basename(REF));

  console.log(`[bubble] model=${model}, 말풍선 텍스트="부산 해커톤, 가보자!" ...`);
  const t0 = Date.now();
  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const text = await res.text();
  if (!res.ok) {
    console.error(`[bubble] ❌ HTTP ${res.status} (${elapsed}s): ${text.slice(0, 500)}`);
    process.exit(1);
  }
  const b64 = JSON.parse(text)?.data?.[0]?.b64_json;
  if (!b64) throw new Error("b64 없음");
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT, Buffer.from(b64, "base64"));
  console.log(`[bubble] ✅ SUCCESS (${elapsed}s) → ${OUT}`);
}

main().catch((e) => {
  console.error("[bubble] FAILED:", e.message);
  process.exit(1);
});
