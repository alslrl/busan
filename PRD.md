# PRD — 포토툰 (PhotoToon)

> 사진 한 묶음을 **하나의 "주제"로 올리고 짧은 에피소드만 적으면**, AI가 줄거리·대사·제목까지 만들어 **네이버 웹툰 스타일(말풍선 포함)의 한 편짜리 웹툰 작품**으로 뽑아 공유한다.

> ✅ **실측 검증(2026-05-30, 실제 OpenAI 호출):**
> - **이미지(R1·R2·R4):** gpt-image-2 — 캐릭터 일관성 · 권한 · 한글 말풍선 정확 렌더. (`smoke-cut.png`·`smoke-bubble.png` — "부산 해커톤, 가보자!")
> - **스토리·제목·대사(R5):** gpt-5.5 — 구조화출력 + 제목 자동("국밥 먹고 커밋까지") + 컷별 한글 대사 자동. **PhotoToon 대사 품질 정책 적용 시 대사 오글거림 제거 확인.** (`scripts/smoke-story.mjs`)
> - **품질 low·표지·Supabase:** **low 컷에서도 한글 말풍선 또렷**(`smoke-cut-low.png`) → 전 이미지 low. 표지+제목 타이포 생성 OK(`smoke-cover.png`·`smoke-title.png`). **Supabase additive**(테이블 create/insert/select + 버킷 + Storage API delete) 실측 통과, 기존 17테이블/버킷 무변경.

| 항목 | 내용 |
|---|---|
| 문서 버전 | **v0.4** (피벗 반영 전면 재작성) |
| 작성일 | 2026-05-30 |
| 상태 | 피벗 확정(사용자 승인) + 핵심 리스크 실측 통과 — 빌드 정본은 `GOAL.md` |
| 플랫폼 | **모바일 웹앱(mobile-first, 반응형) · Vercel 배포** |
| 스택 | **단일 Next.js**(모바일 웹 디자인) + **OpenAI 1키**(gpt-5.5 스토리/제목 · gpt-image-2 이미지) + **Supabase(기존 프로젝트에 additive)** |
| 근거 | `frontend-reference/` 모바일 UI 베이스 · PhotoToon 자체 프롬프트 계약 · OpenAI 실호출 스모크 검증 |

---

## 1. 한 줄 요약

사진 묶음을 **1개 주제로 업로드 + 짧은 에피소드(필수) 입력** → 시간 순서(드래그)·장면별 의미(선택)·주인공 얼굴 선택 → **gpt-5.5가 줄거리를 증강하고 대사·말풍선과 제목을 자동 생성** → **gpt-image-2가 네이버 웹툰 스타일 컷(이미지 내 한글 말풍선)과 1:1 표지+제목 타이포를 합성** → **한 편의 웹툰 작품 완성** → 인스타·카톡 공유 + "나도 만들기" 유입 루프. 완성작은 **"나만의 페이지(작품집/책장)"**에 원본 사진과 함께 영구 저장된다. (확장: 같은 입력에서 **노래·자소서**)

---

## 2. 배경 & 핵심 통찰

- 갤러리엔 수천 장의 삶이 잠들어 있지만, 정리도 활용도 안 되고 죽어 있다.
- "돌아보고 싶은 욕구"는 강하다(셋로그·Wrapped). 하지만 사진 더미 자체로는 감동이 안 된다.
- **핵심 통찰:** 사람들은 사진을 "분류"받고 싶은 게 아니라 **"내 이야기를 작품으로 만들어 자랑"하고 싶다.** 그래서 입구를 무겁게 만드는 자동 분류 단계를 없애고, **"주제 하나 + 한두 줄 에피소드"만으로 곧장 웹툰 한 편을 완성**하는 단일 직선 흐름으로 좁혔다.
- **대사를 사용자가 쓰지 않는다:** 사람들은 말풍선 대사를 직접 쓰는 걸 부담스러워한다. 사용자는 **"무슨 일이 있었는지"(에피소드 시드)만** 주고, **대사·말풍선·제목은 LLM이 어울리게 자동 생성**한다. 입력 부담을 최소화하면서 결과물의 완성도는 올린다.
- **두 층 구조(중요):**
  - **생성 피크 층(viral):** 주제 하나로 웹툰 한 편을 터뜨린다. 자랑하고 싶은 한 방 = 공유 콘텐츠.
  - **누적 retention 층:** 완성한 웹툰은 **"나만의 페이지(작품집)"**에 작품+원본 사진과 함께 쌓인다. 다시 와서 책장을 넘기듯 보고, 사용자가 직접 카테고리를 붙여 정리한다.
  - → 한 편을 터뜨리고(viral), 작품집이 쌓인다(retention). 두 층이 한 제품에 공존.

---

## 3. 목표 & 비목표

### 3.1 제품 목표
- G1. **1개 주제 = 1웹툰.** 사진 묶음을 하나의 주제로 올리고 짧은 에피소드만 입력하면 한 편짜리 웹툰 작품이 완성된다.
- G2. 컷마다 **주인공이 같은 사람**으로 보인다(캐릭터 일관성).
- G3. **대사·말풍선·제목을 AI가 자동 생성**한다. 사용자는 대사를 쓰지 않는다.
- G4. **표지+제목 타이포가 합성된 "하나의 작품"**으로 마감해, 결과물이 진짜 웹툰처럼 보인다.
- G5. 결과물을 **인스타·카톡으로 바로 공유**(바이럴) + "나도 만들기" 유입 루프, 완성작은 **작품집에 영구 저장**.

### 3.2 데모 성공 기준
- D1. 무대에서 **사진 업로드 → 주제·에피소드 입력 → 얼굴 선택 → 표지+제목 + 말풍선 들어간 웹툰 한 편**이 라이브로.
- D2. 원본 사진 ↔ 변환된 컷 대비로 "내 진짜 기록이 만화가 됐다"는 감정. (오늘 RALPHTHON 사진으로 시연)
- D3. 심사위원이 "나도 쓰고 공유하겠다".

### 3.3 비목표
- N1. 로그인·계정·과금 — 작성자 구분은 **익명 디바이스 id**.
- N2. **사진 자동 분류·자동 카테고리 추가** — 전면 제거. 입력은 **사용자가 직접 주는 "주제 + 에피소드"**다. (구 vision 분류 폐기)
- N3. **메타데이터(EXIF) 적극 활용 안 함** — 카톡/캡처 사진은 위치·시간이 자주 없음. 대신 **사용자가 주제·에피소드·시간순서·장면별 의미를 입력**(F2).
- N4. **멀티주제·멀티이벤트 묶기 = P2.** 데모는 **1주제 = 1웹툰**으로 고정.
- N5. **인앱 공개 소셜 피드(남의 작품 구경)·댓글 = 데모 제외(P2).** "소셜 네트워크"가 아니라 **"공유할 작품을 만드는 도구"** — 외부(인스타/카톡) 공유까지. 단 **내 작품집 누적·저장(Supabase additive)은 retention 층으로 P1 포함**.
- N6. 연재 웹툰 플랫폼(분기·다음화·구독) — 이번 데모 범위에서 제외한다.
- N7. 노래·자소서 추출 = **P2 버튼 티저**(이번 데모는 웹툰만 실제 동작). 비전 §14.

---

## 4. 타겟 사용자

| 순위 | 타겟 | 핵심 가치 |
|---|---|---|
| 1순위 | **일상을 작품으로 자랑하고 싶은 누구나**(대학생·취준생·일상러) | 주제 하나 + 한두 줄로 내 이야기가 웹툰 한 편이 되어 공유 |
| 2순위 | 추억을 간직·자랑하려는 사람 | 사진을 작품집으로 |
| 확장 | 취준생(자소서)·음악(노래) | 같은 입력, 출력만 교체(§14) |

---

## 5. 핵심 사용자 흐름

```
[단일 직선 흐름 — 1주제 = 1웹툰]

① 사진 업로드 (1개 "주제"로 모바일 갤러리 다중 선택)                          [F1]
   → ② 입력 단계                                                              [F2]
        · 주제(theme) — 필수
        · 전체 간략 에피소드/맥락 — 한두 줄(필수, 스토리 증강의 핵심 시드)
        · 시간 순서 — 업로드 순 기본 + 드래그로 재정렬
        · 장면별 의미 — 사진마다 한 줄(선택, 빈칸이면 LLM이 추론)
        (※ 대사는 입력하지 않음)
   → ③ 주인공 얼굴 선택 (후보 중 1개 → 모든 컷 공통 ref)                       [F3]
   → ④ 스토리+제목 생성                                                        [F4]
        gpt-5.5: (주제+에피소드+시간순서+장면설명+사진)
                 → 줄거리 증강 + 컷별 대사·말풍선 자동 + 제목 자동(클릭유발형)
                 (대사 = PhotoToon 대사 품질 정책 적용 → 오글거림 없음)
   → ⑤ 컷 이미지 생성                                                          [F5]
        gpt-image-2 low 1024x1536: 네이버 스타일 + 이미지 내 native 한글 말풍선
                 + 선택 얼굴 공통 ref (일관성)
   → ⑥ 표지+제목                                                              [F6]
        gpt-image-2: 1:1 커버(text-free) + 제목 타이포 합성
                 → "하나의 웹툰 작품" 완성
   → ⑦ 웹툰 뷰어 (표지+제목 표지 + 세로 스트립, 말풍선 native)                  [F7]
   → ⑧ 공유 (단일 이미지 합성 + "나도 만들기" 링크 워터마크 + navigator.share)   [F8]
   ⌙ (P1) ⑨ 나만의 페이지 작품집 — 완성 웹툰 + 원본 사진 저장 ·
            사용자가 직접 카테고리 분류 · Supabase additive · 새로고침 후 잔존  [F9]
   ⌙ (P2) 노래 · 자소서로도 출력 — 버튼만 노출                                  [F10]
```

---

## 6. 핵심 컨셉 결정

- **C1. 1주제 = 1웹툰.** 입력은 사용자가 직접 주는 **"주제 1개 + 짧은 에피소드"**. 자동 분류 없음. 멀티주제 묶기는 P2.
- **C2. 입력은 사용자 직접 입력 4종.** 주제(필수) · 전체 에피소드(필수, 증강 시드) · 시간순서(업로드 순 기본 + 드래그) · 장면별 의미(선택, 빈칸이면 LLM 추론). **대사는 받지 않는다.**
- **C3. 대사·말풍선·제목은 LLM 자동.** gpt-5.5가 어울리는 한글 대사·말풍선을 자동 생성(PhotoToon 대사 품질 정책 적용)하고, **클릭유발형 제목**(번역체 거부)도 자동 생성한다. 사용자 대사 입력 불필요.
- **C4. 주인공 1명 + 얼굴 직접 선택.** 얼굴 후보 중 1개 → 모든 컷 공통 reference.
- **C5. 컷 수 4~6(기본 5).**
- **C6. 이미지 모델 = `gpt-image-2` · 품질 `low`(전부) · `1024x1536`.** edit 시 입력 이미지 **자동 high-fidelity**(얼굴 일관성↑). **low에서도 말풍선 가독성 실측 OK + 속도·타임아웃 유리**(40s).
- **C7. 말풍선 = 이미지 내 native 한글 말풍선(네이버 스타일).** 실측 결과 gpt-image-2가 한글 말풍선을 정확히 렌더 → native 채택. PhotoToon 이미지 프롬프트의 "Critical text rule"로 빈/깨진 말풍선 방지. (깨질 시 폴백: 짧은 대사/CSS 오버레이)
- **C8. 표지+제목 = 하나의 작품으로 마감.** 1:1 커버(text-free) + 제목 타이포를 **2-에셋 + CSS 오버레이 파이프라인**으로 합성(§6.1·F6). 결과물이 진짜 "웹툰 작품"으로 보이게.
- **C9. "나만의 페이지" = 작품집/책장(retention 층).** 완성 웹툰 작품을 **원본 사진과 함께** 누적·영구 저장. **카테고리는 사용자가 직접 분류·부여**(자동 분류 아님).
- **C10. 모바일 웹앱 + Vercel.** 공유 `navigator.share`.
- **C11. 단일 Next.js + Supabase additive**(기존 Supabase 프로젝트에 추가만, §8.8).
- **C12. 대사 품질 = PhotoToon 대사 품질 정책.** 자연스러운 한국어 구어체·짧게·감정 직접 설명 금지·감탄사 남발 금지·번역체/진부한 표어 금지·따뜻한 톤. (실측: 미적용 시 오글거림 → 적용 시 제거.)
- **C13. 생성 = 비동기-DB 흐름.** 컷·표지를 **1장 단위 짧은 요청**으로 생성 → **Supabase 저장** → 프론트가 **DB 폴링으로 도착분 렌더**. 요청을 길게 붙잡지 않음 → 단일 요청 = 이미지 1장(low ~40s) → **Vercel Hobby(60s)에서도 동작**. 이탈해도 생성물이 DB에 남아 이어 보임.
- **C14. Supabase = P0 생성물 전달 통로 + P1 작품집.** 생성 이미지가 Storage/DB를 통해 프론트로 전달(P0). 작품집 retention·사용자 카테고리는 P1. ⚠️ **Storage는 API(JS client)로만 조작**(SQL 직접 삭제 차단 — 실측).

### 6.1 PhotoToon 표지·제목 파이프라인

> 표지/제목은 **커버 이미지와 제목 타이포를 분리 생성한 뒤 런타임에서 합성**한다. 모델 호출, 흰배경 제거, 합성 위치를 PhotoToon 구현 안에서 명시한다.

| 단계 | 무엇을 | 모델/방식 | 구현 메모 |
|---|---|---|---|
| 제목 텍스트 | episode_title(클릭유발형 한국어 제목 1개) | **gpt-5.5 스토리 호출의 structured output `episode_title` 필드로 산출**(별도 Responses 호출 X). 짧고 기억나는 제목, 번역체·진부한 제목 금지 | `/api/story` output |
| 커버 이미지 | text-free 9:16 웹툰 커버 | `gpt-image-2`, `quality:"low"`, `output_format:"png"`, **size `1024x1536`** | `/api/cover`에서 생성 |
| 1:1 변환 | 9:16 생성 → **표시 시 CSS 크롭** | 직접 1:1 생성 X. 컨테이너 `aspect-square` + `object-cover`로 정사각 프레임에 9:16을 크롭 | 뷰어/공유 UI 공통 |
| 제목 타이포 | 흰 배경 위 한글 타이포 락업만 | `gpt-image-2`. 프롬프트에 "**글자 내부에 순백색 쓰지 말 것**"(흰배경 제거 시 글자 보존) | `/api/cover`에서 생성 |
| 흰배경 제거 | 흰 픽셀 → 투명 PNG + 자동 트림 | **`sharp` 로컬 처리**(OpenAI 아님). `nearWhite`(min≥238 && max−min≤24) alpha=0 → bounding box로 padding 24px 트림 | 서버 유틸 |
| 합성 | 커버 위에 제목 타이포 오버레이 | **런타임 CSS 오버레이**(서버 굽기 X). 절대배치, 폭 72%/max 300px, drop-shadow + 상단 그라데이션. 타이포 없으면 plain text 제목 폴백 | 뷰어/공유 UI 공통 |

- **적용 포인트:** ① 제목은 **gpt-5.5 스토리 호출에 합쳐서** 1회로 뽑는다(별도 제목 전용 호출 X — premise/hook과 같은 컨텍스트에서 생성해야 일관됨, 레이턴시/비용 절감). ② 표지용 `genre`·`tones`도 **같은 스토리 호출 output에서 추론**해 `/api/cover` 입력으로 넘긴다(상류 생산자 명시 — dangling input 방지). ③ 커버·제목 타이포는 **2개 별개 이미지**로 생성(2-에셋 구조). ④ 1:1은 굳이 정사각 생성하지 말고 `1024x1536` 생성 후 `aspect-square + object-cover`로 크롭. ⑤ 흰배경 제거는 `sharp`. ⑥ 합성은 프론트 CSS 오버레이(재생성 비용 0, 위치 조정 자유). ⑦ 프롬프트와 합성 위치는 **하단 중앙**으로 일치시킨다.

---

## 7. 기능 명세

우선순위: **P0** 데모 필수 / **P1** 강화 / **P2** 추후

### F1. 사진 업로드 (주제별) — P0
- 모바일 갤러리/카메라 직접 접근(`<input type=file accept=image/* multiple>`). 클라 리사이즈/압축. data URL 보유(서버 무상태).
- **1개 "주제"에 사진을 다중 업로드.** (자동 분류 없음 — 올린 사진이 곧 이 웹툰의 컷 소스다.)

### F2. 입력 단계 — P0
- 한 화면에서 사용자가 직접 입력:
  - **주제(theme)** — 필수.
  - **전체 간략 에피소드/맥락** — 한두 줄, 필수. **스토리 증강의 핵심 시드.** (500자 초과 시 UI에서 요약/절단)
  - **시간 순서** — 업로드 순 기본 + **드래그로 재정렬**.
  - **장면별 의미** — 사진마다 한 줄(선택, 빈칸이면 **LLM이 추론**).
- **대사는 입력하지 않는다.** (대사는 F4에서 자동 생성)
- 구현: PhotoToon 입력 폼/페이지 UI.

### F3. 주인공 얼굴 선택 — P0
- 업로드 사진에서 **얼굴 후보 2~3개** → 사용자가 **1개 선택** → 모든 컷 공통 reference. (R1 직접 완화)
- 단순화: 자동 얼굴검출 부담 시 **썸네일 직접 선택**.

### F4. 스토리+제목 생성 (gpt-5.5) — P0 (핵심)
- 입력: **주제 + 전체 에피소드 + 시간순서 + 장면별 의미 + 사진**.
- **gpt-5.5**가 한 번의 호출로:
  - **줄거리 증강** → 4~6 비트 스토리 + 비트별 `image_prompt` + `source_photo_id`.
  - **컷별 대사·말풍선 자동 생성**(한글, `bubble_text[]`). 사용자가 대사를 안 줘도 동작.
  - **제목 자동 생성**(`episode_title`) — 클릭유발형, 번역체·진부한 제목 거부.
  - **표지용 `genre`·`tones` 추론** → F6 `/api/cover` 입력.
- **대사 품질 = PhotoToon 대사 품질 정책 시스템 프롬프트 필수:** 자연스러운 구어체·짧게·감정 직접 설명 금지·감탄사 남발 금지·번역체/진부한 표어 금지·따뜻한 위트 톤. **(실측: 미적용 시 "뭔가 터질 것 같아!" 류 오글거림 → 적용 시 "부산역 냄새 난다. 바다랑 커피 섞인 거." 류로 개선됨.)**
- **대사 자동 생성 정합성:** 입력을 PhotoToon의 intent 입력(주제·에피소드·장면설명)으로 고정하고, 모델이 컷별 대사를 직접 확장한다. 사용자가 대사를 주지 않아도 `bubble_text[]`가 생성되어야 한다.
- **제목 작업량:** story 스키마에 `episode_title`(작품 제목) 1필드를 포함한다. 별도 제목 전용 호출 없이 같은 스토리 호출에서 생성한다.
- 폴백: gpt-4o (가용성 폴백 한정).
- 프롬프트 베이스 = PhotoToon 자체 story prompt contract(대사 품질 정책 포함).

### F5. 컷 이미지 생성 (gpt-image-2) — P0 (핵심)
- 비트별 `image_prompt` + **선택 얼굴(공통 ref)** → `gpt-image-2` `images.edit`, **medium**, `1024x1536`, 병렬.
- **네이버 웹툰 스타일 + 이미지 내 native 한글 말풍선.** 대사 텍스트의 source of truth는 cut_plan의 `bubble_specs[].text`(=`bubble_text[]`)이며 `image_prompt`에 그대로 재주입해 native 렌더(Critical text rule).
- 일관성: PhotoToon Reference rule(얼굴/머리/의상=ref) + identity-swap 금지 negative.
- 구현: 자체 API Route에서 gpt-image-2 edit/generation 호출.

### F6. 표지+제목 (1:1 커버 + 제목 타이포 합성) — P0
- 커버: `gpt-image-2`로 **text-free 9:16(`1024x1536`)** 생성 → 표시 시 `aspect-square + object-cover`로 **1:1 크롭**.
- 제목 타이포: `gpt-image-2`로 **흰 배경 위 한글 타이포 락업**만 생성 → `sharp`로 흰배경 제거(투명 PNG) + 자동 트림.
- 합성: 커버 위에 제목 타이포를 **런타임 CSS 오버레이**(하단 중앙, 폭 72%/max 300px, drop-shadow + 상단 그라데이션). 타이포 없으면 plain text 제목 폴백.
- 입력: `episode_title` + `genre` + `tones`(F4 스토리 호출 output에서 전달).
- 결과: **"하나의 웹툰 작품"** 표지가 완성된다.

### F7. 웹툰 뷰어 — P0
- **표지+제목 표지** + 세로 스크롤 스트립. **말풍선은 컷 이미지 안에 native** — 별도 오버레이 불필요. PhotoToon reader로 구현.

### F8. 공유 — P0
- 표지+스트립을 단일 이미지로 합성(구석에 **"나도 만들기" 로고+링크 워터마크** = 유입 루프) → `navigator.share()`(미지원 시 다운로드). 인스타·카톡 직행 = 바이럴.

### F9. 나만의 페이지 작품집 (Supabase additive) — P1 (retention 층)
- **"나만의 페이지" = 완성 웹툰 작품집/책장**으로 재정의.
- 완성 웹툰 작품을 **누적·영구 저장** → 재접속 후에도 남음.
- **원본 사진도 작품과 함께 저장**(작품 ↔ 사진 묶음 연결).
- **각 웹툰의 카테고리는 사용자가 직접 분류·부여**(자동 분류 아님 — 사용자가 선택해 태깅).
- ⚠️ **기존 Supabase에 additive만**: `phototoon_` 접두 테이블 + 전용 버킷(`phototoon-toons`). 기존 객체 무변경(§8.8, R6).
- 작성자 = 익명 디바이스 id.

### F10. 출력 확장 — 노래·자소서 — P2(티저)
- `[노래로]`·`[자소서로]` 버튼은 데모에선 "준비중" 노출(확장 비전, §14).

### 기능 요약표
| ID | 기능 | 우선순위 | 비고 |
|---|---|---|---|
| F1 | 사진 업로드(주제별, 모바일 갤러리 다중) | P0 | 자동 분류 없음 |
| F2 | 입력: 주제·전체 에피소드(필수)·시간순서(드래그)·장면별 의미(선택) | P0 | 대사 미입력 |
| F3 | 주인공 얼굴 선택(후보 중 1개 → 공통 ref) | P0 | R1 완화 |
| F4 | 스토리+제목 생성(gpt-5.5: 줄거리증강+대사/말풍선 자동+제목 자동) | P0 | 핵심·Dialogue Policy |
| F5 | 컷 이미지 생성(gpt-image-2 low, 네이버 스타일 native 한글 말풍선) | P0 | 핵심 |
| F6 | 표지+제목(1:1 커버 + 제목 타이포 합성) | P0 | 작품 마감 |
| F7 | 웹툰 뷰어(표지+제목 + 세로 스트립, 말풍선 native) | P0 | PhotoToon reader |
| F8 | 공유(단일 이미지 합성 + "나도 만들기" 링크 + navigator.share) | P0 | 바이럴 |
| F9 | 나만의 페이지 작품집(웹툰+원본사진 저장·사용자 카테고리 분류·Supabase additive·새로고침 후 잔존) | P1 | retention·기존 DB 보호 |
| F10 | 노래·자소서 출력 | P2 | 버튼 티저 |

---

## 8. 기술 아키텍처

### 8.1 시스템 구성 (단일 Next.js)
```
┌──────────────────────────┐
│  모바일 웹 (Next.js/React)│  ← frontend-reference 기반
│  업로드 · 입력 · 뷰어 · 작품집│
└─────────────┬────────────┘
              │ (같은 앱)
┌─────────────▼─────────────────────────────────────────┐
│  Next.js API Routes (Vercel 서버리스)                   │
│  /api/story   (gpt-5.5: 줄거리 증강 + 대사/말풍선 + 제목 + genre/tones)│
│  /api/cuts    (gpt-image-2 low, 네이버 스타일 말풍선) │
│  /api/cover   (gpt-image-2: 1:1 커버 + 제목 타이포 합성) │
│  /api/toons   (작품집 저장·목록·카테고리 = F9)           │
└───────┬───────────────────────────────────┬────────────┘
        ▼                                   ▼
   OpenAI API                          Supabase (additive)
 (gpt-5.5 스토리/제목 ·              phototoon_* + 전용 버킷
  gpt-image-2 images.edit)           (phototoon-toons)
```

### 8.2 재활용 매핑
| 출처 | 무엇을 | 방식 |
|---|---|---|
| PhotoToon story prompt contract | 스토리/컷 JSON 스키마. **대사 품질 정책 · intent 입력 고정 → 대사 자동 생성.** `episode_title`·`genre`·`tones` 포함 | implement(gpt-5.5) |
| PhotoToon image prompt contract | 이미지 프롬프트(네이버 스타일·native 말풍선·Reference/Critical/Negative) | implement(gpt-image-2) |
| PhotoToon 표지/제목 구현 | 제목 structured output · 커버/타이포 2-에셋 이미지 호출 · `sharp` 흰배경 제거 + CSS 오버레이 합성(하단 중앙) | implement → `/api/story` · `/api/cover` · 뷰어/공유 UI |
| `frontend-reference/` | 모바일 디자인·컴포넌트 | lift/adapt (DESIGN-NOTES) |
| Supabase additive 패턴 | 저장/스토리지(우리 `phototoon_*`만) | adapt, additive |

### 8.3 데이터 모델
```
# 클라이언트 세션(생성 중)
Photo       { id, dataUrl, order, sceneNote? }                      # order=시간 순서(드래그), sceneNote=장면별 의미(선택)
ToonInput   { theme, episode, photos[] }                            # 주제+에피소드(필수)+사진[]
FaceChoice  { selected_photo_id }
StoryResult { episode_title, genre, tones[], beats[] }              # 제목·장르·톤 자동 생성
StoryBeat   { index, text, image_prompt, bubble_text[], source_photo_id }   # 컷당 말풍선 복수 가능
Cut         { index, image_url, source_photo_id }                   # 말풍선은 이미지 내 native
Cover       { cover_url, title_lockup_url, title_text }             # 1:1 커버 + 제목 타이포

# Supabase 영구 저장 (기존 프로젝트에 additive · phototoon_ 접두)
phototoon_toons  { id, author_device_id, theme, episode_title,
                   cover_url, title_lockup_url,
                   category,                  # ← 사용자가 직접 부여(자동 분류 아님, NULL 허용)
                   created_at }
phototoon_cuts   { id, toon_id, idx, image_url }
phototoon_photos { id, toon_id, photo_url, order }                  # ← 원본 사진을 작품과 함께 저장
Storage 버킷     : phototoon-toons (컷·커버·원본 사진)
```
- **`category`는 `phototoon_toons`의 사용자 입력 컬럼**(NULL 허용, 사용자가 작품집에서 직접 분류·수정). 자동 분류/자동 추가 없음.
- `phototoon_photos`로 **작품 ↔ 원본 사진 묶음**을 영구 연결.

### 8.4 API (Next.js Routes)
```
POST  /api/story   { theme, episode, photos[]{ id, dataUrl, order, sceneNote } }
                   → { episode_title, genre, tones[], beats[]{ image_prompt, bubble_text[], source_photo_id } }   # gpt-5.5
POST  /api/cuts    { toonId, beat, faceDataUrl }   # 1요청=1컷(비동기) → 생성 후 Storage 업로드 + phototoon_cuts insert (gpt-image-2 low, native 말풍선)
GET   /api/toons/:id                               → 폴링: 지금까지 저장된 컷·표지 (프론트가 도착분 렌더)
POST  /api/cover   { episode_title, genre, tones[] }
                   → { cover_url, title_lockup_url(투명PNG) }                                       # gpt-image-2 1:1커버 + 제목 타이포
POST  /api/toons   { theme, episode_title, cover_url, title_lockup_url, cuts[], photos[], category? }
                   → 저장(Supabase additive)
PATCH /api/toons   { toon_id, category }                  → 사용자 카테고리 부여/수정
GET   /api/toons   ?device=...                            → 내 작품집 목록(웹툰+원본사진)
```

### 8.5 모델 & 이미지 파라미터 (OpenAI 공식 문서 확인 + 실측, 2026-05-30)
- **스토리 줄거리 증강 + 대사/말풍선 + 제목 + genre/tones:** **gpt-5.5**(최신) — 주제·에피소드·시간순서·장면설명·사진 → 줄거리 증강 + 컷별 대사·말풍선 자동(Dialogue Policy) + 제목·장르·톤 자동. `json_schema` strict로 구조화 반환. 폴백 gpt-4o(가용성 한정). **실측 통과**(14~20s).
- **이미지 생성:** 모델군 `gpt-image-2`(최신)·`gpt-image-1.5`·`gpt-image-1`·`gpt-image-1-mini`. **기본 `gpt-image-2`** — edit 시 입력 이미지 **자동 high-fidelity → 얼굴 일관성 유리**(input_fidelity 생략). 폴백 gpt-image-1(input_fidelity 조절). quality **`low`**(전부, 실측 OK), size **`1024x1536`**. **컷은 1요청=1장 비동기 생성→DB 저장**(요청당 1장이라 Hobby 60s 안). 커버·제목 타이포도 `low`·`1024x1536`.
- **흰배경 제거:** OpenAI 아님 — **`sharp` 로컬 처리**(§6.1).
- **실측 통과:** 셀카→웹툰 컷 생성 64s, 두 인물 동일성 양호, **한글 말풍선("부산 해커톤, 가보자!") 정확 렌더** → 네이버 스타일 native 말풍선 채택. gpt-5.5 스토리+제목+대사 자동 생성(Dialogue Policy로 오글거림 제거).
- 전부 **OpenAI 키 하나**로 처리.

### 8.6 모바일 고려
- mobile-first 반응형, 세로 스트립 = 모바일 천연 적합, `svh/dvh`+safe-area.
- 업로드 전 클라 압축. 생성 대기 진행 UX(`n/5`)로 이탈 방지. 공유 = `navigator.share`.

### 8.7 프론트 베이스 (`frontend-reference/`)
- **Next.js 16 + React 19 + Tailwind v4 + TS5** 모바일 웹툰 UI. 상세 `frontend-reference/DESIGN-NOTES.md`.
- 디자인 시스템: 폰 프레임(`max-w 430px`), 네온 라임 액센트(`#ecff17`), 다크 reader, PWA 메타.
- ⚠️ 불필요한 레거시 페이지/lib(archive·pipeline·toon·content·profile·comments 등)은 우리 플로우로 교체·삭제 필요(끊긴 import). 상세 `GOAL.md` M0.
- 검증: **Playwright(크롬) 스크린샷**으로 각 퍼널 단언.

### 8.8 배포 (Vercel) + Supabase additive
- Vercel 배포(Git 푸시 → 프리뷰 URL → QR로 폰 체험). 서버리스: 바디 ~4.5MB(생성 얼굴 1장만). **타임아웃: 생성을 1요청=이미지 1장(low ~40s)으로 쪼개 비동기-DB로 처리 → Vercel Hobby 60s 한도 안에서 동작**(`maxDuration` 여유 설정). 한 요청에 여러 장 묶으면 초과하므로 금지.
- ⚠️ **Supabase는 기존 프로젝트에 additive만.** 그 프로젝트는 **다른 라이브 사이트에 연결됨** → 기존 테이블/버킷/정책 **수정·삭제 절대 금지**, `phototoon_` 접두 + 전용 버킷(`phototoon-toons`)만. **`SERVICE_ROLE_KEY` 클라 노출 절대 금지**(서버 전용). **`.env*` git 미커밋**(`!.env.example`만 예외).
- ✅ **연결 확인(MCP):** `rtaciuravymbqhvjuqyi`(ACTIVE), 기존 public 17테이블(전부 RLS·실데이터) — `phototoon_` 충돌 0 → additive 안전.
- ✅ **additive 쓰기/읽기 실측(2026-05-30):** service key로 `phototoon_*` create/insert/select + 버킷 create + **Storage API delete** 통과, 기존 17테이블·`shorts-toons` 버킷 무변경. ⚠️ **Storage(버킷/객체)는 SQL 직접 삭제 차단(`protect_delete` 트리거) → Storage API(JS client)로만** 업로드/삭제. 테이블만 `phototoon_*` 마이그레이션(SQL).
- 환경변수: `OPENAI_API_KEY`(서버), `IMAGE_MODEL=gpt-image-2`/`STORY_MODEL=gpt-5.5`, `NEXT_PUBLIC_SUPABASE_URL`·`...PUBLISHABLE_KEY`(클라), `SUPABASE_SERVICE_ROLE_KEY`(서버 전용). (참고: `.env.local`엔 미사용 `ARK_API_KEY`·`GEMINI_API_KEY`도 있으나 우리는 안 씀·무수정.)

### 8.9 디렉토리 구조 (현재 `부산/`)
```
부산/
├─ PRD.md                     # 이 문서(기획)
├─ GOAL.md                    # 자율 빌드·검증 정본(M0~M12 + 퍼널별 탈출 체크리스트)
├─ .env.local / .env.example  # OpenAI·Supabase 크레덴셜(.gitignore로 보호)
├─ .gitignore
├─ frontend-reference/        # 모바일 디자인(베이스) + DESIGN-NOTES.md
│   └─ src/{app,components,lib}, 설정(next/tailwind/tsconfig)
├─ mock/                      # RALPHTHON 테스트 사진 7장(데모·픽스처 소스)
├─ scripts/                   # smoke-openai.mjs, smoke-bubble.mjs, smoke-story.mjs (실호출 검증)
└─ verification/
    └─ screenshots/           # smoke-cut.png, smoke-bubble.png (실측 결과)
# M0에서 frontend-reference를 앱 루트로 승격 → src/app/api/* 구현, supabase/migrations/ 추가
```

---

## 9. 리스크 & 대응

| # | 리스크 | 심각도 | 대응 / 상태 |
|---|---|---|---|
| R1 | 캐릭터 일관성(모델 의존) | 🚨→✅ | 얼굴 선택(F3) + gpt-image-2 자동 high-fidelity. **실측: 셀카 두 인물 동일성 양호.** 5회 정식 검증(GOAL §6.B) |
| R2 | OpenAI gpt-image 권한 | 🚨→✅ | **실측: gpt-image-2 호출 성공(64s, medium).** 권한 OK |
| R4 | 한글 말풍선 깨짐 | ⚠️→✅ | **실측: "부산 해커톤, 가보자!" 정확 렌더** → native 말풍선 채택. 깨질 시 짧은 대사/CSS 오버레이 폴백 |
| R5 | 스토리·대사 품질(오글거림) | 중→✅(대응됨) | **실측: gpt-5.5 + PhotoToon 대사 품질 정책으로 오글거림 제거 확인.** 사용자 에피소드 시드로 하한선. 대사는 intent 입력에서 자동 생성 |
| R3 | 생성 속도/타임아웃 | ⚠️→✅ | **비동기-DB: 1요청=이미지 1장(low ~40s)→DB 저장, 프론트 폴링 → Hobby 60s 안.** 데모 사전 생성본 백업 |
| R6 | **기존 DB 손상** | 🚨→✅(검증) | **additive만(phototoon_*), 기존 객체 수정·삭제 절대 금지, SERVICE_ROLE 클라 노출 0, `.env*` 미커밋**. ✅ 실측 통과(create/insert/select + 버킷 + Storage API delete, 기존 무변경). **Storage는 API로만**(§8.8) — **최우선** |
| R7 | 제목 타이포 흰배경 제거 사고(글자 같이 지워짐) | ⚠️ | 프롬프트에 "글자 내부 순백색 금지" 지시 + `sharp` nearWhite 임계값(min≥238 && max−min≤24). 폴백: plain text 제목 |
| R8 | M0 부트스트랩(끊긴 import ~30) | ⚠️ | **실측 확인.** 불필요 페이지/lib 교체·삭제 + 재사용 컴포넌트 import 재배선(GOAL M0). typecheck 0 게이트 |

---

## 10. MVP 범위 (진짜 vs 가짜)
| 영역 | 진짜 | 비고 |
|---|---|---|
| 사진 업로드(주제별) | ✅ | 자동 분류 없음 |
| 입력(주제·에피소드·시간순서·장면설명) | ✅ | 대사 미입력 |
| 얼굴 선택 | ✅ | 부담 시 썸네일 직접 |
| 스토리+제목 생성(gpt-5.5) | ✅ 실측됨 | 대사·말풍선·제목 자동(Dialogue Policy) |
| 컷 생성(gpt-image-2 low, 말풍선) | ✅ 실측됨 | 무대용 사전 생성본 백업 |
| 표지+제목 합성 | ✅ | 1:1 커버 + 타이포 오버레이 |
| 뷰어 / 공유(+나도만들기) | ✅ | navigator.share |
| 나만의 페이지 작품집(웹툰+원본사진·사용자 카테고리) | ✅ P1 | Supabase additive |
| 노래·자소서 / 로그인·소셜피드 / 멀티주제 | ❌ | 버튼 티저 / 익명 / P2 |

---

## 11. 구현 순서 (마일스톤)
> **빌드·검증 정본은 `GOAL.md`** (M0~M12 + 퍼널별 탈출 체크리스트). PoC 없음 — 빌드 내 실호출 스모크로 검증(이미 R1·R2·R4·R5 사전 통과).

| M | 마일스톤 | 핵심 |
|---|---|---|
| M0 | 부트스트랩 | `frontend-reference` 승격, 끊긴 import 정리(typecheck 0), playwright/vitest/sharp |
| M1 | 디자인 시스템 & 셸 | 폰 프레임·하단 네비·다크 reader |
| M2 | 사진 업로드(F1) | 주제별 다중 업로드 |
| M3 | 입력 단계(F2) | 주제·전체 에피소드·시간순서(드래그)·장면별 의미 |
| M4 | 주인공 얼굴 선택(F3) | 후보 중 1개 → 공통 ref |
| M5 | 스토리+제목 생성(F4) | gpt-5.5: 줄거리증강+대사/말풍선 자동+제목 자동(Dialogue Policy) |
| M6 | 컷 이미지 생성(F5) | **핵심** — gpt-image-2 low, native 한글 말풍선 |
| M7 | 표지+제목 생성(F6) | 1:1 커버 + 제목 타이포 합성 |
| M8 | 웹툰 뷰어(F7) | 표지+제목 + 세로 스트립 |
| M9 | 공유(F8) | 나도만들기 링크 워터마크 |
| M10 | 나만의 페이지 작품집(F9) | Supabase additive, 웹툰+원본사진, 사용자 카테고리 분류 |
| M11 | 통합 E2E | 모든 퍼널(1~9)을 한 흐름에서 단언(저장→reload→잔존 포함) |
| M12 | Vercel 배포 | QR 폰 체험 |

### 스크린샷 맵 (Playwright 크롬)
| 파일 | 단언 |
|---|---|
| `01-home` | 앱 셸 + 하단 네비 |
| `02-upload` | 주제별 사진 썸네일 N개 |
| `03-input` | 주제·전체 에피소드·시간순서(드래그)·장면설명 입력 폼 |
| `04-face-select` | 얼굴 후보 2~3 + 선택 표시 |
| `05-generating` | 진행 n/N · 스켈레톤 |
| `06-cuts` | 실제 `img` 컷 N개 + 이미지 내 한글 말풍선(자동 생성·네이버 스타일) 정확 렌더 |
| `07-cover` | 1:1 표지(aspect-square) + 제목 타이포(비어있지 않음) |
| `08-webtoon` | 표지+제목 표지 + 세로 스트립 |
| `09-share` | navigator.share(목)/다운로드 + "나도 만들기" 링크 워터마크 |
| `10-mypage` | 작품집: 저장된 웹툰+원본사진 + 사용자 카테고리 + 새로고침 후 잔존 |

---

## 12. 3분 데모 시나리오 (오늘 RALPHTHON 사진으로)
1. (0:00–0:20) 후킹 — "오늘 찍은 사진, 만화 한 편으로 만들면?"
2. (0:20–0:50) **사진 업로드** → **주제 + 한두 줄 에피소드 입력**(시간순서 드래그, 장면설명은 비워도 됨).
3. (0:50–1:15) **주인공 얼굴 선택** → `[웹툰 만들기]`.
4. (1:15–1:35) gpt-5.5가 **줄거리·대사·제목 자동 생성**(대사를 안 썼는데 말풍선이 채워짐).
5. (1:35–2:20) 컷 생성 1/5…5/5 — **말풍선 들어간 네이버 스타일** 컷 + **표지+제목 타이포** 합성.
6. (2:20–2:45) 완성 웹툰 한 편 스크롤(표지부터 세로 스트립).
7. (2:45–2:55) **공유** → 네이티브 시트(인스타/카톡), "나도 만들기" 링크.
8. (2:55–3:00) 비전 — "완성작은 **작품집**에 원본 사진과 함께 쌓이고, 같은 입력에서 노래·자소서도".

---

## 13. 열린 결정
| # | 결정 | 상태 |
|---|---|---|
| O1 | 스택 | ✅ 단일 Next.js + Supabase additive |
| O2 | 입력 모델 | ✅ **사용자 직접 입력(주제+에피소드+시간순서+장면설명), 대사 미입력 / 1주제=1웹툰** |
| O3 | 일관성 | ✅ 선택 얼굴 공통 ref (실측 양호) |
| O4 | 말풍선 | ✅ 이미지 내 native 한글 말풍선(네이버 스타일) — 실측 통과 |
| O5 | 이미지 품질/사이즈 | ✅ **low**(전부) / `1024x1536` |
| O6 | 컷 수 | ✅ 4~6 (기본 5) |
| O7 | 표지+제목 | ✅ **1:1 커버 + 제목 타이포 CSS 오버레이 합성** |
| O8 | 제목 생성 위치 | ✅ **gpt-5.5 스토리 호출의 `episode_title` 필드**(별도 제목 호출 X) |
| O9 | 나만의 페이지 | ✅ **작품집/책장 — 웹툰+원본사진 저장, 사용자가 직접 카테고리 분류** |
| O10 | 인앱 공개 소셜 피드 | ✅ 데모 제외(P2) — 외부 공유만 |
| O11 | 스토리 모델 | ✅ gpt-5.5(증강+대사+제목+genre/tones), 폴백 gpt-4o |
| O12 | 멀티주제·멀티이벤트 | ✅ **P2 강등** |
| O13 | 대사 품질 | ✅ **PhotoToon 대사 품질 정책 적용(실측: 오글거림 제거)** |
| O14 | 생성 흐름 | ✅ **비동기-DB(1요청=이미지 1장 low→DB 저장, 프론트 폴링 렌더)** — Hobby 60s 대응 |
| O15 | Supabase 역할 | ✅ **P0 생성물 전달 통로 + P1 작품집**, additive 실측 통과, Storage는 API로만 |

---

## 14. 확장 비전
**"주제 하나 + 한두 줄 에피소드" 입력에서 출력만 바꾼다.**
- 웹툰(데모) · **노래/뮤직비디오** · **자소서·회고 문장** · 카드뉴스 · 연말결산
- 작품집 축적 → (확장) 인앱 공개 소셜 피드 + 댓글 → 소셜 플랫폼화
- 멀티주제 묶기(P2) → 여러 주제를 엮은 시리즈/연재

> "주제 하나만 던지면, 내 이야기가 작품이 된다 — 오늘은 웹툰, 내일은 노래·자소서."
