import { createClient } from "@supabase/supabase-js";

import type { CutResult, PhotoAsset, SavedToon } from "@/lib/phototoon";
import { requireEnv } from "@/lib/server/env";

const bucketName = "phototoon-toons";

type DatabaseToon = {
  id: string;
  theme: string;
  episode: string;
  episode_title: string;
  category: string | null;
  cover_url: string;
  title_lockup_url: string | null;
  created_at: string;
};

type DatabaseCut = {
  toon_id: string;
  idx: number;
  image_url: string;
  source_photo_id: string | null;
};

type DatabasePhoto = {
  id: string;
  toon_id: string;
  photo_url: string;
  original_name: string | null;
  order_index: number;
};

export function supabaseAdmin() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function dataUrlToUpload(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  const mime = match[1] || "image/png";
  const extension = mime.includes("jpeg") || mime.includes("jpg")
    ? "jpg"
    : mime.includes("webp")
      ? "webp"
      : "png";

  return {
    mime,
    extension,
    buffer: Buffer.from(match[2] || "", "base64"),
  };
}

async function uploadMaybeDataUrl(pathPrefix: string, value: string) {
  const upload = dataUrlToUpload(value);

  if (!upload) {
    return value;
  }

  const client = supabaseAdmin();
  const objectPath = `${pathPrefix}.${upload.extension}`;
  const { error } = await client.storage
    .from(bucketName)
    .upload(objectPath, upload.buffer, {
      contentType: upload.mime,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return client.storage.from(bucketName).getPublicUrl(objectPath).data.publicUrl;
}

export async function saveToon(input: {
  author_device_id: string;
  theme: string;
  episode: string;
  episode_title: string;
  category: string | null;
  cover_url: string;
  title_lockup_url: string | null;
  cuts: CutResult[];
  photos: Pick<PhotoAsset, "id" | "name" | "dataUrl" | "order">[];
}) {
  const client = supabaseAdmin();
  const toonId = crypto.randomUUID();
  const basePath = `${input.author_device_id}/${toonId}`;
  const coverUrl = await uploadMaybeDataUrl(`${basePath}/cover`, input.cover_url);
  const titleLockupUrl = input.title_lockup_url
    ? await uploadMaybeDataUrl(`${basePath}/title-lockup`, input.title_lockup_url)
    : null;

  const { data: toon, error: toonError } = await client
    .from("phototoon_toons")
    .insert({
      id: toonId,
      author_device_id: input.author_device_id,
      theme: input.theme,
      episode: input.episode,
      episode_title: input.episode_title,
      category: input.category,
      cover_url: coverUrl,
      title_lockup_url: titleLockupUrl,
    })
    .select("id, theme, episode, episode_title, category, cover_url, title_lockup_url, created_at")
    .single<DatabaseToon>();

  if (toonError) {
    throw toonError;
  }

  const cuts = await Promise.all(
    input.cuts.map(async (cut) => ({
      toon_id: toon.id,
      idx: cut.index,
      image_url: await uploadMaybeDataUrl(`${basePath}/cuts/${String(cut.index).padStart(2, "0")}`, cut.image_url),
      source_photo_id: cut.source_photo_id,
    })),
  );

  if (cuts.length > 0) {
    const { error } = await client.from("phototoon_cuts").insert(cuts);

    if (error) {
      throw error;
    }
  }

  const photos = await Promise.all(
    input.photos.map(async (photo) => ({
      toon_id: toon.id,
      photo_url: await uploadMaybeDataUrl(`${basePath}/photos/${String(photo.order).padStart(2, "0")}`, photo.dataUrl),
      original_name: photo.name,
      order_index: photo.order,
    })),
  );

  if (photos.length > 0) {
    const { error } = await client.from("phototoon_photos").insert(photos);

    if (error) {
      throw error;
    }
  }

  return {
    ...toon,
    cuts: cuts.map((cut) => ({
      index: cut.idx,
      image_url: cut.image_url,
      source_photo_id: cut.source_photo_id ?? "",
    })),
    photos: photos.map((photo) => ({
      id: `${toon.id}-${photo.order_index}`,
      name: photo.original_name ?? "photo",
      dataUrl: photo.photo_url,
      order: photo.order_index,
    })),
  } satisfies SavedToon;
}

export async function listToons(authorDeviceId: string): Promise<SavedToon[]> {
  const client = supabaseAdmin();
  const { data: toons, error: toonError } = await client
    .from("phototoon_toons")
    .select("id, theme, episode, episode_title, category, cover_url, title_lockup_url, created_at")
    .eq("author_device_id", authorDeviceId)
    .order("created_at", { ascending: false })
    .returns<DatabaseToon[]>();

  if (toonError) {
    throw toonError;
  }

  const toonIds = (toons ?? []).map((toon) => toon.id);

  if (toonIds.length === 0) {
    return [];
  }

  const [{ data: cuts, error: cutError }, { data: photos, error: photoError }] = await Promise.all([
    client
      .from("phototoon_cuts")
      .select("toon_id, idx, image_url, source_photo_id")
      .in("toon_id", toonIds)
      .order("idx", { ascending: true })
      .returns<DatabaseCut[]>(),
    client
      .from("phototoon_photos")
      .select("id, toon_id, photo_url, original_name, order_index")
      .in("toon_id", toonIds)
      .order("order_index", { ascending: true })
      .returns<DatabasePhoto[]>(),
  ]);

  if (cutError) {
    throw cutError;
  }

  if (photoError) {
    throw photoError;
  }

  return (toons ?? []).map((toon) => ({
    ...toon,
    cuts: (cuts ?? [])
      .filter((cut) => cut.toon_id === toon.id)
      .map((cut) => ({
        index: cut.idx,
        image_url: cut.image_url,
        source_photo_id: cut.source_photo_id ?? "",
      })),
    photos: (photos ?? [])
      .filter((photo) => photo.toon_id === toon.id)
      .map((photo) => ({
        id: photo.id,
        name: photo.original_name ?? "photo",
        dataUrl: photo.photo_url,
        order: photo.order_index,
      })),
  }));
}

export async function updateToonCategory(input: {
  toon_id: string;
  author_device_id: string;
  category: string | null;
}) {
  const { data, error } = await supabaseAdmin()
    .from("phototoon_toons")
    .update({ category: input.category })
    .eq("id", input.toon_id)
    .eq("author_device_id", input.author_device_id)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

