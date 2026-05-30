export type PhotoAsset = {
  id: string;
  name: string;
  dataUrl: string;
  order: number;
  sceneNote: string;
  hasPerson: boolean;
};

export type StoryBeat = {
  index: number;
  text: string;
  image_prompt: string;
  bubble_text: string[];
  source_photo_id: string;
};

export type StoryResult = {
  episode_title: string;
  genre: string;
  tones: string[];
  beats: StoryBeat[];
};

export type CutResult = {
  index: number;
  image_url: string;
  source_photo_id: string;
};

export type CoverResult = {
  cover_url: string;
  title_lockup_url: string | null;
  title_text: string;
};

export type SavedToon = {
  id: string;
  theme: string;
  episode: string;
  episode_title: string;
  category: string | null;
  cover_url: string;
  title_lockup_url: string | null;
  cuts: CutResult[];
  photos: Pick<PhotoAsset, "id" | "name" | "dataUrl" | "order">[];
  created_at: string;
};

export const PHOTO_TOON_STORAGE_KEY = "phototoon-library-v1";
export const PHOTO_TOON_DEVICE_KEY = "phototoon-device-id-v1";

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function orderedPhotos(photos: PhotoAsset[]) {
  return [...photos].sort((left, right) => left.order - right.order);
}

export function reorderPhotos(photos: PhotoAsset[], photoId: string, direction: -1 | 1) {
  const ordered = orderedPhotos(photos);
  const currentIndex = ordered.findIndex((photo) => photo.id === photoId);
  const targetIndex = currentIndex + direction;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
    return ordered;
  }

  const next = [...ordered];
  const [moved] = next.splice(currentIndex, 1);

  if (!moved) {
    return ordered;
  }

  next.splice(targetIndex, 0, moved);
  return next.map((photo, index) => ({ ...photo, order: index + 1 }));
}

export function movePhotoToIndex(photos: PhotoAsset[], photoId: string, targetIndex: number) {
  const ordered = orderedPhotos(photos);
  const currentIndex = ordered.findIndex((photo) => photo.id === photoId);
  const boundedTargetIndex = Math.min(Math.max(targetIndex, 0), ordered.length - 1);

  if (currentIndex < 0 || currentIndex === boundedTargetIndex) {
    return ordered;
  }

  const next = [...ordered];
  const [moved] = next.splice(currentIndex, 1);

  if (!moved) {
    return ordered;
  }

  next.splice(boundedTargetIndex, 0, moved);
  return next.map((photo, index) => ({ ...photo, order: index + 1 }));
}

export function validateToonInput(theme: string, episode: string, photos: PhotoAsset[]) {
  const errors: string[] = [];

  if (!theme.trim()) {
    errors.push("주제를 입력해 주세요.");
  }

  if (!episode.trim()) {
    errors.push("전체 에피소드를 입력해 주세요.");
  }

  if (photos.length < 2) {
    errors.push("사진은 최소 2장 이상 필요합니다.");
  }

  return errors;
}

export function normalizeStoryResult(value: unknown): StoryResult {
  if (!value || typeof value !== "object") {
    throw new Error("story result must be an object");
  }

  const candidate = value as Partial<StoryResult>;

  if (!candidate.episode_title || !Array.isArray(candidate.beats)) {
    throw new Error("story result is missing title or beats");
  }

  const beats = candidate.beats.slice(0, 6).map((beat, index) => ({
    index: Number(beat.index || index + 1),
    text: String(beat.text || ""),
    image_prompt: String(beat.image_prompt || ""),
    bubble_text: Array.isArray(beat.bubble_text)
      ? beat.bubble_text.map(String).filter(Boolean).slice(0, 3)
      : [],
    source_photo_id: String(beat.source_photo_id || ""),
  }));

  if (beats.length < 4 || beats.length > 6) {
    throw new Error("story result must contain four to six beats");
  }

  if (beats.some((beat) => beat.bubble_text.length === 0 || !beat.image_prompt)) {
    throw new Error("each story beat needs image prompt and generated dialogue");
  }

  return {
    episode_title: String(candidate.episode_title).trim(),
    genre: String(candidate.genre || "일상 성장"),
    tones: Array.isArray(candidate.tones) ? candidate.tones.map(String).filter(Boolean) : ["현장감"],
    beats,
  };
}

export function createDemoStory(theme: string, episode: string, photos: PhotoAsset[], toonTitle = ""): StoryResult {
  const ordered = orderedPhotos(photos);
  const compactTheme = theme.trim() || "부산 해커톤";
  const compactEpisode = episode.trim() || "사진 묶음으로 하루를 웹툰처럼 정리했다.";
  const compactTitle = toonTitle.trim();
  const beatCount = Math.min(Math.max(ordered.length, 4), 6);
  const bubbles = [
    "부산까지 온 김에, 오늘은 진짜 만든다.",
    "사진이 많아도 한 장면씩 이어보면 돼.",
    "어? 이 컷은 웹툰 같다.",
    "제목까지 붙으니까 작품이 됐네.",
    "나도 만들기 링크 같이 보내자.",
    "오늘 데모, 이걸로 간다.",
  ];

  return {
    episode_title: compactTitle || `${compactTheme.slice(0, 12)}, 커밋까지`,
    genre: "일상 성장",
    tones: ["현장감", "위트", "따뜻함"],
    beats: Array.from({ length: beatCount }, (_, index) => {
      const source = ordered[index % Math.max(ordered.length, 1)];
      const note = source?.sceneNote.trim();
      const personDirection = source?.hasPerson
        ? "주인공 얼굴과 인물이 자연스럽게 등장하는 컷."
        : "인물을 넣지 말고 장소, 사물, 분위기 중심으로 구성한 컷.";
      const bubble = bubbles[index] ?? "좋아, 다음 컷.";

      return {
        index: index + 1,
        text: note || `${compactEpisode} ${index + 1}번째 장면.`,
        image_prompt:
          `네이버 웹툰 스타일 모바일 세로 컷. 주제: ${compactTheme}. ` +
          `장면: ${note || compactEpisode}. ${personDirection} 이미지 안에 정확한 한글 말풍선 "${bubble}" 포함.`,
        bubble_text: [bubble],
        source_photo_id: source?.id ?? `fallback-${index + 1}`,
      };
    }),
  };
}
