"use client";

import { forwardRef } from "react";
import { CLOCK } from "@/lib/mockData";
import { useT } from "@/lib/strings";
import { useLocale } from "@/lib/i18n";
import { SignalIcon, WifiIcon, BatteryIcon } from "../icons";

/**
 * 390px screen inside a 420px bezel — per the design system.
 * Status bar reads 2:14 all the way through: the whole story happens at night.
 */
export const PhoneFrame = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function PhoneFrame({ children }, bodyRef) {
    const t = useT();
    const { n } = useLocale();
    return (
      <div className="w-[420px] rounded-bezel bg-najm-bezel p-[13px] shadow-bezel">
        <div className="relative flex h-[812px] w-full flex-col overflow-hidden rounded-screen bg-screen">
          {/* status bar (LTR run) */}
          <div
            dir="ltr"
            className="flex h-[44px] flex-none items-center justify-between px-[26px]"
          >
            <span className="font-latin text-[14px] font-semibold text-ink">{n(CLOCK)}</span>
            <div className="flex items-center gap-[6px] text-ink">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          {/* app header — no coloured slab: the screen is one empty expanse */}
          <div className="flex flex-none items-center justify-between px-[22px] pb-4 pt-1">
            <div className="flex items-center gap-[9px]">
              <span className="text-[20px] font-bold text-ink">نجم</span>
              <span className="border-s border-hair ps-[9px] text-[12px] font-medium text-ink-muted">
                {t.caller.assistant}
              </span>
            </div>
            <div className="flex items-center gap-[6px] rounded-[20px] border border-najm-border bg-najm-tint px-[10px] py-[5px]">
              <span className="h-[7px] w-[7px] rounded-full bg-najm-green shadow-[0_0_0_3px_rgba(15,92,67,.15)]" />
              <span className="font-latin text-[11px] font-semibold uppercase text-najm-green">
                {t.live}
              </span>
            </div>
          </div>

          {/* screen body — voice-first, so it never scrolls: every beat fits */}
          <div ref={bodyRef} className="relative flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
