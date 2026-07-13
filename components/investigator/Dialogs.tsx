"use client";

import { useState } from "react";
import { FAULT_STEPS, type Case, type FaultPct, type ReasonKey } from "@/lib/mockData";
import { useT } from "@/lib/strings";
import { useLocale, type L } from "@/lib/i18n";
import { CheckIcon, WarningTriangleIcon } from "../icons";

function Modal({
  title,
  intro,
  children,
  onClose,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { dir } = useLocale();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,42,32,.45)] p-6"
      onClick={onClose}
    >
      <div
        dir={dir}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[86vh] w-[560px] overflow-y-auto rounded-card-xl bg-white p-[22px] shadow-bezel"
      >
        <div className="text-[17px] font-bold text-ink">{title}</div>
        {intro && <div className="mt-[5px] text-[13px] text-ink-muted">{intro}</div>}
        <div className="mt-[18px]">{children}</div>
      </div>
    </div>
  );
}

function Actions({
  cancel,
  confirm,
  onCancel,
  onConfirm,
  disabled,
}: {
  cancel: string;
  confirm: string;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-[20px] flex items-center justify-end gap-[10px]">
      <button
        onClick={onCancel}
        className="rounded-chip border border-hair px-[16px] py-[10px] text-[13px] font-semibold text-ink-sub transition-colors hover:bg-[#F7FAF8]"
      >
        {cancel}
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className={`rounded-chip px-[18px] py-[10px] text-[13px] font-semibold text-white transition-colors ${
          disabled
            ? "cursor-not-allowed bg-[#B4C0B9]"
            : "bg-najm-green shadow-primary-sm hover:bg-najm-deep"
        }`}
      >
        {confirm}
      </button>
    </div>
  );
}

/* ── Human escalation ───────────────────────────────────────────────
   Two modes, because most "help me" requests are a second opinion, not a
   handoff. A system that can only transfer ownership teaches investigators to
   avoid escalating — the exact behaviour Najm cannot afford.

   The bundle is not a set of checkboxes to fill; it is a receipt. The point is
   that the investigator does not re-explain the case. The packet IS the case. */

export function EscalateDialog({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (e: { mode: "advice" | "transfer"; reason: ReasonKey; note: string }) => void;
}) {
  const t = useT();
  const [mode, setMode] = useState<"advice" | "transfer">("advice");
  const [reason, setReason] = useState<ReasonKey>("conflict");
  const [note, setNote] = useState("");
  const REASONS: ReasonKey[] = ["conflict", "liability", "fraud", "complex"];

  return (
    <Modal title={t.escalate.title} intro={t.escalate.intro} onClose={onClose}>
      <div className="mb-[6px] text-[12px] font-semibold text-ink-sub">{t.escalate.modeLabel}</div>
      <div className="grid grid-cols-2 gap-[10px]">
        {(
          [
            { k: "advice", label: t.escalate.advice, hint: t.escalate.adviceHint },
            { k: "transfer", label: t.escalate.transfer, hint: t.escalate.transferHint },
          ] as const
        ).map((o) => (
          <button
            key={o.k}
            onClick={() => setMode(o.k)}
            className={`rounded-card border p-[13px] text-start transition-colors ${
              mode === o.k
                ? "border-najm-green bg-najm-tint"
                : "border-hair bg-white hover:bg-[#F7FAF8]"
            }`}
          >
            <div className="flex items-center gap-[7px]">
              <span
                className={`flex h-[15px] w-[15px] flex-none items-center justify-center rounded-full border-2 ${
                  mode === o.k ? "border-najm-green" : "border-[#C6D2CB]"
                }`}
              >
                {mode === o.k && <span className="h-[7px] w-[7px] rounded-full bg-najm-green" />}
              </span>
              <span className="text-[13px] font-bold text-ink">{o.label}</span>
            </div>
            <div className="mt-[5px] ps-[22px] text-[11px] text-ink-muted">{o.hint}</div>
          </button>
        ))}
      </div>

      <div className="mb-[6px] mt-[16px] text-[12px] font-semibold text-ink-sub">
        {t.escalate.reasonLabel}
      </div>
      <div className="flex flex-wrap gap-[7px]">
        {REASONS.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`rounded-pill border px-[12px] py-[6px] text-[12px] font-semibold transition-colors ${
              reason === r
                ? "border-najm-green bg-najm-green text-white"
                : "border-hair bg-white text-ink-sub hover:bg-[#F7FAF8]"
            }`}
          >
            {t.reasons[r]}
          </button>
        ))}
      </div>

      <div className="mb-[6px] mt-[16px] text-[12px] font-semibold text-ink-sub">
        {t.escalate.noteLabel}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t.escalate.notePlaceholder}
        rows={3}
        className="w-full resize-none rounded-card border border-hair bg-[#F7FAF8] px-[13px] py-[11px] text-[13px] leading-[1.7] text-ink outline-none placeholder:text-ink-faint-2 focus:border-najm-green"
      />

      {/* the receipt */}
      <div className="mt-[16px] rounded-card border border-najm-border bg-najm-tint p-[13px]">
        <div className="mb-[9px] text-[12px] font-bold text-najm-green">{t.escalate.bundleTitle}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-[6px]">
          {t.escalate.bundle.map((b) => (
            <div key={b} className="flex items-center gap-[6px] text-[12px] text-ink-soft">
              <CheckIcon size={11} color="#0F5C43" width={3} />
              {b}
            </div>
          ))}
        </div>
      </div>

      <Actions
        cancel={t.escalate.cancel}
        confirm={t.escalate.send}
        onCancel={onClose}
        onConfirm={() => onSend({ mode, reason, note: note.trim() })}
        disabled={!note.trim()}
      />
    </Modal>
  );
}

/* ── Request more information ───────────────────────────────────────
   The AI calls the driver back. The voice product stops being an intake tool
   and becomes an investigation instrument — nobody in the building picks up a
   phone to chase a missing detail. */

export function RequestInfoDialog({
  c,
  onClose,
  onSend,
}: {
  c: Case;
  onClose: () => void;
  onSend: (party: "A" | "B", topic: L) => void;
}) {
  const t = useT();
  const { p } = useLocale();
  const roles: ("A" | "B")[] = c.parties.length ? c.parties.map((x) => x.role) : ["A"];
  const conflicts = c.claims.filter((x) => x.verdict === "conflict").map((x) => x.label);
  const options: L[] = conflicts.length
    ? conflicts
    : [{ en: t.requestInfo.missingFields, ar: "حقول ناقصة في الملف" }];

  const [party, setParty] = useState<"A" | "B">(roles[0]);
  const [topic, setTopic] = useState<L>(options[0]);
  const partyLabel = (r: "A" | "B") => (r === "A" ? t.inv.pA : t.inv.pB);

  return (
    <Modal title={t.requestInfo.title} intro={t.requestInfo.intro} onClose={onClose}>
      <div className="mb-[6px] text-[12px] font-semibold text-ink-sub">
        {t.requestInfo.partyLabel}
      </div>
      <div className="flex gap-[7px]">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => setParty(r)}
            className={`rounded-pill border px-[14px] py-[7px] text-[12px] font-semibold transition-colors ${
              party === r
                ? "border-najm-green bg-najm-green text-white"
                : "border-hair bg-white text-ink-sub hover:bg-[#F7FAF8]"
            }`}
          >
            {partyLabel(r)}
          </button>
        ))}
      </div>

      <div className="mb-[6px] mt-[16px] text-[12px] font-semibold text-ink-sub">
        {t.requestInfo.topicLabel}
      </div>
      <div className="flex flex-wrap gap-[7px]">
        {options.map((o) => (
          <button
            key={o.en}
            onClick={() => setTopic(o)}
            className={`rounded-pill border px-[12px] py-[6px] text-[12px] font-semibold transition-colors ${
              topic.en === o.en
                ? "border-najm-green bg-najm-green text-white"
                : "border-hair bg-white text-ink-sub hover:bg-[#F7FAF8]"
            }`}
          >
            {p(o)}
          </button>
        ))}
      </div>

      <Actions
        cancel={t.requestInfo.cancel}
        confirm={t.requestInfo.send}
        onCancel={onClose}
        onConfirm={() => onSend(party, topic)}
      />
    </Modal>
  );
}

/* ── Issue the verdict ──────────────────────────────────────────────
   If a conflict is still open, the console says so before it lets the verdict
   leave. This is the objection queue, defended at the only moment it can be. */

export function ResolveDialog({
  c,
  onClose,
  onConfirm,
}: {
  c: Case;
  onClose: () => void;
  onConfirm: (faultA: FaultPct) => void;
}) {
  const t = useT();
  const { n } = useLocale();
  const conflicts = c.claims.filter((x) => x.verdict === "conflict").length;
  const [faultA, setFaultA] = useState<FaultPct>(50);
  const faultB = 100 - faultA;

  return (
    <Modal title={t.resolve.title} onClose={onClose}>
      {conflicts > 0 && (
        <div className="mb-[16px] flex gap-[10px] rounded-card border border-[#EFD9AE] bg-warn-tint p-[13px]">
          <span className="mt-[1px] flex-none">
            <WarningTriangleIcon size={16} color="#B8791A" />
          </span>
          <div>
            <div className="text-[13px] font-bold text-warn-text">{t.resolve.riskTitle}</div>
            <div className="mt-[3px] text-[12px] leading-[1.6] text-ink-soft">
              {t.resolve.riskBody}
            </div>
          </div>
        </div>
      )}

      <div className="text-[12px] font-semibold text-ink-sub">{t.resolve.faultLabel}</div>
      <div className="mb-[10px] mt-[2px] text-[11px] text-ink-muted">{t.resolve.faultHint}</div>

      {/* Liability is apportioned in quarters — a winner is not a verdict. */}
      <div className="flex gap-[7px]">
        {FAULT_STEPS.map((step) => (
          <button
            key={step}
            onClick={() => setFaultA(step)}
            className={`flex-1 rounded-card border py-[11px] text-[15px] font-bold transition-colors ${
              faultA === step
                ? "border-najm-green bg-najm-green text-white"
                : "border-hair bg-white text-ink-sub hover:bg-[#F7FAF8]"
            }`}
          >
            {n(step)}%
          </button>
        ))}
      </div>

      {/* the split, stated as it will be recorded */}
      <div className="mt-[14px] overflow-hidden rounded-card border border-hair">
        <div className="flex">
          <div
            className="bg-najm-green py-[10px] text-center text-[13px] font-bold text-white transition-all duration-200"
            style={{ width: `${faultA}%` }}
          />
          <div
            className="bg-[#C6D2CB] py-[10px] text-center text-[13px] font-bold text-ink transition-all duration-200"
            style={{ width: `${faultB}%` }}
          />
        </div>
        <div className="flex items-center justify-between bg-[#F7FAF8] px-[14px] py-[10px]">
          <span className="text-[13px] font-bold text-najm-green">
            {t.inv.pA} {n(faultA)}%
          </span>
          <span className="text-[13px] font-bold text-ink-sub">
            {t.inv.pB} {n(faultB)}%
          </span>
        </div>
      </div>

      <Actions
        cancel={t.resolve.cancel}
        confirm={t.resolve.confirm}
        onCancel={onClose}
        onConfirm={() => onConfirm(faultA)}
      />
    </Modal>
  );
}
