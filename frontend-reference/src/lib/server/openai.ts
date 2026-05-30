import OpenAI, { toFile } from "openai";
import sharp from "sharp";

import {
  createDemoStory,
  normalizeStoryResult,
  type CoverResult,
  type CutResult,
  type PhotoAsset,
  type StoryBeat,
  type StoryResult,
} from "@/lib/phototoon";
import { getEnv, requireEnv } from "@/lib/server/env";

function client() {
  return new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
}

function dataUrlToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Expected base64 data URL image");
  }

  return {
    mime: match[1] || "image/png",
    buffer: Buffer.from(match[2] || "", "base64"),
  };
}

function dataUrlFromB64(b64: string, mime = "image/png") {
  return `data:${mime};base64,${b64}`;
}

export function createCutPlaceholderDataUrl(beat: StoryBeat, theme: string) {
  const hue = (beat.index * 47 + theme.length * 11) % 360;
  const bubble = escapeXml(beat.bubble_text.join(" "));
  const scene = escapeXml(beat.text.slice(0, 70));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
      <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue},72%,88%)"/><stop offset="1" stop-color="hsl(${(hue + 80) % 360},52%,35%)"/></linearGradient></defs>
      <rect width="1024" height="1536" fill="url(#bg)"/>
      <circle cx="516" cy="600" r="194" fill="#f3c9a8"/>
      <path d="M304 560 C320 356 496 278 690 374 C810 434 810 612 734 760 C718 626 642 520 510 520 C402 520 336 552 304 560 Z" fill="#202026"/>
      <circle cx="462" cy="620" r="18" fill="#111"/><circle cx="578" cy="620" r="18" fill="#111"/>
      <path d="M458 714 C496 746 546 746 584 714" fill="none" stroke="#9f4d55" stroke-width="14" stroke-linecap="round"/>
      <path d="M116 238 H686 Q742 238 742 294 V420 Q742 476 686 476 H318 L248 552 L258 476 H116 Q60 476 60 420 V294 Q60 238 116 238 Z" fill="#fff" stroke="#111" stroke-width="10"/>
      <text x="112" y="326" font-family="Arial, sans-serif" font-size="43" font-weight="800" fill="#111">${bubble}</text>
      <text x="112" y="390" font-family="Arial, sans-serif" font-size="32" fill="#333">${scene}</text>
      <rect x="78" y="1292" width="868" height="104" rx="22" fill="rgba(11,11,13,0.78)"/>
      <text x="122" y="1358" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#fff">${escapeXml(theme)}</text>
    </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function createCoverPlaceholderDataUrl(title: string, genre: string, tones: string[]) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536">
      <defs><linearGradient id="cover" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7ff9a"/><stop offset=".42" stop-color="#f4f4f1"/><stop offset="1" stop-color="#131313"/></linearGradient></defs>
      <rect width="1024" height="1536" fill="url(#cover)"/>
      <circle cx="514" cy="560" r="262" fill="rgba(255,255,255,0.38)"/>
      <path d="M292 964 C366 792 654 792 734 964 C802 1110 738 1310 514 1310 C290 1310 226 1110 292 964 Z" fill="#18181b"/>
      <circle cx="514" cy="602" r="194" fill="#f3c9a8"/>
      <path d="M304 560 C320 356 496 278 690 374 C810 434 810 612 734 760 C718 626 642 520 510 520 C402 520 336 552 304 560 Z" fill="#202026"/>
      <text x="98" y="238" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#111">${escapeXml(genre)}</text>
      <text x="98" y="306" font-family="Arial, sans-serif" font-size="30" fill="#333">${escapeXml(tones.join(" · "))}</text>
      <rect x="96" y="1118" width="832" height="250" rx="22" fill="rgba(11,11,13,0.84)"/>
      <text x="136" y="1234" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="#ecff17">${escapeXml(title)}</text>
      <text x="140" y="1310" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#fff">EP.01 · PhotoToon</text>
    </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const storySchema = {
  type: "object",
  additionalProperties: false,
  required: ["episode_title", "genre", "tones", "beats"],
  properties: {
    episode_title: { type: "string", minLength: 2 },
    genre: { type: "string" },
    tones: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
    beats: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["index", "text", "image_prompt", "bubble_text", "source_photo_id"],
        properties: {
          index: { type: "integer" },
          text: { type: "string" },
          image_prompt: { type: "string" },
          bubble_text: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 },
          source_photo_id: { type: "string" },
        },
      },
    },
  },
};

export async function generateStoryWithOpenAI(input: {
  theme: string;
  episode: string;
  toonTitle?: string;
  photos: PhotoAsset[];
}): Promise<StoryResult> {
  const requestedTitle = input.toonTitle?.trim() ?? "";

  if (!getEnv("OPENAI_API_KEY")) {
    return createDemoStory(input.theme, input.episode, input.photos, requestedTitle);
  }

  const storyModel = getEnv("STORY_MODEL") || "gpt-5.5";
  const photoLines = input.photos
    .sort((left, right) => left.order - right.order)
    .map(
      (photo) =>
        `${photo.order}. id=${photo.id}, 인물=${photo.hasPerson ? "있음" : "없음"}, ` +
        `note=${photo.sceneNote || "(모델이 장면 의미 추론)"}`,
    )
    .join("\n");

  const response = await client().responses.create({
    model: storyModel,
    instructions:
      "너는 한국 모바일 웹툰 기획자다. 사용자는 대사를 쓰지 않는다. " +
      "주제와 에피소드, 장면 순서를 바탕으로 4~6컷 스토리, 클릭유발형 한국어 제목, " +
      "사용자가 웹툰 제목을 직접 입력했다면 episode_title은 반드시 그 제목과 정확히 같아야 한다. " +
      "컷별 짧고 자연스러운 한국어 말풍선, 이미지 생성 프롬프트를 만든다. " +
      "인물 없음으로 표시된 사진은 주인공 얼굴을 강제로 넣지 말고 장소, 사물, 분위기 컷으로 구성한다. " +
      "대사는 번역체, 과한 감탄사, 감정 직접 설명, 진부한 표어를 피한다. " +
      "말풍선 텍스트는 이미지 안에 그대로 들어갈 짧은 한국어여야 한다.",
    input:
      `주제: ${input.theme}\n` +
      `웹툰 제목(선택): ${requestedTitle || "(자동 생성)"}\n` +
      `전체 에피소드: ${input.episode}\n` +
      `시간순 사진/장면 메모:\n${photoLines}\n` +
      "각 beat의 source_photo_id는 반드시 위 사진 id 중 하나를 사용해.",
    text: {
      format: {
        type: "json_schema",
        name: "phototoon_story",
        strict: true,
        schema: storySchema,
      },
      verbosity: "low",
    },
    max_output_tokens: 3000,
  });

  const story = normalizeStoryResult(JSON.parse(response.output_text));

  return requestedTitle ? { ...story, episode_title: requestedTitle } : story;
}

export async function generateCutsWithOpenAI(input: {
  theme: string;
  beats: StoryBeat[];
  faceDataUrl: string;
}): Promise<CutResult[]> {
  if (!getEnv("OPENAI_API_KEY")) {
    return input.beats.map((beat) => ({
      index: beat.index,
      image_url: createCutPlaceholderDataUrl(beat, input.theme),
      source_photo_id: beat.source_photo_id,
    }));
  }

  const { buffer, mime } = dataUrlToBuffer(input.faceDataUrl);
  const imageFile = await toFile(buffer, "face-reference.jpg", { type: mime });
  const imageModel = getEnv("IMAGE_MODEL") || "gpt-image-2";

  return Promise.all(
    input.beats.map(async (beat) => {
      const image = await client().images.edit({
        model: imageModel,
        image: imageFile,
        prompt:
          `${beat.image_prompt}\n\n` +
          "Critical reference rule: keep the selected face identity, hair impression, and age consistent. " +
          "Korean Naver-style vertical webtoon panel, polished line art, clean color, native Korean speech bubbles. " +
          `The exact Korean speech bubble text must be: ${beat.bubble_text.map((text) => `"${text}"`).join(", ")}. ` +
          "No garbled text, no English text, no watermark.",
        size: "1024x1536",
        quality: "medium",
        output_format: "png",
      });
      const b64 = image.data?.[0]?.b64_json;

      if (!b64) {
        throw new Error(`OpenAI did not return image data for cut ${beat.index}`);
      }

      return {
        index: beat.index,
        image_url: dataUrlFromB64(b64),
        source_photo_id: beat.source_photo_id,
      };
    }),
  );
}

async function removeWhiteBackground(dataUrl: string) {
  const { buffer } = dataUrlToBuffer(dataUrl);
  const image = sharp(buffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const index = (y * info.width + x) * 4;
      const red = data[index] ?? 255;
      const green = data[index + 1] ?? 255;
      const blue = data[index + 2] ?? 255;
      const min = Math.min(red, green, blue);
      const max = Math.max(red, green, blue);
      const nearWhite = min >= 238 && max - min <= 24;

      if (nearWhite) {
        data[index + 3] = 0;
      } else if ((data[index + 3] ?? 0) > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const transparent = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  if (maxX < minX || maxY < minY) {
    return dataUrlFromB64(transparent.toString("base64"));
  }

  const padding = 24;
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const width = Math.min(info.width - left, maxX - minX + 1 + padding * 2);
  const height = Math.min(info.height - top, maxY - minY + 1 + padding * 2);
  const cropped = await sharp(transparent).extract({ left, top, width, height }).png().toBuffer();

  return dataUrlFromB64(cropped.toString("base64"));
}

export async function generateCoverWithOpenAI(input: {
  episode_title: string;
  genre: string;
  tones: string[];
}): Promise<CoverResult> {
  if (!getEnv("OPENAI_API_KEY")) {
    return {
      cover_url: createCoverPlaceholderDataUrl(input.episode_title, input.genre, input.tones),
      title_lockup_url: null,
      title_text: input.episode_title,
    };
  }

  const imageModel = getEnv("IMAGE_MODEL") || "gpt-image-2";
  const [coverImage, titleImage] = await Promise.all([
    client().images.generate({
      model: imageModel,
      prompt:
        "Text-free Korean webtoon cover art, no title, no logo, no watermark. " +
        `Story title context: ${input.episode_title}. Genre: ${input.genre}. Tones: ${input.tones.join(", ")}. ` +
        "A compelling protagonist-centered vertical cover, polished Naver webtoon style, strong first-glance readability.",
      size: "1024x1536",
      quality: "medium",
      output_format: "png",
    }),
    client().images.generate({
      model: imageModel,
      prompt:
        "White background image containing only a bold Korean webtoon title typography lockup. " +
        "Do not add characters, props, logo, watermark, frame, or decorative white-filled letters. " +
        `Exact Korean title text: ${input.episode_title}`,
      size: "1024x1536",
      quality: "medium",
      output_format: "png",
    }),
  ]);
  const coverB64 = coverImage.data?.[0]?.b64_json;
  const titleB64 = titleImage.data?.[0]?.b64_json;

  if (!coverB64) {
    throw new Error("OpenAI did not return cover image data");
  }

  return {
    cover_url: dataUrlFromB64(coverB64),
    title_lockup_url: titleB64 ? await removeWhiteBackground(dataUrlFromB64(titleB64)) : null,
    title_text: input.episode_title,
  };
}
