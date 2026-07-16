"use client";

import { useState } from "react";
import { useCases } from "@/lib/caseStore";
import {
  COMPLAINT_SLA_DAYS,
  INVESTIGATORS,
  SUPERVISOR_INITIALS,
  TOTAL_FIELDS,
  activeCountFor,
  oldestAgeFor,
  readiness,
  atRisk,
  miscategorised,
  type Case,
  type CaseStatus,
  type Complaint,
  type Field,
  type InvId,
  type Party,
} from "@/lib/mockData";
import { useAge, useClock, useT } from "@/lib/strings";
import { useLocale } from "@/lib/i18n";
import { ArrowRightIcon, CheckIcon, PersonIcon, WarningTriangleIcon } from "../icons";
import { Latin, LanguageBadge } from "../ui";
import { Shell } from "../workspace/Chrome";
import { ContradictionTable } from "../investigator/ContradictionTable";

/**
 * The operations centre. Not a dashboard — every widget answers a question
 * somebody has to act on. Anything that only reports a number lives on أداء
 * الذكاء, where it is honestly labelled as a review artefact.
 */
export function OpsCenter() {
  const { cases } = useCases();
  const t = useT();
  const [tab, setTab] = useState("dashboard");
  const [openRef, setOpenRef] = useState<string | null>(null);

  const nav = [
    { key: "dashboard", label: t.nav.dashboard },
    { key: "cases", label: t.nav.cases },
    { key: "complaints", label: t.nav.complaints },
  ];
  const supervisor = {
    name: t.people.supervisor,
    initials: SUPERVISOR_INITIALS,
    role: t.people.supervisorRole,
  };

  const current = openRef ? cases.find((c) => c.ref === openRef) : undefined;
  const section = current ? t.packet.title : nav.find((x) => x.key === tab)!.label;

  return (
    <Shell
      nav={nav}
      active={tab}
      onNav={(k) => {
        setTab(k);
        setOpenRef(null);
      }}
      role={t.ops.role}
      who={supervisor}
      section={
        current ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenRef(null)}
              aria-label={t.back}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-chip border border-hair text-ink-sub transition-colors hover:bg-[#F7FAF8]"
            >
              <ArrowRightIcon size={15} color="#5B6B63" />
            </button>
            <Latin className="text-[16px] font-bold text-ink">{current.ref}</Latin>
          </div>
        ) : (
          <div>
            <h1 className="text-[16px] font-bold text-ink">{section}</h1>
            {tab === "dashboard" && (
              <div className="text-[11px] text-ink-muted">{t.ops.dashSub}</div>
            )}
          </div>
        )
      }
    >
      {current ? (
        <CaseView c={current} onBack={() => setOpenRef(null)} />
      ) : tab === "dashboard" ? (
        <Dashboard onOpen={setOpenRef} />
      ) : tab === "cases" ? (
        <Ledger onOpen={setOpenRef} />
      ) : (
        <Complaints />
      )}
    </Shell>
  );
}

/* ══ Dashboard ══════════════════════════════════════════════════════
   One screen, everything on it: what is on fire, what is talking, what needs a
   human, where the work is piling up, who can take it, and how well the
   assistant is actually performing. */

function Dashboard({ onOpen }: { onOpen: (r: string) => void }) {
  const { cases, takeOverLive } = useCases();
  const t = useT();
  const { p, n } = useLocale();
  const age = useAge();

  // Emergencies are handled by the AI protocol before this screen — they are
  // not a supervisor dispatch decision, so the dashboard does not surface them.
  const live = cases.filter((c) => c.status === "intake");
  const escalations = cases.filter((c) => c.escalation);

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-[1fr_360px] gap-[16px]">
        <div className="flex flex-col gap-[16px]">
          {/* live intake — a widget, not a workflow */}
          <Card title={t.ops.liveTitle} count={live.length}>
            {live.length === 0 ? (
              <Empty text={t.ops.liveEmpty} />
            ) : (
              <div className="grid grid-cols-2 gap-[10px]">
                {live.map((c) => (
                  <div
                    key={c.ref}
                    className="rounded-card border border-sarj-border bg-sarj-tint p-[13px]"
                  >
                    <div className="flex items-center justify-between">
                      <Latin className="text-[13px] font-bold text-ink">{c.ref}</Latin>
                      <span className="flex items-center gap-[5px]">
                        <span className="h-[7px] w-[7px] animate-softglow rounded-full bg-sarj-violet" />
                        <LanguageBadge lang={c.lang} />
                      </span>
                    </div>
                    <div className="mt-[9px] flex items-center justify-between text-[11px] text-sarj-hover">
                      <span>
                        {n(c.captured ?? 0)} / {n(TOTAL_FIELDS)} {t.ops.captured}
                      </span>
                      <span>{age(c.ageMin)}</span>
                    </div>
                    <div className="mt-[7px] h-[5px] overflow-hidden rounded-[6px] bg-white">
                      <div
                        className="h-full rounded-[6px] bg-sarj-violet"
                        style={{ width: `${((c.captured ?? 0) / TOTAL_FIELDS) * 100}%` }}
                      />
                    </div>

                    {/* The supervisor can pull any live call off the assistant. */}
                    {c.takenOver ? (
                      <div className="mt-[10px] flex items-center justify-center gap-[6px] rounded-chip bg-najm-tint py-[7px] text-[12px] font-bold text-najm-green">
                        <PersonIcon size={12} color="#0F5C43" />
                        {t.ops.takenOver}
                      </div>
                    ) : (
                      <button
                        onClick={() => takeOverLive(c.ref)}
                        className="mt-[10px] w-full rounded-chip border border-najm-border bg-white py-[7px] text-[12px] font-bold text-najm-green transition-colors hover:bg-najm-tint"
                      >
                        {t.ops.takeOver}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* the supervisor's actual worklist */}
          <Card title={t.ops.attentionTitle} sub={t.ops.attentionSub} count={escalations.length}>
            {escalations.length === 0 ? (
              <Empty text={t.ops.attentionEmpty} />
            ) : (
              <div className="flex flex-col gap-[9px]">
                {escalations.map((c) => {
                  const inv = INVESTIGATORS.find((i) => i.id === c.escalation!.by);
                  return (
                    <button
                      key={c.ref}
                      onClick={() => onOpen(c.ref)}
                      className="rounded-card border border-[#EFD9AE] bg-warn-tint px-[14px] py-[12px] text-start transition-colors hover:bg-[#F8EFDC]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[9px]">
                          {/* a person raised this — not the model */}
                          <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-white text-[10px] font-bold text-ink-sub">
                            {inv?.initials ?? "—"}
                          </span>
                          <Latin className="text-[13px] font-bold text-ink">{c.ref}</Latin>
                          <span className="rounded-pill bg-white px-[8px] py-[3px] text-[11px] font-bold text-warn-text">
                            {c.escalation!.mode === "advice" ? t.escalate.advice : t.escalate.transfer}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink-muted">{age(c.ageMin)}</span>
                      </div>
                      <div className="mt-[7px] text-[12px] font-semibold text-warn-text">
                        {t.reasons[c.escalation!.reason]}
                      </div>
                      <div className="mt-[3px] line-clamp-2 text-[12px] leading-[1.6] text-ink-soft">
                        {typeof c.escalation!.note === "string" ? c.escalation!.note : p(c.escalation!.note)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title={t.ops.activityTitle}>
            <Activity cases={cases} />
          </Card>
        </div>

        <div className="flex flex-col gap-[16px]">
          <Card title={t.ops.rosterTitle}>
            <RosterList cases={cases} compact />
          </Card>

          <Card title={t.aiPerf.langTitle} sub={t.aiPerf.langNote}>
            <div className="flex flex-col gap-[10px]">
              {t.aiPerf.langs.map((l) => (
                <div key={l.label}>
                  <div className="mb-[5px] flex items-baseline justify-between">
                    <span className="text-[12px] font-semibold text-sarj-hover">{l.label}</span>
                    <span className="text-[13px] font-bold text-sarj-deep">{n(l.pct)}%</span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded-[6px] bg-[#ECEFED]">
                    <div
                      className="h-full rounded-[6px] bg-sarj-violet"
                      style={{ width: `${l.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Activity({ cases }: { cases: Case[] }) {
  const { p } = useLocale();
  const clock = useClock();
  const events = cases
    .flatMap((c) => c.timeline.map((t) => ({ ...t, ref: c.ref })))
    .slice(-7)
    .reverse();

  return (
    <div className="flex flex-col gap-[9px]">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-[9px]">
          <span className="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-[#C6D2CB]" />
          <div className="flex-1">
            <div className="text-[12px] leading-[1.6] text-ink-soft">{p(e.text)}</div>
            <div className="mt-[2px] flex items-center gap-2 text-[10px] text-ink-faint-2">
              <Latin>{e.ref}</Latin>
              <span>·</span>
              <span>{clock(e.at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══ Investigator load ══════════════════════════════════════════════
   A monitoring view of who is free and who is drowning — read-only, because
   routine assignment is automatic. Rendered inside the Dashboard's side rail. */

function RosterList({ cases, compact }: { cases: Case[]; compact?: boolean }) {
  const t = useT();
  const { n } = useLocale();
  const age = useAge();
  return (
    <div className="flex flex-col gap-[10px]">
      {INVESTIGATORS.map((i) => {
        const load = activeCountFor(cases, i.id);
        const oldest = oldestAgeFor(cases, i.id);
        const pctFull = Math.min(100, (load / i.capacity) * 100);
        const full = load >= i.capacity;

        const status = i.away
          ? t.ops.away
          : full
            ? t.ops.full
            : load >= i.capacity - 1
              ? t.ops.loaded
              : t.ops.available;
        const tone = i.away
          ? "bg-[#EEF1EF] text-ink-muted"
          : full
            ? "bg-warn-tint text-warn-text"
            : "bg-ok-tint text-ok-text";

        return (
          <div key={i.id} className="rounded-card border border-hair bg-white p-[13px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[9px]">
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-najm-tint text-[11px] font-bold text-najm-green">
                  {i.initials}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-ink">{t.people[i.id]}</div>
                  {!compact && oldest > 0 && (
                    <div className="text-[11px] text-ink-muted">
                      {t.ops.oldest}: {age(oldest)}
                    </div>
                  )}
                </div>
              </div>
              <span className={`rounded-pill px-[9px] py-[4px] text-[11px] font-bold ${tone}`}>
                {status}
              </span>
            </div>

            <div className="mt-[10px] flex items-center gap-[9px]">
              <div className="h-[6px] flex-1 overflow-hidden rounded-[6px] bg-[#ECEFED]">
                <div
                  className={`h-full rounded-[6px] ${full ? "bg-warn-dot" : "bg-najm-green"}`}
                  style={{ width: `${pctFull}%` }}
                />
              </div>
              <span className="whitespace-nowrap text-[11px] font-bold text-ink-soft">
                {n(load)} / {n(i.capacity)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══ القضايا — the ledger ═══════════════════════════════════════════ */

function Ledger({ onOpen }: { onOpen: (r: string) => void }) {
  const { cases } = useCases();
  const t = useT();
  const { n } = useLocale();
  const age = useAge();

  return (
    <div className="overflow-hidden rounded-card-lg border border-hair bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F7FAF8]">
            {[t.ledger.ref, t.ledger.status, t.ledger.lang, t.ledger.completeness, t.ledger.investigator, t.ledger.age].map((c) => (
              <th
                key={c}
                className="border-b border-hair-inner px-[16px] py-[10px] text-start text-[11px] font-semibold text-ink-muted"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const inv = INVESTIGATORS.find((i) => i.id === c.assignedTo);
            const r = readiness(c);
            return (
              <tr
                key={c.ref}
                onClick={() => onOpen(c.ref)}
                className={`cursor-pointer border-b border-hair-inner last:border-b-0 transition-colors ${
                  c.status === "emergency"
                    ? "border-s-[3px] border-s-danger-text bg-danger-row hover:bg-[#FBEBE8]"
                    : c.escalation
                      ? "border-s-[3px] border-s-warn-dot bg-[#FDF8EE] hover:bg-[#FBF2E0]"
                      : c.isDemoCase
                        ? "bg-[#F3F8F5] hover:bg-[#EDF5F0]"
                        : "hover:bg-[#F7FAF8]"
                }`}
              >
                <td className="px-[16px] py-[12px]">
                  <Latin className="text-[13px] font-bold text-ink">{c.ref}</Latin>
                </td>
                <td className="px-[16px] py-[12px]">
                  <span
                    className={`inline-flex rounded-pill px-[9px] py-[4px] text-[11px] font-bold ${
                      c.status === "emergency"
                        ? "bg-danger-tint text-danger-text"
                        : c.status === "escalated"
                          ? "bg-warn-tint text-warn-text"
                          : c.status === "resolved"
                            ? "bg-[#EEF1EF] text-ink-muted"
                            : "bg-najm-tint text-najm-green"
                    }`}
                  >
                    {t.status[c.status]}
                  </span>
                </td>
                <td className="px-[16px] py-[12px]">
                  <LanguageBadge lang={c.lang} />
                </td>
                <td className="px-[16px] py-[12px]">
                  <div className="flex items-center gap-[8px]">
                    <div className="h-[5px] w-[54px] overflow-hidden rounded-[6px] bg-[#ECEFED]">
                      <div
                        className={`h-full rounded-[6px] ${r.missing === 0 ? "bg-ok-text" : "bg-warn-dot"}`}
                        style={{ width: `${(c.fieldsResolved / TOTAL_FIELDS) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-ink-soft">
                      {n(c.fieldsResolved)}/{n(TOTAL_FIELDS)}
                    </span>
                  </div>
                </td>
                <td className="px-[16px] py-[12px] text-[12px] text-ink-soft">
                  {inv ? t.people[inv.id] : "—"}
                </td>
                <td className="px-[16px] py-[12px] text-[12px] text-ink-muted">
                  {c.status === "resolved" ? "—" : age(c.ageMin)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ══ Case view — the escalation packet ══════════════════════════════
   The investigator's note is the first thing the supervisor reads; everything
   he would otherwise have had to re-explain is already attached below it. */

function CaseView({ c, onBack }: { c: Case; onBack: () => void }) {
  const { replyAdvice, takeOver, reassign } = useCases();
  const t = useT();
  const { p } = useLocale();
  const clock = useClock();
  const [note, setNote] = useState("");
  const inv = INVESTIGATORS.find((i) => i.id === c.escalation?.by);
  const a = c.parties.find((x) => x.role === "A");
  const b = c.parties.find((x) => x.role === "B");

  return (
    <div className="flex flex-col gap-[16px]">
      {c.emergency && (
        <div className="rounded-card-lg border-s-[4px] border-s-danger-text bg-danger-tint px-[18px] py-[14px]">
          <div className="flex items-center gap-[9px]">
            <WarningTriangleIcon size={16} color="#C0392B" />
            <span className="text-[14px] font-bold text-danger-text">
              {t.ops.emergencyBand} — {p(c.emergency.trigger)}
            </span>
          </div>
          <div className="mt-[5px] text-[12px] text-ink-soft">
            {t.ops.detectedDuring} {clock(c.emergency.at)}. {t.ops.neverQueued}
          </div>
        </div>
      )}

      {c.escalation && (
        <div className="rounded-card-lg border border-[#EFD9AE] bg-warn-tint p-[18px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <span className="flex h-[32px] w-[32px] flex-none items-center justify-center rounded-full bg-white font-latin text-[11px] font-bold text-ink-sub">
                {inv?.initials}
              </span>
              <div>
                <div className="text-[13px] font-bold text-ink">
                  {t.packet.from}: {inv ? t.people[inv.id] : "—"}
                </div>
                <div className="text-[11px] text-warn-text">
                  {c.escalation.mode === "advice" ? t.packet.modeAdvice : t.packet.modeTransfer}
                </div>
              </div>
            </div>
            <span className="rounded-pill bg-white px-[10px] py-[5px] text-[12px] font-bold text-warn-text">
              {t.reasons[c.escalation.reason]}
            </span>
          </div>

          <div className="mt-[13px] rounded-card bg-white p-[13px]">
            <div className="mb-[5px] text-[11px] font-semibold text-ink-muted">{t.packet.note}</div>
            <div className="text-[13px] leading-[1.8] text-ink">
              {typeof c.escalation.note === "string" ? c.escalation.note : p(c.escalation.note)}
            </div>
          </div>

          <div className="mt-[13px] flex items-end gap-[10px]">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.packet.replyPlaceholder}
              className="flex-1 rounded-chip border border-hair bg-white px-[13px] py-[10px] text-[13px] text-ink outline-none placeholder:text-ink-faint-2 focus:border-najm-green"
            />
            <button
              disabled={!note.trim()}
              onClick={() => {
                replyAdvice(c.ref, note.trim());
                onBack();
              }}
              className={`rounded-chip px-[16px] py-[10px] text-[13px] font-semibold text-white transition-colors ${
                note.trim() ? "bg-najm-green hover:bg-najm-deep" : "cursor-not-allowed bg-[#B4C0B9]"
              }`}
            >
              {t.packet.reply}
            </button>
            <button
              onClick={() => {
                takeOver(c.ref);
                onBack();
              }}
              className="rounded-chip border border-hair bg-white px-[14px] py-[10px] text-[13px] font-semibold text-ink-sub transition-colors hover:bg-[#F7FAF8]"
            >
              {t.packet.takeOver}
            </button>
            <button
              onClick={() => {
                const free = INVESTIGATORS.find((i) => !i.away && i.id !== c.escalation?.by);
                if (free) reassign(c.ref, free.id);
                onBack();
              }}
              className="rounded-chip border border-hair bg-white px-[14px] py-[10px] text-[13px] font-semibold text-ink-sub transition-colors hover:bg-[#F7FAF8]"
            >
              {t.packet.reassign}
            </button>
          </div>
        </div>
      )}

      {/* everything the investigator would otherwise have had to repeat */}
      <div className="grid grid-cols-[1fr_320px] gap-[16px]">
        <div className="flex flex-col gap-[14px]">
          <div className="rounded-card-lg border border-sarj-border bg-white">
            <div className="border-b border-sarj-border-soft bg-sarj-tint px-[16px] py-[11px] text-[13px] font-bold text-sarj-hover">
              {t.inv.summaryTitle}
            </div>
            <p className="p-[16px] text-[13px] leading-[1.9] text-ink-soft">{p(c.aiSummary)}</p>
          </div>

          {c.claims.length > 0 && <ContradictionTable claims={c.claims} />}

          {[a, b].filter(Boolean).map((party) => (
            <TranscriptPane key={party!.role} party={party!} />
          ))}
        </div>

        <div className="flex flex-col gap-[14px]">
          <div className="overflow-hidden rounded-card-lg border border-sarj-border bg-white">
            <div className="border-b border-sarj-border-soft bg-sarj-tint px-[16px] py-[11px] text-[13px] font-bold text-sarj-hover">
              {t.inv.fieldsTitle}
            </div>
            <div className="px-[16px]">
              {c.fields.map((f, i) => (
                <FieldRow key={f.label.en} f={f} last={i === c.fields.length - 1} />
              ))}
            </div>
          </div>

          {c.evidence.length > 0 && (
            <div className="rounded-card-lg border border-hair bg-white p-[16px]">
              <div className="mb-[9px] text-[13px] font-bold text-ink">{t.inv.evidenceTitle}</div>
              <div className="flex flex-col gap-[7px]">
                {c.evidence.map((e) => (
                  <div
                    key={e.en}
                    className="rounded-chip border border-hair bg-[#F7FAF8] px-[11px] py-[9px] text-[12px] text-ink-soft"
                  >
                    {p(e)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-card-lg border border-hair bg-white p-[16px]">
            <div className="mb-[10px] text-[13px] font-bold text-ink">{t.inv.timeline}</div>
            <div className="flex flex-col gap-[9px]">
              {c.timeline.map((e, i) => (
                <div key={i} className="flex gap-[9px]">
                  <span className="mt-[5px] h-[6px] w-[6px] flex-none rounded-full bg-[#C6D2CB]" />
                  <div>
                    <div className="text-[12px] leading-[1.6] text-ink-soft">{p(e.text)}</div>
                    <div className="text-[10px] text-ink-faint-2">{clock(e.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Verbatim, and therefore never translated: he spoke Urdu, so the record says
 * Urdu. The gloss beneath is what follows the operator's language.
 */
function TranscriptPane({ party }: { party: Party }) {
  const t = useT();
  const { p } = useLocale();
  const label = party.role === "A" ? t.inv.pA : t.inv.pB;

  return (
    <div className="rounded-card-lg border border-hair bg-white">
      <div className="flex items-center justify-between border-b border-hair-inner px-[16px] py-[11px]">
        <span className="text-[13px] font-bold text-ink">
          {t.inv.transcript} — {label}
        </span>
        <LanguageBadge lang={party.lang} />
      </div>
      <div className="flex flex-col gap-[10px] p-[16px]">
        {party.transcript.map((turn) => {
          const agent = turn.speaker === "agent";
          const who = `${agent ? t.inv.assistant : label} · ${t.langName[turn.script]}`;
          return (
            <div key={turn.id}>
              <div
                className={`mb-[3px] text-[10px] font-semibold ${
                  agent ? "text-najm-green" : "text-end text-ink-muted"
                }`}
              >
                {who}
              </div>
              <div
                className={`rounded-card px-[12px] py-[9px] ${
                  turn.flagged
                    ? "border-s-[3px] border-s-danger-text bg-danger-tint"
                    : agent
                      ? "border border-najm-border bg-najm-tint"
                      : "ms-auto w-fit max-w-[85%] border border-hair bg-[#F7FAF8]"
                }`}
              >
                {turn.script === "ur" ? (
                  <div dir="rtl" className="font-ur text-[14px] leading-[2] text-ink">
                    {turn.text}
                  </div>
                ) : (
                  <div dir="rtl" className="text-[13px] leading-[1.7] text-ink">
                    {turn.text}
                  </div>
                )}
                {turn.gloss && (
                  <div className="mt-1 text-[11px] text-ink-gloss">{p(turn.gloss)}</div>
                )}
                {turn.flagged && (
                  <div className="mt-[8px] border-t border-dashed border-[#EFC9C3] pt-[6px]">
                    <span className="inline-flex items-center gap-[5px] rounded-pill bg-sarj-tint px-[8px] py-[3px] text-[10px] font-bold text-sarj-hover">
                      <WarningTriangleIcon size={10} color="#6C5CE7" />
                      {t.packet.emergencyReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A plate or an ID is evidence: identical in every locale. Prose is not. */
function FieldRow({ f, last }: { f: Field; last: boolean }) {
  const { p } = useLocale();
  const value = typeof f.value === "string" ? f.value : p(f.value);
  return (
    <div
      className={`flex items-start justify-between gap-2 py-[10px] ${
        last ? "" : "border-b border-hair-inner"
      }`}
    >
      <span className="text-[11px] text-ink-muted">{p(f.label)}</span>
      <span
        dir={f.latin ? "ltr" : typeof f.value === "string" ? "rtl" : undefined}
        className={`text-end text-[12px] font-semibold ${f.spaced ? "tracking-[1px]" : ""} ${
          f.bad ? "text-danger-text" : f.good ? "text-ok-text" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}


/* ══ Complaints ═════════════════════════════════════════════════════
   Not fault determination, so this never reaches an investigator. The value is
   that the queue arrives already triaged: the assistant assigns a type and an
   urgency at submission, and every row ages against Najm's 10-working-day
   commitment instead of sitting in one flat pile. */

function Complaints() {
  const { complaints } = useCases();
  const t = useT();
  const { p, n } = useLocale();
  const clock = useClock();

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="overflow-hidden rounded-card-lg border border-hair bg-white">
        <div className="flex items-center justify-between border-b border-hair-inner px-[18px] py-[15px]">
          <div>
            <div className="text-[15px] font-bold text-ink">{t.complaints.title}</div>
            <div className="mt-[2px] text-[12px] text-ink-muted">{t.complaints.sub}</div>
          </div>
          <span className="rounded-pill bg-najm-tint px-[10px] py-[4px] text-[12px] font-bold text-najm-green">
            {n(complaints.length)}
          </span>
        </div>

        {complaints.length === 0 ? (
          <div className="p-[18px]">
            <Empty text={t.complaints.empty} />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F7FAF8]">
                {[
                  t.complaints.ref,
                  t.complaints.relatedCase,
                  t.complaints.type,
                  t.complaints.urgency,
                  t.complaints.confidence,
                  t.complaints.department,
                  t.complaints.sla,
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-hair-inner px-[16px] py-[10px] text-start text-[11px] font-semibold text-ink-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr
                  key={c.ref}
                  className={`border-b border-hair-inner last:border-b-0 ${
                    atRisk(c) ? "border-s-[3px] border-s-warn-dot bg-[#FDF8EE]" : ""
                  }`}
                >
                  <td className="px-[16px] py-[13px] align-top">
                    <Latin className="text-[13px] font-bold text-ink">{c.ref}</Latin>
                    {/* the complaint in his own words — the reason it was classified */}
                    <div className="mt-[5px] max-w-[320px] text-[11px] leading-[1.6] text-ink-muted">
                      “{p(c.said)}”
                    </div>
                  </td>
                  <td className="px-[16px] py-[13px] align-top">
                    {c.aboutCase ? (
                      <Latin className="text-[12px] font-semibold text-ink-soft">
                        {c.aboutCase}
                      </Latin>
                    ) : (
                      <span className="text-[12px] text-ink-faint-2">{t.complaints.standalone}</span>
                    )}
                  </td>
                  <td className="px-[16px] py-[13px] align-top">
                    {/* The caller self-picks a category on Najm's form and often picks
                        wrong. Showing the override is the entire pitch of triage. */}
                    {miscategorised(c) && (
                      <div className="mb-[5px] flex items-center gap-[6px] text-[11px] text-ink-muted">
                        <span>{t.complaints.picked}:</span>
                        <span className="line-through">{t.complaints.types[c.pickedType]}</span>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-[6px] rounded-pill bg-sarj-tint px-[10px] py-[5px] text-[12px] font-bold text-sarj-hover">
                      <span className="h-[6px] w-[6px] rounded-full bg-sarj-violet" />
                      {t.complaints.types[c.type]}
                    </span>
                    {miscategorised(c) && (
                      <div className="mt-[5px] text-[10px] font-semibold text-sarj-violet">
                        {t.complaints.corrected}
                      </div>
                    )}
                  </td>
                  <td className="px-[16px] py-[13px] align-top">
                    <UrgencyChip u={c.urgency} />
                  </td>
                  {/* how sure the model is — its own reading, so violet */}
                  <td className="px-[16px] py-[13px] align-top">
                    <div className="flex items-center gap-[7px]">
                      <div className="h-[5px] w-[42px] overflow-hidden rounded-[6px] bg-[#ECEFED]">
                        <div
                          className="h-full rounded-[6px] bg-sarj-violet"
                          style={{ width: `${c.confidence}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-bold text-sarj-hover">
                        {n(c.confidence)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-[16px] py-[13px] align-top text-[12px] font-semibold text-ink-soft">
                    {t.departments[c.department]}
                  </td>
                  <td className="px-[16px] py-[13px] align-top">
                    <Sla c={c} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="border-t border-hair-inner bg-[#FAFBFA] px-[18px] py-[10px] text-[11px] text-ink-faint">
          {t.complaints.taxonomyNote}
        </div>
      </div>
    </div>
  );
}

function UrgencyChip({ u }: { u: Complaint["urgency"] }) {
  const t = useT();
  const tone =
    u === "high"
      ? "bg-warn-tint text-warn-text"
      : u === "medium"
        ? "bg-najm-tint text-najm-green"
        : "bg-[#EEF1EF] text-ink-muted";
  return (
    <span className={`inline-flex rounded-pill px-[10px] py-[5px] text-[12px] font-bold ${tone}`}>
      {t.complaints.urgencies[u]}
    </span>
  );
}

/** Ageing against the 10-working-day commitment — amber when it is about to breach. */
function Sla({ c }: { c: Complaint }) {
  const t = useT();
  const { n } = useLocale();
  const risk = atRisk(c);
  const pct = (c.daysLeft / COMPLAINT_SLA_DAYS) * 100;

  return (
    <div className="min-w-[110px]">
      <div className="mb-[5px] flex items-center gap-[7px]">
        <span
          className={`text-[12px] font-bold ${risk ? "text-warn-text" : "text-ink-soft"}`}
        >
          {n(c.daysLeft)} {c.daysLeft === 1 ? t.complaints.dayLeft : t.complaints.daysLeft}
        </span>
        {risk && (
          <span className="inline-flex items-center gap-[4px] rounded-pill bg-warn-tint px-[7px] py-[2px] text-[10px] font-bold text-warn-text">
            <WarningTriangleIcon size={9} color="#B8791A" />
            {t.complaints.atRisk}
          </span>
        )}
      </div>
      <div className="h-[5px] w-[100px] overflow-hidden rounded-[6px] bg-[#ECEFED]">
        <div
          className={`h-full rounded-[6px] ${risk ? "bg-warn-dot" : "bg-najm-green"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── shared bits ───────────────────────────────────────────────────── */

function Card({
  title,
  sub,
  count,
  children,
}: {
  title: string;
  sub?: string;
  count?: number;
  children: React.ReactNode;
}) {
  const { n } = useLocale();
  return (
    <div className="rounded-card-lg border border-hair bg-white p-[16px]">
      <div className="mb-[12px] flex items-baseline justify-between">
        <div>
          <span className="text-[14px] font-bold text-ink">{title}</span>
          {sub && <div className="mt-[2px] text-[11px] text-ink-muted">{sub}</div>}
        </div>
        {count !== undefined && count > 0 && (
          <span className="rounded-pill bg-najm-tint px-[9px] py-[3px] text-[12px] font-bold text-najm-green">
            {n(count)}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-card border border-dashed border-[#D5E0DA] bg-[#F7FAF8] py-[22px] text-center text-[12px] text-ink-faint">
      {text}
    </div>
  );
}
