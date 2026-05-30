import { generateStoryWithOpenAI } from "@/lib/server/openai";
import type { PhotoAsset } from "@/lib/phototoon";

export const runtime = "nodejs";
export const maxDuration = 60;

type StoryRequest = {
  theme?: string;
  episode?: string;
  toonTitle?: string;
  photos?: PhotoAsset[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StoryRequest;
    const story = await generateStoryWithOpenAI({
      theme: body.theme ?? "",
      episode: body.episode ?? "",
      toonTitle: body.toonTitle ?? "",
      photos: Array.isArray(body.photos) ? body.photos : [],
    });

    return Response.json({ story });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "story generation failed" },
      { status: 500 },
    );
  }
}
