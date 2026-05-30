import Link from "next/link";
import { Bookmark, Search } from "lucide-react";

export function ReaderTopbar() {
  return (
    <div className="border-b border-line px-4">
      <div className="flex min-h-14 items-center justify-between gap-3">
        <Link href="/" className="text-[24px] font-black tracking-tight text-slate-950">
          PhotoToon
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="검색"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/archive"
            aria-label="보관함으로 이동"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700"
          >
            <Bookmark className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
