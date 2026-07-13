"use client";

import { useEffect, useRef, useState } from "react";
import { OCR, OCR_FIELDS } from "@/lib/mockData";
import { useT } from "@/lib/strings";
import { useLocale } from "@/lib/i18n";
import { OcrFrameIcon } from "../icons";
import { Meter, SourceTag } from "../ui";

const CHAR_MS = 26;
const ROW_GAP_MS = 300;

/**
 * Types the extracted values in one character at a time, field by field —
 * so the audience watches Sarj read the document rather than being handed
 * a finished table.
 *
 * Fully self-cleaning: every timer is cancelled on unmount, and the caller
 * page remounts this subtree on reset, so replaying the demo is deterministic.
 */
function useOcrTyping(start: boolean) {
  const [typed, setTyped] = useState<string[]>(() => OCR_FIELDS.map(() => ""));
  const [rowsShown, setRowsShown] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!start) return;

    let cancelled = false;

    // Flatten the whole extraction into one queue of tiny steps.
    type Step = { kind: "row"; row: number } | { kind: "char"; row: number; upto: number };
    const queue: Step[] = [];
    OCR_FIELDS.forEach((field, row) => {
      queue.push({ kind: "row", row });
      for (let i = 1; i <= field.value.length; i++) {
        queue.push({ kind: "char", row, upto: i });
      }
    });

    let i = 0;
    const run = () => {
      if (cancelled || i >= queue.length) {
        if (!cancelled) setDone(true);
        return;
      }
      const step = queue[i++];

      if (step.kind === "row") {
        setRowsShown(step.row + 1);
      } else {
        setTyped((prev) => {
          const next = [...prev];
          next[step.row] = OCR_FIELDS[step.row].value.slice(0, step.upto);
          return next;
        });
      }

      timer.current = setTimeout(run, step.kind === "row" ? ROW_GAP_MS : CHAR_MS);
    };

    timer.current = setTimeout(run, 260);

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [start]);

  return { typed, rowsShown, done };
}

export function OcrPanel({ start }: { start: boolean }) {
  const t = useT();
  const { n } = useLocale();
  const { typed, rowsShown, done } = useOcrTyping(start);
  const percent = Math.round((OCR.filled / OCR.total) * 100); // 67%

  return (
    <div className="overflow-hidden rounded-card-lg border border-najm-border shadow-lift">
      {/* header — the extraction readout */}
      <div className="flex items-center justify-between border-b border-najm-border bg-najm-tint px-[14px] py-[9px]">
        <div className="flex items-center gap-2">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[7px] bg-najm-green">
            <OcrFrameIcon />
          </span>
          <span className="text-[13px] font-semibold text-najm-green">{t.caller.ocrTitle}</span>
        </div>
        <span dir="ltr" className="font-latin text-[10px] font-semibold tracking-[.4px] text-najm-green">
          SARJ AI • OCR
        </span>
      </div>

      {/* extracted fields */}
      <div className="bg-white px-[14px] py-[6px]">
        {OCR_FIELDS.map((field, i) => {
          const visible = i < rowsShown;
          const value = typed[i];
          const complete = value.length === field.value.length;

          return (
            <div
              key={field.id}
              className={`flex min-h-[42px] items-center justify-between gap-2 py-[5px] ${
                i < OCR_FIELDS.length - 1 ? "border-b border-hair-inner" : ""
              } ${visible ? "animate-fade-in" : "invisible"}`}
            >
              <div>
                <div className="text-[11px] text-ink-muted-2">{t.ocrFields[field.id]}</div>
                <div
                  dir="rtl"
                  className={`mt-[2px] text-[15px] font-semibold text-ink ${
                    field.spaced ? "tracking-[1px]" : ""
                  }`}
                >
                  {value}
                  {visible && !complete && (
                    <span className="ms-[1px] inline-block h-[14px] w-[2px] translate-y-[2px] bg-najm-green" />
                  )}
                </div>
              </div>
              {complete && (
                <span className="animate-fade-in">
                  <SourceTag label={t.caller.ocrTag} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* completeness so far — 6 of 9 fields known at this point in the story */}
      <div className="flex items-center gap-2 border-t border-hair-inner bg-[#FAFBFA] px-[14px] py-[8px]">
        {done ? (
          <Meter percent={percent} tone="ok" duration=".8s" />
        ) : (
          <div className="h-[7px] flex-1 rounded-[6px] bg-[#ECEFED]" />
        )}
        <span className="whitespace-nowrap text-[11px] font-semibold text-ink-sub">
          {`${n(OCR.filled)} / ${n(OCR.total)} ${t.caller.fields}`}
        </span>
      </div>
    </div>
  );
}
