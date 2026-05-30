# 프론트 디자인 참고

부산 해커톤 "포토툰"의 **모바일 웹앱 프론트 디자인 기준**. PhotoToon에 필요한
**디자인 레이어만 유지**했다. (백엔드/Supabase/생성 로직·대형 데모 에셋은 의도적으로 제외 — §6)

> 이 폴더는 "그대로 돌리는 앱"이 아니라 **디자인 참고 키트**다. 실제 앱으로 옮길 때 §7의 "이음새"를 PhotoToon 백엔드나 목 데이터로 갈아끼운다.

---

## 1. 무엇이 들어있나
- `src/app/globals.css` — **디자인 시스템 핵심** (토큰, 모바일 셸, 폰트, 스크롤바)
- `src/app/layout.tsx` — 모바일 셸 + viewport(`viewportFit: cover`) + Geist 폰트 + PWA 메타(`appleWebApp`)
- `src/app/*/page.tsx` — 페이지 컴포지션(홈/리더/파이프라인/온보딩/보관함)
- `src/components/*` — UI 컴포넌트 전체(아래 §4)
- `src/lib/types.ts` — 콘텐츠/이미지잡 데이터 모델 (§5)
- `src/lib/locale.ts`, `src/lib/generation/creator-reference.ts` — UI 라벨·생성폼 상수
- `src/data/demo-content.ts` — UI를 채울 데모 데이터(목)
- 설정: `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs`, `package.json`

---

## 2. 기술 스택 (package.json 기준)
- **Next.js 16.2.4 (App Router)** / **React 19.2** / **TypeScript 5**
- **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme inline`, PostCSS 플러그인)
- **lucide-react** (아이콘) · `next/font/google` Geist
- (원본은 Supabase + openai도 쓰지만 **여기엔 미포함** — 우리 백엔드로 대체)

설치(참고): `npm i next@16 react@19 react-dom@19 lucide-react` + `npm i -D tailwindcss@4 @tailwindcss/postcss typescript`

---

## 3. 디자인 시스템 (globals.css)

**컬러 토큰**
| 토큰 | 값 | 용도 |
|---|---|---|
| `--background` | `#ffffff` | 본문 배경(화이트 카드) |
| `--foreground` | `#111111` | 본문 텍스트 |
| `--muted` | `#f6f6f6` | 비활성/보조 |
| `--line` | `rgba(17,17,17,0.09)` | 헤어라인 보더 |
| `--accent` | **`#ecff17`** (네온 라임) | 강조/활성/뱃지 |
| `--accent-ink` | `#111111` | 액센트 위 텍스트 |

> Tailwind에서 `bg-accent`, `text-accent-ink`, `border-line`, `bg-muted` 등으로 바로 사용.

**모바일 셸 (핵심 패턴)**
- `.app-shell` — `width: min(100%, 430px)` 폰 폭 카드, 가운데 정렬, 다크(`#0b0b0d`) 바탕 위 화이트. 데스크톱(≥520×840)에선 `border-radius`로 폰 프레임처럼.
- `.reader-shell` — 다크 리더(웹툰 뷰어). 모바일 풀스크린, 데스크톱 둥근 프레임.
- 모바일 뷰포트: `100svh/100dvh` 사용, `overscroll-behavior: none`, `viewportFit: cover`(safe-area).
- `.soft-scrollbar` — 스크롤바 숨김.
- `lang="ko"`, 다크 `themeColor #0b0b0d`.

**우리 적용:** 토큰/셸은 거의 그대로 쓰되 브랜드 컬러(`--accent`)와 로고를 "포토툰" 정체성으로 교체.

---

## 4. 컴포넌트 인벤토리

| 컴포넌트 | 역할 | 우리 흐름(PRD) 매핑 | 상태 |
|---|---|---|---|
| `bottom-nav.tsx` | 모바일 하단 탭(쇼츠툰/보관함) | 전역 네비 | ✅ 그대로 lift (props/라우트만) |
| `reader-topbar.tsx` | 리더 상단바(로고/검색/보관) | 공통 헤더 | ✅ 그대로 lift |
| `reader-tabs.tsx` | 상단 탭(액센트 언더라인) | 피드/리더 탭 | ✅ 그대로 lift |
| `cut-panel.tsx` | **웹툰 컷 1장**(3:4, 팔레트 그라데이션, "컷 N" 뱃지, 캡션/감정/연속성) | **F4/F6 컷 렌더** | ✅ types만 의존, lift |
| `shorts-toon-list-item.tsx` | 피드 리스트 아이템(썸네일+메타) | 보관함/피드 | ✅ types만 의존, lift |
| `home-feed.tsx` | 홈 피드(추천/인기 탭, 프로모 배너, i18n) | 메인 피드 | ⚠️ locale/types만(복사됨). 데모 배너 이미지 경로는 폴백 |
| `reader-viewer.tsx` | **세로 스크롤 리더**(컷, 좋아요/댓글/공유/저장, ko·ja·en) | **F6 웹툰 뷰어 + 공유** | 🔧 데이터 이음새 교체(§7) |
| `pipeline-console.tsx` | **생성 콘솔**(장르/톤/아이디어→캐릭터→페이지 브리프→생성) | **F2~F4 생성 플로우** | 🔧 API 이음새 교체(§7) |
| `onboarding-panel.tsx` | 온보딩(언어/로그인) | 진입 | 🔧 auth 이음새 교체 |
| `my-page.tsx` | 마이페이지(내 작품/잡) | 보관함/내 웹툰 | 🔧 데이터 이음새 교체 |
| `archive-button.tsx` | 저장(북마크) 버튼 | 보관 액션 | 🔧 데이터 이음새 교체 |

✅ = 프레젠테이션 전용, 바로 사용 / ⚠️ = UI 의존성만(복사됨) / 🔧 = 백엔드 이음새 있음(§7)

---

## 5. 데이터 모델 하이라이트 (`src/lib/types.ts`)

이미 **우리 기획과 거의 일치**한다 — 특히 이미지 생성 잡 모델:

```ts
interface SceneImageJob {
  strategy: "generate" | "edit";   // ← "edit" = image-to-image = 사용자 사진 reference (우리 핵심!)
  model: string;                    // gpt-image-2
  references: string[];             // ← 캐릭터 reference(사용자 사진) asset
  inputFidelity: "high" | "low" | null;  // ← 얼굴 보존 강도
  size: "1024x1536";                // 세로 웹툰
  quality: "medium" | "high";
}
```
- `StoryPackage` / `StoryScene`(imagePrompt, continuityNotes, caption) / `StoryCharacter`(appearance, invariants) — 우리 "스토리→컷" 단계 모델로 그대로 차용 가능.
- `ShortsToon` / `ShortsToonCut`(palette, caption, situation, emotion, continuityNotes, imagePath) — 리더/피드 렌더 모델.
- `ToonDraft` / `CharacterDraft` / `PageImageBrief` / `StyleGuide` — 생성 콘솔(pipeline-console) 입력 모델.

> 즉 PhotoToon 백엔드와 이 프론트 모델은 `references`, `strategy: edit`, `inputFidelity`로 **개념이 1:1 매핑**된다.

---

## 6. 의도적으로 제외한 것 (복사 안 함)
- `src/app/api/*` — 백엔드 API 라우트(Supabase/OpenAI). 우리는 PhotoToon 자체 API로 대체.
- `src/lib/supabase/*`, `lib/content`, `lib/comments`, `lib/archive`, `lib/profile`, `lib/auth-redirect`, `lib/preview-archive`, `lib/env`, `lib/generation/{access,creator-jobs,mock,openai,plan,...}` — 데이터/생성 백엔드 로직.
- 대형 데모 이미지/mp4. 우리 콘텐츠 아님. UI는 `palette` 그라데이션으로 폴백되므로 없어도 레이아웃 확인 가능.

---

## 7. 이음새(Seams) — 실제 앱으로 옮길 때 교체할 것

| 컴포넌트 | 끊긴 import / API | 교체 방향 |
|---|---|---|
| `reader-viewer.tsx` | `lib/preview-archive`, `lib/supabase/client`, `/api/archive`, `/api/comments`, `/api/views` | 저장/댓글/조회는 우리 백엔드(또는 데모는 로컬상태/목)로 |
| `pipeline-console.tsx` | `/api/generation/jobs`, `/api/generation/toon-draft` | **우리 생성 API(`POST /generate`)로 연결** — 핵심 연동 지점 |
| `my-page.tsx` | `lib/generation/creator-jobs`, `lib/supabase/client`, `/api/generation/jobs` | 내 작품 목록 → 우리 백엔드/목 |
| `onboarding-panel.tsx` | `lib/auth-redirect`, `lib/supabase/client`, `/api/profile` | 데모는 로그인 생략 가능(스텁) |
| `archive-button.tsx` | `lib/auth-redirect`, `lib/preview-archive`, `lib/supabase/client`, `/api/archive` | 저장 토글 → 로컬상태/목 |

✅ 복사되어 바로 쓰는 lib: `@/lib/types`, `@/lib/locale`, `@/lib/generation/creator-reference`.

---

## 8. 우리 PRD 흐름과 매핑

| PRD 단계 | 재사용 컴포넌트 |
|---|---|
| 진입/온보딩 | `onboarding-panel`, `home-feed` |
| F2~F4 캐릭터·스토리·컷 생성 | **`pipeline-console`** (생성 콘솔 UX) |
| F4/F6 컷 렌더 | **`cut-panel`** |
| F6 웹툰 뷰어 + 공유 | **`reader-viewer`** (세로 스크롤 + 공유 버튼 → `navigator.share` 연결) |
| F5 씬-사진 매핑 | `cut-panel` 확장(원본 썸네일 토글 추가) |
| 보관/마이 | `my-page`, `archive-button`, `shorts-toon-list-item` |

---

## 9. 사용법 (실제 앱으로 lift)
1. 부산 본 프로젝트를 Next.js 16 + Tailwind v4로 스캐폴드(또는 이 폴더를 앱 루트 기반으로 승격).
2. `globals.css` + `layout.tsx` + 설정 파일을 먼저 이식 → 디자인 시스템 가동.
3. ✅ 프레젠테이션 컴포넌트(§4)부터 붙여 화면 골격 완성.
4. 🔧 `pipeline-console`의 생성 API와 `reader-viewer`의 데이터 호출을 **PhotoToon 생성 API**로 교체.
5. 브랜드(로고/`--accent`)를 "포토툰"으로 교체, 데모 에셋은 우리 생성물로 대체.
