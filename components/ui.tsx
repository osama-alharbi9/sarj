import { CheckIcon, PersonIcon } from "./icons";
import type { LangCode, TagTone } from "@/lib/mockData";

/* ── Latin run inside the RTL shell ───────────────────────────────
   Reference numbers, plates, clocks, durations. Always LTR + Plex Sans. */
export function Latin({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span dir="ltr" className={`font-latin ${className}`}>
      {children}
    </span>
  );
}

/* ── Language badge ───────────────────────────────────────────────
   The language was *detected*, not declared — it is a reading the model made,
   so every one of these is violet regardless of which language it landed on. */
export function LanguageBadge({ lang }: { lang: LangCode }) {
  return (
    <span
      dir="ltr"
      className="inline-block rounded-[7px] bg-sarj-tint px-[9px] py-[3px] font-latin text-[11px] font-bold text-sarj-hover"
    >
      {lang}
    </span>
  );
}

/* ── Completeness meter — AI-native. Violet on the caller side,
      success-green once the case is a Najm operational record. ────
   Grows from the right (RTL). */
export function Meter({
  percent,
  tone = "sarj",
  track = "#ECEFED",
  duration = ".9s",
}: {
  percent: number;
  tone?: "sarj" | "ok" | "on-green";
  track?: string;
  duration?: string;
}) {
  // on-green: sits on the solid Najm-green ticket card, so it has to be light.
  const fill =
    tone === "sarj" ? "#6C5CE7" : tone === "ok" ? "#0F7A50" : "#3FD98B";
  return (
    <div
      className="h-[7px] flex-1 overflow-hidden rounded-[6px]"
      style={{ background: track }}
    >
      <div
        className="h-full rounded-[6px] meter-fill"
        style={{
          width: `${percent}%`,
          background: fill,
          animationDuration: duration,
        }}
      />
    </div>
  );
}

/* ── Classification / status tags ─────────────────────────────────── */

const TAG_TONES: Record<TagTone, string> = {
  najm: "bg-najm-tint text-najm-green",
  sarj: "bg-sarj-tint text-sarj-hover",
  ok: "bg-ok-tint text-ok-text",
  // Reserved for human safety only — see the colour law in mockData.
  danger: "bg-danger-tint text-danger-text",
  // Human escalation and ageing.
  warn: "bg-warn-tint text-warn-text",
};

export function Tag({ label, tone }: { label: string; tone: TagTone }) {
  return (
    <span
      className={`rounded-pill px-3 py-[5px] text-[12px] font-semibold ${TAG_TONES[tone]}`}
    >
      {label}
    </span>
  );
}

/* ── "من المستند" provenance tag on every OCR-extracted field ─────── */
export function SourceTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[7px] bg-najm-tint px-2 py-[3px] text-[10px] font-semibold text-najm-green">
      <CheckIcon size={9} color="#0F5C43" width={3} />
      {label}
    </span>
  );
}

/* ── Verified tag (موثّق) — operational, so success-green ─────────── */
export function VerifiedTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-ok-tint px-[9px] py-1 text-[11px] font-semibold text-ok-text">
      <CheckIcon size={10} color="#0F7A50" width={3} />
      {label}
    </span>
  );
}
