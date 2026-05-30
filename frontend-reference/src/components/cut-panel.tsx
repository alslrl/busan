import type { ShortsToonCut } from "@/lib/types";

function buildPanelBackground(cut: ShortsToonCut) {
  return {
    background: `
      radial-gradient(circle at 22% 18%, ${cut.palette.glow}, transparent 30%),
      radial-gradient(circle at 78% 32%, rgba(255,255,255,0.18), transparent 26%),
      linear-gradient(160deg, ${cut.palette.from} 0%, ${cut.palette.via} 48%, ${cut.palette.to} 100%)
    `,
  };
}

export function CutPanel({
  cut,
  index,
}: {
  cut: ShortsToonCut;
  index: number;
}) {
  return (
    <article className="border-b border-line py-5">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-[10px] border border-slate-200"
        style={buildPanelBackground(cut)}
      >
        <div className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-[12px] font-bold text-accent-ink">
          컷 {index + 1}
        </div>
      </div>

      <div className="space-y-2 px-1 pt-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span>{cut.emotion}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span>{cut.title}</span>
        </div>
        <p className="text-[15px] font-semibold leading-6 text-slate-950">
          {cut.caption}
        </p>
        <p className="text-[13px] leading-6 text-slate-500">{cut.situation}</p>
        <p className="text-[12px] leading-5 text-slate-400">
          연속성 메모: {cut.continuityNotes.join(" · ")}
        </p>
      </div>
    </article>
  );
}
