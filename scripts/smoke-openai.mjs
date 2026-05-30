// OpenAI 이미지 생성 스모크 — 실제 호출로 R1(얼굴 일관성 가능성)·R2(gpt-image 권한) 검증.
// 사용: node scripts/smoke-openai.mjs
// 동작: mock 셀카(002)를 reference로 images.edit(gpt-image-2, quality medium, 1024x1536) 1회 호출 → PNG 저장.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/sehosohn/Desktop/사이드프로젝트/부산";
const REF = path.join(ROOT, "mock", "KakaoTalk_Photo_2026-05-30-14-07-18 002.jpeg");
const OUT_DIR = path.join(ROOT, "verification", "screenshots");
const OUT = path.join(OUT_DIR, "smoke-cut.png");

const PROMPT =
  "Korean webtoon (만화) style illustration. Turn the two friends from the reference selfie into a single webtoon panel: " +
  "they are at a coding hackathon in Busan, laptops in front of them, name tags, excited and tired expressions, warm afternoon light. " +
  "Clean webtoon line art, soft cel shading, vibrant colors, vertical panel composition. " +
  "Keep each person's face, hairstyle, and identity faithful to the reference photo. No text, no speech bubbles, no watermark.";

async function loadEnv(file) {
  const txt = await readFile(file, "utf8");
  const env = {};
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function callEdit({ apiKey, model, imageBytes, imageName }) {
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", PROMPT);
  form.append("size", "1024x1536");
  form.append("quality", "medium");
  form.append("n", "1");
  form.append("image[]", new Blob([imageBytes], { type: "image/jpeg" }), imageName);

  const t0 = Date.now();
  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const text = await res.text();
  return { ok: res.ok, status: res.status, text, elapsed };
}

async function main() {
  const env = await loadEnv(path.join(ROOT, ".env.local"));
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY 없음 (.env.local)");

  const imageBytes = await readFile(REF);
  const imageName = path.basename(REF);
  console.log(`[smoke] reference=${imageName} (${(imageBytes.length / 1024 / 1024).toFixed(2)}MB)`);

  const models = [env.IMAGE_MODEL || "gpt-image-2", "gpt-image-1"];
  let lastErr = null;
  for (const model of models) {
    console.log(`[smoke] trying model=${model} (size 1024x1536, quality medium) ...`);
    const r = await callEdit({ apiKey, model, imageBytes, imageName });
    if (r.ok) {
      const json = JSON.parse(r.text);
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) throw new Error("응답에 b64_json 없음: " + r.text.slice(0, 400));
      await mkdir(OUT_DIR, { recursive: true });
      await writeFile(OUT, Buffer.from(b64, "base64"));
      console.log(`[smoke] ✅ SUCCESS model=${model} elapsed=${r.elapsed}s → ${OUT}`);
      console.log(`[smoke] usage=${JSON.stringify(json.usage || {})}`);
      return;
    }
    console.log(`[smoke] ❌ model=${model} HTTP ${r.status} (${r.elapsed}s)`);
    console.log(`[smoke]    error: ${r.text.slice(0, 500)}`);
    lastErr = `${model}: HTTP ${r.status}`;
    // 모델/권한 문제가 아니면(예: 400 잘못된 파라미터) 폴백 무의미할 수 있으나 일단 다음 모델 시도
  }
  throw new Error("모든 모델 실패: " + lastErr);
}

main().catch((e) => {
  console.error("[smoke] FAILED:", e.message);
  process.exit(1);
});
