"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home } from "lucide-react";

const tabs = [
  { href: "/", label: "쇼츠툰", icon: Home },
  { href: "/archive", label: "보관함", icon: Bookmark },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 mt-auto border-t border-line/80 bg-white/92 px-4 py-3 backdrop-blur">
      <ul className="grid grid-cols-2 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl text-sm font-medium transition ${
                  active
                    ? "bg-accent text-accent-ink"
                    : "bg-muted/80 text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
