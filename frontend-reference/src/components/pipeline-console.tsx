"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  GalleryVertical,
  LoaderCircle,
  Plus,
  Sparkles,
  Square,
  Trash2,
  WandSparkles,
} from "lucide-react";

import {
  CHARACTER_LIMITS,
  CHARACTER_ROLES,
  CREATOR_GENRES,
  CREATOR_TONES,
  IMAGE_VOLUME_TIERS,
  pickCreatorTitlePreset,
} from "@/lib/generation/creator-reference";
import { localeToggleLabels, nextLocale, readerNavLabels } from "@/lib/locale";
import type {
  CharacterDraft,
  CharacterRole,
  CreatorCanvasMode,
  CreatorGenre,
  CreatorTone,
  PageImageCount,
  PageImageBrief,
  PageImagePurpose,
  SupportedLocale,
  ToonDraft,
} from "@/lib/types";

type PipelineResponse = {
  mode: "demo" | "live";
  toonDraft: ToonDraft;
};

const titlePlaceholder = "제목을 선택하거나 직접 입력";
const TITLE_PICK_DELAY_MS = 320;

function Logo() {
  return (
    <div
      className="font-black leading-none"
      style={{
        fontFamily: "'Archivo Black', var(--font-geist-sans), sans-serif",
        fontSize: 30,
        letterSpacing: "-1.2px",
      }}
    >
      <span className="text-white">Wa</span>
      <span className="text-[#E4F222]">Wo</span>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-[21px] w-[21px] shrink-0"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.8l-6.5 5C9.5 39.6 16.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.3-4.1 5.6l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z"
      />
    </svg>
  );
}

function CreatorNavPill({ locale }: { locale: SupportedLocale }) {
  const nextLanguage = nextLocale(locale);
  const labels = readerNavLabels[locale];
  const items = [
    { key: "recommended", label: labels.recommended, href: `/?lang=${locale}` },
    {
      key: "popular",
      label: labels.popular,
      href: `/?tab=popular&lang=${locale}`,
    },
    { key: "my", label: labels.my, href: `/archive?lang=${locale}` },
    {
      key: "language",
      label: localeToggleLabels[locale],
      href: `/pipeline?lang=${nextLanguage}`,
    },
  ] as const;

  return (
    <div
      className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-0.5 rounded-full border border-white/10 bg-[rgba(20,20,22,0.75)] p-[5px]"
      style={{
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
      }}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="min-w-[48px] whitespace-nowrap rounded-full px-[13px] py-[9px] text-center text-[13px] font-semibold tracking-[-0.2px]"
          style={{
            color: item.key === "my" ? "#0b0b0d" : "rgba(255,255,255,0.75)",
            background: item.key === "my" ? "#fff" : "transparent",
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function toneLabel(tones: CreatorTone[]) {
  return tones.join(" · ");
}

function tierForPageImages(pageImages: PageImageCount) {
  if (pageImages === 1) {
    return "demo" as const;
  }

  if (pageImages === 3) {
    return "compact" as const;
  }

  if (pageImages === 5) {
    return "rich" as const;
  }

  return "recommended" as const;
}

function purposeForIndex(index: number, total: number): PageImagePurpose {
  if (index === 1) {
    return "도입";
  }

  if (index === total) {
    return "마무리";
  }

  if (total >= 4 && index === total - 1) {
    return "클라이맥스";
  }

  if (total >= 5 && index === 3) {
    return "반전";
  }

  return "전개";
}

function makeBrief(
  imageIndex: number,
  total: PageImageCount,
  draft: ToonDraft,
): PageImageBrief {
  const purpose = purposeForIndex(imageIndex, total);

  return {
    imageIndex,
    purpose,
    sceneContent: `${draft.title} ${imageIndex}번째 이미지. ${purpose} 역할의 핵심 장면을 자연스러운 웹툰 페이지 구성으로 보여준다.`,
    emotionalBeat: `${purpose} 감정이 분명하게 읽힌다.`,
    entryTransition:
      imageIndex === 1
        ? "첫 화면 상단에서 장소와 분위기가 바로 열린다."
        : "이전 이미지 하단에 남긴 시선, 소품, 빛 방향을 상단에서 이어받는다.",
    exitTransition:
      imageIndex === total
        ? "마지막 하단에서 감정의 여운을 남긴다."
        : "하단에 다음 이미지가 이어받을 시선, 움직임, 문, 손, 소품, 빛 방향 중 하나를 남긴다.",
    mustShow: [
      "주요 인물의 표정",
      "장르를 드러내는 장소",
      "다음 이미지로 이어지는 소품",
    ],
  };
}

function createBlankCharacter(index: number): CharacterDraft {
  return {
    id: `character-${Date.now()}-${index}`,
    name: "",
    age: "20대",
    role: index === 0 ? "주인공" : "조력자",
    personality: "",
    storyFunction: "",
    visualHint: "",
  };
}

export function PipelineConsole({
  locale,
  requiresLogin,
  generationAccessDeniedMessage,
}: {
  pipelineLabel: string;
  locale: SupportedLocale;
  requiresLogin: boolean;
  generationAccessDeniedMessage: string | null;
}) {
  const [genre, setGenre] = useState<CreatorGenre>("학원");
  const [tones, setTones] = useState<CreatorTone[]>(["설렘"]);
  const [title, setTitle] = useState(() => pickCreatorTitlePreset("학원"));
  const [idea, setIdea] = useState("");
  const [pending, setPending] = useState(false);
  const [generationPending, setGenerationPending] = useState(false);
  const [titlePicking, setTitlePicking] = useState(false);
  const [, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ToonDraft | null>(null);
  const [canvasMode, setCanvasMode] = useState<CreatorCanvasMode>("scroll");
  const [selectedPageImages, setSelectedPageImages] = useState<PageImageCount>(4);
  const titlePickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titlePickTokenRef = useRef(0);

  useEffect(
    () => () => {
      if (titlePickTimeoutRef.current) {
        clearTimeout(titlePickTimeoutRef.current);
      }
    },
    [],
  );

  function cancelTitlePick() {
    titlePickTokenRef.current += 1;

    if (titlePickTimeoutRef.current) {
      clearTimeout(titlePickTimeoutRef.current);
      titlePickTimeoutRef.current = null;
    }

    setTitlePicking(false);
  }

  function scheduleTitlePick(nextGenre: CreatorGenre) {
    cancelTitlePick();
    setConfirmed(false);
    setError(null);
    setGenerationError(null);
    setIdea("");
    setTitlePicking(true);

    const token = titlePickTokenRef.current;
    titlePickTimeoutRef.current = setTimeout(() => {
      if (titlePickTokenRef.current !== token) {
        return;
      }

      setTitle(pickCreatorTitlePreset(nextGenre));
      setTitlePicking(false);
      titlePickTimeoutRef.current = null;
    }, TITLE_PICK_DELAY_MS);
  }

  function toggleTone(tone: CreatorTone) {
    setConfirmed(false);
    setTones((current) => {
      if (current.includes(tone)) {
        return current.length === 1 ? current : current.filter((item) => item !== tone);
      }

      if (current.length < 2) {
        return [...current, tone];
      }

      return [current[1], tone];
    });
  }

  function updateDraftField<Key extends keyof ToonDraft>(
    key: Key,
    value: ToonDraft[Key],
  ) {
    setConfirmed(false);
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateCharacter(
    characterIndex: number,
    patch: Partial<CharacterDraft>,
  ) {
    setConfirmed(false);
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        characters: current.characters.map((character, index) =>
          index === characterIndex ? { ...character, ...patch } : character,
        ),
      };
    });
  }

  function addCharacter() {
    setConfirmed(false);
    setDraft((current) => {
      if (!current || current.characters.length >= CHARACTER_LIMITS.max) {
        return current;
      }

      return {
        ...current,
        characters: [
          ...current.characters,
          createBlankCharacter(current.characters.length),
        ],
      };
    });
  }

  function removeCharacter(characterIndex: number) {
    setConfirmed(false);
    setDraft((current) => {
      if (!current || current.characters.length <= CHARACTER_LIMITS.min) {
        return current;
      }

      return {
        ...current,
        characters: current.characters.filter((_, index) => index !== characterIndex),
      };
    });
  }

  function updateVolume(pageImages: PageImageCount) {
    setSelectedPageImages(pageImages);
    setConfirmed(false);
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const firstBrief = current.pageBriefs[0]
        ? {
            ...current.pageBriefs[0],
            imageIndex: 1,
            purpose: purposeForIndex(1, pageImages),
          }
        : makeBrief(1, pageImages, current);

      return {
        ...current,
        volumeRecommendation: {
          ...current.volumeRecommendation,
          tier: tierForPageImages(pageImages),
          pageImages,
        },
        pageBriefs: [firstBrief],
      };
    });
  }

  function updateBrief(briefIndex: number, patch: Partial<PageImageBrief>) {
    setConfirmed(false);
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        pageBriefs: current.pageBriefs.map((brief, index) =>
          index === briefIndex ? { ...brief, ...patch } : brief,
        ),
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setConfirmed(false);
    setError(null);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generation/toon-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          tones,
          title,
          idea,
          pageImages: selectedPageImages,
          canvasMode,
        }),
      });

      const payload = (await response.json()) as
        | PipelineResponse
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload ? payload.error : "제작안 생성에 실패했습니다.",
        );
      }

      setSelectedPageImages(payload.toonDraft.volumeRecommendation.pageImages);
      setDraft(payload.toonDraft);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "제작안 생성 중 오류가 생겼습니다.");
    } finally {
      setPending(false);
    }
  }

  function handlePickTitle() {
    scheduleTitlePick(genre);
  }

  async function handleStartGeneration() {
    if (!draft) {
      return;
    }

    setGenerationPending(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/generation/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          canvasMode,
        }),
      });
      const payload = (await response.json()) as
        | { job: { id: string } }
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload ? payload.error : "이미지 제작 시작에 실패했습니다.",
        );
      }

      window.location.href = `/archive?lang=${locale}&job=${payload.job.id}`;
    } catch (caught) {
      setGenerationError(
        caught instanceof Error ? caught.message : "이미지 제작 시작 중 오류가 생겼습니다.",
      );
      setGenerationPending(false);
    }
  }

  return (
    <div className="reader-shell relative flex h-[100svh] flex-col">
      <div className="border-b border-white/10 px-5 pb-4 pt-[58px]">
        <Logo />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
          CREATOR STUDIO
        </p>
      </div>

      <main
        className="soft-scrollbar flex-1 overflow-y-auto px-[6px] pb-44 pt-3"
        style={{ scrollPaddingBottom: "180px" }}
      >
        {requiresLogin ? (
          <section className="mx-2 overflow-hidden rounded-[20px] border border-white/10 bg-[#121214] p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#E4F222]">
                Google account
              </div>
              <p className="mt-1 text-[21px] font-black leading-tight tracking-[-0.5px] text-white">
                로그인하고 제작을 시작하세요
              </p>
            </div>
            <p className="mt-4 text-[13px] leading-5 text-white/54">
              제작안 생성, 저장, 게시 내역이 내 계정에 안전하게 연결됩니다.
            </p>
            <Link
              href={`/onboarding?lang=${locale}&next=${encodeURIComponent("/pipeline")}`}
              className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-black text-[#111113] transition hover:bg-white/92"
            >
              <GoogleLogo />
              <span className="text-[#111113]">Google로 계속하기</span>
            </Link>
            <p className="mt-3 text-center text-[11px] leading-4 text-white/35">
              첫 로그인 후 선택한 언어와 제작 설정이 유지됩니다.
            </p>
          </section>
        ) : generationAccessDeniedMessage ? (
          <section className="mx-2 overflow-hidden rounded-[20px] border border-white/10 bg-[#121214] p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#E4F222]">
              Creator access
            </div>
            <p className="mt-1 text-[21px] font-black leading-tight tracking-[-0.5px] text-white">
              현재 계정은 제작 권한이 없어요
            </p>
            <p className="mt-4 text-[13px] leading-5 text-white/54">
              {generationAccessDeniedMessage}
            </p>
            <Link
              href={`/?lang=${locale}`}
              className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-[15px] font-black text-[#111113] transition hover:bg-white/92"
            >
              작품 보러가기
            </Link>
          </section>
        ) : (
          <div className="space-y-3">
            <form
              onSubmit={handleSubmit}
              className="mx-2 space-y-4 rounded-[12px] border border-white/10 bg-white/[0.04] p-4"
            >
              <section className="space-y-2">
                <label className="text-[15px] font-black tracking-[-0.2px] text-white/72">
                  장르
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CREATOR_GENRES.map((item) => {
                    const selected = item === genre;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setGenre(item);
                          scheduleTitlePick(item);
                        }}
                        className={`min-h-11 rounded-full border px-1 text-[15px] font-bold tracking-[-0.2px] transition ${
                          selected
                            ? "border-white bg-white text-[#0b0b0d]"
                            : "border-white/10 bg-white/[0.03] text-white/66 hover:border-white/18 hover:bg-white/[0.06]"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[15px] font-black tracking-[-0.2px] text-white/72">
                    톤
                  </label>
                  <span className="font-mono text-[12px] text-white/42">MAX 2</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {CREATOR_TONES.map((item) => {
                    const selected = tones.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleTone(item)}
                        className={`min-h-11 rounded-full border px-1 text-[15px] font-bold tracking-[-0.2px] transition ${
                          selected
                            ? "border-[#E4F222] bg-[#E4F222] text-[#0b0b0d]"
                            : "border-white/10 bg-white/[0.03] text-white/66 hover:border-white/18 hover:bg-white/[0.06]"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[15px] font-black tracking-[-0.2px] text-white/72">
                    출력 방식
                  </label>
                  <span className="font-mono text-[12px] text-white/42">
                    {canvasMode === "scroll" ? "9:16" : "1:1"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "square" as const,
                      label: "1:1 카드",
                      meta: "SQUARE",
                      icon: Square,
                    },
                    {
                      id: "scroll" as const,
                      label: "세로 스크롤",
                      meta: "9:16 · 1152×2048",
                      icon: GalleryVertical,
                    },
                  ].map((option) => {
                    const selected = canvasMode === option.id;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setCanvasMode(option.id);
                          setConfirmed(false);
                        }}
                        className={`rounded-[10px] border p-3 text-left transition ${
                          selected
                            ? "border-[#E4F222] bg-[#E4F222] text-[#0b0b0d]"
                            : "border-white/10 bg-black/20 text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2 text-[13px] font-black">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </span>
                        <span
                          className={`mt-1 block font-mono text-[10px] ${
                            selected ? "text-black/48" : "text-white/35"
                          }`}
                        >
                          {option.meta}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[15px] font-black tracking-[-0.2px] text-white/72">
                    이미지 수
                  </label>
                  <span className="font-mono text-[12px] text-white/42">
                    {selectedPageImages} IMG
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_VOLUME_TIERS.map((tier) => {
                    const selected = selectedPageImages === tier.pageImages;

                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => updateVolume(tier.pageImages)}
                        className={`rounded-[10px] border p-3 text-left transition ${
                          selected
                            ? "border-white bg-white text-[#0b0b0d]"
                            : "border-white/10 bg-black/20 text-white"
                        }`}
                      >
                        <span className="block text-[13px] font-black">
                          {tier.label}
                        </span>
                        <span
                          className={`mt-1 block font-mono text-[10px] ${
                            selected ? "text-black/45" : "text-white/35"
                          }`}
                        >
                          {tier.pageImages} IMG
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <button
                type="button"
                onClick={() => {
                  handlePickTitle();
                }}
                disabled={titlePicking}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E4F222]/45 bg-[#E4F222]/10 px-4 text-[13px] font-black text-[#E4F222] transition hover:bg-[#E4F222]/14 disabled:opacity-55"
              >
                {titlePicking ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {titlePicking ? "제목 고르는 중" : "제목 랜덤 선택"}
              </button>

              <label className="block space-y-2">
                <span className="text-[13px] font-bold tracking-[-0.1px] text-white/58">
                  제목
                </span>
                <input
                  value={title}
                  onChange={(event) => {
                    cancelTitlePick();
                    setTitle(event.target.value);
                    setConfirmed(false);
                  }}
                  aria-busy={titlePicking}
                  placeholder={titlePlaceholder}
                  className="min-h-12 w-full rounded-[10px] border border-white/10 bg-black/28 px-3 text-[15px] font-black text-white outline-none transition placeholder:font-semibold placeholder:text-white/25 focus:border-white/28"
                />
              </label>

              <button
                type="submit"
                disabled={pending}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E4F222] px-5 text-[14px] font-black text-[#0b0b0d] shadow-[0_14px_36px_rgba(228,242,34,0.18)] disabled:opacity-65"
              >
                {pending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <WandSparkles className="h-4 w-4" />
                )}
                제작안 만들기
              </button>

              {error ? (
                <p className="rounded-[10px] bg-[#ff453a]/15 px-3 py-2 text-[13px] font-semibold text-[#ff9b86]">
                  {error}
                </p>
              ) : null}

              <Link
                href={`/archive?lang=${locale}`}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-[13px] font-bold text-white/62 transition hover:border-white/18 hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                MY로 돌아가기
              </Link>
            </form>

            {draft ? (
              <section className="space-y-3">
                <article className="mx-2 rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#E4F222]">
                        {draft.genre} · {toneLabel(draft.tones)}
                      </p>
                      <p className="mt-2 text-[13px] leading-5 text-white/52">
                        {draft.volumeRecommendation.reason}
                      </p>
                    </div>
                    <Sparkles className="h-5 w-5 shrink-0 text-white/28" />
                  </div>

                  <label className="mt-4 block space-y-2">
                    <span className="text-[13px] font-bold text-white">제목</span>
                    <input
                      value={draft.title}
                      onChange={(event) => updateDraftField("title", event.target.value)}
                      className="min-h-11 w-full rounded-[10px] border border-white/10 bg-black/28 px-3 text-[16px] font-black text-white outline-none focus:border-white/28"
                    />
                  </label>

                  <label className="mt-3 block space-y-2">
                    <span className="text-[13px] font-bold text-white">훅</span>
                    <textarea
                      value={draft.hook}
                      onChange={(event) => updateDraftField("hook", event.target.value)}
                      rows={3}
                      className="soft-scrollbar min-h-24 w-full rounded-[10px] border border-white/10 bg-black/28 px-3 py-3 text-[14px] leading-6 text-white outline-none focus:border-white/28"
                    />
                  </label>
                </article>

                <article className="mx-2 rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-[15px] font-black text-white">이미지 수</h2>
                    <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-white/60">
                      {draft.volumeRecommendation.pageImages} IMG
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {IMAGE_VOLUME_TIERS.map((tier) => {
                      const selected =
                        draft.volumeRecommendation.pageImages === tier.pageImages;

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => updateVolume(tier.pageImages)}
                          className={`rounded-[10px] border p-3 text-left transition ${
                            selected
                              ? "border-white bg-white text-[#0b0b0d]"
                              : "border-white/10 bg-black/20 text-white"
                          }`}
                        >
                          <span className="block text-[13px] font-black">
                            {tier.label}
                          </span>
                          <span
                            className={`mt-1 block font-mono text-[10px] ${
                              selected ? "text-black/45" : "text-white/35"
                            }`}
                          >
                            {tier.pageImages} IMG
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>

                <article className="mx-2 rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-[15px] font-black text-white">출력 방식</h2>
                    <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-white/60">
                      POC
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: "square" as const,
                        label: "1:1 카드",
                        meta: "SQUARE",
                        icon: Square,
                      },
                      {
                        id: "scroll" as const,
                        label: "세로 스크롤",
                        meta: "9:16 · 1152×2048",
                        icon: GalleryVertical,
                      },
                    ].map((option) => {
                      const selected = canvasMode === option.id;
                      const Icon = option.icon;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setCanvasMode(option.id);
                            setConfirmed(false);
                          }}
                          className={`rounded-[10px] border p-3 text-left transition ${
                            selected
                              ? "border-[#E4F222] bg-[#E4F222] text-[#0b0b0d]"
                              : "border-white/10 bg-black/20 text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2 text-[13px] font-black">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </span>
                          <span
                            className={`mt-1 block font-mono text-[10px] ${
                              selected ? "text-black/48" : "text-white/35"
                            }`}
                          >
                            {option.meta}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>

                <article className="mx-2 rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-[15px] font-black text-white">등장인물</h2>
                    <button
                      type="button"
                      onClick={addCharacter}
                      disabled={draft.characters.length >= CHARACTER_LIMITS.max}
                      className="flex min-h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[12px] font-bold text-white/78 disabled:opacity-35"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      추가
                    </button>
                  </div>

                  <div className="space-y-3">
                    {draft.characters.map((character, index) => (
                      <div key={character.id} className="rounded-[10px] border border-white/10 bg-black/20 p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] text-white/35">
                            {index + 1}/{CHARACTER_LIMITS.max}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCharacter(index)}
                            disabled={draft.characters.length <= CHARACTER_LIMITS.min}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white/36 transition hover:bg-white/10 hover:text-[#ff6b5a] disabled:opacity-30"
                            aria-label="등장인물 삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-[1fr_84px] gap-2">
                          <label className="space-y-1.5">
                            <span className="text-[11px] font-bold text-white/45">이름</span>
                            <input
                              value={character.name}
                              onChange={(event) =>
                                updateCharacter(index, { name: event.target.value })
                              }
                              className="min-h-10 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 text-[13px] text-white outline-none focus:border-white/28"
                            />
                          </label>
                          <label className="space-y-1.5">
                            <span className="text-[11px] font-bold text-white/45">나이</span>
                            <input
                              value={character.age}
                              onChange={(event) =>
                                updateCharacter(index, { age: event.target.value })
                              }
                              className="min-h-10 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 text-[13px] text-white outline-none focus:border-white/28"
                            />
                          </label>
                        </div>

                        <label className="mt-2 block space-y-1.5">
                          <span className="text-[11px] font-bold text-white/45">역할</span>
                          <select
                            value={character.role}
                            onChange={(event) =>
                              updateCharacter(index, {
                                role: event.target.value as CharacterRole,
                              })
                            }
                            className="min-h-10 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 text-[13px] text-white outline-none focus:border-white/28"
                          >
                            {CHARACTER_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="mt-2 block space-y-1.5">
                          <span className="text-[11px] font-bold text-white/45">성격</span>
                          <input
                            value={character.personality}
                            onChange={(event) =>
                              updateCharacter(index, { personality: event.target.value })
                            }
                            className="min-h-10 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 text-[13px] text-white outline-none focus:border-white/28"
                          />
                        </label>

                        <label className="mt-2 block space-y-1.5">
                          <span className="text-[11px] font-bold text-white/45">정보</span>
                          <textarea
                            value={character.storyFunction}
                            onChange={(event) =>
                              updateCharacter(index, { storyFunction: event.target.value })
                            }
                            rows={2}
                            className="soft-scrollbar min-h-16 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 py-2 text-[13px] leading-5 text-white outline-none focus:border-white/28"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="mx-2 rounded-[12px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[15px] font-black text-white">
                        1번 장면 가이드
                      </h2>
                      <p className="mt-1 text-[12px] leading-5 text-white/45">
                        2번 이후 이미지는 직전 이미지를 입력으로 받아 자연스럽게 이어서 생성합니다.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/55">
                      총 {draft.volumeRecommendation.pageImages} IMG
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {draft.pageBriefs.slice(0, 1).map((brief, index) => (
                      <div
                        key={brief.imageIndex}
                        className="block rounded-[10px] border border-white/10 bg-black/20 p-3"
                      >
                        <span className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-[13px] font-black text-white">
                            이미지 {brief.imageIndex}
                          </span>
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/55">
                            {brief.purpose}
                          </span>
                        </span>
                        <textarea
                          value={brief.sceneContent}
                          onChange={(event) =>
                            updateBrief(index, { sceneContent: event.target.value })
                          }
                          rows={4}
                          className="soft-scrollbar min-h-28 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 py-3 text-[13px] leading-6 text-white outline-none focus:border-white/28"
                        />

                        <label className="mt-3 block space-y-1.5">
                          <span className="text-[11px] font-bold text-white/45">
                            상단 진입
                          </span>
                          <textarea
                            value={brief.entryTransition}
                            onChange={(event) =>
                              updateBrief(index, {
                                entryTransition: event.target.value,
                              })
                            }
                            rows={2}
                            className="soft-scrollbar min-h-16 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 py-2 text-[13px] leading-5 text-white outline-none focus:border-white/28"
                          />
                        </label>

                        <label className="mt-3 block space-y-1.5">
                          <span className="text-[11px] font-bold text-white/45">
                            하단 연결
                          </span>
                          <textarea
                            value={brief.exitTransition}
                            onChange={(event) =>
                              updateBrief(index, {
                                exitTransition: event.target.value,
                              })
                            }
                            rows={2}
                            className="soft-scrollbar min-h-16 w-full rounded-[8px] border border-white/10 bg-black/24 px-3 py-2 text-[13px] leading-5 text-white outline-none focus:border-white/28"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </article>

                <button
                  type="button"
                  onClick={() => {
                    void handleStartGeneration();
                  }}
                  disabled={generationPending}
                  className="mx-2 flex min-h-12 w-[calc(100%-16px)] items-center justify-center gap-2 rounded-full bg-[#E4F222] px-4 text-[14px] font-black text-[#0b0b0d] shadow-[0_14px_36px_rgba(228,242,34,0.18)] disabled:opacity-65"
                >
                  {generationPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  이미지 제작 시작
                </button>

                {generationError ? (
                  <p className="mx-2 rounded-[10px] bg-[#ff453a]/15 px-3 py-2 text-[13px] font-semibold leading-5 text-[#ff9b86]">
                    {generationError}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
        )}
      </main>

      <CreatorNavPill locale={locale} />
    </div>
  );
}
