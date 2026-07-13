"use client";

import { type Claim, type ClaimVerdict } from "@/lib/mockData";
import { useT } from "@/lib/strings";
import { useLocale } from "@/lib/i18n";
import { CheckIcon, WarningTriangleIcon } from "../icons";

/**
 * The centrepiece of the whole console.
 *
 * The model reads both drivers' accounts and lines them up claim by claim. The
 * investigator's job stops being "read two transcripts" and becomes "adjudicate
 * the three things they disagree about" — which is also exactly what a verdict
 * needs in order to survive the objection committee.
 *
 * The verdict chips are violet because the *comparison* is the model's work.
 * The conflict rows are amber, never red: red is reserved for human safety.
 */

const VERDICT_STYLE: Record<ClaimVerdict, string> = {
  agree: "bg-ok-tint text-ok-text",
  conflict: "bg-warn-tint text-warn-text",
  onlyA: "bg-sarj-tint text-sarj-hover",
  onlyB: "bg-sarj-tint text-sarj-hover",
};

export function ContradictionTable({ claims }: { claims: Claim[] }) {
  const t = useT();
  const { p, n } = useLocale();
  const conflicts = claims.filter((c) => c.verdict === "conflict").length;

  return (
    <div className="overflow-hidden rounded-card-lg border border-hair bg-white">
      <div className="flex items-center justify-between border-b border-hair-inner px-[16px] py-[12px]">
        <div>
          <div className="text-[14px] font-bold text-ink">{t.inv.compareTitle}</div>
          <div className="mt-[2px] text-[11px] text-ink-muted">{t.inv.compareSub}</div>
        </div>
        {conflicts > 0 && (
          <span className="inline-flex items-center gap-[6px] rounded-pill bg-warn-tint px-[10px] py-[5px] text-[12px] font-bold text-warn-text">
            <WarningTriangleIcon size={12} color="#B8791A" />
            {n(conflicts)} {conflicts === 1 ? t.inv.conflict : t.inv.conflicts}
          </span>
        )}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F7FAF8]">
            <th className="border-b border-hair-inner px-[14px] py-[9px] text-start text-[11px] font-semibold text-ink-muted">
              {t.inv.claim}
            </th>
            <th className="border-b border-hair-inner px-[14px] py-[9px] text-start text-[11px] font-semibold text-ink-muted">
              {t.inv.narrativeA}
            </th>
            <th className="border-b border-hair-inner px-[14px] py-[9px] text-start text-[11px] font-semibold text-ink-muted">
              {t.inv.narrativeB}
            </th>
            <th className="border-b border-hair-inner px-[14px] py-[9px] text-start text-[11px] font-semibold text-ink-muted">
              {t.inv.verdict}
            </th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => {
            const conflict = c.verdict === "conflict";
            return (
              <tr
                key={c.key}
                className={`border-b border-hair-inner last:border-b-0 ${
                  conflict ? "border-s-[3px] border-s-warn-dot bg-[#FDF8EE]" : ""
                }`}
              >
                <td className="px-[14px] py-[11px] align-top text-[12px] font-semibold text-ink-sub">
                  {p(c.label)}
                </td>
                <td
                  className={`px-[14px] py-[11px] align-top text-[13px] ${
                    conflict ? "font-semibold text-ink" : "text-ink-soft"
                  }`}
                >
                  {p(c.a)}
                </td>
                <td
                  className={`px-[14px] py-[11px] align-top text-[13px] ${
                    conflict ? "font-semibold text-ink" : "text-ink-soft"
                  }`}
                >
                  {p(c.b)}
                </td>
                <td className="px-[14px] py-[11px] align-top">
                  <span
                    className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-pill px-[9px] py-[4px] text-[11px] font-bold ${
                      VERDICT_STYLE[c.verdict]
                    }`}
                  >
                    {c.verdict === "agree" ? (
                      <CheckIcon size={10} color="#0F7A50" width={3} />
                    ) : conflict ? (
                      <WarningTriangleIcon size={10} color="#B8791A" />
                    ) : (
                      <span className="h-[5px] w-[5px] rounded-full bg-sarj-violet" />
                    )}
                    {t.claimVerdict[c.verdict]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
