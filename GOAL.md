# GOAL — 포토툰(사진→웹툰) 자율 빌드 & 검증 스펙 (v0.4.1)

> **자율 에이전트가 끊김 없이 처음부터 끝까지 전부 구현**하는 실행 목표(goal).
> PoC 없음 — **동작하는 모바일 웹앱 전체**를 만들고 각 단계를 **빡빡하게 검증**(정적 + 유닛 + 실제 OpenAI + **크롬 스크린샷**).
> 기획: `PRD.md` / 이미지·스토리 엔진·프롬프트: PhotoToon 자체 구현 / 표지·제목 파이프라인: PhotoToon 자체 구현 / 프론트 디자인: `frontend-reference/`.
> **§6 탈출 체크리스트가 전부 ✅ 될 때까지 멈추지 않는다.**

> ✅ **선결 실측(2026-05-30, 실제 호출):**
> - **이미지(R1·R2·R4):** gpt-image-2 셀카→웹툰 컷 생성, 두 인물 동일성 양호, **이미지 내 native 한글 말풍선 정확 렌더**. (`smoke-cut.png`·`smoke-bubble.png`)
> - **품질 low(R3-속도):** **low 컷에서도 한글 말풍선 또렷 + 그림체 양호, 40s**(`smoke-cut-low.png`) → **전 이미지 low 확정**.
> - **스토리·제목·대사(R5):** **gpt-5.5** 구조화출력 OK, **제목 자동**("국밥 먹고 커밋까지") + **컷별 한글 대사 자동**, 컷 4~6. **PhotoToon 대사 품질 정책 적용 시 대사 오글거림 제거**. (`smoke-story.mjs`)
> - **표지+제목(M7):** gpt-image-2 generations로 **text-free 커버 + 흰배경 한글 제목 타이포** 생성 검증(`smoke-cover.png`·`smoke-title.png`).
> - **Supabase additive(R6):** service key로 `phototoon_*` 테이블 create/insert/select + 버킷 create + **Storage API delete** 통과, **기존 17테이블·버킷 무변경**. ⚠️ storage는 **SQL 직접 삭제 차단**(`protect_delete`) → **Storage API(JS client)로만**.

> 🔁 **v0.4 피벗(사용자 승인):** 사진 **자동분류(gpt-4o vision) 완전 제거**. 입력 = 사용자가 **1개 "주제" 업로드 + 주제·전체 에피소드(필수)·시간순서·장면별 의미(선택) 직접 입력**, **대사 미입력**(gpt-5.5 자동). **1주제=1웹툰.** **제목 자동 + 1:1 표지(PhotoToon 자체 구현).** "나만의 페이지"=완성 웹툰 **작품집**(웹툰+원본사진, 카테고리 **사용자 직접 분류**).

> ⚡ **v0.4.1 추가 결정(2026-05-30):** ① **이미지 품질 전부 `low`**(속도·타임아웃, 말풍선 가독성 실측 OK). ② **생성 = 비동기-DB 흐름** — 요청을 붙잡지 않고 **컷·표지를 1장 단위 짧은 요청으로 생성 → Supabase 저장 → 프론트가 DB 폴링으로 도착분 렌더**(단일 요청은 이미지 1장만 = low ~40s → **Vercel Hobby 60s 안에서 동작**). ③ 따라서 **Supabase = 생성물 전달 통로(P0)**로 승격(작품집 retention 카테고리는 P1).

---

## 0. 자율 실행 계약
- §5 마일스톤을 **M0→M12 순서대로** 구현.
- 각 마일스톤 끝 **검증 게이트** 100% 통과 전엔 다음으로 못 넘어감. 게이트에는 **그 퍼널의 핵심 단언**이 명시됨.
- 실패 시: 로그 읽고 수정 → 재실행. **스킵·우회 금지**(§7).
- 통과 시: 증거(명령 출력 + 스크린샷 경로)를 `verification/REPORT.md`에 기록.
- 최종 **§6 탈출 체크리스트 전부 ✅** 까지 종료 금지.

```
for M in [M0..M12]:
    implement(M)
    while not (typecheck & lint & test & verify:ui[M] 통과): fix()   # 스킵 금지
    record_evidence(M)
until §6 EXIT CHECKLIST all ✅   # 9개 퍼널 전부 + 품질 5회 + 기술 + 안전
```

---

## 1. 목표 선언 (Definition of Success)

**완성 = 아래 9개 퍼널이 실제로 끝까지 동작 + §6 체크리스트 전부 ✅ 인 모바일 웹앱.**

사진 업로드(주제별) → **입력**(주제·전체 에피소드·시간순서 드래그·장면별 의미) → **주인공 얼굴 선택**(공통 ref) → **스토리+제목 생성**(gpt-5.5: 줄거리 증강 + 컷별 한글 대사·말풍선 자동 + **제목 자동**) → **컷 이미지 생성**(gpt-image-2 **low**, 네이버 스타일 + native 한글 말풍선, 공통 얼굴 ref, **1장 단위 비동기 생성→DB 저장**) → **표지+제목**(1:1 커버 + 제목 타이포) → **웹툰 뷰어**(표지 + 세로 스트립, **DB 폴링 렌더**) → **공유**(단일 이미지 + "나도 만들기" 워터마크 + navigator.share) → **나만의 페이지 작품집**(완성 웹툰 + 원본 사진 저장, 사용자 카테고리, Supabase additive, 새로고침 후 잔존).

**핵심 원칙: 1주제 = 1웹툰** · **이미지 전부 low** · **생성은 비동기-DB(요청 차단 금지)**.

### 9개 퍼널 (이 순서가 곧 마일스톤·E2E 흐름)
| # | 퍼널 | 내용 | 기능 ID |
|---|---|---|---|
| 1 | 업로드 | 주제별 사진 업로드(모바일 갤러리 다중) | F1 |
| 2 | 입력 | 주제 · 전체 에피소드(필수) · 시간순서(드래그) · 장면별 의미(선택) | F2 |
| 3 | 얼굴 선택 | 후보 중 1개 → 공통 ref | F3 |
| 4 | 스토리+제목 생성 | gpt-5.5: 줄거리 증강 + 대사/말풍선 자동 + 제목 자동 | F4 |
| 5 | 컷 이미지 생성 | gpt-image-2 **low**, native 한글 말풍선, 얼굴 일관성, **1장 단위 비동기→DB** | F5 |
| 6 | 표지+제목 | 1:1 커버 + 제목 타이포 | F6 |
| 7 | 웹툰 뷰어 | 표지 + 세로 스트립(DB 폴링 렌더) | F7 |
| 8 | 공유 | 단일 이미지 + 나도만들기 링크 + navigator.share | F8 |
| 9 | 나만의 페이지 작품집 | 웹툰+원본사진 저장 · 사용자 카테고리 · Supabase additive · 새로고침 후 잔존 | F9 |

---

## 1.5 확정 기능 (Feature IDs)

| ID | 기능 | 우선순위 |
|---|---|---|
| F1 | 사진 업로드(주제별, 모바일 갤러리 다중) | P0 |
| F2 | 입력 단계: 주제 · 전체 에피소드(필수) · 시간순서(드래그) · 장면별 의미(선택) | P0 |
| F3 | 주인공 얼굴 선택(후보 중 1개 → 공통 ref) | P0 |
| F4 | 스토리+제목 생성(gpt-5.5: 줄거리 증강 + 대사/말풍선 자동 + 제목 자동) | **P0 핵심** |
| F5 | 컷 이미지 생성(gpt-image-2 low, native 한글 말풍선, 1장 단위 비동기→DB) | **P0 핵심** |
| F6 | 표지+제목(1:1 커버 + 제목 타이포) | P0 |
| F7 | 웹툰 뷰어(표지 + 세로 스트립, DB 폴링 렌더) | P0 |
| F8 | 공유(단일 이미지 + "나도 만들기" 워터마크 + navigator.share) | P0 |
| F9a | **생성물 전달(이미지를 Supabase에 저장→프론트가 DB에서 읽음)** | **P0**(비동기 흐름의 통로) |
| F9b | 작품집 retention(완성 웹툰+원본사진 누적 · 사용자 카테고리 분류 · 새로고침 후 잔존) | P1 |
| F10 | 노래·자소서 출력(버튼 티저) | P2 |

---

## 2. 기술 스택 (확정)

- **단일 Next.js 16** (App Router) + React 19 + TS5 + Tailwind v4 — 베이스 `frontend-reference/`.
- **AI (전부 OpenAI 1키, 공식 문서+실측 확인 2026-05-30):**
  - 스토리+제목 = **gpt-5.5**(주제 + 전체 에피소드 + 시간순서 + 장면별 의미 + 사진 → 줄거리 증강 + 컷별 한글 대사·말풍선 자동 + **제목 자동** + 표지용 `genre`·`tones` 추론; 폴백 gpt-4o). **대사는 PhotoToon 대사 품질 정책(§7-12) 시스템 프롬프트 필수.** (이건 텍스트 응답이라 빠름 ~15s → 동기 호출 OK.)
  - 이미지(컷·표지·제목) = **gpt-image-2**(`images.edit`/`generations`). 프롬프트는 PhotoToon 자체 prompt contract로 관리.
- **이미지 품질: `gpt-image-2` · quality `low`(전부)** · 컷/커버 size `1024x1536`. edit 시 **입력 자동 high-fidelity → 얼굴 일관성**(input_fidelity 생략). 폴백 gpt-image-1. **네이버 스타일 + native 한글 말풍선**(low에서도 가독성 실측 OK).
- **⚡ 생성 흐름 = 비동기-DB(요청 차단 금지):**
  - 컷·표지·제목을 **1장 단위 짧은 요청**(`/api/cuts` 한 번에 1컷, `/api/cover` 커버1+제목1)으로 생성 → **즉시 Supabase에 저장**(이미지=Storage 버킷, 메타=`phototoon_*`).
  - 프론트는 요청을 붙잡고 기다리지 않고 **`GET /api/toons/:id`(DB)를 폴링**해 **도착한 컷부터 렌더**(진행 `n/N`).
  - 단일 요청이 처리하는 건 **이미지 1장(low ~40s)** → **Vercel Hobby 60s 한도 안**. 컷 N장은 클라가 병렬/순차로 N요청.
  - **이탈해도 생성물이 DB에 남아** 재접속 시 이어 보임(작품집과 자연 연결).
- **표지(1:1) 방식:** 커버는 `1024x1536`(9:16, quality low)로 생성하고, 표시 시 **CSS `aspect-square` + `object-cover` 크롭**으로 1:1. 제목 타이포는 별도 흰배경 이미지(low) → `sharp`로 흰픽셀 투명화(`min>=238 && max-min<=24` → alpha=0) + bounding box 트림(padding 24px) → 투명 PNG → 런타임 CSS 오버레이로 커버 하단 중앙 합성.
- **저장: Supabase — 기존 프로젝트에 additive만. (P0 = 생성물 전달 통로 + P1 = 작품집 retention)**
  - ⚠️ 그 프로젝트(`rtaciuravymbqhvjuqyi`, ACTIVE)는 **다른 라이브 사이트에 연결됨** → 기존 테이블/버킷/정책 **수정·삭제 절대 금지**. **`phototoon_` 접두 + 전용 버킷(`phototoon-toons`)** 만.
  - 클라는 **anon/publishable 키만**. `SERVICE_ROLE_KEY` 서버 전용·우리 테이블만·**클라 노출 절대 금지**.
  - ⚠️ **storage는 SQL 직접 삭제/조작 차단(`protect_delete` 트리거)** → 버킷·객체 생성/업로드/삭제는 **반드시 Storage API(`supabase.storage`, JS client)로**. 테이블은 `phototoon_*` 마이그레이션(SQL) OK.
  - ✅ **additive 실측 통과(2026-05-30):** service key로 `phototoon_*` create/insert/select + 버킷 create + Storage API delete 성공, **기존 public 17테이블·`shorts-toons` 버킷 무변경**(전후 동일). `phototoon_` 충돌 0.
- **서버리스:** 단일 요청=이미지 1장(low) → Hobby 60s 안. `export const maxDuration` 설정(여유 위해 90~120s 권장; Hobby 60 / Pro 300). 바디 ~4.5MB → 얼굴 1장만 + 클라 압축.
- **검증:** Playwright(Chromium) 스크린샷+단언, Vitest 유닛. **배포:** Vercel.

### 환경변수 (`.env.local`, 커밋 금지 — 이미 복사됨)
```
OPENAI_API_KEY=sk-...                       # 필수(서버) — 스토리·제목·이미지 전부 이 키
IMAGE_MODEL=gpt-image-2                      # 최신·edit 입력 자동 high-fidelity. 폴백 gpt-image-1
IMAGE_QUALITY=low                            # ← 전 이미지 low(속도·타임아웃)
STORY_MODEL=gpt-5.5                          # 줄거리 증강 + 대사/말풍선 + 제목 자동. 폴백 gpt-4o
NEXT_PUBLIC_SUPABASE_URL=...                 # 기존 Supabase 프로젝트
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...     # 클라 anon
SUPABASE_SERVICE_ROLE_KEY=...               # 서버 전용·신중(phototoon_ 만)
# (참고) ARK_API_KEY·GEMINI_API_KEY = 현재 앱에서 미사용. 안 씀·무수정. .gitignore 보호.
```

---

## 3. 3중 게이트 (마일스톤마다 전부 통과)
1. **정적:** `typecheck`(에러0) + `lint`(`--max-warnings=0`).
2. **유닛:** `test`(해당 + 회귀 그린).
3. **UI(크롬):** `verify:ui --grep "<M>"` — 화면 열고 단언 + **콘솔에러0/pageerror0** + **스크린샷 저장**.

---

## 4. 검증 인프라

### 4.1 npm scripts (필수)
```jsonc
{ "scripts": {
  "dev":"next dev", "build":"next build", "start":"next start",
  "typecheck":"tsc --noEmit", "lint":"eslint . --max-warnings=0", "test":"vitest run",
  "verify:ui":"playwright test", "verify:ui:headed":"playwright test --headed",
  "smoke:openai":"node scripts/smoke-openai.mjs",   // gpt-image-2 컷+말풍선(실측 통과)
  "smoke:low":"node scripts/smoke-cut-low.mjs",     // low 품질 말풍선 가독성(실측 통과)
  "smoke:story":"node scripts/smoke-story.mjs",     // gpt-5.5 스토리+제목+대사(실측 통과)
  "smoke:cover":"node scripts/smoke-cover.mjs",     // 표지+제목 타이포(실측 통과)
  "verify:quality":"node scripts/webtoon-quality.mjs"   // 웹툰 5회 품질(low) 생성→스크린샷(표지+제목 포함)
}}
```

### 4.2 Playwright 하니스 (빡빡)
- config: `baseURL http://localhost:3000`, `viewport 390x844`, `webServer: build && start`, chromium.
- 공통 필수: `console`error/`pageerror` → 끝에 `expect([]).toEqual`(0건). 각 단계 `page.screenshot({path:'verification/screenshots/<NN>.png', fullPage:true})`. 단언은 role/text + `toBeVisible`.
- 테스트 title에 `@M3`·`@F2`·`@full` 등 태그.
- ✅ **Playwright/Chromium 실측 OK**: `@playwright/test` 설치 + chromium 구동 + 한글 렌더 스크린샷 통과(`smoke-playwright.png`). (브라우저 캐시 존재; 없으면 `npx playwright install chromium`.)

#### 화면별 단언·스크린샷 (퍼널 1~9 ↔ 01~10)
| 파일 | 퍼널 | 상태 | 단언 |
|---|---|---|---|
| `01-home.png` | — | `/` | 앱 셸 + 하단 네비 |
| `02-upload.png` | 1 | 업로드 후 | 주제별 사진 썸네일 N개 |
| `03-input.png` | 2 | 입력 후 | **주제** + **전체 에피소드(필수)** + **시간순서(드래그 핸들)** + **장면별 의미(선택)** 폼 모두 존재 |
| `04-face-select.png` | 3 | 얼굴 선택 | 얼굴 후보 2~3 + **선택 표시** |
| `05-generating.png` | 5 | 생성 중 | **DB 폴링 진행 `n/N`** · 도착한 컷부터 렌더 · 스켈레톤 |
| `06-cuts.png` | 4·5 | 컷 생성 후 | **실제 img 컷 N개**(placeholder 아님) + **native 한글 말풍선(자동 생성·네이버 스타일) 정확 렌더** ← 퍼널4 대사 자동 증거 |
| `07-cover.png` | 4·6 | 표지+제목 | **1:1 비율 표지**(aspect-square) + **제목 텍스트(타이포) 비어있지 않음** ← 퍼널4 제목 자동 증거 |
| `08-webtoon.png` | 7 | 뷰어 | 표지+제목 표지 + 세로 스트립(말풍선 native) |
| `09-share.png` | 8 | 공유 | navigator.share(목)/다운로드 + **"나도 만들기" 링크 워터마크** |
| `10-mypage.png` | 9 | 작품집(P1) | 저장된 웹툰 + **원본 사진 묶음** + **사용자 카테고리** + **새로고침 후 잔존** |

> 퍼널4(스토리+제목) 시각 증거 = `06-cuts`(자동 생성 한글 말풍선) + `07-cover`(자동 생성 제목). M11에서 `episode_title` 노출·비어있지 않음을 컷 말풍선과 **별도** 단언.

### 4.3 픽스처
- `mock/`에 RALPHTHON 사진 7장(셀카 002 = 얼굴 ref) + 품질 5회용 입력셋. 없으면 게이트 "픽스처 필요"로 실패(조용한 통과 금지).

### 4.4 OpenAI 실호출 스모크 — ✅ 전부 실측 통과(2026-05-30)
- `smoke-openai.mjs` / `smoke-bubble.mjs` — gpt-image-2 컷 + 한글 말풍선(medium). R1·R2·R4.
- `smoke-cut-low.mjs` — **quality low** 컷 + 한글 말풍선 → low에서도 또렷, 40s. **전 이미지 low 확정 근거.**
- `smoke-story.mjs` — gpt-5.5 `json_schema` → `{title, beats[bubble_text]}`. 제목·대사 자동, **Dialogue Policy로 오글거림 제거**. 폴백 gpt-4o.
- `smoke-cover.mjs` — gpt-image-2 generations로 text-free 커버 + 흰배경 한글 제목 타이포(low). M7 근거.
- b64/JSON 없으면 명확히 에러+멈춤.

### 4.5 웹툰 품질 5회 검증 (`scripts/webtoon-quality.mjs`) — 핵심 게이트
- **서로 다른 입력셋(주제+에피소드) 5회**로 전체 생성(**quality low**) → `webtoon-quality-0N.png`(컷 + 표지+제목).
- 자동 단언: 컷이 **실제 생성 이미지**(바이트>임계), 컷 4~6, **표지 1:1 프레임 + 제목 텍스트 비어있지 않음**.
- 사람/스크린샷 판정: (a) 네이버 웹툰 그림체 (b) **native 한글 말풍선 정확** (c) 주인공 **동일인** 일관 (d) **표지=1:1 + 제목 정확(번역체 아님)** (e) **대사 오글거림 없음**. → §6.B.
- **얼굴 일관성·대사 품질은 사람 판정** → **5회 각 판정을 `verification/REPORT.md`에 명시 기록**해야 함. 기록 누락 시 게이트 **실패**(하드룰 4).
- 미달이면 얼굴선택/프롬프트/모델/제목·대사 정책 보정 후 재실행.

---

## 5. 마일스톤 (M0 → M12)

각: 산출물 / 구현 / 게이트(해당 퍼널 핵심 단언 포함) / DoD. 게이트 전부 통과해야 다음.

- **M0 부트스트랩** — `frontend-reference/`를 실제 Next.js 앱으로 승격, scripts(§4.1)/config/playwright/vitest, deps 설치(`@playwright/test`·`sharp`·`@supabase/supabase-js` 추가).
  - ⚠️ **import 정리(실측: 현재 typecheck ~30 에러):** 현재 앱에 없는 `@/lib/*` 참조를 정리.
    - **삭제/교체:** 불필요 페이지(`src/app/archive`·`pipeline`·`toon/[slug]`·기존 `page.tsx`)와 미사용 lib(`@/lib/archive`·`content`·`profile`·`comments`·`auth-redirect`·`preview-archive`·`generation/*`·`access`·`env`)는 PhotoToon 플로우로 교체·삭제.
    - **재배선/스텁:** 재사용 컴포넌트(`reader-viewer`·`my-page`·`bottom-nav`·`cut-panel`)의 끊긴 import(`@/lib/supabase/client`·`preview-archive`·`generation/creator-jobs`)는 우리 `src/lib`로 재배선/최소 스텁.
    - **암묵 any 제거.**
  - **게이트:** `typecheck` **0** + `build` 무에러 + `verify:ui @M0`(`01-home.png`).

- **M1 디자인 시스템 & 셸** — globals.css/layout/bottom-nav/reader chrome. **게이트:** typecheck/lint + `verify:ui @M1`.

- **M2 사진 업로드 (F1·퍼널1)** — 모바일 input(갤러리 다중) + 클라 압축 + data URL + **주제별** 썸네일. **게이트:** 유닛(압축) + `verify:ui @M2`(`02-upload.png`, 주제별 썸네일 N개).

- **M3 입력 단계 (F2·퍼널2)** — 폼: **주제(필수)** + **전체 에피소드(필수)** + **시간순서**(업로드 순 + **드래그 재정렬**) + **장면별 의미**(선택). **대사 입력 없음**. *(자동분류 UI 없음)*. **게이트:** 유닛(스키마 + 드래그 순서 + 에피소드 필수) + `verify:ui @M3`(`03-input.png`).

- **M4 주인공 얼굴 선택 (F3·퍼널3)** — 얼굴 후보(또는 썸네일 직접) → 1개 선택 → 공통 ref. **게이트:** 유닛(선택 상태) + `verify:ui @M4`(`04-face-select.png`).

- **M5 스토리+제목 생성 (F4·퍼널4) — 핵심** — `POST /api/story { theme, episode, photos[]{ id, dataUrl, order, sceneNote } }`(텍스트 응답 ~15s, 동기 OK) → **gpt-5.5**: 줄거리 증강 + 컷별 한글 **대사·말풍선 자동**(intent 입력) + **`episode_title` 자동**(클릭유발형, 번역체 거부) + 표지용 `genre`·`tones`. **대사 = PhotoToon 대사 품질 정책 시스템 프롬프트 필수**(감탄사·직설 감정·번역체·표어 금지, 짧은 구어체·따뜻한 톤). structured output `{ episode_title, genre, tones[], beats:[{ index, text, image_prompt, bubble_text[], source_photo_id }] }`(4~6). **게이트:** 유닛(스키마/비트수 + `episode_title` 비어있지 않음 + 대사 존재) + `smoke:story` 통과 + `verify:ui @M5`(`05-generating.png`).

- **M6 컷 이미지 생성 (F5·퍼널5) — 핵심·비동기** — `POST /api/cuts { toonId, beat, faceDataUrl }`(**1요청 = 1컷**) → `images.edit`(**gpt-image-2**, 공통 얼굴 ref, **quality `low`**, `1024x1536`; 자동 high-fidelity) → **생성 즉시 Storage 업로드 + `phototoon_cuts` insert**(idx 포함). 클라는 컷별로 N요청(병렬/순차) 후 **`GET /api/toons/:id` 폴링**해 도착분 렌더. **native 한글 말풍선** — PhotoToon 이미지 prompt contract(Reference + Critical text rule + Negative; `bubble_text[]`를 `image_prompt`에 재주입). **게이트:** `smoke:openai`/`smoke:low` 통과 + 통합(1요청→1실이미지 DB 저장→폴링 조회) + `verify:ui @M6`(`06-cuts.png`, 실제 img + native 한글 말풍선 정확).

- **M7 표지+제목 생성 (F6·퍼널6) — 비동기** — `POST /api/cover { toonId, episode_title, genre, tones } → { cover_url, title_lockup_url }`(커버1+제목1, **quality low**). ① text-free 커버(`1024x1536`) ② 흰배경 한글 제목 타이포(글자 내부 순백색 금지) → `sharp` 흰픽셀 투명화 + 트림 → 투명 PNG → Storage 저장 + `phototoon_toons` 갱신. 표시: 커버 **CSS `aspect-square`+`object-cover` 1:1** + 제목 타이포 하단 중앙 오버레이(폭 ~72%, drop-shadow). **타이포 없으면 plain text 제목 폴백.** **게이트:** 통합(커버+제목 PNG 저장) + `verify:ui @M7`(`07-cover.png`, 표지 1:1 + 제목 텍스트 존재).

- **M8 웹툰 뷰어 (F7·퍼널7)** — PhotoToon reader: **표지+제목 표지** 맨 위 + 세로 스트립(**말풍선 native**), **DB(`GET /api/toons/:id`)에서 읽어 렌더**. **게이트:** `verify:ui @M8`(`08-webtoon.png`).

- **M9 공유 (F8·퍼널8)** — 스트립 단일 이미지 합성(**"나도 만들기" 워터마크**) → `navigator.share`(폴백 다운로드). **게이트:** `verify:ui @M9`(`09-share.png`, 워터마크 단언).

- **M10 Supabase 저장·작품집 (F9·퍼널9, additive)** — `phototoon_toons`/`phototoon_cuts`/`phototoon_photos`(원본 사진) + `phototoon-toons` 버킷. **이미지 저장·읽기는 비동기 흐름의 P0 통로**(M6/M7가 이미 사용) + **작품집 retention은 P1**(완성 웹툰+원본사진 누적, **카테고리 사용자 직접 부여** `PATCH /api/toons`).
  - ⚠️ **테이블 = `phototoon_*` 마이그레이션(SQL). Storage(버킷/객체) = Storage API(JS client)로만**(SQL 직접 조작 `protect_delete`로 차단됨, 실측). **기존 객체 무변경**(연결 전 `list_tables`).
  - **게이트:** 통합(insert→select + Storage 업로드→공개 URL read, 우리 객체만) + **영구성 e2e**(생성→저장→**`page.reload()`**→`10-mypage.png`에 웹툰+원본사진+사용자 카테고리 잔존).

- **M11 통합 E2E (모든 퍼널 1~9 한 흐름)** — `e2e/full-flow.spec.ts`: 업로드→입력→얼굴→스토리+제목→컷(폴링 렌더)→표지+제목→뷰어→공유→**작품집 저장 → `page.reload()` → 잔존**. **각 퍼널 핵심 단언**:
  - 퍼널4: **`episode_title` 노출·비어있지 않음**(컷 말풍선과 별도) + 컷별 한글 말풍선.
  - 퍼널5: 실제 img 컷 4~6 + native 한글 말풍선 + 주인공 일관.
  - 퍼널6: 표지 1:1 + 제목 텍스트.
  - 퍼널8: "나도 만들기" 워터마크.
  - 퍼널9: **저장 → `page.reload()` → 웹툰+원본사진+사용자 카테고리 잔존**(정식 단계).
  - **게이트:** `--grep @full` 그린 + 스크린샷 `01~10` + 콘솔에러0.

- **M12 배포 (Vercel)** — vercel 설정 + `maxDuration`(이미지 1장/요청이라 Hobby 60s 안; 여유 위해 설정) + README + `.env.local.example`. **게이트:** `build` 클린 + (가능 시) 프리뷰 URL `verify:ui` 1회.

---

## 6. GOAL 탈출 조건 (Exit Checklist) — 전부 ✅ 여야 종료

### 6.A 퍼널별 E2E 탈출조건 — **9개 퍼널 각각** = 크롬 스크린샷 증거 + **M11 full-flow E2E 한 흐름 단언** (빠진 퍼널 0개)

| ✅ | 퍼널 | 핵심 단언 | 스크린샷 | M11 full-flow |
|---|---|---|---|---|
| [ ] | **퍼널1 업로드** | 주제별 사진 썸네일 N개 | `02-upload.png` | 한 흐름에서 단언 |
| [ ] | **퍼널2 입력** | 주제 + 전체 에피소드(필수) + 시간순서(드래그) + 장면별 의미(선택) 폼 동작 | `03-input.png` | 한 흐름에서 단언 |
| [ ] | **퍼널3 얼굴 선택** | 후보 2~3 중 1개 선택 → 공통 ref 확정 | `04-face-select.png` | 한 흐름에서 단언 |
| [ ] | **퍼널4 스토리+제목** | gpt-5.5 줄거리 증강 + **대사/말풍선 자동**(`06-cuts`) + **`episode_title` 자동·비어있지 않음**(`07-cover`) | `06-cuts.png`·`07-cover.png` | **`episode_title` 노출 별도 단언** |
| [ ] | **퍼널5 컷 이미지** | 4~6컷 **실제 생성(low)** + **native 한글 말풍선 정확** + 주인공 일관 (**1장 단위 비동기→DB 폴링 렌더**) | `06-cuts.png` | 한 흐름에서 단언 |
| [ ] | **퍼널6 표지+제목** | **표지 1:1(aspect-square)** + **제목 텍스트(타이포) 존재** | `07-cover.png` | 한 흐름에서 단언 |
| [ ] | **퍼널7 웹툰 뷰어** | 표지 맨 위 + 세로 스트립(말풍선 native, DB 렌더) | `08-webtoon.png` | 한 흐름에서 단언 |
| [ ] | **퍼널8 공유** | navigator.share(목)/다운로드 + **"나도 만들기" 워터마크** | `09-share.png` | 한 흐름에서 단언 |
| [ ] | **퍼널9 작품집** | **`page.reload()` 후** 웹툰 + **원본 사진 묶음** + **사용자 카테고리** 잔존 | `10-mypage.png` | **저장→reload→잔존 정식 단계** |
| [ ] | ✅ **위 9개 퍼널 전부가 `full-flow` E2E 한 흐름에서 단언으로 검증됨**(누락 0) | | | |

### 6.B 웹툰 품질 5회 확인 (그림체 + 한글 말풍선 정확 + 대사 자연스러움 + 주인공 일관 + 표지 1:1·제목) — 핵심
> ✅ 선결 실증: smoke-cut/bubble/low(이미지·말풍선·low) + smoke-story(제목·대사, 오글거림 제거) + smoke-cover(표지/제목). 아래는 정식 5회(low).
- [ ] 품질 1/5 — 입력셋 A → `webtoon-quality-01.png` → 그림체 ✔ · 말풍선 한글 ✔ · 대사 자연 ✔ · 주인공 동일 ✔ · 표지 1:1+제목 ✔
- [ ] 품질 2/5 — B → `webtoon-quality-02.png` → ✔/✔/✔/✔/✔
- [ ] 품질 3/5 — C → `webtoon-quality-03.png` → ✔/✔/✔/✔/✔
- [ ] 품질 4/5 — D → `webtoon-quality-04.png` → ✔/✔/✔/✔/✔
- [ ] 품질 5/5 — E → `webtoon-quality-05.png` → ✔/✔/✔/✔/✔
- [ ] 판정: **5회 모두 실제 생성물 + 한글 말풍선 정확 + 대사 오글거림 없음 + 표지 1:1+제목 정확** + **주인공 일관 ≥4/5**. **5회 각 판정 `REPORT.md` 기록**(누락=실패). 미달 시 보정 후 재실행.

### 6.C 기술 게이트
- [ ] `typecheck` 0 / `lint` 0 / `test` green / `build` 무에러
- [ ] `smoke:openai`(또는 `smoke:low`) + `smoke:story` + `smoke:cover` 성공
- [ ] `verify:ui` 전체 통과(콘솔에러0/pageerror0), 스크린샷 `01~10`+`smoke-*`+`webtoon-quality-01..05` 존재
- [ ] `full-flow` E2E green (업로드→…→작품집 잔존, 9개 퍼널 전부 단언, **컷 DB 폴링 렌더 포함**)

### 6.D 안전·정합
- [ ] **기존 Supabase DB 무변경** — `phototoon_*` + 전용 버킷만 additive (`SERVICE_ROLE_KEY` 클라 노출 0). **Storage는 API로만 조작(SQL 직접 X).** ✅ additive 실측 통과.
- [ ] 시크릿 git 미커밋(`.env*` ignore, `!.env.example`만 예외)
- [ ] `verification/REPORT.md`에 M0~M12 증거 + 품질 5회 판정 기록
- [ ] P0(F1~F8 + F9a 생성물 전달) 실제 동작, F9b(P1 작품집 retention) 포함, F10 버튼 티저

> **6.A~6.D 모든 박스 ✅ 일 때만 종료.** 하나라도 비면 그 항목으로 돌아가 루프.

---

## 7. 하드 룰 (위반 금지)
1. 핵심 생성 로직(M5 스토리+제목·M6 컷·M7 표지) **최종 빌드에서 목킹 금지**(유닛만 목, 실동작은 smoke/quality/E2E로).
2. 게이트 **스킵/우회 금지**(`eslint-disable`·`any`·`@ts-ignore` 덮기 금지).
3. **스크린샷 없이 "UI 됨" 금지.**
4. **조용한 실패 금지**(픽스처/키/모델 누락 → 에러+멈춤+보고. 품질·일관성 사람 판정은 REPORT.md 기록 강제).
5. **시크릿 커밋 금지**(`.env*` ignore, `SERVICE_ROLE_KEY` 클라 노출 절대 금지).
6. **기존 Supabase DB 절대 수정/삭제 금지** — `phototoon_` + 전용 버킷만 additive. **Storage는 Storage API로만 조작**(SQL 직접 삭제 `protect_delete`로 차단됨). service role 클라 금지. 의심되면 별도 프로젝트.
7. **이미지 품질 `low` 사용(전부)** — 속도·타임아웃. **말풍선은 native 한글**(low에서 가독성 실측 OK; 깨지면 짧은 대사/오버레이 폴백).
8. **사용자는 대사를 입력하지 않는다** — 대사·말풍선은 gpt-5.5 자동(`creator_input_mode=intent`). 직접 대사 입력 UI 금지.
9. **1주제 = 1웹툰** — 멀티주제·멀티이벤트 P2.
10. **작품집 카테고리는 사용자가 직접 분류** — 자동분류 금지.
11. **생성은 비동기-DB** — 1요청=이미지 1장, 즉시 DB 저장, 프론트는 DB 폴링 렌더. **요청을 길게 붙잡아 60s 넘기지 말 것.**
12. **대사는 PhotoToon 대사 품질 정책 적용 필수**(M5 시스템 프롬프트) — 감탄사·직설 감정·번역체·진부한 표어 금지, 짧은 구어체·따뜻한 톤.
13. P0에 `TODO later` 금지. §6 전부 ✅ 전엔 완료 선언 금지.

---

## 8. 디렉토리 (현재 + 목표)
```
부산/
├─ PRD.md · GOAL.md
├─ .env.local / .env.example / .gitignore     # 크레덴셜(보호됨)
├─ frontend-reference/      # 모바일 UI 베이스 + DESIGN-NOTES.md
├─ mock/                    # RALPHTHON 테스트 사진 7장(데모·픽스처)
├─ scripts/                 # smoke-openai · smoke-bubble · smoke-cut-low · smoke-story · smoke-cover (+ webtoon-quality 예정)
├─ verification/screenshots # smoke-*.png(실측), 01~10, webtoon-quality-01..05
├─ src/app/...              # [M0~] 페이지 + /api/{story,cuts,cover,toons}
├─ src/components/ · src/lib/   # 표지 합성(sharp) · CSS aspect-square 오버레이 · supabase client(폴링)
└─ supabase/migrations/     # [M10] phototoon_* 테이블 additive 마이그레이션만(toons/cuts/photos). 버킷은 Storage API로 생성
```

> PhotoToon 자체 구현 근거: 제목=gpt-5.5 스토리 호출 `episode_title` 필드(별도 호출 X) / 커버 9:16→CSS 1:1 크롭 / 제목 타이포 `sharp` 흰배경 제거 → CSS 오버레이(하단 중앙, plain text 폴백). 스키마는 `episode_title`·`genre`·`tones` + intent 입력 기반 대사 자동 생성 + PhotoToon 대사 품질 정책.

---

> 한 줄: **"포토툰"을 처음부터 끝까지 만들고(주제 1개 업로드+입력 → gpt-5.5 줄거리·대사·제목 자동 → gpt-image-2 `low` 컷+native 한글 말풍선을 **1장 단위 비동기로 생성·DB 저장**, 프론트는 DB 폴링 렌더 → 1:1 표지+제목 → 뷰어 → 공유 → 작품집), 정적·유닛·실제 OpenAI·크롬 스크린샷 + 품질 5회로 검증하며, 9개 퍼널 각각의 탈출조건을 M11 full-flow E2E 한 흐름에서 단언하고, §6 체크리스트가 전부 ✅ 될 때까지 멈추지 않는다. (gpt-5.5 · gpt-image-2 low · native 한글 말풍선 · PhotoToon 대사 품질 정책 · PhotoToon 표지 · 비동기-DB · 1주제=1웹툰 · Supabase additive 실측 통과 · 기존 DB 보호)**
