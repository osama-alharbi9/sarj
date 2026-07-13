"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  CALLER_COMPLAINT,
  CASES,
  COMPLAINTS,
  ME,
  type Case,
  type Complaint,
  type FaultPct,
  type InvId,
  type ReasonKey,
} from "./mockData";
import { STRINGS } from "./strings";
import type { L } from "./i18n";

/**
 * One case list, shared by the investigator's desk and the operations centre.
 *
 * It lives in the root layout, so an escalation raised on /investigator is
 * already sitting in the supervisor's queue when you switch to /ops. That
 * hand-off *is* the demo — mocking it with two separate seeds would be a lie
 * the audience could catch in one click.
 *
 * Every event it writes is stamped in BOTH locales, because the store has no
 * idea which language the person reading it back will be in.
 */

interface Store {
  cases: Case[];
  complaints: Complaint[];
  /** The caller files it from his phone; the supervisor sees it appear. */
  fileComplaint: () => void;
  /** A structured request the support assistant produced. */
  submitSupport: (c: Complaint) => void;
  /** UC6: pull a live call off the assistant and onto a human. */
  takeOverLive: (ref: string) => void;
  /** UC6: an injury was heard — send help. */
  dispatch: (ref: string) => void;
  escalate: (ref: string, e: { mode: "advice" | "transfer"; reason: ReasonKey; note: string }) => void;
  requestInfo: (ref: string, partyRole: "A" | "B", topic: L) => void;
  resolveCase: (ref: string, faultA: FaultPct) => void;
  noteProgress: (ref: string) => void;
  replyAdvice: (ref: string, note: string) => void;
  takeOver: (ref: string) => void;
  reassign: (ref: string, invId: InvId) => void;
  assign: (ref: string, invId: InvId) => void;
}

const Ctx = createContext<Store | null>(null);

/** The story runs at 2:14 a.m.; every new event lands inside that same night. */
const NOW = "2:52";

const E = STRINGS.en;
const A = STRINGS.ar;

const bi = (en: string, ar: string): L => ({ en, ar });

/** The store writes both locales, so it needs Arabic numerals of its own. */
const ARN = (v: number) => String(v).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

export function CaseStoreProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<Case[]>(CASES);
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);

  const patch = useCallback((ref: string, fn: (c: Case) => Case) => {
    setCases((prev) => prev.map((c) => (c.ref === ref ? fn(c) : c)));
  }, []);

  const value = useMemo<Store>(
    () => ({
      cases,
      complaints,

      fileComplaint: () =>
        setComplaints((prev) =>
          prev.some((x) => x.ref === CALLER_COMPLAINT.ref) ? prev : [CALLER_COMPLAINT, ...prev]
        ),

      submitSupport: (c) =>
        setComplaints((prev) => (prev.some((x) => x.ref === c.ref) ? prev : [c, ...prev])),

      takeOverLive: (ref) =>
        patch(ref, (c) => ({
          ...c,
          takenOver: true,
          timeline: [
            ...c.timeline,
            {
              at: NOW,
              text: bi(
                "Supervisor took over the live call from the assistant",
                "تولّى المشرف المكالمة من المساعد"
              ),
            },
          ],
        })),

      dispatch: (ref) =>
        patch(ref, (c) => ({
          ...c,
          dispatched: true,
          timeline: [
            ...c.timeline,
            { at: NOW, text: bi("Emergency dispatched", "تم إرسال الطوارئ") },
          ],
        })),

      escalate: (ref, e) =>
        patch(ref, (c) => ({
          ...c,
          status: "escalated",
          // Advice keeps the case on the investigator's desk. Transfer does not.
          assignedTo: e.mode === "transfer" ? undefined : c.assignedTo,
          escalation: { by: ME, mode: e.mode, reason: e.reason, note: e.note, at: NOW },
          timeline: [
            ...c.timeline,
            {
              at: NOW,
              text:
                e.mode === "advice"
                  ? bi(
                      `Investigator asked the supervisor for advice — ${E.reasons[e.reason]}`,
                      `طلب المحقق مشورة المشرف — ${A.reasons[e.reason]}`
                    )
                  : bi(
                      `Investigator transferred the case to the supervisor — ${E.reasons[e.reason]}`,
                      `نقل المحقق القضية للمشرف — ${A.reasons[e.reason]}`
                    ),
            },
          ],
        })),

      requestInfo: (ref, partyRole, topic) =>
        patch(ref, (c) => ({
          ...c,
          status: "awaiting_info",
          timeline: [
            ...c.timeline,
            {
              at: NOW,
              text: bi(
                `Assistant asked to call Party ${partyRole} about: ${topic.en}`,
                `طلب المحقق من الذكاء الاتصال بالطرف ${partyRole === "A" ? "أ" : "ب"} بشأن: ${topic.ar}`
              ),
            },
          ],
        })),

      resolveCase: (ref, faultA) => {
        const b = 100 - faultA;
        const en = `${E.inv.pA} ${faultA}% — ${E.inv.pB} ${b}%`;
        const ar = `${A.inv.pA} ${ARN(faultA)}٪ — ${A.inv.pB} ${ARN(b)}٪`;
        return patch(ref, (c) => ({
          ...c,
          status: "resolved",
          verdict: bi(en, ar),
          timeline: [
            ...c.timeline,
            {
              at: NOW,
              text: bi(`${E.liabilityPrefix}${en}`, `${A.liabilityPrefix}${ar}`),
            },
          ],
        }));
      },

      noteProgress: (ref) =>
        patch(ref, (c) => ({
          ...c,
          status: "investigating",
          timeline: [
            ...c.timeline,
            { at: NOW, text: bi("Investigator continued the investigation", "واصل المحقق التحقيق") },
          ],
        })),

      replyAdvice: (ref, note) =>
        patch(ref, (c) => ({
          ...c,
          status: "investigating",
          escalation: undefined,
          timeline: [
            ...c.timeline,
            {
              at: NOW,
              text: bi(`Supervisor replied with advice: ${note}`, `ردّ المشرف بمشورة: ${note}`),
            },
          ],
        })),

      takeOver: (ref) =>
        patch(ref, (c) => ({
          ...c,
          status: "investigating",
          assignedTo: undefined,
          escalation: undefined,
          timeline: [
            ...c.timeline,
            { at: NOW, text: bi("Supervisor took over the case", "تولّى المشرف القضية") },
          ],
        })),

      reassign: (ref, invId) =>
        patch(ref, (c) => ({
          ...c,
          status: "investigating",
          assignedTo: invId,
          escalation: undefined,
          timeline: [
            ...c.timeline,
            { at: NOW, text: bi("Supervisor reassigned the case", "أعاد المشرف تعيين القضية") },
          ],
        })),

      assign: (ref, invId) =>
        patch(ref, (c) => ({
          ...c,
          status: "investigating",
          assignedTo: invId,
          timeline: [...c.timeline, { at: NOW, text: bi("Case assigned", "أُسندت القضية") }],
        })),
    }),
    [cases, complaints, patch]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCases() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useCases must be used inside CaseStoreProvider");
  return s;
}
