import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const appRoot = path.resolve(__dirname, "../..");
const workspaceRoot = path.resolve(appRoot, "..");
const verificationDir = path.resolve(workspaceRoot, "verification/screenshots");
const mockDir = path.resolve(workspaceRoot, "mock");
const fixtureFiles = [
  "KakaoTalk_Photo_2026-05-30-14-07-18 001.jpeg",
  "KakaoTalk_Photo_2026-05-30-14-07-18 002.jpeg",
  "KakaoTalk_Photo_2026-05-30-14-07-19 003.jpeg",
].map((fileName) => path.join(mockDir, fileName));

test.describe("PhotoToon full flow", () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(verificationDir, { recursive: true });
    page.on("console", (message) => {
      if (message.type() === "error") {
        throw new Error(`console error: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => {
      throw error;
    });
    await page.goto("/");
  });

  test("@full @M11 uploads photos, generates a toon, shares it, and persists library", async ({ page }) => {
    await expect(page.getByText("PhotoToon")).toBeVisible();
    await expect(page.getByTestId("upload-panel")).toBeVisible();
    await page.screenshot({ path: path.join(verificationDir, "01-home.png"), fullPage: true });

    await page.getByTestId("photo-input").setInputFiles(fixtureFiles);
    await expect(page.getByLabel("1번째 사진")).toBeVisible();
    await page.screenshot({ path: path.join(verificationDir, "02-upload.png"), fullPage: true });

    await page.getByTestId("theme-input").fill("부산 해커톤 데모");
    await page.getByTestId("toon-title-input").fill("처음 만난 팀의 부산 데모");
    await page.getByTestId("episode-input").fill("처음 만난 팀이 사진을 고르고, 빠르게 웹툰 데모를 완성했다.");
    await page.getByTestId("scene-note-1").fill("부산역에서 시작한 첫 만남");
    await page.getByTestId("scene-note-2").fill("팀원들과 아이디어를 좁히는 장면");
    await page.getByTestId("scene-person-2").check();
    await page.getByTestId("scene-drag-1").dragTo(page.getByTestId("scene-drag-2"));
    await expect(page.getByTestId("scene-note-2")).toHaveValue("부산역에서 시작한 첫 만남");
    await expect(page.getByTestId("scene-panel")).toContainText("장면별 의미");
    await page.screenshot({ path: path.join(verificationDir, "03-input.png"), fullPage: true });

    await page.getByLabel("2번 얼굴 선택").click();
    await expect(page.getByTestId("selected-face")).toBeVisible();
    await page.screenshot({ path: path.join(verificationDir, "04-face-select.png"), fullPage: true });

    await page.getByTestId("generate-button").click();
    await expect(page.getByTestId("generation-panel")).toContainText(/진행|완료/);
    await page.screenshot({ path: path.join(verificationDir, "05-generating.png"), fullPage: true });

    await expect(page.getByTestId("episode-title")).toBeVisible({ timeout: 320_000 });
    await expect(page.getByTestId("episode-title")).toHaveText("처음 만난 팀의 부산 데모");
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="generated-cut"]').length >= 4,
      null,
      { timeout: 320_000 },
    );
    await expect(page.getByTestId("story-panel")).toContainText("“");
    await page.screenshot({ path: path.join(verificationDir, "06-cuts.png"), fullPage: true });

    await expect(page.getByTestId("cover-frame")).toBeVisible({ timeout: 320_000 });
    await expect(page.getByTestId("cover-panel")).toContainText("표지+제목");
    await page.screenshot({ path: path.join(verificationDir, "07-cover.png"), fullPage: true });

    await expect(page.getByTestId("webtoon-strip")).toBeVisible();
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="webtoon-strip"] [data-testid="generated-cut"]').length >= 4,
      null,
      { timeout: 20_000 },
    );
    await page.screenshot({ path: path.join(verificationDir, "08-webtoon.png"), fullPage: true });

    await page.getByTestId("share-nav-button").click();
    await expect(page.getByTestId("share-panel")).toBeVisible();
    await page.getByTestId("share-button").click();
    await expect(page.getByTestId("share-card")).toContainText("나도 만들기");
    await page.screenshot({ path: path.join(verificationDir, "09-share.png"), fullPage: true });

    await page.getByTestId("library-nav-button").click();
    await expect(page.getByTestId("library-panel")).toBeVisible();
    await page.getByTestId("category-select").selectOption("해커톤");
    await page.getByTestId("save-button").click();
    await expect(page.getByTestId("saved-toon")).toContainText("원본 사진", { timeout: 60_000 });
    await page.reload();
    await expect(page.getByTestId("saved-toon")).toContainText("해커톤", { timeout: 60_000 });
    await expect(page.getByTestId("saved-toon")).toContainText("원본 사진");
    await page.screenshot({ path: path.join(verificationDir, "10-mypage.png"), fullPage: true });
  });
});
