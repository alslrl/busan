import type { CreatorCanvasMode, CreatorGenre, CreatorTone } from "@/lib/types";

export const CREATOR_GENRES = [
  "로맨스",
  "로판",
  "판타지",
  "현판",
  "헌터",
  "액션",
  "학원",
  "코미디",
  "스릴러",
  "공포",
] as const satisfies readonly CreatorGenre[];

export const CREATOR_TONES = [
  "설렘",
  "달달함",
  "병맛",
  "사이다",
  "긴장감",
  "피폐함",
  "감성",
  "막장",
  "기묘함",
  "열혈",
] as const satisfies readonly CreatorTone[];

export const IMAGE_VOLUME_TIERS = [
  {
    id: "demo",
    label: "데모 1장",
    pageImages: 1,
    bestFor: "Vercel 데모, 빠른 생성 확인",
    capacity: "demo",
  },
  {
    id: "compact",
    label: "더 짧게",
    pageImages: 3,
    bestFor: "한 가지 반전, 감정 한 방, 간단한 상황극",
    capacity: "short",
  },
  {
    id: "recommended",
    label: "추천 구성",
    pageImages: 4,
    bestFor: "대부분의 쇼츠툰 기본형",
    capacity: "standard",
  },
  {
    id: "rich",
    label: "더 풍부하게",
    pageImages: 5,
    bestFor: "개그, 액션, 반전, 설정이 많은 이야기",
    capacity: "rich",
  },
] as const;

export const CHARACTER_LIMITS = {
  min: 1,
  default: 2,
  max: 3,
} as const;

export const CHARACTER_ROLES = [
  "주인공",
  "상대역",
  "조력자",
  "방해자",
  "라이벌",
] as const;

export const PAGE_IMAGE_PURPOSES = [
  "도입",
  "전개",
  "반전",
  "클라이맥스",
  "마무리",
] as const;

export const GENRE_REFERENCE = {
  로맨스: {
    titlePattern: "{관계명} {감정/결함}, 사내/계약/룸메/첫사랑 같은 생활 키워드, 또는 {인물}의 {사건}",
    visualStyle:
      "Naver Webtoon romance series-style Korean webtoon art direction, clean attractive character design, elegant romance-cover polish, soft expressive eyes, refined linework, emotionally readable faces, commercial mobile webtoon finish",
    thumbnailRule:
      "두 인물의 손/시선이 닿기 직전인 OTS 구도. 단독 인물 썸네일은 피한다. 좌측 하단 42% x 30%는 고정 타이틀 슬롯으로 비워두고, 얼굴/손/핵심 소품/밝은 하이라이트를 넣지 않는다.",
    avoid:
      "추상명사 단독 제목, 인물 이름만 있는 제목, 무국적 판타지 의상, 던전/괴물/무기",
  },
  로판: {
    titlePattern: "{책/게임} 속 {역할}이 되었다, 이번 생은 {새 역할}, 악역의 {운명}은 {결말}뿐",
    visualStyle:
      "Korean romance fantasy webtoon, ultra-fine line art, painterly semi-cel with pastel jewel tones, Renaissance court fashion, ornate dress with gemstone accessories, chandelier rim light, 8-head-tall slim proportions",
    thumbnailRule:
      "여주 단독 풀샷의 드레스 강조 또는 남주 손이 닿기 직전인 OTS 컷. 보석톤 배경.",
    avoid:
      "현대 한국 도시 일상, 추상 형용사 제목, 여주를 수동 피해자로만 두는 장면, 헌터/총/차원문",
  },
  판타지: {
    titlePattern: "{등급} {직군} + {일상행동}, 환생한 {전직군}은 {새 분야} 천재",
    visualStyle:
      "Korean fantasy webtoon, dynamic ink-style with strong outlines and motion lines, vivid signature accent color over desaturated dark background, system status window UI, low-angle hero shot",
    thumbnailRule:
      "주인공 단독 정면 풀샷, 무기와 발광 효과, 등급 텍스트를 한 색으로 강하게.",
    avoid:
      "던전 안 현대 옷차림, 영문 카피 단독, 평화로운 일상 컷만으로 종료, 헌터물 게이트 미장센",
  },
  현판: {
    titlePattern: "{현실 사건} 후 {사이다 사건}, {플랫폼/국가} 씹어먹는 천재 {직업}, 음슴체 종결",
    visualStyle:
      "Korean modern fantasy webtoon, clean medium-weight line art, realistic Seoul urban background, Korean cast, profession outfit, one signature glow color, holographic Korean status UI",
    thumbnailRule:
      "정면 응시 하프샷, 한국 도시 배경, 시스템창/돈/스킬 발광, 직업 소품.",
    avoid:
      "중세 성/드래곤/마법학교, 추상 형용사 제목, 다색 무지개 발광, 사이다 없이 끝나는 단편",
  },
  헌터: {
    titlePattern: "{회귀한/지옥에서 돌아온/부서진} {역할}, {등급} {직군}, 나 혼자 {장소}에서 {일상행동}",
    visualStyle:
      "Korean hunter-genre webtoon, gritty heavy line art with shadow inking, desaturated concrete-Seoul base, one signature glow color, holographic Korean status UI, hunter combat outfit",
    thumbnailRule:
      "주인공 정면 풀샷, 손의 무기, 뒤쪽 게이트, 한국 도시 실루엣, 등급 텍스트.",
    avoid:
      "발광 컬러 무지개, 무국적 다크 판타지, 등급/시스템 노출 없이 종료, 게이트 상시 개방",
  },
  액션: {
    titlePattern: "{직책/계급}의 귀환, 회귀한 {직군}, 짧은 명사형 임팩트",
    visualStyle:
      "Korean webtoon action, sharp inked linework, cinematic dutch angle, dramatic rim lighting, single saturated accent color, motion-blur speed lines, hero stance",
    thumbnailRule:
      "상반신 클로즈업, 무기/도구 한 점, 얼굴은 정면 또는 도전적인 측면, 굵은 고딕 타이포 자리.",
    avoid:
      "모든 컷 풀샷 단조, 고어, 추상 요약 캡션, 익명 양복 군상만 있는 적",
  },
  학원: {
    titlePattern: "학교 호칭/관계어 + 사건, 반장/선배/짝꿍/우리반, 모순 + 학생 신분",
    visualStyle:
      "Korean school-life webtoon, clean inked outlines, soft natural classroom lighting, modern Korean school uniforms, one signature accessory per character, pastel sky or fluorescent gradient",
    thumbnailRule:
      "교복 인물 1~2명, 칠판/창문/복도 배경, 시선은 살짝 빗기고 강한 단어 한쪽 배치.",
    avoid:
      "미국식 프롬/치어리더, 학교폭력 가해 미화, 회상 내레이션만 있는 화, 동일한 학생 외형",
  },
  코미디: {
    titlePattern: "~일기, ~탈출일지, ~라이프, {호칭} {모순 직업}, 짧은 의성어",
    visualStyle:
      "Korean slice-of-life comedy webtoon, clean simple linework, occasional super-deformed reaction, flat pastel background, over-the-top facial reactions, light cell shading",
    thumbnailRule:
      "캐릭터 2명, 한 명은 표정 폭발, 한 명은 무표정, 단색 배경과 굵은 펀치 단어.",
    avoid:
      "한 컷에 농담 2개 이상, 진지한 영화풍 라이팅, 농담 해설 캡션, 모든 인물 의상 통일",
  },
  스릴러: {
    titlePattern: "일상 단어 + 음습 변형, 게임 메타포, 1인칭 진술형",
    visualStyle:
      "Korean thriller webtoon, precise inked linework, desaturated charcoal palette with single accent, hard shadows, asymmetric framing, ordinary Korean apartment hallway or office after hours",
    thumbnailRule:
      "인물 얼굴 일부만 보이는 비대칭 컷, 어두운 배경, 강조색 한 점, 텍스트는 하단 작게.",
    avoid:
      "피/비명/고어 클로즈업 시작, 처음부터 음흉한 가해자 표정, 빈 공간을 효과음으로 채우기",
  },
  공포: {
    titlePattern: "장소/역명 + 귀신/괴담, 한자 4자, 들어가지 마라/보지 마 같은 명령형",
    visualStyle:
      "Korean horror webtoon, rough inked linework, near-monochrome palette, single hard light source, realistic Korean urban space, character from behind with face partially hidden",
    thumbnailRule:
      "어두운 한국 공간, 인물 등 뒤 컷, 얼굴은 가리고 LED/비상구 같은 강조색 한 점.",
    avoid:
      "첫 컷부터 큰 귀신 얼굴, 고어 묘사, 컷마다 효과음, 서양식 호러 클리셰",
  },
} as const satisfies Record<
  CreatorGenre,
  {
    titlePattern: string;
    visualStyle: string;
    thumbnailRule: string;
    avoid: string;
  }
>;

type HookAxisReference = {
  axis: string;
  options: readonly string[];
};

type GenrePremiseReference = {
  researchAnchors: readonly string[];
  premiseMoves: readonly string[];
  hookAxes?: readonly HookAxisReference[];
  promptSeeds: readonly string[];
  avoidOverusedHooks?: readonly string[];
  avoidPremises: readonly string[];
};

export const GENRE_PREMISE_REFERENCE = {
  로맨스: {
    researchAnchors: [
      "사내/캠퍼스 로맨스는 관계 거리, 직책, 닿기 직전의 손/시선이 핵심이다.",
      "Cheese in the Trap 계열은 달콤함보다 불편한 권력 거리와 시선 회피가 강하다.",
      "True Beauty 계열은 외모 변화보다 공개/비공개 정체성의 타이밍이 훅이 된다.",
    ],
    premiseMoves: [
      "평범한 첫 만남 대신 계약/예약/리뷰/명찰 같은 행정적 오류를 감정 사건으로 바꾼다.",
      "두 사람이 좋아하게 되는 이유보다, 좋아하면 안 되는 정확한 생활 규칙을 먼저 만든다.",
      "고백은 빼고, 관계가 들킬 수밖에 없는 물건 하나를 첫 문장에 넣는다.",
    ],
    promptSeeds: [
      "가짜 결혼식 리뷰를 쓰던 웨딩홀 알바가 자기 이름으로 예약된 식을 발견하고, 신랑 역할의 단골 손님에게 하루만 부부인 척해 달라고 한다.",
      "사내 익명 칭찬봇을 관리하던 인턴이 매일 같은 사람에게만 삭제된 고백 로그가 쌓이는 걸 보고, 퇴근 엘리베이터에서 그 계정을 대면한다.",
    ],
    avoidPremises: [
      "비 오는 날 우산만으로 시작하는 첫사랑",
      "인기남이 평범한 여주에게 갑자기 반하는 구조",
      "운명/첫눈/추억 같은 추상어만 있는 문장",
    ],
  },
  로판: {
    researchAnchors: [
      "로판은 황실 표식, 유언장, 만찬, 계약서처럼 세계관 표지를 첫 장면에 박아야 한다.",
      "악녀/빙의/회귀 공식은 그대로 쓰면 낡으므로 문서·법·의식의 허점을 뒤집는 편이 낫다.",
      "막장 톤은 감정 설명보다 공개 장소의 물건 하나가 폭로 장치가 될 때 강하다.",
    ],
    premiseMoves: [
      "빙의 사실보다, 주인공이 원작 규칙을 행정 문서 하나로 역이용하는 순간을 만든다.",
      "황제/공작의 집착 대신 여주가 먼저 판을 깔아 상대가 해독하게 만든다.",
      "드레스와 궁전은 배경으로만 두고, 갈등은 초대장/유언장/혼인 서약서 같은 소품에 싣는다.",
    ],
    promptSeeds: [
      "처형 직전 황녀가 자기 장례식 초대장을 먼저 보내자, 그녀를 죽이려던 공작이 살아 있는 황녀의 유언장을 해독해야 한다.",
      "빙의한 악녀가 황제의 청혼을 거절하지 않고 혼인계약서 맨 아래 벌칙 조항만 바꿔, 다음 만찬에서 황실 전체를 증인으로 세운다.",
    ],
    avoidPremises: [
      "악녀가 사실 착했다는 설명만 있는 구조",
      "폭군 남주가 이유 없이 구원하는 장면",
      "빙의/회귀 사실을 독백으로 길게 설명하는 시작",
    ],
  },
  판타지: {
    researchAnchors: [
      "Tower of God 계열은 탑/시험/규칙 같은 거대 구조물과 등급의 불공정성이 훅이다.",
      "Annarasumanara 계열은 일상 풍경 속 한 장면만 마법처럼 어긋날 때 감성이 산다.",
      "판타지는 능력보다 규칙을 먼저 만들고, 그 규칙을 깨는 작은 직업을 주면 신선해진다.",
    ],
    premiseMoves: [
      "마법 천재 대신 지도 제작자, 번역가, 청소부처럼 세계의 빈틈을 보는 직업을 쓴다.",
      "SSS급 각성은 결과로 미루고, 첫 문장에는 이상한 규칙이나 금지된 장소를 넣는다.",
      "거대한 운명보다, 누락된 이름/지도/문장 같은 결함 하나를 따라가게 한다.",
    ],
    promptSeeds: [
      "마법을 못 쓰는 지도 제작자가 사람들이 길을 잃은 장소에서만 보이는 두 번째 지도를 발견하고, 지도 밖으로 사라진 형의 이름을 따라간다.",
      "왕립 시험장에서 매번 빈 답안지만 내던 견습 번역가가 아무도 읽지 못한 몬스터의 항의문을 번역하자, 시험장이 먼저 무너진다.",
    ],
    avoidPremises: [
      "F급이 갑자기 SSS급으로 각성하는 한 줄",
      "마왕/용사/성검을 이름만 바꾼 구조",
      "세계 멸망을 설명하고 끝나는 도입",
    ],
  },
  현판: {
    researchAnchors: [
      "현판은 서울 사무실, 앱, 주식, 야구장, 방송국처럼 현실 직업 표지가 중요하다.",
      "사이다 톤은 주인공의 정보 우위가 스마트폰 화면이나 숫자로 증명될 때 빠르게 읽힌다.",
      "회귀/시스템은 목적이 아니라 현실 권력 구조를 뒤집는 장치로만 써야 한다.",
    ],
    premiseMoves: [
      "회귀를 말하지 말고, 앱 알림/영수증/근태 기록처럼 현실 데이터가 미래를 흘리게 한다.",
      "갑질 응징은 마지막에 미루고, 첫 문장에는 주인공이 조용히 바꾸는 작은 기록을 둔다.",
      "천재 직업물은 직업 소품 하나가 말도 안 되는 예언 장치로 변할 때 덜 진부하다.",
    ],
    promptSeeds: [
      "퇴사 대행 앱의 리뷰를 조작하던 인턴이 미래의 자기 퇴사 사유를 미리 읽고, 그날부터 팀장의 일정표를 하나씩 바꿔 놓는다.",
      "야구장 전광판 자막 알바가 아직 치지 않은 홈런 문구를 송출해 버린 뒤, 관중석의 무명 투수와 같은 시스템 알림을 본다.",
    ],
    avoidPremises: [
      "회귀 후 주식으로 돈 버는 설명만 있는 구조",
      "부장에게 바로 한 방 먹이고 끝나는 장면",
      "시스템창이 모든 문제를 대신 해결하는 전개",
    ],
  },
  헌터: {
    researchAnchors: [
      "헌터물은 게이트/등급/협회/상태창이 즉시 보이는 장르 표지다.",
      "Solo Leveling 계열의 단독 강자 구도는 강하지만, 그대로 쓰면 흔하므로 일상 직업과 충돌시킨다.",
      "SSS급 죽어야 사는 헌터 계열은 죽음/회귀보다 대가와 반복 규칙이 훅이다.",
    ],
    premiseMoves: [
      "강한 헌터가 강해지는 이야기가 아니라, 약한 직무가 던전 규칙을 이상하게 해석하게 만든다.",
      "상태창에는 능력치보다 이상한 생활 정보나 영수증을 띄운다.",
      "게이트를 열지 말고, 게이트 안에 너무 현실적인 공간을 하나 박아 부조리를 만든다.",
    ],
    promptSeeds: [
      "F급 짐꾼이 던전 입장권 대신 분실물 보관증을 줍자, 그 보관증에 S급 헌터들이 잃어버린 생존 본능이 번호표처럼 찍혀 있다.",
      "SSS급 회귀자가 던전 5층에 무인 편의점을 열었는데, 첫 손님인 협회장이 계산대 상태창에 자기 사망 예정 시간을 찍고 간다.",
    ],
    avoidPremises: [
      "최하급 헌터가 갑자기 최강 스킬을 얻는 구조",
      "던전 보스 처치만 목표인 문장",
      "검은 코트와 푸른 발광만 있는 무국적 설정",
    ],
  },
  액션: {
    researchAnchors: [
      "약한영웅/입학용병 계열은 약자와 강자의 물리적 거리, 도구 하나, 눈빛으로 읽힌다.",
      "참교육 계열은 권력자가 방심하는 일상 공간에서 응징의 각도가 잡힐 때 카타르시스가 난다.",
      "액션은 싸움 자체보다 싸움을 피하려는 이유가 먼저 있어야 단편 훅이 산다.",
    ],
    premiseMoves: [
      "전직 강자를 숨기되, 배달/대리/청소 같은 낮은 위치의 동선으로 사건에 들어가게 한다.",
      "첫 문장에 주먹보다 버튼, 헬멧, 송장, 출입증 같은 액션 직전 소품을 넣는다.",
      "복수 이유를 설명하지 말고, 조작 영상/분실 파일 같은 증거를 발견하게 한다.",
    ],
    promptSeeds: [
      "배달 오토바이만 타던 전직 복서가 마지막 주문지에서 자기 은퇴 경기의 조작 영상을 발견하고, 배달 완료 버튼을 누르기 전 상대를 찾아간다.",
      "대리기사로 숨어 살던 전직 조직원이 첫 콜 차량 뒷좌석에서 옛 부하의 목소리를 듣고, 문 손잡이를 잡은 채 도망칠지 싸울지 멈춘다.",
    ],
    avoidPremises: [
      "일진에게 당한 뒤 바로 각성하는 구조",
      "정체불명의 양복 악당만 등장하는 장면",
      "피와 고어로 강도를 대신하는 액션",
    ],
  },
  학원: {
    researchAnchors: [
      "학원물은 교복, 호칭, 자리 거리, 방과후 동선처럼 즉시 읽히는 학교 생활 표지가 훅이다.",
      "unOrdinary 계열은 교복과 일상 규칙 아래 숨은 능력 서열이 훅이다.",
      "치인트 계열 학원 로맨스는 친절한 표정 뒤의 불편한 권력 거리와 시선 회피가 강하다.",
    ],
    premiseMoves: [
      "학교 시스템 하나를 이상하게 만드는 대신, 관계 축 하나와 실제 공간/행사 축 하나를 섞어 단편 압력을 만든다.",
      "인기 남학생/모범생 클리셰보다, 같이 움직일 수밖에 없는 장소·당번·준비 상황을 먼저 만든다.",
      "고백은 빼고, 들키면 관계가 바뀌는 작은 행동이나 물건을 첫 문장에 넣는다.",
    ],
    hookAxes: [
      {
        axis: "관계",
        options: ["반장", "짝꿍", "선배", "후배", "전학생", "방송부", "동아리장"],
      },
      {
        axis: "공간",
        options: ["교실", "복도", "옥상", "체육관", "도서관", "하교길", "매점", "방송실"],
      },
      {
        axis: "사건",
        options: ["축제 준비", "수행평가", "청소 당번", "단체 채팅", "무대 소품", "체육복 대여", "도시락", "우산"],
      },
      {
        axis: "감정",
        options: ["들킴", "오해", "보호", "질투", "응원", "어색한 친절", "비밀 공유"],
      },
    ],
    promptSeeds: [
      "축제 전날 무대 소품을 옮기던 방송부 막내가 모두가 피하던 전학생의 응원 멘트를 대신 틀어 버리고, 반장은 그 실수를 조용히 자기 탓으로 돌린다.",
      "체육관 창고에 같이 갇힌 짝꿍 둘이 꺼내려던 체육복 주머니에서 서로에게 쓰다 만 응원 문장을 발견하고, 문밖 단체 채팅은 둘을 찾기 시작한다.",
      "하교길 소나기 때문에 우산 하나를 나눠 쓴 선배와 후배가 매점 앞에서 같은 동아리 탈퇴서를 숨기고 있었다는 걸 동시에 알아챈다.",
      "옥상에서 도시락을 혼자 먹던 반장이 매일 두 개씩 놓고 가던 사람을 붙잡자, 무표정한 전학생이 오늘만 반찬 순서를 바꾼 이유를 들킨다.",
    ],
    avoidOverusedHooks: [
      "좌석표",
      "분실물함",
      "날짜별 쪽지",
      "매일 바뀌는 규칙",
      "내일 평판",
      "전교생 공개 랭킹",
    ],
    avoidPremises: [
      "시험 스트레스 많은 고3을 누가 위로하는 이야기",
      "인기 남학생이 만든 간식으로 가까워지는 구조",
      "모범생과 일진이 사실 착했다는 설명만 있는 문장",
    ],
  },
  코미디: {
    researchAnchors: [
      "마음의소리 계열은 단순한 선, 무표정, 과장 표정의 점프가 핵심이다.",
      "Mage & Demon Queen 계열은 판타지 설정을 일상 감정으로 너무 가볍게 처리할 때 웃긴다.",
      "병맛은 이유를 설명할수록 약해지므로 셋업과 결론 사이 논리 하나만 고장낸다.",
    ],
    premiseMoves: [
      "캐릭터가 웃긴 말을 하는 대신, 조직 전체가 아무렇지 않게 이상한 규칙을 받아들이게 한다.",
      "첫 문장에는 회의, 방송, 급식, 고객센터처럼 질서 있는 공간을 넣고 그 질서 하나만 망가뜨린다.",
      "농담을 설명하지 말고, 마지막까지 진지한 사람 한 명을 남긴다.",
    ],
    promptSeeds: [
      "학교 방송반이 급식 메뉴를 예언처럼 읽었을 뿐인데 전교생이 그대로 움직이기 시작하고, 무표정한 막내 PD만 방송 금지를 까먹는다.",
      "분기 보고 회의 중 부장이 아이돌 데뷔를 선언하자, 신입은 박수 타이밍을 놓쳤다는 이유로 갑자기 센터 포지션이 된다.",
    ],
    avoidPremises: [
      "개그를 캡션으로 설명하는 상황",
      "모두가 동시에 소리 지르는 리액션",
      "랜덤한 말장난만 있고 사건 압력이 없는 문장",
    ],
  },
  스릴러: {
    researchAnchors: [
      "Sweet Home 계열은 평범한 주거 공간이 갑자기 생존 규칙으로 바뀌는 힘이 있다.",
      "Bastard 계열은 얼굴 절반, 가족/이웃 관계, 닫힌 문 같은 가까운 공포가 강하다.",
      "피라미드 게임 계열은 학급/회사 규칙표가 폭력의 인터페이스가 될 때 읽힌다.",
    ],
    premiseMoves: [
      "살인마를 먼저 보여주지 말고, 앱 로그/근태/좌석표처럼 지워지는 기록으로 위협을 만든다.",
      "공간은 아파트 복도, 사무실, 교실처럼 가까운 곳으로 좁히고 시간 하나를 반복시킨다.",
      "마지막 문장에는 범인이 아니라 주인공의 이름이 이상한 칸에 뜨게 한다.",
    ],
    promptSeeds: [
      "야근 기록을 지워 주는 사내 앱을 만든 신입이 매일 00:17에 삭제되는 한 사람의 출근 기록을 복구하자, 자기 사번이 범인 칸에 뜬다.",
      "비어 있는 옆방에서 매일 같은 시간 의자 끄는 소리가 나고, 관리 앱의 민원 작성자 이름은 아직 이사 오지 않은 주인공의 이름이다.",
    ],
    avoidPremises: [
      "피 묻은 메모나 비명으로 시작하는 장면",
      "처음부터 수상하게 웃는 범인",
      "CCTV 확인만으로 해결되는 단순 괴담",
    ],
  },
  공포: {
    researchAnchors: [
      "기기괴괴 계열은 일상 소품 하나가 정상처럼 보이다가 마지막에 비틀릴 때 강하다.",
      "옥수역 귀신 계열은 도시 장소명과 반복 동선, 단 한 컷의 충격으로 압축된다.",
      "공포는 귀신 얼굴보다 형광등, 엘리베이터, 비상구, 배달 알림 같은 현실 표지가 먼저다.",
    ],
    premiseMoves: [
      "귀신을 보여주지 말고, 알림/층수/역명/문패가 계속 한 글자씩 바뀌게 한다.",
      "한국 도시 공간을 구체화하고, 첫 문장에는 사람이 아니라 시스템이 이상한 요청을 하게 한다.",
      "고어 없이 다음 사람이 될 것 같은 순번표나 예약표를 둔다.",
    ],
    promptSeeds: [
      "새벽마다 엘리베이터가 없는 13층에서 배달 완료 알림이 오고, 마지막 주문 메모에는 기사 이름이 아니라 다음 입주자의 사망 시간이 적혀 있다.",
      "막차가 끊긴 역에서 분실물 보관함 번호가 한 칸씩 늘어나고, 열쇠고리마다 아직 살아 있는 승객의 오늘 사진이 매달려 있다.",
    ],
    avoidPremises: [
      "첫 장면부터 큰 귀신 얼굴이 튀어나오는 구조",
      "피 묻은 인형이나 폐가 같은 서양식 클리셰",
      "무서운 일이 있었다고 설명만 하는 독백",
    ],
  },
} as const satisfies Record<CreatorGenre, GenrePremiseReference>;

export const TONE_REFERENCE = {
  설렘: {
    speech: "8단어 이내, ~지/~네/~잖아/~? 어미, 존댓말에서 반말로 아주 조금 내려오는 호흡",
    caption: "명사 + 쉼표 + 짧은 결론",
    visual: "동공 확대, 1/4 미소, 손끝 디테일, 한 뼘 거리, 파스텔 핑크/피치, 역광",
    pacing: "슬로 번, 중후반 작은 한 방, 마지막은 여운",
    avoid: "키스/포옹/울음/외침으로 과하게 결론내기, 코믹 SFX",
  },
  달달함: {
    speech: "6~10단어, ~야/~지/~다고/~ㄴ다니까, 대부분 반말과 애칭",
    caption: "시간/장소 명사 캡션",
    visual: "3/4 미소, 손깍지나 어깨 닿음, 크림/허니/골드 실내광",
    pacing: "갈등 거의 없이 평탄하게, 끝에 짧은 응답형 한 줄",
    avoid: "드라마 자막체, 키스 클라이맥스, 사랑을 해설하는 내레이션",
  },
  병맛: {
    speech: "한 글자와 긴 호흡을 섞고, ~?/~다고?/~ㄴ데? 의문형을 우세하게",
    caption: "메타 또는 시간 점프 캡션",
    visual: "무표정과 과장표정 점프컷, 일부러 어색한 비율, 단색/원색",
    pacing: "셋업 후 갑작스러운 톤 붕괴, 마지막에 이상한 결론",
    avoid: "리얼리스틱 셰이딩, 로맨틱 분위기, 농담 해설",
  },
  사이다: {
    speech: "5~9단어, ~다/~지마/~법이야/~군 단정형, 상대보다 낮춰 응수",
    caption: "사후 보고체",
    visual: "무표정에서 한쪽 입꼬리, 정면 어깨, 차가운 화이트/블루그레이와 빨강 한 점",
    pacing: "빌드업 뒤 침묵 1컷, 응수 1컷, 상대 무너짐 1컷",
    avoid: "외침, 눈물, 주먹 액션, 통쾌함 자기 해설",
  },
  긴장감: {
    speech: "12→6→2→침묵으로 줄이고, 종결을 회피하는 속삭임",
    caption: "거리/시간 캡션",
    visual: "눈동자만 움직임, 손이 벽/문에 닿음, 좁은 투시, 60% 이상 그림자",
    pacing: "점진 감속 후 마지막 1초, 사건 직전 클리프행어",
    avoid: "밝은 햇빛, 미소, 풀 채도, 코믹 SFX",
  },
  피폐함: {
    speech: "3~9어절로 짧고 끊기며, 존대와 흐린 반말이 압박감을 만든다",
    caption: "시간 표지 + 감정명사",
    visual: "하이라이트 없는 눈, 안쪽으로 말린 어깨, 채도 낮은 청회색과 빨강 한 점",
    pacing: "천천히 균열을 보이고 후반에 자해적 결단 또는 이별",
    avoid: "밝은 채도, 액션선, SD 챠비, 쾌활한 단체샷",
  },
  감성: {
    speech: "6~12어절 부드러운 평문, ~었다/~더라/~같아/~네",
    caption: "명사 종결과 줄바꿈",
    visual: "시선 떨굼, 손끝 소품, 풍경 속 작은 인물, 골든아워/아침안개",
    pacing: "풍경 컷 직후 한 줄 캡션이 정점, 마지막은 시간 점프",
    avoid: "행복 직설, 운명/영원 같은 큰 단어, 외침과 고채도 빨강",
  },
  막장: {
    speech: "4~10어절 단문, ~다고?!/~ㄹ 셈이냐/~말도 안 돼, 위계별 하대/극존대",
    caption: "시간/장소 캡션만",
    visual: "와인잔/손목/옷깃, 눈물과 분노, 고채도 와인색/골드, 대치 클로즈업",
    pacing: "매 페이지 폭로나 반전 1개, 마지막 컷 클리프행어",
    avoid: "파스텔, 풍경 인서트, 명상 모놀로그, 챠비 개그",
  },
  기묘함: {
    speech: "5~11어절을 어색한 곳에서 끊고, 평범한 반말 사이 어색한 존대",
    caption: "정확한 시간/장소 캡션",
    visual: "무표정, 사라진 하이라이트, 좌우 대칭 복도, 한 디테일만 어긋남",
    pacing: "평범→어긋남→봉합→마지막 디테일 결정타",
    avoid: "점프스케어, 고어, 과장 호러, 큰 빨강",
  },
  열혈: {
    speech: "1~7어절, ~다!/~겠어!/~가자!, 외침은 짧게",
    caption: "결의 캡션과 느낌표",
    visual: "이를 악문 표정, 주먹, 로앵글/광각, 노랑/주황 임팩트와 푸른/금색 각성",
    pacing: "위기→각성→더 강한 위기→더 큰 각성",
    avoid: "파스텔, 조용한 표정, 호러 그림자, 결정타 컷의 챠비 개그",
  },
} as const satisfies Record<
  CreatorTone,
  {
    speech: string;
    caption: string;
    visual: string;
    pacing: string;
    avoid: string;
  }
>;

function pickReferenceItem(items: readonly string[], variantIndex: number) {
  return items[Math.abs(variantIndex) % items.length] ?? items[0] ?? "";
}

const CREATOR_PROMPT_TITLE_FALLBACKS = {
  로맨스: ["예약된 신랑님", "퇴근 엘리베이터 로그"],
  로판: ["장례식 초대장을 보냈습니다", "혼인계약서 17조"],
  판타지: ["지도 밖의 이름", "몬스터 항의문 번역가"],
  현판: ["퇴사 사유가 도착했습니다", "전광판은 아직 모른다"],
  헌터: ["분실물 보관증 S급", "던전 5층 무인편의점"],
  액션: ["배달 완료 전까지", "첫 콜은 옛 부하였다"],
  학원: ["축제 무대 3번 큐", "옥상 도시락 작전"],
  코미디: ["급식 예언 방송반", "김부장의 센터 포지션"],
  스릴러: ["00:17 삭제 기록", "옆방 민원 작성자"],
  공포: ["13층 배달 완료", "막차역 보관함"],
} as const satisfies Record<CreatorGenre, readonly string[]>;

export const CREATOR_TITLE_PRESETS = {
  학원: [
    "그 새끼가 내 짝꿍이 됐다",
    "내 짝꿍은 우리학교 짱이다",
    "옆자리 그놈이 자꾸 시비건다",
    "뒷자리에 앉은 일진이 수상하다",
    "짝꿍이 자꾸 내 손을 잡는다",
    "우리반 일진이 나만 괴롭힌다",
    "짝꿍 바꿔주세요, 진짜로요",
    "내 짝꿍, 알고 보니 재벌집 막내",
    "그 자식이 내 옆자리로 왔다",
    "짝꿍이 어제부터 이상해졌다",
    "4반 짱이 나를 좋아한대",
    "우리학교 짱이 내 첫사랑이다",
    "1학년 짱한테 고백받았다",
    "일진 무리에 잘못 끼었다",
    "짱이 자꾸 나만 쳐다본다",
    "전교 짱의 여자가 됐다",
    "일진 오빠가 우리집 옆에 산다",
    "옆반 짱이 우리반에 자꾸 온다",
    "짱 먹은 그 새끼가 내 사촌이다",
    "일진이 갑자기 다정해졌다",
    "전학 첫날, 짱한테 찍혔다",
    "전학생이 자꾸 내 이름을 부른다",
    "그 전학생, 알고 보니 내 첫사랑",
    "전학 온 그놈이 너무 잘생겼다",
    "전학생한테 고백받는 중입니다",
    "전학 가지 마, 제발",
    "그 전학생이 우리집에 산다",
    "전학생이 자꾸 따라온다",
    "전학 온 첫날 키스당했다",
    "전학생, 너 누구야",
    "학생회장이 자꾸 나만 부른다",
    "우리 학생회장님이 변했다",
    "부회장님은 내 전 남친",
    "학생회장의 비밀을 알아버렸다",
    "모범생인 줄 알았는데",
    "전교 1등이 나를 좋아한다고?",
    "학생회장님, 그러시면 안 돼요",
    "도서부 그 애가 수상하다",
    "학생회장이 내 짝사랑이다",
    "모범생 가면 쓴 그놈",
    "짝사랑이 옆자리에 앉았다",
    "그 애한테 고백할 거야",
    "내 짝사랑이 나를 좋아한대",
    "짝사랑 들킨 날",
    "너만 모르는 내 마음",
    "6년째 짝사랑 중입니다",
    "고백하면 안 되는 사람",
    "첫사랑이 우리학교로 전학왔다",
    "짝사랑 그놈이 자꾸 웃어준다",
    "들키면 안 되는 짝사랑",
    "소꿉친구가 갑자기 멋있어졌다",
    "우리집 옆방, 소꿉친구",
    "소꿉친구가 내 남친인 척",
    "7년 만에 돌아온 소꿉친구",
    "소꿉친구랑 계약 연애 중",
    "소꿉친구가 자꾸 선 넘는다",
    "계약 연애, 진심이 됐다",
    "가짜 여친이 진짜가 됐다",
    "소꿉친구가 내 옆반 짱이다",
    "우리, 친구로 지내자며",
    "차가운 그 애가 나한테만 웃는다",
    "까칠한 그놈 길들이기",
    "차도남 옆자리에 앉았다",
    "까칠한 선배가 자꾸 챙겨준다",
    "그 애는 나한테만 차갑다",
    "까칠한 그놈이 변했다",
    "차도남이 내 동아리 선배다",
    "까칠남이 자꾸 집까지 데려다준다",
    "그 애의 진짜 모습",
    "차가운 척하는 그놈",
    "우리 선배가 자꾸 따라온다",
    "동아리 선배한테 고백받았다",
    "농구부 선배가 내 첫사랑",
    "후배가 자꾸 선 넘는다",
    "그 선배는 내 거예요",
    "1학년 후배가 자꾸 들이댄다",
    "선배, 그러시면 반칙이에요",
    "무서운 선배의 비밀",
    "우리 선배는 우리학교 짱",
    "후배한테 졌다",
    "옥상에서 마주친 그 애",
    "비 오는 날, 우산 속 두 사람",
    "야자 끝나고 만나",
    "체육시간, 그 애와 부딪혔다",
    "수학여행에서 생긴 일",
    "축제 때 키스했다",
    "점심시간에 옥상으로 와",
    "도서관에서 마주친 그놈",
    "등굣길에 만난 그 애",
    "수업시간에 쪽지가 왔다",
    "그놈이 내 약혼자라고?",
    "우리 오빠 친구가 내 짝꿍",
    "첫키스 상대가 우리반 짱",
    "알고 보니 우리 옆집",
    "그 새끼가 내 과외 선생이다",
    "어제 만난 그놈이 우리 담임",
    "운명이라기엔 너무 가까워",
    "내 남친이 우리학교 일진이었다",
    "그날의 그놈이 내 짝꿍이 됐다",
    "너랑 나, 다시 만났네",
  ],
} as const satisfies Partial<Record<CreatorGenre, readonly string[]>>;

export function creatorTitlePresetsForGenre(genre: CreatorGenre) {
  const presets = CREATOR_TITLE_PRESETS as Partial<
    Record<CreatorGenre, readonly string[]>
  >;

  return presets[genre] ?? CREATOR_PROMPT_TITLE_FALLBACKS[genre];
}

export function pickCreatorTitlePreset(
  genre: CreatorGenre,
  variantIndex = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
) {
  return pickReferenceItem(creatorTitlePresetsForGenre(genre), variantIndex);
}

export function buildCreatorPromptReference(input: {
  genre: CreatorGenre;
  tones: CreatorTone[];
}) {
  const genreReference = GENRE_REFERENCE[input.genre];
  const premiseReference: GenrePremiseReference = GENRE_PREMISE_REFERENCE[input.genre];
  const hookAxes = premiseReference.hookAxes
    ?.map((axis) => `- ${axis.axis}: ${axis.options.join(", ")}`)
    .join("\n");
  const avoidOverusedHooks = premiseReference.avoidOverusedHooks?.join(", ");
  const toneBrief = input.tones
    .map((tone) => {
      const reference = TONE_REFERENCE[tone];

      return [
        `- ${tone}`,
        `speech: ${reference.speech}`,
        `pacing: ${reference.pacing}`,
        `avoid: ${reference.avoid}`,
      ].join("; ");
    })
    .join("\n");

  return [
    "Use these research notes as abstract genre grammar only.",
    "Do not copy, mention, or closely imitate any reference title, character, or setting.",
    `Genre title pattern: ${genreReference.titlePattern}`,
    `Genre premise anchors:\n- ${premiseReference.researchAnchors.join("\n- ")}`,
    `Freshness moves:\n- ${premiseReference.premiseMoves.join("\n- ")}`,
    hookAxes
      ? [
          "Hook axes:",
          hookAxes,
          "Combine at least two different axes instead of copying a seed premise.",
        ].join("\n")
      : "",
    avoidOverusedHooks
      ? `Avoid overused hooks for this genre unless the selected tone explicitly needs mystery/thriller: ${avoidOverusedHooks}`
      : "",
    `Avoid premise cliches:\n- ${premiseReference.avoidPremises.join("\n- ")}`,
    `Visual/thumbnail grammar to imply in the premise: ${genreReference.thumbnailRule}`,
    `Tone grammar:\n${toneBrief}`,
  ].filter(Boolean).join("\n\n");
}

export function createCreatorPromptFallback(
  input: {
    genre: CreatorGenre;
    tones: CreatorTone[];
    pageImages?: 1 | 3 | 4 | 5;
    canvasMode?: CreatorCanvasMode;
    title?: string;
    idea?: string;
  },
  variantIndex = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
) {
  const seedIndex = variantIndex + input.tones.join("").length;
  const seed = pickReferenceItem(
    GENRE_PREMISE_REFERENCE[input.genre].promptSeeds,
    seedIndex,
  );
  const sourceIdea = input.idea?.replace(/\s+/g, " ").trim();
  const pageImages = input.pageImages ?? 4;
  const basePrompt = sourceIdea
    ? `${sourceIdea} 이 이야기를 한국 웹툰/웹소설식 에피소드처럼 첫 사건, 공개 반응, 관계 변화, 마지막 여운이 보이도록 더 선명하게 다듬는다.`
    : seed;
  const prompt =
    input.canvasMode === "scroll"
      ? [
          basePrompt,
          `${pageImages}장의 세로 원고로, 첫 장은 관계와 장소를 열고, 중간 장들은 행동과 오해를 한 단계씩 키우며, 마지막 장은 감정이 들키는 순간과 다음 장면으로 이어질 여운을 남긴다.`,
        ].join(" ")
      : basePrompt;
  const title =
    input.genre === "학원" && /방송|라디오|녹음|USB|온에어/.test(prompt)
      ? "축제 라디오에 들킨 목소리"
      : pickReferenceItem(CREATOR_PROMPT_TITLE_FALLBACKS[input.genre], seedIndex);

  return {
    title,
    prompt,
  };
}
