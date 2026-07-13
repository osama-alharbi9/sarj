"use client";

import { useState } from "react";
import { useCases } from "@/lib/caseStore";
import {
  ACTIVE_STATUSES,
  INVESTIGATORS,
  ME,
  TOTAL_FIELDS,
  readiness,
  type Case,
  type Field,
  type Party,
  type Turn,
} from "@/lib/mockData";
import { useAge, useClock, useT } from "@/lib/strings";
import { useLocale, type L } from "@/lib/i18n";
import { ArrowRightIcon, CheckIcon, WarningTriangleIcon } from "../icons";
import { Latin, LanguageBadge, Tag } from "../ui";
import { Shell } from "../workspace/Chrome";
import { ContradictionTable } from "./ContradictionTable";
import { EscalateDialog, RequestInfoDialog, ResolveDialog } from "./Dialogs";

/**
 * The investigator's seat. Deliberately has no dashboard: he lives inside one
 * case for minutes at a time, and widgets are just things to look at instead of
 * the file. Inbox → case. That is the entire information architecture.
 */
export function InvestigatorWorkspace() {
  const { cases } = useCases();
  const t = useT();
  const [openRef, setOpenRef] = useState<string | null>(null);
  const inv = INVESTIGATORS.find((i) => i.id === ME)!;
  const me = { name: t.people[ME], initials: inv.initials, role: t.inv.role };

  const mine = cases.filter((c) => c.assignedTo === ME && ACTIVE_STATUSES.includes(c.status));
  const current = openRef ? cases.find((c) => c.ref === openRef) : undefined;

  return (
    <Shell
      nav={[{ key: "inbox", label: t.inv.inboxTitle }]}
      active="inbox"
      onNav={() => setOpenRef(null)}
      role={t.inv.role}
      who={me}
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
            <StatusChip c={current} />
          </div>
        ) : (
          <div>
            <h1 className="text-[16px] font-bold text-ink">{t.inv.inboxTitle}</h1>
            <div className="text-[11px] text-ink-muted">{t.inv.inboxSub}</div>
          </div>
        )
      }
    >
      {current ? (
        <CaseWorkspace c={current} onBack={() => setOpenRef(null)} />
      ) : (
        <Inbox cases={mine} onOpen={setOpenRef} />
      )}
    </Shell>
  );
}

/* ── Inbox — ordered by what blocks a decision, not by age ─────────── */

function Inbox({ cases, onOpen }: { cases: Case[]; onOpen: (r: string) => void }) {
  const age = useAge();
  // A case you cannot decide is more urgent than an old one you can.
  const score = (r: ReturnType<typeof readiness>) =>
    r.conflicts * 10 + r.missing + (r.waitingB ? 5 : 0);
  const ranked = [...cases].sort((a, b) => score(readiness(b)) - score(readiness(a)));

  return (
    <div className="flex flex-col gap-[10px]">
      {ranked.map((c) => {
        const r = readiness(c);
        return (
          <button
            key={c.ref}
            onClick={() => onOpen(c.ref)}
            className="flex items-center justify-between rounded-card-lg border border-hair bg-white px-[18px] py-[15px] text-start transition-colors hover:bg-[#F7FAF8]"
          >
            <div className="flex items-center gap-4">
              <div>
                <Latin className="text-[14px] font-bold text-ink">{c.ref}</Latin>
                <div className="mt-[4px] flex items-center gap-2">
                  <LanguageBadge lang={c.lang} />
                  <StatusChip c={c} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-[22px]">
              <Blockers c={c} />
              <span className="text-[12px] text-ink-muted">{age(c.ageMin)}</span>
              <ArrowRightIcon size={15} color="#8A988F" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** What is stopping this case from being decided, stated plainly. */
function Blockers({ c }: { c: Case }) {
  const t = useT();
  const { n } = useLocale();
  const r = readiness(c);
  if (r.ready) {
    return (
      <span className="inline-flex items-center gap-[6px] rounded-pill bg-ok-tint px-[10px] py-[5px] text-[12px] font-bold text-ok-text">
        <CheckIcon size={11} color="#0F7A50" width={3} />
        {t.inv.ready}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {r.conflicts > 0 && (
        <span className="inline-flex items-center gap-[5px] rounded-pill bg-warn-tint px-[10px] py-[5px] text-[12px] font-bold text-warn-text">
          <WarningTriangleIcon size={11} color="#B8791A" />
          {n(r.conflicts)} {r.conflicts === 1 ? t.inv.conflict : t.inv.conflicts}
        </span>
      )}
      {r.waitingB && (
        <span className="rounded-pill bg-[#EEF1EF] px-[10px] py-[5px] text-[12px] font-semibold text-ink-muted">
          {t.inv.waitingB}
        </span>
      )}
      {r.missing > 0 && !r.waitingB && (
        <span className="rounded-pill bg-[#EEF1EF] px-[10px] py-[5px] text-[12px] font-semibold text-ink-muted">
          {n(r.missing)} {t.inv.missing}
        </span>
      )}
    </div>
  );
}

function StatusChip({ c }: { c: Case }) {
  const t = useT();
  const tone =
    c.status === "emergency"
      ? "bg-danger-tint text-danger-text" // red = human safety, only
      : c.status === "escalated"
        ? "bg-warn-tint text-warn-text"
        : c.status === "resolved"
          ? "bg-[#EEF1EF] text-ink-muted"
          : "bg-najm-tint text-najm-green";
  return (
    <span className={`inline-flex rounded-pill px-[9px] py-[4px] text-[11px] font-bold ${tone}`}>
      {t.status[c.status]}
    </span>
  );
}

/* ── The case workspace ─────────────────────────────────────────────
   Three columns in the investigator's reading order: what the AI concluded and
   what he can do about it (right, the RTL start), the two stories side by side
   (centre), the raw evidence he can fall back to (left). */

function CaseWorkspace({ c, onBack }: { c: Case; onBack: () => void }) {
  const { escalate, requestInfo, resolveCase, noteProgress } = useCases();
  const t = useT();
  const { p } = useLocale();
  const clock = useClock();
  const [dialog, setDialog] = useState<"escalate" | "request" | "resolve" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const a = c.parties.find((x) => x.role === "A");
  const b = c.parties.find((x) => x.role === "B");

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3200);
  };

  return (
    <div className="grid grid-cols-[330px_1fr_290px] gap-[16px]">
      {/* ── decision column (right) ── */}
      <div className="flex flex-col gap-[14px]">
        <Classification c={c} />

        <Panel title={t.inv.summaryTitle} ai>
          <p className="text-[13px] leading-[1.9] text-ink-soft">{p(c.aiSummary)}</p>
        </Panel>

        <Readiness c={c} />

        {c.escalation && (
          <div className="rounded-card-lg border border-[#EFD9AE] bg-warn-tint p-[14px]">
            <div className="text-[12px] font-bold text-warn-text">
              {c.escalation.mode === "advice" ? t.escalate.advice : t.escalate.transfer} —{" "}
              {t.reasons[c.escalation.reason]}
            </div>
            <div className="mt-[5px] text-[12px] leading-[1.7] text-ink-soft">
              {typeof c.escalation.note === "string" ? c.escalation.note : p(c.escalation.note)}
            </div>
          </div>
        )}

        {c.verdict && (
          <div className="rounded-card-lg border border-najm-border bg-najm-tint p-[14px] text-[13px] font-bold text-najm-green">
            {p(c.verdict)}
          </div>
        )}

        <div className="flex flex-col gap-[8px]">
          <Action label={t.inv.actContinue} onClick={() => { noteProgress(c.ref); flash(t.inv.progressLogged); }} />
          <Action label={t.inv.actRequest} onClick={() => setDialog("request")} />
          <Action label={t.inv.actEscalate} onClick={() => setDialog("escalate")} />
          <Action label={t.inv.actResolve} primary onClick={() => setDialog("resolve")} />
        </div>

        <Panel title={t.inv.timeline}>
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
        </Panel>
      </div>

      {/* ── comparison column (centre) ── */}
      <div className="flex flex-col gap-[14px]">
        {a && b ? (
          <>
            <div className="grid grid-cols-2 gap-[14px]">
              <Narrative title={t.inv.narrativeA} party={a} />
              <Narrative title={t.inv.narrativeB} party={b} />
            </div>
            <ContradictionTable claims={c.claims} />
          </>
        ) : (
          <div className="rounded-card-lg border border-dashed border-[#CFDAD4] bg-white p-[40px] text-center">
            <div className="text-[14px] font-bold text-ink">{t.inv.waitingB}</div>
            <div className="mt-[6px] text-[12px] text-ink-muted">{t.inv.noCompare}</div>
          </div>
        )}

        {a && <Transcript party={a} />}
        {b && <Transcript party={b} />}
      </div>

      {/* ── evidence column (left) ── */}
      <div className="flex flex-col gap-[14px]">
        <Panel title={t.inv.fieldsTitle} ai>
          <div className="-mt-[6px]">
            {c.fields.map((f, i) => (
              <FieldRow key={f.label.en} f={f} last={i === c.fields.length - 1} />
            ))}
          </div>
        </Panel>

        {c.evidence.length > 0 && (
          <Panel title={t.inv.evidenceTitle}>
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
          </Panel>
        )}
      </div>

      {dialog === "escalate" && (
        <EscalateDialog
          onClose={() => setDialog(null)}
          onSend={(e) => {
            escalate(c.ref, e);
            setDialog(null);
            flash(t.escalate.sent);
            onBack();
          }}
        />
      )}
      {dialog === "request" && (
        <RequestInfoDialog
          c={c}
          onClose={() => setDialog(null)}
          onSend={(party, topic) => {
            requestInfo(c.ref, party, topic);
            setDialog(null);
            flash(`${t.requestInfo.willCall} ${party === "A" ? t.inv.pA : t.inv.pB}`);
          }}
        />
      )}
      {dialog === "resolve" && (
        <ResolveDialog
          c={c}
          onClose={() => setDialog(null)}
          onConfirm={(faultA) => {
            resolveCase(c.ref, faultA);
            setDialog(null);
            flash(t.resolve.issued);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 start-1/2 z-50 -translate-x-1/2 animate-fade-in rounded-card bg-najm-deep px-[18px] py-[12px] text-[13px] font-semibold text-white shadow-bezel">
          {toast}
        </div>
      )}
    </div>
  );
}

/**
 * Automatic classification. Every one of these is a reading the model made, so
 * the whole panel is violet — except the emergency tag, which is red because red
 * is reserved for human safety and this is the one case where it applies.
 */
function Classification({ c }: { c: Case }) {
  const t = useT();
  const { p } = useLocale();
  const emergency = Boolean(c.emergency);

  return (
    <div className="rounded-card-lg border border-hair bg-white p-[14px]">
      <div className="mb-[9px] text-[11px] font-semibold text-ink-muted">
        {t.inv.classification}
      </div>
      <div className="flex flex-wrap gap-[6px]">
        <Tag label={t.inv.tagAccident} tone="najm" />
        <Tag label={`${t.langName[c.lang.toLowerCase() as "ar" | "ur" | "en"]} · ${t.inv.tagDetected}`} tone="sarj" />
        {emergency ? (
          <Tag label={c.emergency ? p(c.emergency.trigger) : t.inv.tagEmergency} tone="danger" />
        ) : (
          <Tag label={t.inv.tagNoInjuries} tone="ok" />
        )}
      </div>
    </div>
  );
}

/* ── Readiness: replaces "٩/٩" ──────────────────────────────────────
   Fields present is only one input. A complete file with two open conflicts is
   not a decidable file, and pretending otherwise is how a verdict comes back
   through the objection committee three to ten days later. */

function Readiness({ c }: { c: Case }) {
  const t = useT();
  const { n } = useLocale();
  const r = readiness(c);
  return (
    <div
      className={`rounded-card-lg border p-[14px] ${
        r.ready ? "border-najm-border bg-najm-tint" : "border-[#EFD9AE] bg-warn-tint"
      }`}
    >
      <div className="flex items-center gap-[7px]">
        {r.ready ? (
          <CheckIcon size={14} color="#0F5C43" width={3} />
        ) : (
          <WarningTriangleIcon size={14} color="#B8791A" />
        )}
        <span
          className={`text-[13px] font-bold ${r.ready ? "text-najm-green" : "text-warn-text"}`}
        >
          {r.ready ? t.inv.ready : t.inv.notReady}
        </span>
      </div>

      <div className="mt-[10px] flex flex-col gap-[5px]">
        <Line
          ok={r.conflicts === 0}
          text={
            r.conflicts === 0
              ? t.inv.noConflict
              : `${n(r.conflicts)} ${r.conflicts === 1 ? t.inv.conflict : t.inv.conflicts}`
          }
        />
        <Line
          ok={r.missing === 0}
          text={
            r.missing === 0
              ? `${t.inv.complete} ${n(c.fieldsResolved)}/${n(TOTAL_FIELDS)}`
              : `${n(r.missing)} ${t.inv.missing}`
          }
        />
        {r.waitingB && <Line ok={false} text={t.inv.waitingB} />}
      </div>
    </div>
  );
}

function Line({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-[7px] text-[12px] text-ink-soft">
      {ok ? (
        <CheckIcon size={10} color="#0F7A50" width={3} />
      ) : (
        <span className="h-[5px] w-[5px] rounded-full bg-warn-dot" />
      )}
      {text}
    </div>
  );
}

function Narrative({ title, party }: { title: string; party: Party }) {
  const { p } = useLocale();
  return (
    <div className="rounded-card-lg border border-hair bg-white p-[15px]">
      <div className="mb-[9px] flex items-center justify-between">
        <span className="text-[13px] font-bold text-ink">{title}</span>
        <LanguageBadge lang={party.lang} />
      </div>
      <div dir="rtl" className="mb-[9px] text-[12px] font-semibold tracking-[1px] text-ink-sub">
        {party.plate}
      </div>
      <p className="text-[13px] leading-[1.9] text-ink-soft">{p(party.narrative)}</p>
    </div>
  );
}

/** A plate or an ID is evidence: identical in every locale. Prose is not. */
function FieldRow({ f, last }: { f: Field; last: boolean }) {
  const { p } = useLocale();
  const value = typeof f.value === "string" ? f.value : p(f.value);
  return (
    <div
      className={`flex items-start justify-between gap-2 py-[9px] ${
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

/**
 * Verbatim, and therefore never translated: he spoke Urdu, so the record says
 * Urdu. It is the gloss beneath that follows the operator's language.
 */
function Transcript({ party }: { party: Party }) {
  const t = useT();
  const { p } = useLocale();
  const label = party.role === "A" ? t.inv.pA : t.inv.pB;

  return (
    <Panel title={`${t.inv.transcript} — ${label}`} ai>
      <div className="flex flex-col gap-[10px]">
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
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Panel({
  title,
  ai,
  children,
}: {
  title: string;
  ai?: boolean;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <div
      className={`overflow-hidden rounded-card-lg border bg-white ${
        ai ? "border-sarj-border" : "border-hair"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-[15px] py-[11px] ${
          ai ? "border-sarj-border-soft bg-sarj-tint" : "border-hair-inner"
        }`}
      >
        <span
          className={`text-[13px] font-bold ${ai ? "text-sarj-hover" : "text-ink"}`}
        >
          {title}
        </span>
        {ai && (
          <span
            dir="ltr"
            className="font-latin text-[9px] font-bold tracking-[.4px] text-sarj-violet"
          >
            {t.inv.engine}
          </span>
        )}
      </div>
      <div className="p-[15px]">{children}</div>
    </div>
  );
}

function Action({
  label,
  primary,
  onClick,
}: {
  label: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-card px-[14px] py-[11px] text-[13px] font-semibold transition-colors ${
        primary
          ? "bg-najm-green text-white shadow-primary-sm hover:bg-najm-deep"
          : "border border-hair bg-white text-ink-sub hover:bg-[#F7FAF8]"
      }`}
    >
      {label}
    </button>
  );
}
