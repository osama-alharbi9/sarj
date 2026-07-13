"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { useT } from "@/lib/strings";
import { SarjWordmark } from "./SarjWordmark";

/**
 * Three seats, one per persona: the caller who reports, the investigator who
 * decides, the supervisor who runs the floor. The call-centre agent is gone —
 * nobody at Najm is paid to watch a conversation go by.
 */
export function LauncherBar() {
  const pathname = usePathname();
  const t = useT();
  const { locale, setLocale } = useLocale();

  const seats = [
    { href: "/", label: t.seats.caller },
    { href: "/support", label: t.seats.support },
    { href: "/investigator", label: t.seats.investigator },
    { href: "/ops", label: t.seats.ops },
  ];

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="sticky top-0 z-40 grid h-[60px] grid-cols-[1fr_auto_1fr] items-center border-b border-hair-alt bg-white px-[22px] shadow-[0_1px_0_rgba(16,40,30,.02)]">
      <div className="flex items-center gap-[10px]">
        <span className="text-[22px] font-bold leading-none tracking-[-.5px] text-najm-green">
          نجم
        </span>
        <span
          dir="ltr"
          className="border-s border-[#D5E0DA] ps-[10px] font-latin text-[12px] font-semibold tracking-[.5px] text-najm-green"
        >
          {t.najmLatin}
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-[12px] border border-hair-alt bg-[#F1F5F2] p-1">
        {seats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`whitespace-nowrap rounded-[9px] px-[13px] py-[9px] text-[13px] font-semibold transition-all duration-150 ${
              active(s.href) ? "bg-najm-green text-white" : "text-ink-sub hover:text-ink"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-end gap-[14px]">
        {/* One switch drives the whole demo — chrome, summaries, numerals, direction. */}
        <div className="flex items-center rounded-[9px] border border-hair-alt bg-[#F1F5F2] p-[3px]">
          {(
            [
              { k: "en", label: "EN" },
              { k: "ar", label: "ع" },
            ] as const
          ).map((o) => (
            <button
              key={o.k}
              onClick={() => setLocale(o.k)}
              aria-label={o.k === "en" ? "English" : "العربية"}
              className={`min-w-[34px] rounded-[6px] px-[8px] py-[5px] text-[12px] font-bold transition-colors ${
                locale === o.k ? "bg-white text-najm-green shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <span className="flex items-center gap-[9px]" dir="ltr">
          <span className="font-latin text-[10px] tracking-[.3px] text-ink-muted-2">
            POWERED BY
          </span>
          <SarjWordmark height={19} className="text-sarj-violet" />
        </span>
      </div>
    </div>
  );
}
