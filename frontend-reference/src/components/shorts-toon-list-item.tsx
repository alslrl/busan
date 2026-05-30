import Link from "next/link";

import type { ShortsToon } from "@/lib/types";

function buildThumbnailBackground(item: ShortsToon) {
  return {
    background: `linear-gradient(160deg, ${item.palette.from} 0%, ${item.palette.via} 48%, ${item.palette.to} 100%)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.52)`,
  };
}

export function ShortsToonListItem({
  item,
  href,
  index,
  showRanking = false,
  trailing,
}: {
  item: ShortsToon;
  href: string;
  index?: number;
  showRanking?: boolean;
  trailing?: React.ReactNode;
}) {
  const body = (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-[10px] border border-slate-200"
        style={buildThumbnailBackground(item)}
      >
        {showRanking && typeof index === "number" ? (
          <div className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-md bg-accent px-1 text-[13px] font-black text-slate-950">
            {index + 1}
          </div>
        ) : null}
      </div>

      <div className="min-w-0 py-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span>Shorts Toon</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{item.sceneCount} cuts</span>
        </div>
        <h3 className="mt-1 text-[18px] font-bold leading-[1.25] text-slate-950">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-slate-500">
          {item.summary}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-500">
          <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
            {item.tags[0] ?? "PhotoToon"}
          </span>
          <span>{item.readingMinutes}분 내외</span>
        </div>
      </div>
    </div>
  );

  return (
    <article className="border-b border-line py-4">
      {trailing ? (
        <div className="space-y-3">
          <Link href={href}>{body}</Link>
          {trailing}
        </div>
      ) : (
        <Link href={href}>{body}</Link>
      )}
    </article>
  );
}
