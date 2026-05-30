export interface Palette {
  from: string;
  via: string;
  to: string;
  glow: string;
  ink: string;
}

export type ShortsToonCutMediaType = "image" | "video";

export interface ShortsToonCut {
  id: string;
  title: string;
  caption: string;
  situation: string;
  emotion: string;
  prompt: string;
  continuityNotes: string[];
  mediaType?: ShortsToonCutMediaType;
  imagePath?: string | null;
  videoPath?: string | null;
  palette: Palette;
}

export interface ShortsToon {
  id: string;
  slug: string;
  title: string;
  hook: string;
  summary: string;
  tags: string[];
  canvasMode?: CreatorCanvasMode;
  readingMinutes: number;
  sceneCount: number;
  creator: string;
  episodeLabel: string;
  likes: number;
  viewsLabel: string;
  publishedDate: string;
  commentCount: number;
  coverImagePath?: string | null;
  coverVideoPath?: string | null;
  coverTitleOverlayPath?: string | null;
  palette: Palette;
  cuts: ShortsToonCut[];
}

export type SupportedLocale = "ko" | "ja" | "en";

export interface ToonComment {
  id: string;
  shortsToonId: string;
  authorName: string;
  body: string;
  locale: SupportedLocale;
  createdAt: string;
  displayLocale?: SupportedLocale;
  originalBody?: string;
  isTranslated?: boolean;
  translationModel?: string | null;
}

export interface StoryCharacter {
  name: string;
  role: string;
  appearance: string;
  invariants: string[];
}

export interface StoryScene {
  sceneIndex: number;
  situation: string;
  emotion: string;
  camera: string;
  continuityNotes: string[];
  imagePrompt: string;
  caption: string;
}

export interface StoryPackage {
  title: string;
  hook: string;
  summary: string;
  thumbnailPrompt: string;
  characters: StoryCharacter[];
  sceneCount: number;
  scenes: StoryScene[];
}

export interface VisualAnchorJob {
  id: string;
  role: "character_reference" | "style_frame";
  prompt: string;
}

export interface ThumbnailJob {
  model: string;
  prompt: string;
  size: "1024x1536";
  quality: "medium" | "high";
  references: string[];
}

export interface SceneImageJob {
  jobId: string;
  sceneIndex: number;
  strategy: "generate" | "edit";
  model: string;
  prompt: string;
  references: string[];
  inputFidelity: "high" | "low" | null;
  size: "1024x1536";
  quality: "medium" | "high";
}

export interface ImageJobPlan {
  visualAnchors: VisualAnchorJob[];
  thumbnail: ThumbnailJob;
  scenes: SceneImageJob[];
}

export type CreatorGenre =
  | "로맨스"
  | "로판"
  | "판타지"
  | "현판"
  | "헌터"
  | "액션"
  | "학원"
  | "코미디"
  | "스릴러"
  | "공포";

export type CreatorTone =
  | "설렘"
  | "달달함"
  | "병맛"
  | "사이다"
  | "긴장감"
  | "피폐함"
  | "감성"
  | "막장"
  | "기묘함"
  | "열혈";

export type ImageVolumeTier = "demo" | "compact" | "recommended" | "rich";
export type PageImageCount = 1 | 3 | 4 | 5;

export type CreatorCanvasMode = "square" | "scroll";

export type CharacterRole =
  | "주인공"
  | "상대역"
  | "조력자"
  | "방해자"
  | "라이벌";

export interface CharacterDraft {
  id: string;
  name: string;
  age: string;
  role: CharacterRole;
  personality: string;
  storyFunction: string;
  visualHint: string;
}

export type PageImagePurpose =
  | "도입"
  | "전개"
  | "반전"
  | "클라이맥스"
  | "마무리";

export interface StoryVolumeRecommendation {
  tier: ImageVolumeTier;
  pageImages: PageImageCount;
  reason: string;
}

export interface PageImageBrief {
  imageIndex: number;
  purpose: PageImagePurpose;
  sceneContent: string;
  emotionalBeat: string;
  entryTransition: string;
  exitTransition: string;
  mustShow: string[];
}

export interface ThumbnailBrief {
  concept: string;
  composition: string;
  cropPlan: "9:16 text-free cover -> 1:1 crop -> title overlay";
  titleTreatment: string;
}

export interface StyleGuide {
  visualStyle: string;
  colorMood: string;
  lineAndRendering: string;
  textPolicy: string;
}

export interface CreatorGenerationPolicy {
  originalLanguage: "ko";
  translatedLocales: ["en", "ja"];
  bodyImageSequence: "sequential";
  allowsInImageText: true;
  allowsSfx: true;
  autoRetryCount: 1;
  afterFailure: "show_regenerate_button";
}

export interface ToonDraftInput {
  genre: CreatorGenre;
  tones: CreatorTone[];
  idea: string;
  title?: string;
  pageImages?: PageImageCount;
  canvasMode?: CreatorCanvasMode;
}

export interface ToonDraft {
  title: string;
  hook: string;
  genre: CreatorGenre;
  tones: CreatorTone[];
  ideaDigest: string;
  volumeRecommendation: StoryVolumeRecommendation;
  characters: CharacterDraft[];
  pageBriefs: PageImageBrief[];
  thumbnailBrief: ThumbnailBrief;
  styleGuide: StyleGuide;
  generationPolicy: CreatorGenerationPolicy;
}
