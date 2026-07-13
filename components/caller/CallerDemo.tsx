"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BEATS, CALLER_TRANSCRIPT, FIRST_BEAT, LAST_BEAT, SLOTS, type SlotKey } from "@/lib/mockData";
import { useT } from "@/lib/strings";
import { useLocale } from "@/lib/i18n";
import { PhoneFrame } from "./PhoneFrame";
import { CallerScreen } from "./Screens";

/** Length of the AI-typing indicator shown between beats. */
const TYPING_MS = 700;
/** Chips fill just behind the bubble that answers each question. */
const CHIP_MS = [650, 1150, 1650];

/** Natural height of the stage: strapline + 838px phone + presenter controls. */
const STAGE_H = 1064;
const LAUNCHER_H = 60;

/**
 * The design system fixes the phone at 812px of screen inside a 420px bezel.
 * On a laptop or a projector that is taller than the viewport, so the stage
 * scales down to fit rather than pushing the Next button below the fold —
 * the presenter must always see the whole story and the controls.
 */
function useFitScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const available = window.innerHeight - LAUNCHER_H - 16;
      setScale(Math.max(0.62, Math.min(1, available / STAGE_H)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return scale;
}

export function CallerDemo() {
  // A hard reset remounts the entire run: every timer, animation and
  // typewriter starts from zero. This is the key the presenter leans on.
  const [runKey, setRunKey] = useState(0);
  const reset = useCallback(() => setRunKey((k) => k + 1), []);
  return <CallerRun key={runKey} onReset={reset} />;
}

function CallerRun({ onReset }: { onReset: () => void }) {
  const router = useRouter();
  const [beat, setBeat] = useState(FIRST_BEAT);
  const [typing, setTyping] = useState(false);
  const [filled, setFilled] = useState<SlotKey[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale();
  const t = useT();
  const { dir, n } = useLocale();

  const next = useCallback(() => {
    if (beat >= LAST_BEAT) return;
    setBeat(beat + 1);
    setTyping(true);
  }, [beat]);

  const prev = useCallback(() => {
    setBeat((b) => Math.max(FIRST_BEAT, b - 1));
    setTyping(false);
  }, []);

  const goTo = useCallback(
    (n: number) => {
      setBeat(Math.min(LAST_BEAT, Math.max(FIRST_BEAT, n)));
      setTyping(false);
    },
    []
  );

  /* Typing indicator between beats — always self-clears, never blocks input. */
  useEffect(() => {
    if (!typing) return;
    const t = setTimeout(() => setTyping(false), TYPING_MS);
    return () => clearTimeout(t);
  }, [typing, beat]);

  /* Progress chips fill as the caller answers each question in beat 3. */
  useEffect(() => {
    if (beat < 3) {
      setFilled([]);
      return;
    }
    if (beat > 3) {
      setFilled([...SLOTS]);
      return;
    }
    if (typing) return; // wait for the agent to "finish thinking"

    const answers = CALLER_TRANSCRIPT.filter((m) => m.beat === 3 && m.fills).map(
      (m) => m.fills as SlotKey
    );
    const timers = answers.map((slot, i) =>
      setTimeout(() => setFilled((f) => (f.includes(slot) ? f : [...f, slot])), CHIP_MS[i])
    );
    return () => timers.forEach(clearTimeout);
  }, [beat, typing]);

  /* Presenter keyboard: space = next beat, R = reset, A = admin. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.repeat) return; // a held key must not stampede through beats

      if (e.code === "Space") {
        e.preventDefault(); // never scroll the page mid-demo
        next();
        return;
      }
      // Layout-independent: e.code is unaffected by the active keyboard language.
      if (e.code === "KeyR") {
        e.preventDefault();
        onReset();
        return;
      }
      if (e.code === "KeyI") {
        e.preventDefault();
        router.push("/investigator");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, onReset, router]);

  return (
    <div
      className="flex flex-1 justify-center overflow-hidden pt-[18px]"
      style={{ height: STAGE_H * scale }}
    >
      <div
        className="w-[420px] flex-none"
        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
      >
      <div className="mb-5 text-center">
        <div className="font-latin text-[11px] font-semibold uppercase tracking-[2px] text-sarj-violet">
          {t.chrome.eyebrow}
        </div>
        <div className="mt-1 text-[15px] text-ink-sub">{t.chrome.strapline}</div>
      </div>

      <PhoneFrame ref={bodyRef}>
        <div dir={dir} className="h-full">
          <CallerScreen beat={beat} typing={typing} filled={filled} onConfirm={next} />
        </div>
      </PhoneFrame>

      {/* Presenter controls */}
      <div className="mt-[18px] w-[420px]">
        <div className="flex items-center justify-between gap-3">
          <NavButton onClick={prev} enabled={beat > FIRST_BEAT}>
            {t.chrome.prev}
          </NavButton>

          <div className="flex gap-[7px]">
            {BEATS.map((b) => (
              <button
                key={b.n}
                onClick={() => goTo(b.n)}
                aria-label={`${b.n}. ${t.beats[b.n - 1]}`}
                className={`h-2 rounded-[20px] transition-all duration-200 ${
                  b.n === beat ? "w-[26px] bg-najm-green" : "w-2 bg-[#C6D2CB]"
                }`}
              />
            ))}
          </div>

          <NavButton onClick={next} enabled={beat < LAST_BEAT}>
            {t.chrome.next}
          </NavButton>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[13px] font-semibold text-ink">{t.beats[beat - 1]}</span>
          <span className="ms-2 font-latin text-[12px] text-ink-faint">
            {n(beat)} / {n(LAST_BEAT)}
          </span>
        </div>

        <div className="mt-2 text-center text-[11px] text-ink-faint-2">{t.chrome.keys}</div>
      </div>
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  enabled,
  children,
}: {
  onClick: () => void;
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`min-w-[96px] rounded-chip-lg border border-hair-alt px-5 py-[11px] text-[14px] font-semibold transition-colors ${
        enabled
          ? "cursor-pointer bg-white text-ink hover:bg-[#F7FAF8]"
          : "cursor-default bg-[#F4F7F5] text-ink-faint-2"
      }`}
    >
      {children}
    </button>
  );
}
