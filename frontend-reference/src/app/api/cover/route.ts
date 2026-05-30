import { generateCoverWithOpenAI } from "@/lib/server/openai";

export const runtime = "nodejs";
export const maxDuration = 300;

type CoverRequest = {
  episode_title?: string;
  genre?: string;
  tones?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CoverRequest;
    const cover = await generateCoverWithOpenAI({
      episode_title: body.episode_title?.trim() || "부산의 하루",
      genre: body.genre?.trim() || "일상 성장",
      tones: Array.isArray(body.tones) && body.tones.length > 0 ? body.tones : ["현장감"],
    });

    return Response.json({ cover });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "cover generation failed" },
      { status: 500 },
    );
  }
}

