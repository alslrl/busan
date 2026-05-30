"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Globe2, Settings } from "lucide-react";

import { localeLabels, readerNavLabels, supportedLocales } from "@/lib/locale";
import type { ShortsToon, SupportedLocale } from "@/lib/types";

const feedCopy: Record<
  SupportedLocale,
  {
    tagline: string;
    settingsLabel: string;
    settingsTitle: string;
    languageLabel: string;
  }
> = {
  ko: {
    tagline: "나의 이야기를 전 세계로",
    settingsLabel: "설정",
    settingsTitle: "설정",
    languageLabel: "언어",
  },
  ja: {
    tagline: "一度公開して、世界中に届ける。",
    settingsLabel: "設定",
    settingsTitle: "設定",
    languageLabel: "言語",
  },
  en: {
    tagline: "Publish once. Read globally.",
    settingsLabel: "Settings",
    settingsTitle: "Settings",
    languageLabel: "Language",
  },
};

type PromoBanner = {
  eyebrow: string;
  title: string;
  body: string;
  imagePath: string;
  href: string;
};

const promoBanners: Record<SupportedLocale, PromoBanner[]> = {
  ko: [
    {
      eyebrow: "GLOBAL UGC",
      title: "이번 주 새 웹툰",
      body: "짧게 올라온 이야기를 바로 읽어보세요.",
      imagePath: "/phototoon-fixtures/scene-01.jpeg",
      href: "/?lang=ko",
    },
    {
      eyebrow: "CREATOR STUDIO",
      title: "나만의 웹툰 만들기",
      body: "아이디어에서 컷 구성까지 한 번에.",
      imagePath: "/phototoon-fixtures/scene-02.jpeg",
      href: "/archive?lang=ko",
    },
    {
      eyebrow: "KR · JP · EN",
      title: "언어별 자동 공개",
      body: "올리면 각 나라 독자에게 맞게 보입니다.",
      imagePath: "/phototoon-fixtures/scene-03.jpeg",
      href: "/?lang=ko",
    },
  ],
  ja: [
    {
      eyebrow: "GLOBAL UGC",
      title: "今週の新作",
      body: "短く届く物語をすぐ読めます。",
      imagePath: "/phototoon-fixtures/scene-01.jpeg",
      href: "/?lang=ja",
    },
    {
      eyebrow: "CREATOR STUDIO",
      title: "自分のウェブトゥーン",
      body: "アイデアからカット構成まで一気に。",
      imagePath: "/phototoon-fixtures/scene-02.jpeg",
      href: "/archive?lang=ja",
    },
    {
      eyebrow: "KR · JP · EN",
      title: "言語別に自動公開",
      body: "読者の言語に合わせて表示されます。",
      imagePath: "/phototoon-fixtures/scene-03.jpeg",
      href: "/?lang=ja",
    },
  ],
  en: [
    {
      eyebrow: "GLOBAL UGC",
      title: "New this week",
      body: "Read short stories from global creators.",
      imagePath: "/phototoon-fixtures/scene-01.jpeg",
      href: "/?lang=en",
    },
    {
      eyebrow: "CREATOR STUDIO",
      title: "Make your own webtoon",
      body: "From idea to storyboard in one flow.",
      imagePath: "/phototoon-fixtures/scene-02.jpeg",
      href: "/archive?lang=en",
    },
    {
      eyebrow: "KR · JP · EN",
      title: "Auto-localized release",
      body: "Publish once, show it in each reader's language.",
      imagePath: "/phototoon-fixtures/scene-03.jpeg",
      href: "/?lang=en",
    },
  ],
};

function Logo({ compact }: { compact: boolean }) {
  return (
    <div
      className="font-black leading-none"
      style={{
        fontFamily: "'Archivo Black', var(--font-geist-sans), sans-serif",
        fontSize: compact ? 17 : 30,
        letterSpacing: compact ? "-1px" : "-1.2px",
        opacity: compact ? 0.78 : 1,
        transform: compact ? "scaleX(1) scaleY(1)" : "scaleX(1) scaleY(1)",
      }}
    >
      <span className="text-white">Wa</span>
      <span className="text-[#E4F222]">Wo</span>
    </div>
  );
}

function FeedCardVideo({
  poster,
  src,
  title,
}: {
  poster: string | null;
  src: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const restartPlayback = () => {
      video.currentTime = 0;
      void video.play().catch(() => {
        // Mobile browsers can still defer autoplay in low-power or background states.
      });
    };

    restartPlayback();

    window.addEventListener("focus", restartPlayback);
    window.addEventListener("pageshow", restartPlayback);
    document.addEventListener("visibilitychange", restartPlayback);

    return () => {
      window.removeEventListener("focus", restartPlayback);
      window.removeEventListener("pageshow", restartPlayback);
      document.removeEventListener("visibilitychange", restartPlayback);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster ?? undefined}
      aria-label={`${title} animated preview`}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
    />
  );
}

function FeedCardReal({
  item,
  focused,
  activeTab,
  locale,
}: {
  item: ShortsToon;
  focused: boolean;
  activeTab: "recommended" | "popular";
  locale: SupportedLocale;
}) {
  const showVideo = focused && Boolean(item.coverVideoPath);
  const showTitleOverlay = focused && Boolean(item.coverTitleOverlayPath);

  return (
    <Link
      href={`/toon/${item.slug}?lang=${locale}`}
      className="relative block overflow-hidden rounded-[6px] bg-[#1a1a1c]"
      style={{
        height: focused ? "min(calc(100vw - 12px), 418px)" : "116px",
        boxShadow: focused ? "0 20px 60px rgba(0,0,0,0.6)" : undefined,
        transform: focused ? "scale(1)" : "scale(0.992)",
        transformOrigin: "center",
        transition:
          "height 520ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "height, transform",
      }}
    >
      <Image
        src={item.coverImagePath ?? ""}
        alt={item.title}
        fill
        sizes="430px"
        priority={focused}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      />
      {showVideo && item.coverVideoPath ? (
        <FeedCardVideo
          src={item.coverVideoPath}
          poster={item.coverImagePath ?? null}
          title={item.title}
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background: focused
            ? "linear-gradient(to top, rgba(0,0,0,0.72) 12%, rgba(0,0,0,0) 46%)"
            : "linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0) 100%)",
        }}
      />
      {item.coverTitleOverlayPath ? (
        <Image
          src={item.coverTitleOverlayPath}
          alt=""
          width={758}
          height={456}
          priority={focused}
          sizes="250px"
          className={`pointer-events-none absolute bottom-7 left-4 z-[1] h-auto w-[64%] max-w-[250px] transition-opacity duration-200 ${
            focused ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      <div
        className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 text-right"
        style={{
          opacity: focused ? 1 : 0,
          transform: focused ? "translateY(0)" : "translateY(8px)",
          transition:
            "opacity 260ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="flex gap-3 font-mono text-[11px] text-white/84">
          <span>◉ {item.viewsLabel}</span>
          <span className="text-[#ff4d5d]">♥ {item.likes}</span>
        </div>
        <div className="font-mono text-[11px] text-white/78">
          {item.creator} · {item.publishedDate}
        </div>
      </div>

      {!showTitleOverlay ? (
        <div
          className="absolute bottom-3 left-4 right-[132px]"
          style={{
            opacity: focused ? 1 : 0,
            transform: focused ? "translateY(0)" : "translateY(8px)",
            transition:
              "opacity 260ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/62">
            {item.episodeLabel} · {item.sceneCount} cuts
          </div>
          <div className="mt-1 text-[19px] font-black leading-[1.15] tracking-[-0.45px] text-white">
            {item.title}
          </div>
          <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-white/66">
            {item.hook}
          </div>
        </div>
      ) : null}

      <div
        style={{
          opacity: focused ? 0 : 1,
          transform: focused ? "translateY(-6px)" : "translateY(0)",
          transition:
            "opacity 220ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.12em] text-white/75">
          {item.episodeLabel}
        </div>
        <div className="absolute left-4 top-9 max-w-[210px] text-[16px] font-bold tracking-[-0.3px] text-white">
          {item.title}
        </div>
        <div className="absolute bottom-3 right-4 flex flex-col items-end gap-1 text-right">
          <div className="flex gap-2.5 font-mono text-[10px] text-white/75">
            <span>◉ {item.viewsLabel}</span>
            <span className="text-[#ff4d5d]">♥ {item.likes}</span>
          </div>
          <div className="font-mono text-[10px] text-white/58">
            {item.creator} · {item.publishedDate}
          </div>
        </div>
      </div>

      {!focused && activeTab === "popular" ? (
        <div className="absolute right-3 top-3 rounded-md bg-[#E4F222] px-2 py-1 font-mono text-[10px] text-[#0b0b0d]">
          HOT
        </div>
      ) : null}
    </Link>
  );
}

function PromoCarousel({
  locale,
  activeIndex,
  onSelect,
}: {
  locale: SupportedLocale;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const banners = promoBanners[locale];
  const activeBanner = banners[activeIndex] ?? banners[0];
  const href = activeBanner.href.includes("?")
    ? activeBanner.href
    : `${activeBanner.href}?lang=${locale}`;

  return (
    <section
      aria-label="Promotions"
      className="relative h-[124px] overflow-hidden rounded-[10px] border border-white/10 bg-[#171719]"
      style={{ boxShadow: "0 14px 36px rgba(0,0,0,0.28)" }}
    >
      {banners.map((banner, index) => (
        <Image
          key={banner.imagePath}
          src={banner.imagePath}
          alt=""
          fill
          priority={index === 0}
          sizes="430px"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out"
          style={{
            opacity: index === activeIndex ? 1 : 0,
            transform: index === activeIndex ? "scale(1)" : "scale(1.035)",
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(9,9,10,0.88) 0%, rgba(9,9,10,0.62) 43%, rgba(9,9,10,0.18) 100%), linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.04))",
        }}
      />

      <Link href={href} className="absolute inset-0 z-10 px-4 py-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#E4F222]">
          {activeBanner.eyebrow}
        </div>
        <div className="mt-1 max-w-[200px] text-[18px] font-black leading-[1.08] tracking-[-0.4px] text-white">
          {activeBanner.title}
        </div>
        <p className="mt-1 line-clamp-2 max-w-[190px] text-[11px] leading-[1.35] text-white/62">
          {activeBanner.body}
        </p>
      </Link>

      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
        {banners.map((banner, index) => (
          <button
            key={banner.title}
            type="button"
            aria-label={`${index + 1} / ${banners.length}`}
            onClick={() => onSelect(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/38"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function NavPill({
  active,
  locale,
  onNavigate,
  onSettingsClick,
}: {
  active: "recommended" | "popular" | "my";
  locale: SupportedLocale;
  onNavigate: () => void;
  onSettingsClick: () => void;
}) {
  const labels = readerNavLabels[locale];
  const items = [
    { key: "recommended", label: labels.recommended, href: `/?lang=${locale}` },
    {
      key: "popular",
      label: labels.popular,
      href: `/?tab=popular&lang=${locale}`,
    },
    { key: "my", label: labels.my, href: `/archive?lang=${locale}` },
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
          onClick={onNavigate}
          className="min-w-[48px] whitespace-nowrap rounded-full px-[13px] py-[9px] text-center text-[13px] font-semibold tracking-[-0.2px]"
          style={{
            color: item.key === active ? "#0b0b0d" : "rgba(255,255,255,0.75)",
            background: item.key === active ? "#fff" : "transparent",
          }}
        >
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={onSettingsClick}
        aria-label={feedCopy[locale].settingsLabel}
        className="flex min-w-[48px] items-center justify-center rounded-full px-[13px] py-[9px] text-white/75 transition hover:bg-white/[0.08] hover:text-white"
      >
        <Settings className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}

function SettingsSheet({
  activeTab,
  copy,
  locale,
  onClose,
}: {
  activeTab: "recommended" | "popular";
  copy: (typeof feedCopy)[SupportedLocale];
  locale: SupportedLocale;
  onClose: () => void;
}) {
  const localeHref = (targetLocale: SupportedLocale) =>
    activeTab === "popular"
      ? `/?tab=popular&lang=${targetLocale}`
      : `/?lang=${targetLocale}`;

  return (
    <div className="absolute inset-0 z-40">
      <button
        type="button"
        aria-label={copy.settingsLabel}
        className="absolute inset-0 bg-black/56"
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[30px] bg-[#121214]/96 px-5 pb-[max(26px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-28px_70px_rgba(0,0,0,0.58)] ring-1 ring-white/10"
        style={{ backdropFilter: "blur(18px) saturate(150%)" }}
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/24" />
        <div className="mb-4 text-[22px] font-bold tracking-[-0.01em] text-white">
          {copy.settingsTitle}
        </div>

        <div className="rounded-[18px] bg-white/[0.045] px-4 py-3.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/38">
            <Globe2 className="h-3.5 w-3.5" />
            {copy.languageLabel}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {supportedLocales.map((targetLocale) => {
              const selected = targetLocale === locale;

              return (
                <Link
                  key={targetLocale}
                  href={localeHref(targetLocale)}
                  className="rounded-full px-3 py-2 text-center text-[12px] font-bold transition"
                  style={{
                    background: selected ? "#E4F222" : "rgba(255,255,255,0.07)",
                    color: selected ? "#0b0b0d" : "rgba(255,255,255,0.76)",
                  }}
                >
                  {localeLabels[targetLocale]}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeFeed({
  items,
  activeTab,
  locale,
}: {
  items: ShortsToon[];
  activeTab: "recommended" | "popular";
  locale: SupportedLocale;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frameRef = useRef<number | null>(null);

  const orderedItems = useMemo(() => {
    if (activeTab === "popular") {
      return [...items].sort((left, right) => right.likes - left.likes);
    }

    return items;
  }, [activeTab, items]);

  const copy = feedCopy[locale];
  const promoCount = promoBanners[locale].length;
  const showCompact = scrollTop > 34;
  const resetFeedPosition = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const scrollArea = scrollAreaRef.current;

    if (scrollArea) {
      scrollArea.scrollTo({ top: 0, behavior: "auto" });
    }

    setScrollTop(0);
    setFocusedIndex(0);
  }, []);

  const updateFocusedIndex = useCallback(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    if (scrollArea.scrollTop <= 8) {
      setFocusedIndex((currentIndex) => (currentIndex === 0 ? currentIndex : 0));
      return;
    }

    const scrollRect = scrollArea.getBoundingClientRect();
    const focusY = scrollRect.top + scrollRect.height * 0.56;
    let nextFocusedIndex = 0;
    let shortestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((node, index) => {
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(centerY - focusY);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nextFocusedIndex = index;
      }
    });

    setFocusedIndex((currentIndex) =>
      currentIndex === nextFocusedIndex ? currentIndex : nextFocusedIndex,
    );
  }, []);

  const scheduleFocusedIndexUpdate = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      updateFocusedIndex();
    });
  }, [updateFocusedIndex]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, orderedItems.length);
    updateFocusedIndex();

    window.addEventListener("resize", updateFocusedIndex);

    return () => {
      window.removeEventListener("resize", updateFocusedIndex);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [orderedItems.length, updateFocusedIndex]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPromoIndex((index) => (index + 1) % promoCount);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [promoCount]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    const resetFrame = window.requestAnimationFrame(resetFeedPosition);

    return () => window.cancelAnimationFrame(resetFrame);
  }, [activeTab, locale, resetFeedPosition]);

  return (
    <div className="reader-shell relative flex h-[100svh] flex-col">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-[22px] pb-[14px] pt-[28px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,11,13,0.95), rgba(11,11,13,0.4) 70%, rgba(11,11,13,0))",
        }}
      >
        {!showCompact ? (
          <div>
            <Logo compact={false} />
            <p className="mt-2 max-w-[190px] text-[12px] leading-5 text-white/58">
              {copy.tagline}
            </p>
          </div>
        ) : null}
      </div>

      <main
        key={`${activeTab}-${locale}`}
        ref={scrollAreaRef}
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop);
          scheduleFocusedIndexUpdate();
        }}
        className="soft-scrollbar flex-1 overflow-y-auto px-[6px] pb-32 pt-[116px]"
        style={{
          overscrollBehaviorY: "contain",
          scrollPaddingBottom: "150px",
          scrollPaddingTop: "116px",
          scrollSnapType: "y mandatory",
        }}
      >
        <div className="mb-3">
          <PromoCarousel
            locale={locale}
            activeIndex={promoIndex}
            onSelect={setPromoIndex}
          />
        </div>

        <div className="space-y-2">
          {orderedItems.map((item, index) => (
            <div
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              style={{
                scrollMarginTop: "116px",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
              }}
            >
              <FeedCardReal
                item={item}
                focused={index === focusedIndex}
                activeTab={activeTab}
                locale={locale}
              />
            </div>
          ))}
        </div>
      </main>

      {settingsOpen ? (
        <SettingsSheet
          activeTab={activeTab}
          copy={copy}
          locale={locale}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}

      <NavPill
        active={activeTab === "popular" ? "popular" : "recommended"}
        locale={locale}
        onNavigate={resetFeedPosition}
        onSettingsClick={() => setSettingsOpen(true)}
      />
    </div>
  );
}
