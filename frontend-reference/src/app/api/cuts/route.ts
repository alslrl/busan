import { generateCutsWithOpenAI } from "@/lib/server/openai";
import type { StoryBeat } from "@/lib/phototoon";

export const runtime = "nodejs";
export const maxDuration = 300;

type CutsRequest = {
  theme?: string;
  beats?: StoryBeat[];
  faceDataUrl?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CutsRequest;

    if (!body.faceDataUrl) {
      return Response.json({ error: "faceDataUrl is required" }, { status: 400 });
    }

    const cuts = await generateCutsWithOpenAI({
      theme: body.theme ?? "PhotoToon",
      beats: Array.isArray(body.beats) ? body.beats : [],
      faceDataUrl: body.faceDataUrl,
    });

    return Response.json({ cuts });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "cut generation failed" },
      { status: 500 },
    );
  }
}

