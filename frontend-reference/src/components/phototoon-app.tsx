"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  Download,
  GripVertical,
  Images,
  Library,
  LoaderCircle,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  UploadCloud,
  UserRoundCheck,
} from "lucide-react";

import {
  createId,
  movePhotoToIndex,
  orderedPhotos,
  PHOTO_TOON_DEVICE_KEY,
  PHOTO_TOON_STORAGE_KEY,
  validateToonInput,
  type CoverResult,
  type CutResult,
  type PhotoAsset,
  type SavedToon,
  type StoryResult,
} from "@/lib/phototoon";

type GenerationPhase = "idle" | "story" | "cuts" | "cover" | "done" | "error";
type AppView = "create" | "library" | "share";

const stepItems = [
  { key: "upload", label: "업로드", icon: UploadCloud },
  { key: "input", label: "입력", icon: GripVertical },
  { key: "face", label: "얼굴", icon: UserRoundCheck },
  { key: "generate", label: "생성", icon: Sparkles },
  { key: "viewer", label: "뷰어", icon: BookOpen },
  { key: "library", label: "저장", icon: Library },
] as const;

type SectionKey = "top" | "upload" | "input" | "scene" | "face" | "generate" | "viewer" | "share" | "library";

const stepTargets: Record<(typeof stepItems)[number]["key"], SectionKey> = {
  upload: "upload",
  input: "input",
  face: "face",
  generate: "generate",
  viewer: "viewer",
  library: "library",
};

const sectionFallbacks: Record<SectionKey, SectionKey[]> = {
  top: ["top"],
  upload: ["upload", "top"],
  input: ["input", "upload"],
  scene: ["scene", "input"],
  face: ["face", "scene"],
  generate: ["generate", "face"],
  viewer: ["viewer", "generate"],
  share: ["share", "viewer", "library"],
  library: ["library"],
};

const bottomNavItems = [
  { key: "create", label: "만들기", icon: Sparkles },
  { key: "library", label: "작품집", icon: Library },
  { key: "share", label: "공유", icon: Share2 },
] as const;

const categoryOptions = ["해커톤", "여행", "일상", "취준", "친구"];
const samplePhotoPaths = [
  "/phototoon-fixtures/scene-01.jpeg",
  "/phototoon-fixtures/scene-02.jpeg",
  "/phototoon-fixtures/scene-03.jpeg",
  "/phototoon-fixtures/scene-04.jpeg",
];
const sampleSceneNotes = [
  "부산역에서 시작한 첫 만남",
  "팀원들과 아이디어를 좁히는 장면",
  "데모를 만들며 집중한 순간",
  "결과물을 보며 공유를 준비하는 장면",
];
const sampleScenePersonFlags = [false, true, true, false];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

function resizeImageDataUrl(dataUrl: string) {
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 720;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.76));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

function getOrCreateDeviceId() {
  const existing = window.localStorage.getItem(PHOTO_TOON_DEVICE_KEY);

  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.localStorage.setItem(PHOTO_TOON_DEVICE_KEY, next);
  return next;
}

function isSectionKey(value: string): value is SectionKey {
  return value in sectionFallbacks;
}

function getRouteFromHash(hashValue: string): { view: AppView; section: SectionKey } {
  const hash = hashValue.replace("#", "");

  if (hash === "library") {
    return { view: "library", section: "library" };
  }

  if (hash === "share") {
    return { view: "share", section: "share" };
  }

  if (isSectionKey(hash) && hash !== "library" && hash !== "share") {
    return { view: "create", section: hash };
  }

  return { view: "create", section: "top" };
}

function AppLogo() {
  return (
    <div className="text-[28px] font-black leading-none tracking-normal text-[#EAF3FA]">
      <span>Photo</span>
      <span className="text-[#8EC5EA]">Toon</span>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#CFE1EE] bg-white text-[#3A4250] transition hover:bg-[#F2F8FC] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function Panel({
  id,
  title,
  action,
  children,
  testId,
}: {
  id?: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section id={id} data-testid={testId} className="phototoon-panel scroll-mt-3 rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-black leading-tight text-[#3A4250]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProgressRail({
  activeIndex,
  onStepSelect,
}: {
  activeIndex: number;
  onStepSelect: (section: SectionKey) => void;
}) {
  return (
    <ol className="grid grid-cols-6 gap-1.5 border-t border-[#DDEAF3] px-2 pb-4 pt-4">
      {stepItems.map((step, index) => {
        const Icon = step.icon;
        const active = index <= activeIndex;

        return (
          <li key={step.key} className="text-center">
            <button
              type="button"
              onClick={() => onStepSelect(stepTargets[step.key])}
              className="group w-full rounded-md py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[#8EC5EA]"
              aria-label={`${step.label} 섹션으로 이동`}
            >
              <div
                className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border transition group-hover:scale-[1.03] ${
                  active
                    ? "border-[#B8DAF0] bg-[#EAF3FA] text-[#5E97C7]"
                    : "border-[#B8CAD8] bg-[#DDEAF3]/70 text-[#7FA9C8]"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className={`mt-1 text-[11px] font-bold ${active ? "text-[#5E97C7]" : "text-[#A8BAC8]"}`}>
                {step.label}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function EmptyPhotoSlot() {
  return (
    <div className="flex h-24 min-w-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#CFE1EE] bg-[#F7FBFE] text-xs font-bold text-[#8CA6BA]">
      <Images className="h-5 w-5" />
      사진
    </div>
  );
}

async function parseJsonResponse<T>(response: Response) {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "요청이 실패했습니다.");
  }

  return payload;
}

export function PhotoToonApp() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [theme, setTheme] = useState("부산 해커톤 첫날");
  const [toonTitle, setToonTitle] = useState("");
  const [episode, setEpisode] = useState(
    "낯선 사람들과 사진을 찍고, 아이디어를 웹툰으로 만들기까지 정신없지만 웃긴 하루였다.",
  );
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [story, setStory] = useState<StoryResult | null>(null);
  const [cuts, setCuts] = useState<CutResult[]>([]);
  const [cover, setCover] = useState<CoverResult | null>(null);
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("해커톤");
  const [library, setLibrary] = useState<SavedToon[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "shared" | "downloaded">("idle");
  const [activeView, setActiveView] = useState<AppView>("create");
  const [pendingSection, setPendingSection] = useState<{ section: SectionKey; token: number } | null>(null);
  const [draggingPhotoId, setDraggingPhotoId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const persistLibrary = useCallback((nextLibrary: SavedToon[]) => {
    setLibrary(nextLibrary);
    window.localStorage.setItem(PHOTO_TOON_STORAGE_KEY, JSON.stringify(nextLibrary));
  }, []);

  const scrollToCreateSection = useCallback((section: SectionKey) => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    const candidates = sectionFallbacks[section] ?? sectionFallbacks.top;
    const target = candidates
      .map((candidate) => document.getElementById(candidate))
      .find((element): element is HTMLElement => Boolean(element));

    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    if (!target || target.id === "top") {
      scrollArea.scrollTo({ left: 0, top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "#create");
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${target.id}`);
  }, []);

  const openView = useCallback((view: AppView) => {
    setActiveView(view);
    setPendingSection(view === "create" ? { section: "top", token: Date.now() } : null);
    window.history.replaceState(null, "", view === "create" ? "#create" : `#${view}`);
  }, []);

  const openSection = useCallback((section: SectionKey) => {
    if (section === "library" || section === "share") {
      openView(section);
      return;
    }

    setActiveView("create");
    setPendingSection({ section, token: Date.now() });
  }, [openView]);

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const scrollArea = scrollAreaRef.current;

      if (!scrollArea) {
        return;
      }

      if (activeView !== "create") {
        scrollArea.scrollTo({ left: 0, top: 0, behavior: "auto" });
        window.scrollTo({ left: 0, top: 0, behavior: "auto" });
        return;
      }

      if (pendingSection) {
        scrollToCreateSection(pendingSection.section);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [activeView, pendingSection, scrollToCreateSection]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateLibrary() {
      const nextDeviceId = getOrCreateDeviceId();
      const raw = window.localStorage.getItem(PHOTO_TOON_STORAGE_KEY);

      if (cancelled) {
        return;
      }

      setDeviceId(nextDeviceId);

      if (raw) {
        try {
          const parsed = JSON.parse(raw) as SavedToon[];
          setLibrary(Array.isArray(parsed) ? parsed : []);
        } catch {
          setLibrary([]);
        }
      }

      try {
        const payload = await parseJsonResponse<{ toons: SavedToon[] }>(
          await fetch(`/api/toons?device=${encodeURIComponent(nextDeviceId)}`),
        );

        if (!cancelled) {
          persistLibrary(payload.toons);
        }
      } catch {
        // Local cache remains usable if Supabase is temporarily unavailable.
      }
    }

    void hydrateLibrary();

    return () => {
      cancelled = true;
    };
  }, [persistLibrary]);

  useEffect(() => {
    function syncHashScroll() {
      const route = getRouteFromHash(window.location.hash);
      setActiveView(route.view);
      setPendingSection(route.view === "create" ? { section: route.section, token: Date.now() } : null);
    }

    const timeout = window.setTimeout(syncHashScroll, 0);
    window.addEventListener("hashchange", syncHashScroll);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("hashchange", syncHashScroll);
    };
  }, []);

  const sortedPhotos = useMemo(() => orderedPhotos(photos), [photos]);
  const selectedPhoto = sortedPhotos.find((photo) => photo.id === selectedPhotoId) ?? sortedPhotos[0] ?? null;
  const inputErrors = validateToonInput(theme, episode, photos);
  const canGenerate = inputErrors.length === 0 && Boolean(selectedPhoto);
  const activeIndex = useMemo(() => {
    if (library.length > 0) {
      return 5;
    }
    if (cover && cuts.length > 0) {
      return 4;
    }
    if (phase !== "idle") {
      return 3;
    }
    if (selectedPhoto) {
      return 2;
    }
    if (photos.length > 0 && theme && episode) {
      return 1;
    }
    return 0;
  }, [cover, cuts.length, episode, library.length, phase, photos.length, selectedPhoto, theme]);

  async function handleFiles(nextFiles: FileList | null) {
    if (!nextFiles || nextFiles.length === 0) {
      return;
    }

    const existingCount = photos.length;
    const assets = await Promise.all(
      Array.from(nextFiles).map(async (file, index) => {
        const dataUrl = await readFileAsDataUrl(file);
        const resized = file.type.startsWith("image/") ? await resizeImageDataUrl(dataUrl) : dataUrl;

        return {
          id: createId("photo"),
          name: file.name,
          dataUrl: resized,
          order: existingCount + index + 1,
          sceneNote: "",
          hasPerson: false,
        };
      }),
    );

    setPhotos((current) => {
      const next = orderedPhotos([...current, ...assets]);

      if (!selectedPhotoId && next[0]) {
        setSelectedPhotoId(next[0].id);
      }

      return next;
    });
    setStory(null);
    setCuts([]);
    setCover(null);
    setShareState("idle");
  }

  async function loadSamplePhotos() {
    const assets = await Promise.all(
      samplePhotoPaths.map(async (path, index) => {
        const response = await fetch(path);
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        const resized = await resizeImageDataUrl(dataUrl);

        return {
          id: createId("sample"),
          name: `sample-${index + 1}.jpeg`,
          dataUrl: resized,
          order: index + 1,
          sceneNote: sampleSceneNotes[index] ?? "",
          hasPerson: sampleScenePersonFlags[index] ?? false,
        };
      }),
    );

    setPhotos(assets);
    setSelectedPhotoId(assets[0]?.id ?? null);
    setTheme("부산 해커톤 데모");
    setToonTitle("처음 만난 팀의 부산 데모");
    setEpisode("처음 만난 팀이 사진을 고르고, 빠르게 웹툰 데모를 완성했다.");
    setStory(null);
    setCuts([]);
    setCover(null);
    setShareState("idle");
  }

  function updateSceneNote(photoId: string, sceneNote: string) {
    setPhotos((current) =>
      current.map((photo) => (photo.id === photoId ? { ...photo, sceneNote } : photo)),
    );
  }

  function updateScenePerson(photoId: string, hasPerson: boolean) {
    setPhotos((current) =>
      current.map((photo) => (photo.id === photoId ? { ...photo, hasPerson } : photo)),
    );
  }

  function handleSceneDragStart(event: React.DragEvent<HTMLButtonElement>, photoId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", photoId);
    setDraggingPhotoId(photoId);
  }

  function handleSceneDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleSceneDrop(event: React.DragEvent<HTMLDivElement>, targetIndex: number) {
    event.preventDefault();
    const photoId = event.dataTransfer.getData("text/plain") || draggingPhotoId;

    if (!photoId) {
      return;
    }

    setPhotos((current) => movePhotoToIndex(current, photoId, targetIndex));
    setDraggingPhotoId(null);
  }

  function removePhoto(photoId: string) {
    setPhotos((current) => {
      const next = orderedPhotos(current.filter((photo) => photo.id !== photoId)).map((photo, index) => ({
        ...photo,
        order: index + 1,
      }));

      if (selectedPhotoId === photoId) {
        setSelectedPhotoId(next[0]?.id ?? null);
      }

      return next;
    });
  }

  async function generateToon() {
    if (!canGenerate || !selectedPhoto) {
      setError(inputErrors[0] ?? "주인공 얼굴을 선택해 주세요.");
      return;
    }

    setError(null);
    setShareState("idle");

    try {
      setPhase("story");
      const storyPayload = await parseJsonResponse<{ story: StoryResult }>(
        await fetch("/api/story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, episode, toonTitle, photos: sortedPhotos }),
        }),
      );
      setStory(storyPayload.story);

      setPhase("cuts");
      const cutsPayload = await parseJsonResponse<{ cuts: CutResult[] }>(
        await fetch("/api/cuts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme,
            beats: storyPayload.story.beats,
            faceDataUrl: selectedPhoto.dataUrl,
          }),
        }),
      );
      setCuts(cutsPayload.cuts);

      setPhase("cover");
      const coverPayload = await parseJsonResponse<{ cover: CoverResult }>(
        await fetch("/api/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episode_title: storyPayload.story.episode_title,
            genre: storyPayload.story.genre,
            tones: storyPayload.story.tones,
          }),
        }),
      );
      setCover(coverPayload.cover);
      setPhase("done");
    } catch (nextError) {
      setPhase("error");
      setError(nextError instanceof Error ? nextError.message : "생성 중 오류가 발생했습니다.");
    }
  }

  async function saveToLibrary() {
    if (!story || !cover || cuts.length === 0 || !deviceId) {
      setError("먼저 웹툰을 생성해 주세요.");
      return;
    }

    setError(null);

    try {
      const payload = await parseJsonResponse<{ toon: SavedToon }>(
        await fetch("/api/toons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author_device_id: deviceId,
            theme,
            episode,
            episode_title: story.episode_title,
            category,
            cover_url: cover.cover_url,
            title_lockup_url: cover.title_lockup_url,
            cuts,
            photos: sortedPhotos.map(({ id, name, dataUrl, order }) => ({ id, name, dataUrl, order })),
          }),
        }),
      );

      persistLibrary([payload.toon, ...library.filter((item) => item.id !== payload.toon.id)]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "저장 중 오류가 발생했습니다.");
    }
  }

  async function shareToon() {
    const text = `${story?.episode_title ?? "PhotoToon"} - 나도 만들기: http://localhost:3000`;

    if (navigator.share) {
      try {
        await navigator.share({ title: story?.episode_title ?? "PhotoToon", text });
        setShareState("shared");
        return;
      } catch {
        setShareState("downloaded");
        return;
      }
    }

    await navigator.clipboard?.writeText(text).catch(() => undefined);
    setShareState("downloaded");
  }

  return (
    <main className="app-shell text-[#3A4250]" data-testid="app-shell">
      <header className="shrink-0 bg-[#10243A] px-4 pt-5 text-[#EAF3FA] shadow-[0_8px_30px_rgba(0,0,0,0.28)]">
        <div className="mb-4 flex items-center">
          <AppLogo />
        </div>
        <ProgressRail activeIndex={activeIndex} onStepSelect={openSection} />
      </header>

      <div
        ref={scrollAreaRef}
        data-testid="app-scroll"
        className="app-scroll soft-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-28 pt-3"
      >
        {activeView === "create" ? (
          <>
            <div id="top" data-testid="top-anchor" className="h-px scroll-mt-3" />
            <Panel
              id="upload"
              title="사진 업로드"
              testId="upload-panel"
              action={
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-testid="sample-button"
                    onClick={() => void loadSamplePhotos()}
	                    className="inline-flex items-center gap-1.5 rounded-md border border-[#CFE1EE] bg-white px-3 py-2 text-sm font-black text-[#3A4250] shadow-sm"
                  >
                    <Images className="h-4 w-4" />
                    샘플
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
	                    className="inline-flex items-center gap-1.5 rounded-md border border-[#CFE1EE] bg-white px-3 py-2 text-sm font-black text-[#3A4250] shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    추가
                  </button>
                </div>
              }
            >
          <input
            ref={fileInputRef}
            data-testid="photo-input"
            className="sr-only"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              void handleFiles(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
          />
          <div className="soft-scrollbar flex gap-2 overflow-x-auto pb-1">
            {sortedPhotos.length === 0 ? (
              <>
                <EmptyPhotoSlot />
                <EmptyPhotoSlot />
                <EmptyPhotoSlot />
              </>
            ) : (
              sortedPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoId(photo.id)}
                  className={`relative h-24 min-w-24 overflow-hidden rounded-md border ${
	                    selectedPhotoId === photo.id ? "border-[#8EC5EA] phototoon-focus" : "border-[#CFE1EE]"
                  }`}
                  aria-label={`${photo.order}번째 사진`}
                >
                  <img src={photo.dataUrl} alt={photo.name} className="h-full w-full object-cover" />
	                  <span className="absolute left-1.5 top-1.5 rounded bg-[#5E97C7] px-1.5 py-0.5 text-[11px] font-black text-white">
                    {photo.order}
                  </span>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel id="input" title="입력" testId="input-panel">
          <div className="grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-sm font-black">주제 <span className="text-red-600">(필수)</span></span>
              <input
                data-testid="theme-input"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                className="h-11 rounded-md border border-[#CFE1EE] bg-white px-3 text-[15px] font-semibold outline-none focus:border-[#8EC5EA]"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-black">웹툰 제목 <span className="text-[#7B8FA3]">(선택)</span></span>
              <input
                data-testid="toon-title-input"
                value={toonTitle}
                onChange={(event) => setToonTitle(event.target.value)}
                maxLength={32}
                placeholder="비워두면 자동 생성"
                className="h-11 rounded-md border border-[#CFE1EE] bg-white px-3 text-[15px] font-semibold outline-none focus:border-[#8EC5EA]"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-black">전체 에피소드 <span className="text-red-600">(필수)</span></span>
              <textarea
                data-testid="episode-input"
                value={episode}
                onChange={(event) => setEpisode(event.target.value)}
                maxLength={500}
                rows={3}
	                className="resize-none rounded-md border border-[#CFE1EE] bg-white px-3 py-2 text-[15px] font-semibold leading-6 outline-none focus:border-[#8EC5EA]"
              />
            </label>
          </div>
        </Panel>

        <Panel
          id="scene"
          title="시간순서와 장면별 의미"
          testId="scene-panel"
	          action={<span className="text-xs font-bold text-[#8CA6BA]">총 {sortedPhotos.length}개 장면</span>}
        >
          <div className="grid gap-2">
            {sortedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onDragOver={handleSceneDragOver}
                onDrop={(event) => handleSceneDrop(event, index)}
                className={`grid grid-cols-[28px_54px_minmax(0,1fr)_38px] items-center gap-2 rounded-md border border-[#DDEAF3] bg-[#FBFDFF] p-2 ${
                  draggingPhotoId === photo.id ? "opacity-60 ring-2 ring-[#8EC5EA]" : ""
                }`}
              >
                <button
                  type="button"
                  draggable
                  data-testid={`scene-drag-${index + 1}`}
                  aria-label={`${photo.order}번 장면 순서 조정`}
                  title="순서 조정"
                  onDragStart={(event) => handleSceneDragStart(event, photo.id)}
                  onDragEnd={() => setDraggingPhotoId(null)}
                  className="inline-flex h-10 w-7 cursor-grab items-center justify-center rounded-md text-[#8CA6BA] outline-none transition hover:bg-[#EEF7FD] focus-visible:ring-2 focus-visible:ring-[#8EC5EA] active:cursor-grabbing"
                >
                  <GripVertical className="h-5 w-5" aria-hidden="true" />
                </button>
                <img src={photo.dataUrl} alt="" className="h-12 w-14 rounded object-cover" />
                <div className="grid min-w-0 gap-1.5">
                  <label className="min-w-0">
                    <span className="sr-only">{index + 1}번째 장면별 의미</span>
                    <input
                      data-testid={`scene-note-${index + 1}`}
                      value={photo.sceneNote}
                      onChange={(event) => updateSceneNote(photo.id, event.target.value)}
                      placeholder={`${index + 1}번째 장면 의미`}
                      className="h-10 w-full rounded-md border border-[#CFE1EE] bg-white px-2 text-sm font-semibold outline-none focus:border-[#8EC5EA]"
                    />
                  </label>
                  <label className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-black text-[#5E6C7A]">
                    <input
                      type="checkbox"
                      data-testid={`scene-person-${index + 1}`}
                      checked={photo.hasPerson}
                      onChange={(event) => updateScenePerson(photo.id, event.target.checked)}
                      className="h-4 w-4 shrink-0 accent-[#DFFF00]"
                    />
                    <span className="truncate">인물 있음</span>
                  </label>
                </div>
                <IconButton label={`${photo.order}번 사진 삭제`} onClick={() => removePhoto(photo.id)}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            ))}
            {sortedPhotos.length === 0 ? (
	              <div className="rounded-md border border-dashed border-[#CFE1EE] bg-[#F7FBFE] p-4 text-center text-sm font-bold text-[#8CA6BA]">
                사진을 추가하면 장면 순서가 나타납니다.
              </div>
            ) : null}
          </div>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2">
          <Panel id="face" title="주인공 얼굴" testId="face-panel">
            {selectedPhoto ? (
              <div className="grid gap-3">
                <button
                  type="button"
                  data-testid="selected-face"
                  onClick={() => setSelectedPhotoId(selectedPhoto.id)}
	                  className="relative overflow-hidden rounded-md border-2 border-[#8EC5EA] bg-[#EAF3FA]"
                >
                  <img src={selectedPhoto.dataUrl} alt={selectedPhoto.name} className="aspect-square w-full object-cover" />
	                  <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3FA] text-[#5E97C7]">
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </span>
                </button>
                <div className="soft-scrollbar flex gap-2 overflow-x-auto">
                  {sortedPhotos.slice(0, 4).map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      aria-label={`${photo.order}번 얼굴 선택`}
                      onClick={() => setSelectedPhotoId(photo.id)}
                      className={`h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 ${
	                        selectedPhotoId === photo.id ? "border-[#8EC5EA]" : "border-[#CFE1EE]"
                      }`}
                    >
                      <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
	              <div className="flex aspect-square items-center justify-center rounded-md bg-[#F4F9FD] text-sm font-bold text-[#8CA6BA]">
                얼굴 후보 대기
              </div>
            )}
          </Panel>

          <Panel
            id="generate"
            title="생성 진행 상황"
            testId="generation-panel"
            action={
              <button
                type="button"
                data-testid="generate-button"
                onClick={() => void generateToon()}
                disabled={!canGenerate || phase === "story" || phase === "cuts" || phase === "cover"}
	                className="inline-flex items-center gap-1.5 rounded-md bg-[#5E97C7] px-3 py-2 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
              >
                {phase === "story" || phase === "cuts" || phase === "cover" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                생성
              </button>
            }
          >
            <div className="grid gap-2 text-sm font-bold">
              {[
                ["스토리 구성", story ? "완료" : phase === "story" ? "진행" : "대기"],
                [toonTitle.trim() ? "제목 고정" : "제목 생성", story?.episode_title ? "완료" : phase === "story" ? "진행" : "대기"],
                ["컷 생성", cuts.length > 0 ? `${cuts.length}컷 완료` : phase === "cuts" ? "진행" : "대기"],
                ["표지 이미지", cover ? "완료" : phase === "cover" ? "진행" : "대기"],
              ].map(([label, value]) => (
	                <div key={label} className="flex items-center justify-between rounded-md bg-[#F4F9FD] px-3 py-2">
	                  <span>{label}</span>
	                  <span className={value === "대기" ? "text-[#8CA6BA]" : "text-[#5E97C7]"}>{value}</span>
                </div>
              ))}
            </div>
            {error ? <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p> : null}
            {inputErrors.length > 0 ? (
	              <p className="mt-3 text-xs font-bold text-[#8CA6BA]">{inputErrors[0]}</p>
            ) : null}
          </Panel>
        </div>

        {story ? (
          <Panel title="스토리와 제목" testId="story-panel">
            <h3 data-testid="episode-title" className="text-[25px] font-black leading-tight">
              {story.episode_title}
            </h3>
	            <p className="mt-1 text-sm font-bold text-[#7B8FA3]">{story.genre} · {story.tones.join(" · ")}</p>
            <div className="mt-3 grid gap-2">
              {story.beats.map((beat) => (
	                <div key={beat.index} className="rounded-md border border-[#DDEAF3] bg-[#FBFDFF] p-3">
	                  <div className="text-xs font-black text-[#8CA6BA]">CUT {beat.index}</div>
                  <p className="mt-1 text-sm font-bold leading-5">{beat.text}</p>
                  <p className="mt-2 rounded bg-white px-2 py-1 text-sm font-black">“{beat.bubble_text.join(" ")}”</p>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {cover ? (
          <Panel title="표지+제목" testId="cover-panel">
            <div data-testid="cover-frame" className="relative aspect-square overflow-hidden rounded-md bg-black">
              <img src={cover.cover_url} alt={cover.title_text} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/84 to-transparent p-4">
                {cover.title_lockup_url ? (
                  <img src={cover.title_lockup_url} alt={cover.title_text} className="mx-auto w-[74%] max-w-[300px] drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]" />
                ) : (
                  <div className="text-[25px] font-black leading-tight text-[#8EC5EA] drop-shadow">{cover.title_text}</div>
                )}
              </div>
            </div>
          </Panel>
        ) : null}

            {cuts.length > 0 ? (
          <Panel id="viewer" title="웹툰 뷰어" testId="viewer-panel">
            <div data-testid="webtoon-strip" className="overflow-hidden rounded-md bg-[#0b0b0d] p-2">
              {cover ? (
                <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
                  <img src={cover.cover_url} alt={cover.title_text} className="h-full w-full object-cover" />
                  <div className="absolute bottom-3 left-3 right-3 text-[23px] font-black leading-tight text-[#8EC5EA]">
                    {cover.title_text}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-2">
                {cuts.map((cut) => (
                  <img
                    key={cut.index}
                    data-testid="generated-cut"
                    src={cut.image_url}
                    alt={`${cut.index}번째 웹툰 컷`}
                    className="w-full rounded-md border border-white/10"
                  />
                ))}
              </div>
            </div>
          </Panel>
        ) : null}

          </>
        ) : null}

        {activeView === "share" ? (
          <Panel id="share" title="공유" testId="share-panel">
            {cuts.length > 0 ? (
              <div data-testid="share-card" className="rounded-md border border-[#CFE1EE] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black">{story?.episode_title}</div>
                    <div className="text-sm font-bold text-[#7B8FA3]">나도 만들기 · phototoon.local</div>
                  </div>
                  <button
                    type="button"
                    data-testid="share-button"
                    onClick={() => void shareToon()}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-[#5E97C7] px-3 text-sm font-black text-white"
                  >
                    {shareState === "idle" ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    {shareState === "idle" ? "공유" : "준비됨"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                data-testid="share-card"
                className="rounded-md border border-dashed border-[#CFE1EE] bg-[#F7FBFE] p-4 text-center text-sm font-bold text-[#8CA6BA]"
              >
                공유할 웹툰이 아직 없습니다.
              </div>
            )}
          </Panel>
        ) : null}

        {activeView === "library" ? (
          <Panel
            id="library"
            title="나만의 페이지 작품집"
            testId="library-panel"
            action={
              <button
                type="button"
                data-testid="save-button"
                onClick={() => void saveToLibrary()}
                disabled={!story || !cover || cuts.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#5E97C7] px-3 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Library className="h-4 w-4" />
                저장
              </button>
            }
          >
            <label className="mb-3 grid gap-1.5">
              <span className="text-sm font-black">사용자 카테고리</span>
              <select
                data-testid="category-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 rounded-md border border-[#CFE1EE] bg-white px-3 text-[15px] font-black outline-none focus:border-[#8EC5EA]"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3">
              {library.length === 0 ? (
                <div className="rounded-md border border-dashed border-[#CFE1EE] bg-[#F7FBFE] p-4 text-center text-sm font-bold text-[#8CA6BA]">
                  저장된 웹툰이 아직 없습니다.
                </div>
              ) : (
                library.map((item) => (
                  <article key={item.id} data-testid="saved-toon" className="grid grid-cols-[92px_1fr] gap-3 rounded-md border border-[#DDEAF3] bg-[#FBFDFF] p-2">
                    <img src={item.cover_url} alt={item.episode_title} className="aspect-square w-full rounded object-cover" />
                    <div className="min-w-0">
                      <h3 className="truncate text-[17px] font-black">{item.episode_title}</h3>
                      <p className="mt-1 text-sm font-bold text-[#7B8FA3]">{item.category ?? "미분류"} · 원본 사진 {item.photos.length}장</p>
                      <div className="mt-2 flex gap-1">
                        {item.photos.slice(0, 4).map((photo) => (
                          <img key={photo.id} src={photo.dataUrl} alt={photo.name} className="h-8 w-8 rounded object-cover" />
                        ))}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Panel>
        ) : null}
      </div>

      <nav
        aria-label="주요 섹션"
        className="app-bottom-nav absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-[#CFE1EE] bg-white/88 p-1 text-[#3A4250] backdrop-blur-xl"
        style={{
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.62), inset 0 -1px 1px rgba(94,151,199,0.18), 0 16px 34px rgba(0,0,0,0.24)",
        }}
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;

          return (
            <button
              key={item.key}
              type="button"
              data-testid={`${item.key}-nav-button`}
              aria-current={active ? "page" : undefined}
              onClick={() => openView(item.key)}
              className={`flex h-9 min-w-[68px] items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 text-[10.5px] font-semibold transition-colors ${
                active ? "bg-[#EAF3FA] text-[#3A4250] ring-1 ring-[#CFE1EE]" : "text-[#5E97C7] hover:bg-[#EAF3FA]/70 hover:text-[#3A4250]"
              }`}
              style={
                active
	                  ? {
	                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.72), inset 0 -1px 1px rgba(94,151,199,0.18), 0 7px 16px rgba(94,151,199,0.16)",
	                    }
                  : undefined
              }
            >
              <Icon className="h-[13px] w-[13px]" strokeWidth={active ? 2.35 : 2.05} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}
