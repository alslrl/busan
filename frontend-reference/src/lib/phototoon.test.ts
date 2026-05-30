import { describe, expect, it } from "vitest";

import {
  createDemoStory,
  movePhotoToIndex,
  reorderPhotos,
  validateToonInput,
  type PhotoAsset,
} from "./phototoon";

function photo(id: string, order: number): PhotoAsset {
  return {
    id,
    name: `${id}.jpg`,
    dataUrl: "data:image/jpeg;base64,AA==",
    order,
    sceneNote: "",
    hasPerson: false,
  };
}

describe("phototoon flow helpers", () => {
  it("moves uploaded photos and normalizes order", () => {
    const result = reorderPhotos([photo("a", 1), photo("b", 2), photo("c", 3)], "c", -1);

    expect(result.map((item) => item.id)).toEqual(["a", "c", "b"]);
    expect(result.map((item) => item.order)).toEqual([1, 2, 3]);
  });

  it("moves uploaded photos to a dropped index and normalizes order", () => {
    const result = movePhotoToIndex([photo("a", 1), photo("b", 2), photo("c", 3)], "a", 2);

    expect(result.map((item) => item.id)).toEqual(["b", "c", "a"]);
    expect(result.map((item) => item.order)).toEqual([1, 2, 3]);
  });

  it("requires theme, episode, and at least two photos", () => {
    expect(validateToonInput("", "", [photo("a", 1)])).toEqual([
      "주제를 입력해 주세요.",
      "전체 에피소드를 입력해 주세요.",
      "사진은 최소 2장 이상 필요합니다.",
    ]);
  });

  it("creates a title and four to six story beats with generated dialogue", () => {
    const story = createDemoStory("부산 해커톤", "처음 만난 팀이 데모를 끝냈다.", [
      photo("a", 1),
      photo("b", 2),
    ]);

    expect(story.episode_title).toContain("부산 해커톤");
    expect(story.beats.length).toBeGreaterThanOrEqual(4);
    expect(story.beats.length).toBeLessThanOrEqual(6);
    expect(story.beats.every((beat) => beat.bubble_text.length > 0)).toBe(true);
  });

  it("uses the manually entered webtoon title when present", () => {
    const story = createDemoStory("부산 해커톤", "처음 만난 팀이 데모를 끝냈다.", [
      photo("a", 1),
      photo("b", 2),
    ], "처음 만난 팀의 부산 데모");

    expect(story.episode_title).toBe("처음 만난 팀의 부산 데모");
  });
});
