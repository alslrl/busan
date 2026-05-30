// scripts/smoke-story.mjs — M5 사전 검증
// gpt-5.5로 (주제+전체 에피소드+시간순 장면) → {title, beats[{image_prompt, bubble_text}]} 구조화 출력
// 검증 포인트: ①gpt-5.5 모델 존재 ②json_schema 구조화출력 ③한글 대사 자동생성 ④제목 자동생성 ⑤폴백 gpt-4o
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function loadEnv() {
  const txt = await readFile(join(ROOT, '.env.local'), 'utf8');
  const env = {};
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const STORY_SCHEMA = {
  name: 'webtoon_story_v1',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'beats'],
    properties: {
      title: { type: 'string', description: '클릭 유발형 한국어 웹툰 제목(번역체/밋밋한 요약 금지)' },
      beats: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['index', 'image_prompt', 'bubble_text', 'source_scene'],
          properties: {
            index: { type: 'integer' },
            image_prompt: { type: 'string', description: '이 컷의 영어 이미지 생성 지시' },
            bubble_text: { type: 'string', description: '이 컷의 한국어 말풍선 대사. 짧은 구어체, 따옴표 없이. 감정 직접 설명·느낌표 남발·번역투·진부한 표어 금지.' },
            source_scene: { type: 'string', description: '대응하는 입력 장면 라벨' },
          },
        },
      },
    },
  },
};

const INPUT = {
  theme: '부산 미니 랄프톤',
  episode: '부산에서 열린 코드 해커톤 첫날. 정신없지만 친구들과 밤새 개발하며 즐거웠던 하루.',
  scenes: [
    '아침: 부산 도착, 행사장 입장 (설렘)',
    '점심: 돼지국밥 먹으며 아이디어 회의',
    '오후: 노트북 펼치고 정신없이 개발',
    '저녁: 데모 성공, 다같이 환호',
  ],
};

async function callStory(env, model) {
  const body = {
    model,
    messages: [
      { role: 'system', content: [
        '너는 네이버 웹툰 작가이자 대사 작가다. 사용자가 준 주제·에피소드·시간순 장면으로 4~6컷짜리 따뜻한 일상/회고 웹툰의 줄거리를 증강하고, 각 컷의 한국어 말풍선 대사와 클릭을 부르는 제목을 직접 짓는다. 사용자는 대사를 주지 않는다.',
        '',
        '[대사 철칙 — 오글거리면 실패다] (PhotoToon 대사 품질 정책 적용)',
        '- 자연스러운 한국어 구어체. 번역투·설명투·AI식 문장 절대 금지.',
        '- 짧게. 한 말풍선엔 하나의 감정/생각/한마디만.',
        '- 감정을 직접 설명하지 마라. "설레", "행복해", "뭔가 터질 것 같아", "잊지 못할 거야" 같은 직설 금지 → 구체적 상황·사소한 디테일·행동으로 드러내라.',
        '- 감탄사·느낌표 남발 금지("대박!", "최고!", "가보자!", "드디어!" 류 자제). 과장 말고 진짜 친구한테 툭 던지듯.',
        '- 진부한 표어·홍보문구 같은 멘트 금지. 구체적이고 사소할수록 웹툰답다.',
        '- 상대 말을 그대로 반복하지 마라. 따옴표 없이 쓴다.',
        '- 톤: 따뜻하고 위트 있고 담백하게. 냉소·억지 감동 금지.',
        '',
        '[제목] 짧고 한국적이고 클릭을 부르는 제목 1개. "~한 날"·밋밋한 요약·이름만 제목 금지.',
        '[줄거리] 시간순 장면을 따라 흐르되 컷마다 작은 변화나 리액션이 있게. 4~6컷을 억지로 채우지 말고 자연스러운 수로.',
      ].join('\n') },
      { role: 'user', content: `주제: ${INPUT.theme}\n전체 에피소드: ${INPUT.episode}\n시간순 장면:\n${INPUT.scenes.map((s, i) => `${i + 1}. ${s}`).join('\n')}` },
    ],
    response_format: { type: 'json_schema', json_schema: STORY_SCHEMA },
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, text: await res.text() };
}

const env = await loadEnv();
if (!env.OPENAI_API_KEY) { console.error('❌ OPENAI_API_KEY 없음'); process.exit(1); }

const primary = env.STORY_MODEL || 'gpt-5.5';
const t0 = Date.now();
let used = primary;
let r = await callStory(env, primary);
if (!r.ok) {
  console.error(`⚠️ [${primary}] 실패 status=${r.status}\n${r.text.slice(0, 700)}\n→ 폴백 gpt-4o 재시도`);
  used = 'gpt-4o';
  r = await callStory(env, 'gpt-4o');
}
if (!r.ok) { console.error(`❌ 폴백도 실패 status=${r.status}\n${r.text.slice(0, 700)}`); process.exit(1); }

const story = JSON.parse(JSON.parse(r.text).choices[0].message.content);
console.log(`✅ 모델: ${used}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
console.log(`제목: ${story.title}`);
console.log(`컷 수: ${story.beats.length}`);
for (const b of story.beats) {
  console.log(`  [${b.index}] 말풍선="${b.bubble_text}"  | scene=${b.source_scene}`);
  console.log(`       prompt: ${b.image_prompt.slice(0, 90)}...`);
}
const hasKorean = story.beats.every((b) => /[가-힣]/.test(b.bubble_text));
const beatsOk = story.beats.length >= 4 && story.beats.length <= 6;
console.log(`\n판정: 한글대사 ${hasKorean ? '✅' : '❌'} · 컷4~6 ${beatsOk ? '✅' : '❌'} · 제목 ${story.title ? '✅' : '❌'}`);
process.exit(hasKorean && beatsOk && story.title ? 0 : 2);
