import { listToons, saveToon, updateToonCategory } from "@/lib/server/supabase";
import type { CutResult, PhotoAsset } from "@/lib/phototoon";

export const runtime = "nodejs";
export const maxDuration = 60;

type SaveRequest = {
  author_device_id?: string;
  theme?: string;
  episode?: string;
  episode_title?: string;
  category?: string | null;
  cover_url?: string;
  title_lockup_url?: string | null;
  cuts?: CutResult[];
  photos?: Pick<PhotoAsset, "id" | "name" | "dataUrl" | "order">[];
};

type PatchRequest = {
  author_device_id?: string;
  toon_id?: string;
  category?: string | null;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const device = url.searchParams.get("device");

    if (!device) {
      return Response.json({ error: "device is required" }, { status: 400 });
    }

    return Response.json({ toons: await listToons(device) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "toon listing failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveRequest;

    if (!body.author_device_id || !body.theme || !body.episode_title || !body.cover_url) {
      return Response.json({ error: "missing required toon fields" }, { status: 400 });
    }

    const toon = await saveToon({
      author_device_id: body.author_device_id,
      theme: body.theme,
      episode: body.episode ?? "",
      episode_title: body.episode_title,
      category: body.category ?? null,
      cover_url: body.cover_url,
      title_lockup_url: body.title_lockup_url ?? null,
      cuts: Array.isArray(body.cuts) ? body.cuts : [],
      photos: Array.isArray(body.photos) ? body.photos : [],
    });

    return Response.json({ toon });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "toon save failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as PatchRequest;

    if (!body.author_device_id || !body.toon_id) {
      return Response.json({ error: "author_device_id and toon_id are required" }, { status: 400 });
    }

    await updateToonCategory({
      author_device_id: body.author_device_id,
      toon_id: body.toon_id,
      category: body.category ?? null,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "toon update failed" },
      { status: 500 },
    );
  }
}

