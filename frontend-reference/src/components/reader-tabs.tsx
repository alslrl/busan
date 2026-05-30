import Link from "next/link";

type ReaderTab = {
  href: string;
  label: string;
  active: boolean;
};

export function ReaderTabs({ tabs }: { tabs: ReaderTab[] }) {
  return (
    <nav
      aria-label="리더 상단 탭"
      className="flex items-center gap-5 border-b border-line px-4"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`relative inline-flex min-h-12 items-center text-[15px] font-semibold tracking-tight ${
            tab.active ? "text-slate-950" : "text-slate-400"
          }`}
        >
          {tab.label}
          {tab.active ? (
            <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-accent" />
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
