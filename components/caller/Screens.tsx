"use client";

import { useState } from "react";
import Link from "next/link";
import { useCases } from "@/lib/caseStore";
import { CALLER_COMPLAINT, CASE_REF, IDENTITY, OCR, PARTY_2, SLOTS, type SlotKey } from "@/lib/mockData";
import { useT } from "@/lib/strings";
import { useLocale } from "@/lib/i18n";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  OcrFrameIcon,
  ShieldCheckIcon,
  TwoPeopleIcon,
} from "../icons";
import { Latin, Meter, VerifiedTag } from "../ui";
import { OcrPanel } from "./OcrPanel";
import { Orb, type OrbState } from "./Orb";
import { RegistrationCardPhoto } from "./RegistrationCard";

/**
 * ChatGPT voice mode, in Arabic: one orb on an empty screen, and a card only
 * when the system actually needs something from the caller. The conversation
 * itself leaves no trace here — the verbatim transcript lives on the console,
 * where an operator needs it and the caller does not.
 */
export function CallerScreen({
  beat,
  typing,
  filled,
  onConfirm,
}: {
  beat: number;
  typing: boolean;
  filled: SlotKey[];
  onConfirm: () => void;
}) {
  const t = useT();
  const card = typing ? null : cardFor(beat, filled, onConfirm);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* The orb owns whatever space the card leaves it, and is centred in it. */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
        <Orb state={orbStateFor(beat, typing)} />

        {/* The single exception to the no-text rule: the language switch is the
            moment the demo exists to sell, so it gets a pill — and only here. */}
        {beat === 2 && (
          <span className="inline-flex animate-fade-in items-center gap-[7px] rounded-[20px] border border-najm-border bg-najm-tint px-[14px] py-[6px] text-[13px] font-semibold text-najm-green">
            <span className="h-[9px] w-[9px] rounded-full bg-najm-green" />
            {t.langName.ur} · {t.caller.detected}
          </span>
        )}
      </div>

      {card && (
        <div className="flex-none animate-card-up rounded-t-[26px] border-t border-hair bg-white px-[18px] pb-[16px] pt-[15px] shadow-[0_-14px_40px_-20px_rgba(16,40,30,.25)]">
          {card}
        </div>
      )}
    </div>
  );
}

/**
 * No labels, so the state has to be pinned per beat — a frozen slide still has
 * to say who is talking.
 */
function orbStateFor(beat: number, typing: boolean): OrbState {
  if (typing) return "speaking";
  if (beat === 3) return "listening"; // he is answering the guided questions
  if (beat === 6) return "idle"; // the ticket is cut; nobody is talking
  return "speaking"; // the assistant is greeting, asking, reading back, answering
}

/* ── The bottom slot: only when the system is asking for something ─── */

function cardFor(beat: number, filled: SlotKey[], onConfirm: () => void) {
  // Beat 3 opens on the orb alone and settles into the ID once he has spoken it.
  if (beat === 3) {
    return filled.length === SLOTS.length ? <PartiesCard onConfirm={onConfirm} /> : null;
  }
  if (beat === 4) return <EvidenceCard onConfirm={onConfirm} />;
  if (beat === 5) return <ReadbackCard onConfirm={onConfirm} />;
  if (beat === 6) return <TicketCard onConfirm={onConfirm} />;
  if (beat === 7) return <StatusCard />;
  return null;
}

/** The line the assistant just spoke, at the head of the card it is asking for. */
function RequestLine({ children }: { children: React.ReactNode }) {
  return <div className="mb-[13px] text-[15px] font-semibold text-ink">{children}</div>;
}

/**
 * Every request card ends in its own action, so the story can be driven from
 * inside the phone rather than only from the presenter's التالي / السابق.
 */
function PrimaryAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-[13px] w-full rounded-card bg-najm-green p-[13px] text-[16px] font-semibold text-white shadow-primary transition-colors hover:bg-najm-deep"
    >
      {label}
    </button>
  );
}

/* ── Both parties: voice in, screen for the check ─────────────────── */

/** One captured value: spoken by him, verified by eye. Never typed. */
function CapturedValue({
  label,
  value,
  latin = false,
}: {
  label: string;
  value: string;
  latin?: boolean;
}) {
  const t = useT();
  return (
    <div>
      <div className="mb-[6px] flex items-center gap-[6px]">
        <span className="text-[12px] font-semibold text-ink-muted">{label}</span>
        <span className="inline-flex items-center gap-1 rounded-pill bg-ok-tint px-[7px] py-[2px] text-[10px] font-bold text-ok-text">
          <CheckIcon size={9} color="#0F7A50" width={3} />
          {t.caller.verified}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-card border border-hair bg-[#F7FAF8] px-[14px] py-[12px]">
        <span
          dir={latin ? "ltr" : "rtl"}
          className={`font-bold text-ink ${
            latin
              ? "font-latin text-[22px] tabular-nums tracking-[.2em]"
              : "text-[22px] tracking-[.18em]"
          }`}
        >
          {value}
        </span>
        <button
          type="button"
          className="flex-none text-[13px] font-semibold text-najm-green underline-offset-2 hover:underline"
        >
          {t.caller.edit}
        </button>
      </div>
    </div>
  );
}

function PartiesCard({ onConfirm }: { onConfirm: () => void }) {
  const t = useT();
  return (
    <>
      <RequestLine>{t.caller.idAsk}</RequestLine>

      <div className="flex flex-col gap-[14px]">
        <CapturedValue label={t.caller.partyA} value={IDENTITY.digits} latin />

        <div className="border-t border-hair-inner pt-[14px]">
          <CapturedValue label={t.caller.partyB} value={PARTY_2.plate} />
          {/* Optional, and deliberately weak: the plate he read out is enough. */}
          <button
            type="button"
            className="mt-[9px] flex w-full items-center justify-center gap-[7px] rounded-card border border-dashed border-[#CFDAD4] py-[9px] text-[12px] font-semibold text-ink-muted transition-colors hover:bg-[#F7FAF8]"
          >
            <CameraPlusIcon />
            {t.caller.addPhoto}
          </button>
        </div>
      </div>

      <PrimaryAction label={t.caller.confirmId} onClick={onConfirm} />
    </>
  );
}

function CameraPlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5h3l1.5-2h5l1.5 2h3a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17v-7A1.5 1.5 0 0 1 6 8.5z"
        stroke="#7A8880"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 11v4M10 13h4" stroke="#7A8880" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── Evidence: photo request → upload → extraction ────────────────── */

function EvidenceCard({ onConfirm }: { onConfirm: () => void }) {
  const t = useT();
  return (
    <>
      <RequestLine>{t.caller.evidenceAsk}</RequestLine>

      {/* camera-style capture frame around the shot he just took */}
      <div className="relative mb-[10px] rounded-card border border-najm-border bg-najm-tint p-[7px]">
        <RegistrationCardPhoto />
        <span className="pointer-events-none absolute end-[15px] top-[15px] z-[2] flex h-[22px] w-[22px] items-center justify-center rounded-[7px] bg-najm-green/90">
          <OcrFrameIcon size={13} />
        </span>
      </div>

      <OcrPanel start />
      <PrimaryAction label={t.caller.continue} onClick={onConfirm} />
    </>
  );
}

/* ── Beat 5: read-back confirmation ───────────────────────────────── */

function SummaryIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-[32px] w-[32px] flex-none items-center justify-center rounded-[10px] bg-najm-tint">
      {children}
    </span>
  );
}

function ReadbackCard({ onConfirm }: { onConfirm: () => void }) {
  const t = useT();
  const { n } = useLocale();
  const c = t.caller;

  return (
    <>
      <RequestLine>{c.readbackTitle}</RequestLine>

      <div className="overflow-hidden rounded-card-lg border border-hair">
        <div className="flex items-start gap-3 border-b border-hair-inner px-[14px] py-[10px]">
          <SummaryIcon>
            <TwoPeopleIcon />
          </SummaryIcon>
          <div className="flex-1">
            <div className="text-[12px] text-ink-muted-2">{c.parties}</div>
            <div className="mt-[1px] text-[15px] font-semibold text-ink">{c.twoParties}</div>
            {/* one identifier per party — the ID masked, the plate as spoken */}
            <div className="mt-[5px] space-y-[2px] text-[11px] text-ink-muted">
              <div>
                {c.partyA}: {c.idMasked} ···{IDENTITY.digits.slice(-4)}
              </div>
              <div>
                {c.partyB}: {c.plate} <span dir="rtl">{PARTY_2.plate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-hair-inner px-[14px] py-[10px]">
          <SummaryIcon>
            <MapPinIcon size={17} />
          </SummaryIcon>
          <div className="flex-1">
            <div className="text-[12px] text-ink-muted-2">{c.location}</div>
            <div className="mt-[1px] text-[15px] font-semibold text-ink">{c.locationValue}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-hair-inner px-[14px] py-[10px]">
          <SummaryIcon>
            <CheckCircleIcon />
          </SummaryIcon>
          <div className="flex-1">
            <div className="text-[12px] text-ink-muted-2">{c.injuries}</div>
            <div className="mt-[1px] text-[15px] font-semibold text-ok-text">{c.none}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-[14px] py-[10px]">
          <SummaryIcon>
            <ShieldCheckIcon />
          </SummaryIcon>
          <div className="flex-1">
            <div className="text-[12px] text-ink-muted-2">{c.insurance}</div>
            <div className="mt-[1px] text-[15px] font-semibold text-ink">
              {c.insurer} — <span className="text-ok-text">{c.insVerified}</span>
            </div>
          </div>
          <VerifiedTag label={c.verified} />
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="mt-[13px] w-full rounded-card bg-najm-green p-[13px] text-[16px] font-semibold text-white shadow-primary transition-colors hover:bg-najm-deep"
      >
        {c.readbackConfirm}
      </button>
      <div className="mt-2 text-center text-[12px] text-ink-faint">{c.readbackHelper}</div>
    </>
  );
}

/* ── Beat 6: ticket created ───────────────────────────────────────── */

function TicketCard({ onConfirm }: { onConfirm: () => void }) {
  const t = useT();
  const { n } = useLocale();
  return (
    <>
      <RequestLine>{t.caller.ticketTitle}</RequestLine>

      {/* Operational record, so solid Najm green. */}
      <div className="relative overflow-hidden rounded-card-xl bg-najm-green p-[18px] text-white">
        <div
          className="absolute -top-5 h-[110px] w-[110px] rounded-full bg-white/5"
          style={{ insetInlineEnd: "-20px" }}
        />
        <div className="text-[12px] text-najm-on-dark">{t.caller.ticketRefLabel}</div>
        <div className="mt-1">
          <Latin className="text-[25px] font-bold tracking-[1px]">{CASE_REF}</Latin>
        </div>

        <div className="mt-3 flex items-center gap-[10px]">
          <span className="inline-flex items-center gap-[6px] rounded-[20px] bg-white/[.14] px-3 py-[5px] text-[13px] font-semibold">
            <span className="h-[7px] w-[7px] rounded-full bg-warn-dot-soft" />
            {t.caller.ticketStatus}
          </span>
        </div>

        {/* completeness — AI-derived, so violet even on Najm green */}
        <div className="mt-4 border-t border-white/[.14] pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] text-najm-on-dark">{t.caller.ticketCompleteness}</span>
            <span className="text-[13px] font-bold">{`${n(OCR.total)} / ${n(OCR.total)} ${t.caller.ticketComplete}`}</span>
          </div>
          <div className="flex">
            <Meter percent={100} tone="on-green" track="rgba(255,255,255,.16)" duration="1s" />
          </div>
        </div>
      </div>

      <PrimaryAction label={t.caller.continue} onClick={onConfirm} />
    </>
  );
}

/* ── Beat 7: 2:14 AM status query ─────────────────────────────────── */

function StatusCard() {
  const t = useT();
  const { dir, p, n } = useLocale();
  const { fileComplaint } = useCases();
  const [filed, setFiled] = useState(false);

  // He is not satisfied with "wait 24 hours". This is the moment a complaint is
  // actually born — so it is the moment the product should be able to take one.
  if (filed) {
    return (
      <>
        <RequestLine>{t.caller.complaintFiled}</RequestLine>

        <div className="rounded-card-lg border border-najm-border bg-najm-tint p-[15px]">
          <div className="text-[11px] text-najm-green/80">{t.caller.complaintRef}</div>
          <Latin className="text-[21px] font-bold tracking-[.5px] text-najm-green">
            {CALLER_COMPLAINT.ref}
          </Latin>

          <div className="mt-[13px] grid grid-cols-2 gap-[10px]">
            <div className="rounded-card border border-sarj-border bg-white p-[10px]">
              <div className="text-[10px] text-ink-muted">{t.caller.complaintType}</div>
              <div className="mt-[2px] text-[13px] font-bold text-sarj-hover">
                {t.complaints.types[CALLER_COMPLAINT.type]}
              </div>
            </div>
            <div className="rounded-card border border-sarj-border bg-white p-[10px]">
              <div className="text-[10px] text-ink-muted">{t.caller.complaintUrgency}</div>
              <div className="mt-[2px] text-[13px] font-bold text-sarj-hover">
                {t.complaints.urgencies[CALLER_COMPLAINT.urgency]}
              </div>
            </div>
          </div>

          {/* the whole point: it arrives triaged, not in a flat queue */}
          <div className="mt-[10px] flex items-center gap-[6px] text-[11px] font-semibold text-sarj-hover">
            <span className="h-[6px] w-[6px] rounded-full bg-sarj-violet" />
            {t.caller.complaintClassified}
          </div>

          <div className="mt-[10px] border-t border-najm-border pt-[9px] text-[11px] text-ink-muted">
            {t.caller.complaintSla}
          </div>
        </div>

        <Link
          href="/ops"
          className="mt-[13px] flex w-full items-center justify-center gap-2 rounded-card bg-najm-green p-[13px] text-[15px] font-semibold text-white shadow-primary transition-colors hover:bg-najm-deep"
        >
          {t.caller.handoff}
          <span className={dir === "rtl" ? "-scale-x-100" : ""}>
            <ArrowRightIcon size={17} color="#fff" />
          </span>
        </Link>
      </>
    );
  }

  return (
    <>
      <RequestLine>
        {t.caller.statusAnswerA}
        <Latin className="font-bold text-najm-green">{CASE_REF}</Latin>
        {t.caller.statusAnswerB}
      </RequestLine>

      <div className="rounded-card-lg border border-hair bg-[#F7FAF8] px-[14px] py-[12px]">
        <div className="mb-[9px] flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warn-dot" />
          <span className="text-[13px] font-semibold text-ink">{t.caller.statusLine}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-[2px] flex-none">
            <ArrowRightIcon />
          </span>
          <div className="text-[13px] leading-[1.55] text-ink-soft">
            <span className="font-semibold text-ink">{t.caller.nextStep}</span>{" "}
            {t.caller.nextStepBody}
          </div>
        </div>
        <div className="mt-[9px] flex items-center gap-[6px] text-[10px] text-[#7FA090]">
          <ClockIcon size={11} color="#7FA090" />
          {t.caller.answeredAt}
        </div>
      </div>

      <button
        onClick={() => {
          fileComplaint();
          setFiled(true);
        }}
        className="mt-[10px] w-full rounded-card border border-hair bg-white p-[12px] text-[14px] font-semibold text-ink-sub transition-colors hover:bg-[#F7FAF8]"
      >
        {t.caller.complaintCta}
      </button>

      {/* The payoff: hand the same case to the operations console. */}
      <Link
        href="/investigator"
        className="mt-[13px] flex w-full items-center justify-center gap-2 rounded-card bg-najm-green p-[13px] text-[15px] font-semibold text-white shadow-primary transition-colors hover:bg-najm-deep"
      >
        {t.caller.handoff}
        {/* "forward" is left in Arabic and right in English */}
        <span className={dir === "rtl" ? "-scale-x-100" : ""}>
          <ArrowRightIcon size={17} color="#fff" />
        </span>
      </Link>
    </>
  );
}
