"use client";

import { useLocale } from "@/lib/i18n";
import { useT } from "@/lib/strings";


/**
 * Shared shell for both internal seats. The sidebar sits at the writing-start
 * edge — right in Arabic, left in English — which logical properties give us for
 * free once the document direction flips.
 */
export function Shell({
  nav,
  active,
  onNav,
  role,
  who,
  section,
  children,
}: {
  nav: { key: string; label: string }[];
  active: string;
  onNav: (k: string) => void;
  role: string;
  who: { name: string; initials: string; role: string };
  section: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useT();
  const { dir } = useLocale();

  return (
    <div dir={dir} className="flex min-h-[calc(100vh-60px)] bg-page">
      <aside className="flex w-[228px] flex-none flex-col bg-najm-deep">
        <div className="border-b border-white/[.08] px-5 py-[16px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[21px] font-bold text-white">نجم</span>
            <span
              dir="ltr"
              className="border-s border-white/20 ps-[10px] font-latin text-[11px] font-semibold tracking-[.5px] text-najm-on-dark"
            >
              {t.najmLatin}
            </span>
          </div>
          <div className="mt-[6px] text-[11px] font-semibold text-najm-on-dark-soft">{role}</div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              className={`rounded-chip px-[14px] py-[10px] text-start text-[14px] font-semibold transition-colors ${
                item.key === active
                  ? "bg-najm-green text-white"
                  : "text-najm-on-dark-mute hover:bg-white/[.06] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-[10px] border-t border-white/[.08] px-[14px] py-4">
          <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-white/[.12] font-latin text-[12px] font-bold text-white">
            {who.initials}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] text-najm-on-dark-soft">{who.role}</div>
            <div className="truncate text-[13px] font-semibold text-white">{who.name}</div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* No Sarj attribution here — the launcher bar above already carries it,
            and two of them on one screen reads as a bug. */}
        <div className="flex flex-none items-center border-b border-hair-alt bg-white px-[24px] py-[13px]">
          <div className="min-w-0">{section}</div>
        </div>

        <div className="min-w-0 flex-1 p-[22px]">{children}</div>
      </div>
    </div>
  );
}
