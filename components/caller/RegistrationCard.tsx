"use client";

import { REGISTRATION_CARD } from "@/lib/mockData";
import { useT } from "@/lib/strings";

/**
 * The uploaded evidence: a photo of a Saudi vehicle-registration card
 * (استمارة سير), rendered as markup so the demo ships with no binary assets
 * and looks identical on every machine.
 *
 * Presented as a *photograph*: tilted card, soft surface, vignette — this is
 * the caller's camera roll, not a UI card.
 */
export function RegistrationCardPhoto() {
  const t = useT();
  return (
    <div className="relative mb-2 h-[88px] w-full overflow-hidden rounded-card border border-hair">
      {/* photographed surface */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,#3A4A43_0%,#22302A_60%,#18231E_100%)]" />

      {/* the card itself, slightly rotated as if snapped by hand */}
      <div
        className="absolute inset-x-[26px] top-[7px] rounded-[6px] bg-[linear-gradient(160deg,#FBFAF4_0%,#F1EEE2_100%)] shadow-[0_14px_28px_-10px_rgba(0,0,0,.55)]"
        style={{ transform: "rotate(-1.4deg)" }}
      >
        {/* header band */}
        <div dir="rtl" className="flex items-center justify-between rounded-t-[6px] bg-najm-deep px-[10px] py-[5px]">
          <span className="text-[8px] font-semibold text-white/90">
            {REGISTRATION_CARD.headerAr}
          </span>
          <span dir="ltr" className="font-latin text-[6px] tracking-[.6px] text-najm-on-dark">
            {REGISTRATION_CARD.headerLatin}
          </span>
        </div>

        <div dir="rtl" className="flex gap-[10px] px-[10px] py-[8px]">
          {/* plate block */}
          <div className="flex-none rounded-[3px] border border-[#C9C6B8] bg-white px-[6px] py-[4px] text-center">
            <div className="text-[11px] font-bold leading-none tracking-[2px] text-[#1B2620]">
              ٤٥٦٢
            </div>
            <div className="mt-[3px] text-[9px] font-bold leading-none tracking-[2px] text-[#1B2620]">
              ر س ط
            </div>
            <div className="mt-[3px] border-t border-[#DEDBCF] pt-[2px]">
              <span dir="ltr" className="font-latin text-[6px] font-semibold tracking-[.8px] text-[#5C6660]">
                {REGISTRATION_CARD.plateLatin}
              </span>
            </div>
          </div>

          {/* printed rows */}
          <div className="flex-1 space-y-[3px]">
            {REGISTRATION_CARD.rows.slice(1).map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-2">
                <span className="text-[7px] text-[#8A8272]">{row.label}</span>
                <span className="text-[8px] font-semibold text-[#22302A]">{row.value}</span>
              </div>
            ))}
            <div className="!mt-[6px] border-t border-dashed border-[#D8D3C2] pt-[3px]">
              <span className="text-[6px] text-[#9A9384]">{REGISTRATION_CARD.kingdomAr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* camera vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_40%,transparent_40%,rgba(0,0,0,.35)_100%)]" />

      {/* upload confirmation — operational, so Najm green */}
      <span className="absolute start-[10px] top-[10px] z-[2] rounded-pill bg-najm-green/[.92] px-[9px] py-1 text-[11px] font-semibold text-white">
        {t.caller.uploaded}
      </span>
    </div>
  );
}
