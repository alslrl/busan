import type { Palette, ShortsToon } from "@/lib/types";

const palettes: Palette[] = [
  {
    from: "#d9f99d",
    via: "#86efac",
    to: "#22c55e",
    glow: "rgba(34, 197, 94, 0.28)",
    ink: "#0f172a",
  },
  {
    from: "#fbcfe8",
    via: "#f9a8d4",
    to: "#fb7185",
    glow: "rgba(244, 114, 182, 0.22)",
    ink: "#111827",
  },
  {
    from: "#bfdbfe",
    via: "#93c5fd",
    to: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.22)",
    ink: "#0f172a",
  },
];

export const demoShortsToons: ShortsToon[] = [
  {
    id: "demo-survival",
    slug: "survive-at-work",
    title: "회사에서 살아남기",
    hook: "회사 채팅 하나에도 눈치가 흐르는 날, 버티는 표정을 들키지 않는 법.",
    summary:
      "살아남는 기술은 일보다 표정에서 시작된다는 걸 보여주는 오피스 생존 쇼츠툰.",
    tags: ["오피스", "생존", "공감"],
    readingMinutes: 3,
    sceneCount: 4,
    creator: "@jinho",
    episodeLabel: "EP.12",
    likes: 892,
    viewsLabel: "12.3k",
    publishedDate: "2026.04.24",
    commentCount: 47,
    coverImagePath: "/phototoon-fixtures/scene-01.jpeg",
    palette: palettes[0],
    cuts: [
      {
        id: "survival-1",
        title: "컷 1",
        caption: "오늘도 침착한 척 먼저 자리에 앉는다.",
        situation: "오전 회의 직전, 주인공이 의자를 끌며 표정을 정리한다.",
        emotion: "긴장, 억눌림",
        prompt:
          "Dark office survival scene, tired protagonist in a formal shirt, cinematic webtoon cover style.",
        continuityNotes: ["검은 머리와 어두운 셔츠 유지", "무거운 사무실 조명 톤 유지"],
        imagePath: "/phototoon-fixtures/scene-01.jpeg",
        palette: palettes[0],
      },
      {
        id: "survival-2",
        title: "컷 2",
        caption: "단체방 알림이 울리자 모두의 시선이 위로 튄다.",
        situation: "주인공이 휴대폰을 확인하며 작게 표정을 굳힌다.",
        emotion: "불안, 정지",
        prompt:
          "Same office, same protagonist reacting to a message notification, cinematic suspense, dark moody style.",
        continuityNotes: ["앞 컷의 표정 흐름 유지", "같은 사무실 배경 유지"],
        imagePath: "/phototoon-fixtures/scene-01.jpeg",
        palette: palettes[0],
      },
      {
        id: "survival-3",
        title: "컷 3",
        caption: "웃는 척하지만 손끝은 이미 하얗게 굳어 있다.",
        situation: "주인공이 억지 미소를 지으며 버티는 순간을 잡는다.",
        emotion: "체념, 버팀",
        prompt:
          "Close-up on protagonist masking fear with a smile, dramatic office webtoon mood, black and crimson shadows.",
        continuityNotes: ["얼굴 각도와 조명 흐름 연결", "같은 복장 유지"],
        imagePath: "/phototoon-fixtures/scene-01.jpeg",
        palette: palettes[0],
      },
      {
        id: "survival-4",
        title: "컷 4",
        caption: "퇴근은 못 했지만, 오늘도 살아남았다.",
        situation: "모니터 불빛만 남은 저녁, 주인공이 조용히 숨을 뱉는다.",
        emotion: "안도, 공허",
        prompt:
          "Late evening office survival ending, protagonist alone with monitor glow, bittersweet webtoon frame.",
        continuityNotes: ["주인공 silhouette 유지", "사무실 밤 톤 유지"],
        imagePath: "/phototoon-fixtures/scene-01.jpeg",
        palette: palettes[0],
      },
    ],
  },
  {
    id: "demo-ilijji",
    slug: "iljjin-hansumin",
    title: "일찐 한수민",
    hook: "복도 끝에서 눈이 마주친 순간, 학급의 공기가 먼저 멈춘다.",
    summary:
      "학교 복도 한가운데에서 시작되는 날선 긴장감. 눈빛 하나로 분위기를 뒤집는 인물극.",
    tags: ["학원", "긴장", "로맨스?"],
    readingMinutes: 2,
    sceneCount: 4,
    creator: "@dalkom",
    episodeLabel: "EP.04",
    likes: 510,
    viewsLabel: "8.1k",
    publishedDate: "2026.04.23",
    commentCount: 31,
    coverImagePath: "/phototoon-fixtures/scene-02.jpeg",
    palette: palettes[1],
    cuts: [
      {
        id: "ilijji-1",
        title: "컷 1",
        caption: "복도 끝에 서 있는 애를 보자 발걸음이 먼저 멈췄다.",
        situation: "학교 복도, 한수민이 벽에 기대 서 있다.",
        emotion: "경계, 정적",
        prompt:
          "School hallway, sharp-eyed female lead leaning against the wall, moody romance thriller webtoon style.",
        continuityNotes: ["검은 교복 느낌 유지", "차가운 복도 톤 유지"],
        imagePath: "/phototoon-fixtures/scene-02.jpeg",
        palette: palettes[1],
      },
      {
        id: "ilijji-2",
        title: "컷 2",
        caption: "말은 없는데, 표정이 먼저 시비를 건다.",
        situation: "주인공과 한수민이 서로를 보는 클로즈업.",
        emotion: "도발, 위축",
        prompt:
          "Close-up tension between two students, webtoon romance thriller mood, dramatic shadows.",
        continuityNotes: ["인물 얼굴 대비 유지", "복도 배경 흐림 유지"],
        imagePath: "/phototoon-fixtures/scene-02.jpeg",
        palette: palettes[1],
      },
      {
        id: "ilijji-3",
        title: "컷 3",
        caption: "한 걸음 가까워질수록 주변 소리가 사라진다.",
        situation: "한수민이 다가오고 주인공의 시선이 흔들린다.",
        emotion: "압도, 흔들림",
        prompt:
          "The intimidating girl steps closer, hallway fades around them, cinematic manga panel lighting.",
        continuityNotes: ["앞 컷의 두 인물 위치 흐름 유지", "눈빛 강조"],
        imagePath: "/phototoon-fixtures/scene-02.jpeg",
        palette: palettes[1],
      },
      {
        id: "ilijji-4",
        title: "컷 4",
        caption: "그리고 뜻밖에도, 먼저 웃은 건 한수민이었다.",
        situation: "날카로운 분위기가 잠시 풀리는 반전 컷.",
        emotion: "반전, 흔들림",
        prompt:
          "Unexpected smile breaks the tension, dark school romance webtoon ending beat.",
        continuityNotes: ["한수민 비주얼 유지", "복도 조명 유지"],
        imagePath: "/phototoon-fixtures/scene-02.jpeg",
        palette: palettes[1],
      },
    ],
  },
  {
    id: "demo-sea",
    slug: "sea-trip-with-you",
    title: "너랑 나랑 같이 바다여행?",
    hook: "농담처럼 던진 한마디가 여름의 방향을 바꿔 버린다.",
    summary:
      "바다와 노을, 장난스러운 대사, 그리고 살짝 흔들리는 감정선이 중심인 청춘 감성 쇼츠툰.",
    tags: ["청춘", "바다", "감성"],
    readingMinutes: 2,
    sceneCount: 4,
    creator: "@sora",
    episodeLabel: "EP.08",
    likes: 1400,
    viewsLabel: "18.2k",
    publishedDate: "2026.04.22",
    commentCount: 52,
    coverImagePath: "/phototoon-fixtures/scene-03.jpeg",
    palette: palettes[2],
    cuts: [
      {
        id: "sea-1",
        title: "컷 1",
        caption: "바람이 불자 머리카락보다 먼저 분위기가 흔들렸다.",
        situation: "해 질 무렵, 두 사람이 바닷가 방파제에 서 있다.",
        emotion: "설렘",
        prompt:
          "Two young people at the seaside during sunset, breezy, cinematic romantic webtoon cover style.",
        continuityNotes: ["바다와 노을 톤 유지", "두 인물 실루엣 유지"],
        imagePath: "/phototoon-fixtures/scene-03.jpeg",
        palette: palettes[2],
      },
      {
        id: "sea-2",
        title: "컷 2",
        caption: "“너랑 나랑 같이 바다여행?” 장난처럼 들렸지만, 눈빛은 아니었다.",
        situation: "상대가 웃으며 말을 건네는 순간을 잡는다.",
        emotion: "가벼움, 진심",
        prompt:
          "Youth romance at sunset beach, one character asks the other to travel together, emotional close-up.",
        continuityNotes: ["앞 컷의 바다 노을 유지", "두 인물 의상 유지"],
        imagePath: "/phototoon-fixtures/scene-03.jpeg",
        palette: palettes[2],
      },
      {
        id: "sea-3",
        title: "컷 3",
        caption: "대답 대신 웃어버린 게 더 확실한 고백처럼 느껴졌다.",
        situation: "주인공이 바다 쪽으로 시선을 돌리며 웃는다.",
        emotion: "머뭇거림, 설렘",
        prompt:
          "Romantic hesitation at a beach sunset, soft smile, webtoon lighting, emotional distance closing.",
        continuityNotes: ["바다 수평선과 노을 유지", "표정 흐름 유지"],
        imagePath: "/phototoon-fixtures/scene-03.jpeg",
        palette: palettes[2],
      },
      {
        id: "sea-4",
        title: "컷 4",
        caption: "우리가 진짜 떠날지는 몰라도, 그날은 분명 시작이었다.",
        situation: "멀어지는 바다를 함께 바라보는 엔딩 컷.",
        emotion: "여운",
        prompt:
          "Two figures looking at the horizon together, dreamy seaside webtoon ending.",
        continuityNotes: ["두 인물 뒷모습 유지", "노을 그라데이션 유지"],
        imagePath: "/phototoon-fixtures/scene-03.jpeg",
        palette: palettes[2],
      },
    ],
  },
  {
    id: "demo-tiger",
    slug: "beautiful-tiger-behind-base",
    title: "군대 뒷산에 등장한 미녀 호랑이",
    hook: "훈련보다 더 믿기 어려운 건, 뒷산에서 눈이 마주친 그 순간이었다.",
    summary:
      "군대와 판타지, 미녀 호랑이라는 강한 조합을 다크 액션 톤으로 밀어붙이는 쇼츠툰.",
    tags: ["판타지", "액션", "군대"],
    readingMinutes: 2,
    sceneCount: 4,
    creator: "@yunho",
    episodeLabel: "EP.01",
    likes: 3200,
    viewsLabel: "42.8k",
    publishedDate: "2026.04.21",
    commentCount: 88,
    coverImagePath: "/phototoon-fixtures/scene-04.jpeg",
    palette: palettes[1],
    cuts: [
      {
        id: "tiger-1",
        title: "컷 1",
        caption: "총보다 먼저 숨이 멎었다.",
        situation: "뒷산 수색 중, 주인공이 숲속 실루엣을 발견한다.",
        emotion: "경악",
        prompt:
          "Military fantasy webtoon, soldier spotting a mysterious tiger woman in the forest, dark cinematic mood.",
        continuityNotes: ["숲과 군복 톤 유지", "호랑이 귀 실루엣 유지"],
        imagePath: "/phototoon-fixtures/scene-04.jpeg",
        palette: palettes[1],
      },
      {
        id: "tiger-2",
        title: "컷 2",
        caption: "아름다운데, 도망쳐야 할 것 같았다.",
        situation: "호랑이 여인이 천천히 모습을 드러낸다.",
        emotion: "압도",
        prompt:
          "Tiger woman revealed in the forest, dangerous beauty, dark fantasy webtoon composition.",
        continuityNotes: ["호랑이 여인 외형 유지", "숲 안개 유지"],
        imagePath: "/phototoon-fixtures/scene-04.jpeg",
        palette: palettes[1],
      },
      {
        id: "tiger-3",
        title: "컷 3",
        caption: "그녀는 먼저 이름을 물었다.",
        situation: "긴장 속에서 예상 밖의 대화가 시작된다.",
        emotion: "혼란",
        prompt:
          "Unexpected conversation between soldier and tiger woman, dark fantasy tension with soft eye contact.",
        continuityNotes: ["두 인물 거리감 유지", "다크 숲 분위기 유지"],
        imagePath: "/phototoon-fixtures/scene-04.jpeg",
        palette: palettes[1],
      },
      {
        id: "tiger-4",
        title: "컷 4",
        caption: "그날 이후, 뒷산은 훈련장이 아니라 비밀이 되었다.",
        situation: "숲 뒤로 사라지는 호랑이 여인의 엔딩 컷.",
        emotion: "여운",
        prompt:
          "Tiger woman disappears into the mountain forest at dusk, haunting fantasy ending.",
        continuityNotes: ["호랑이 꼬리와 실루엣 유지", "산 안개 유지"],
        imagePath: "/phototoon-fixtures/scene-04.jpeg",
        palette: palettes[1],
      },
    ],
  },
];

export function listDemoShortsToons() {
  return demoShortsToons;
}

export function findDemoShortsToonBySlug(slug: string) {
  return demoShortsToons.find((toon) => toon.slug === slug) ?? null;
}
