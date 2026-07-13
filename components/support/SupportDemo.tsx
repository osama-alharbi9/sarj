"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useCases } from "@/lib/caseStore";
import {
  COMPLAINT_QUESTIONS,
  OBJECTION_QUESTIONS,
  SUPPORT_COMPLAINT,
  SUPPORT_OBJECTION,
  SUPPORT_PROMPTS,
  SUPPORT_STATUS,
  type SupportIntent,
  type SupportQuestion,
} from "@/lib/mockData";
import { useLocale } from "@/lib/i18n";
import { useClock, useT } from "@/lib/strings";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "../icons";
import { Latin } from "../ui";
import { Orb } from "../caller/Orb";
import { PhoneFrame } from "../caller/PhoneFrame";

/**
 * Customer support — the same conversational engine, the same phone, pointed at
 * Najm's other front door. Nothing here is a second product: it reuses the orb,
 * the card slot and the triage the complaints queue already runs on.
 *
 * The whole story is one line: he asks in his own words → the assistant works
 * out what he actually needs → it asks only what is missing → the human team
 * receives a structured request instead of free text.
 */

type Step =
  | { kind: "open" }
  | { kind: "clarify" }
  | { kind: "status" }
  | { kind: "asking"; intent: "complaint" | "objection"; q: number }
  | { kind: "review"; intent: "complaint" | "objection" }
  | { kind: "done"; intent: "complaint" | "objection" };

const STAGE_H = 1064;
const LAUNCHER_H = 60;

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

export function SupportDemo() {
  const [runKey, setRunKey] = useState(0);
  return <SupportRun key={runKey} onRestart={() => setRunKey((k) => k + 1)} />;
}

function SupportRun({ onRestart }: { onRestart: () => void }) {
  const t = useT();
  const { dir, p } = useLocale();
  const { submitSupport } = useCases();
  const scale = useFitScale();

  const [step, setStep] = useState<Step>({ kind: "open" });
  const [intent, setIntent] = useState<SupportIntent>("unclear");
  const [confidence, setConfidence] = useState(0);
  const [said, setSaid] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);

  /* The assistant "hears", then decides. The pause is the whole point of the
     intent step: it is doing something, not routing on a keyword. */
  const think = useCallback((next: Step) => {
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setStep(next);
    }, 750);
  }, []);

  const pick = (i: SupportIntent, conf: number, text?: string) => {
    setIntent(i);
    setConfidence(conf);
    if (text) setSaid(text);
    setAnswers([]);
    if (i === "unclear") return think({ kind: "clarify" });
    if (i === "status") return think({ kind: "status" });
    think({ kind: "asking", intent: i, q: 0 });
  };

  const questions: SupportQuestion[] =
    step.kind === "asking" || step.kind === "review" || step.kind === "done"
      ? step.intent === "complaint"
        ? COMPLAINT_QUESTIONS
        : OBJECTION_QUESTIONS
      : [];

  const answer = (label: string) => {
    if (step.kind !== "asking") return;
    const next = [...answers, label];
    setAnswers(next);
    if (step.q + 1 < questions.length) {
      think({ kind: "asking", intent: step.intent, q: step.q + 1 });
    } else {
      think({ kind: "review", intent: step.intent });
    }
  };

  const submit = () => {
    if (step.kind !== "review") return;
    submitSupport(step.intent === "complaint" ? SUPPORT_COMPLAINT : SUPPORT_OBJECTION);
    think({ kind: "done", intent: step.intent });
  };

  const orbState = thinking
    ? "speaking"
    : step.kind === "open" || step.kind === "clarify"
      ? "listening"
      : step.kind === "done"
        ? "idle"
        : "speaking";

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
            {t.support.eyebrow}
          </div>
          <div className="mt-1 text-[15px] text-ink-sub">{t.support.strapline}</div>
        </div>

        <PhoneFrame>
          <div dir={dir} className="flex h-full flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6">
              <Orb state={orbState} />

              {/* The one line of text on the empty screen: what he was asked, or
                  what the assistant just understood. */}
              {step.kind === "open" && !thinking && (
                <div className="animate-fade-in text-center text-[15px] font-semibold text-ink">
                  {t.support.opening}
                </div>
              )}

              {said && step.kind !== "open" && !thinking && (
                <IntentChip intent={intent} confidence={confidence} />
              )}
            </div>

            {!thinking && (
              <div className="flex-none animate-card-up rounded-t-[26px] border-t border-hair bg-white px-[18px] pb-[16px] pt-[15px] shadow-[0_-14px_40px_-20px_rgba(16,40,30,.25)]">
                {step.kind === "open" && (
                  <>
                    <Ask>{t.support.pickHint}</Ask>
                    <div className="flex flex-col gap-[8px]">
                      {SUPPORT_PROMPTS.map((s) => (
                        <Choice
                          key={s.id}
                          label={p(s.text)}
                          onClick={() => pick(s.intent, s.confidence, p(s.text))}
                        />
                      ))}
                    </div>
                  </>
                )}

                {step.kind === "clarify" && (
                  <>
                    <Ask>{t.support.unclear}</Ask>
                    <div className="flex flex-col gap-[8px]">
                      {(["status", "complaint", "objection"] as const).map((i) => (
                        <Choice
                          key={i}
                          label={t.support.intents[i]}
                          onClick={() => pick(i, 99)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {step.kind === "status" && <StatusResult onRestart={onRestart} />}

                {step.kind === "asking" && (
                  <>
                    {step.intent === "objection" && step.q === 0 && <ObjectionNotice />}
                    <Ask>{p(questions[step.q].ask)}</Ask>
                    <div className="flex flex-col gap-[8px]">
                      {questions[step.q].options.map((o) => (
                        <Choice key={o.id} label={p(o.label)} onClick={() => answer(p(o.label))} />
                      ))}
                    </div>
                  </>
                )}

                {step.kind === "review" && (
                  <ReviewCard intent={step.intent} answers={answers} onSubmit={submit} />
                )}

                {step.kind === "done" && (
                  <DoneCard intent={step.intent} onRestart={onRestart} />
                )}
              </div>
            )}
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}

/* ── bits, all borrowed from the existing system ───────────────────── */

function Ask({ children }: { children: React.ReactNode }) {
  return <div className="mb-[13px] text-[15px] font-semibold text-ink">{children}</div>;
}

function Choice({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-card border border-hair bg-[#F7FAF8] px-[14px] py-[12px] text-start text-[14px] font-semibold text-ink-sub transition-colors hover:border-najm-border hover:bg-najm-tint hover:text-najm-green"
    >
      {label}
    </button>
  );
}

/** The model's own reading of what he wants — so, violet. */
function IntentChip({ intent, confidence }: { intent: SupportIntent; confidence: number }) {
  const t = useT();
  const { n } = useLocale();
  return (
    <div className="flex animate-fade-in flex-col items-center gap-[6px]">
      <span className="inline-flex items-center gap-[7px] rounded-[20px] border border-sarj-border bg-sarj-tint px-[14px] py-[6px] text-[13px] font-semibold text-sarj-hover">
        <span className="h-[8px] w-[8px] rounded-full bg-sarj-violet" />
        {t.support.detected}: {t.support.intents[intent]}
      </span>
      <span className="text-[11px] text-ink-muted">
        {n(confidence)}% {t.support.confidence}
      </span>
    </div>
  );
}

function ObjectionNotice() {
  const t = useT();
  return (
    <div className="mb-[13px] rounded-card border border-najm-border bg-najm-tint p-[12px] text-[13px] font-semibold leading-[1.6] text-najm-green">
      {t.support.objectionRoute}
    </div>
  );
}

/* ── Intent 1: status ──────────────────────────────────────────────── */

function StatusResult({ onRestart }: { onRestart: () => void }) {
  const t = useT();
  const { p } = useLocale();
  const clock = useClock();

  return (
    <>
      <Ask>{t.support.statusTitle}</Ask>

      <div className="rounded-card-lg border border-najm-border bg-najm-tint p-[15px]">
        <div className="text-[11px] text-najm-green/80">{t.support.statusRef}</div>
        <Latin className="text-[20px] font-bold tracking-[.5px] text-najm-green">
          {SUPPORT_STATUS.ref}
        </Latin>

        <div className="mt-[12px] flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warn-dot" />
          <span className="text-[13px] font-semibold text-ink">
            {t.support.statusState}: {t.support.statusStateValue}
          </span>
        </div>

        <div className="mt-[12px] rounded-card border border-najm-border bg-white p-[12px]">
          <div className="text-[11px] font-semibold text-ink-muted">{t.support.latestUpdate}</div>
          <div className="mt-[4px] text-[13px] leading-[1.6] text-ink-soft">
            {p(SUPPORT_STATUS.latestUpdate)}
          </div>
          <div className="mt-[7px] flex items-center gap-[6px] text-[10px] text-[#7FA090]">
            <ClockIcon size={11} color="#7FA090" />
            {clock(SUPPORT_STATUS.updatedAt)}
          </div>
        </div>
      </div>

      <RestartLink onRestart={onRestart} />
    </>
  );
}

/* ── Intents 2 & 3: review, then submit ────────────────────────────── */

function ReviewCard({
  intent,
  answers,
  onSubmit,
}: {
  intent: "complaint" | "objection";
  answers: string[];
  onSubmit: () => void;
}) {
  const t = useT();
  const { p, n } = useLocale();
  const r = intent === "complaint" ? SUPPORT_COMPLAINT : SUPPORT_OBJECTION;

  return (
    <>
      <Ask>{t.support.reviewTitle}</Ask>

      <div className="overflow-hidden rounded-card-lg border border-sarj-border">
        <div className="flex items-center justify-between border-b border-sarj-border-soft bg-sarj-tint px-[13px] py-[9px]">
          <span className="text-[12px] font-bold text-sarj-hover">{t.support.summary}</span>
          <span className="text-[10px] font-bold text-sarj-violet">
            {n(r.confidence)}% {t.support.confidence}
          </span>
        </div>

        <div className="bg-white p-[13px]">
          <p className="text-[13px] leading-[1.8] text-ink-soft">{p(r.said)}</p>

          {/* what he actually told it, folded into the record */}
          <div className="mt-[9px] flex flex-wrap gap-[5px]">
            {answers.map((a) => (
              <span
                key={a}
                className="rounded-pill bg-[#F1F5F2] px-[8px] py-[3px] text-[10px] font-semibold text-ink-muted"
              >
                {a}
              </span>
            ))}
          </div>

          <div className="mt-[12px] grid grid-cols-2 gap-[8px] border-t border-hair-inner pt-[12px]">
            <Cell label={t.support.category} value={t.complaints.types[r.type]} />
            <Cell label={t.support.priority} value={t.complaints.urgencies[r.urgency]} />
            <Cell label={t.support.queue} value={t.departments[r.department]} />
            <Cell label={t.support.slaLabel} value={t.support.sla} />
          </div>
        </div>
      </div>

      <div className="mt-[9px] flex items-center gap-[6px] text-[11px] font-semibold text-sarj-hover">
        <span className="h-[6px] w-[6px] rounded-full bg-sarj-violet" />
        {t.support.generated}
      </div>

      <button
        onClick={onSubmit}
        className="mt-[13px] w-full rounded-card bg-najm-green p-[13px] text-[16px] font-semibold text-white shadow-primary transition-colors hover:bg-najm-deep"
      >
        {t.support.submit}
      </button>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-ink-muted">{label}</div>
      <div className="mt-[2px] text-[13px] font-bold text-ink">{value}</div>
    </div>
  );
}

function DoneCard({
  intent,
  onRestart,
}: {
  intent: "complaint" | "objection";
  onRestart: () => void;
}) {
  const t = useT();
  const r = intent === "complaint" ? SUPPORT_COMPLAINT : SUPPORT_OBJECTION;

  return (
    <>
      <div className="mb-[13px] flex items-center gap-[8px]">
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-ok-tint">
          <CheckIcon size={13} color="#0F7A50" width={3} />
        </span>
        <span className="text-[15px] font-semibold text-ink">
          {intent === "complaint" ? t.support.submittedComplaint : t.support.submittedObjection}
        </span>
      </div>

      <div className="rounded-card-lg border border-najm-border bg-najm-tint p-[15px]">
        <div className="text-[11px] text-najm-green/80">{t.support.reference}</div>
        <Latin className="text-[21px] font-bold tracking-[.5px] text-najm-green">{r.ref}</Latin>

        <div className="mt-[12px] grid grid-cols-2 gap-[8px] border-t border-najm-border pt-[12px]">
          <Cell label={t.support.queue} value={t.departments[r.department]} />
          <Cell label={t.support.slaLabel} value={t.support.sla} />
        </div>
      </div>

      {intent === "objection" && (
        <div className="mt-[10px] rounded-card border border-dashed border-[#CFDAD4] bg-[#F7FAF8] p-[11px] text-[11px] leading-[1.6] text-ink-muted">
          {t.support.objectionRoadmap}
        </div>
      )}

      <Link
        href="/ops"
        className="mt-[13px] flex w-full items-center justify-center gap-2 rounded-card bg-najm-green p-[13px] text-[15px] font-semibold text-white shadow-primary transition-colors hover:bg-najm-deep"
      >
        {t.support.seeOps}
        <ArrowRightIcon size={16} color="#fff" />
      </Link>

      <RestartLink onRestart={onRestart} />
    </>
  );
}

function RestartLink({ onRestart }: { onRestart: () => void }) {
  const t = useT();
  return (
    <button
      onClick={onRestart}
      className="mt-[10px] w-full text-center text-[12px] font-semibold text-ink-muted transition-colors hover:text-ink"
    >
      {t.support.restart}
    </button>
  );
}
