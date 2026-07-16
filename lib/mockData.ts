/**
 * Najm × Sarj AI — demo data.
 *
 * UI copy lives in strings.ts. This file holds only what the *story* is made
 * of: the cases, the people, and what each driver actually said.
 *
 * The bilingual split is deliberate. Anything the model WROTE (summaries,
 * narratives, the contradiction table) carries both locales and follows the
 * operator. Anything a driver SAID does not: the transcript stays in the script
 * he spoke, because a translated transcript is not a verbatim record — and the
 * fact that he spoke Urdu is the entire product.
 *
 * IDENTITY RULE: no caller names in any list, tag or metric. The ID number is
 * evidence and appears only in the extracted-fields panel.
 *
 * COLOUR LAW: red is reserved for human safety (AI emergency). Human escalation
 * is amber. Violet marks only what the model itself produced.
 */

import type { L } from "./i18n";

export const CASE_REF = "NJM-2026-04512";

/** The whole story happens at 2:14 in the morning — the 24/7 proof point. */
export const CLOCK = "2:14";

/* ══ Caller journey ═════════════════════════════════════════════════ */

export type Speaker = "agent" | "caller";
export type SlotKey = "parties" | "location" | "injuries";

/** Three intake slots. Their labels went with the chips; only the order matters. */
export const SLOTS: SlotKey[] = ["parties", "location", "injuries"];

export type ScreenKey = "voice" | "evidence" | "readback" | "ticket" | "status";

export const BEATS: { n: number; screen: ScreenKey }[] = [
  { n: 1, screen: "voice" },
  { n: 2, screen: "voice" },
  { n: 3, screen: "voice" },
  { n: 4, screen: "evidence" },
  { n: 5, screen: "readback" },
  { n: 6, screen: "ticket" },
  { n: 7, screen: "status" },
];

export const FIRST_BEAT = 1;
export const LAST_BEAT = BEATS.length;

/** Drives beat 3's slot timing. Nothing renders this text any more. */
export const CALLER_TRANSCRIPT: { beat: number; fills?: SlotKey }[] = [
  { beat: 1 },
  { beat: 2 },
  { beat: 3, fills: "parties" },
  { beat: 3, fills: "location" },
  { beat: 3, fills: "injuries" },
];

/** He says his iqama out loud; the screen exists only so he can check it. */
export const IDENTITY = { digits: "2438190756" } as const;

/** The other vehicle: no registration exists for a car that is not his. */
export const PARTY_2 = { plate: "أ ب ج ١٢٣٤" } as const;

export const OCR = { filled: 6, total: 9 } as const;

export type OcrFieldId = "plate" | "owner" | "vehicle" | "insurer";

export const OCR_FIELDS: { id: OcrFieldId; value: string; spaced?: boolean }[] = [
  { id: "plate", value: "ر س ط ٤٥٦٢", spaced: true },
  { id: "owner", value: "محمد أختر" },
  { id: "vehicle", value: "تويوتا هايلكس ٢٠٢٢" },
  { id: "insurer", value: "التعاونية للتأمين" },
];

/** A photographed Saudi document. It stays Arabic in every locale — it is a photo. */
export const REGISTRATION_CARD = {
  headerAr: "المرور — استمارة سير",
  headerLatin: "VEHICLE REGISTRATION",
  rows: [
    { label: "رقم اللوحة", value: "ر س ط ٤٥٦٢" },
    { label: "المالك", value: "محمد أختر" },
    { label: "المركبة", value: "تويوتا هايلكس ٢٠٢٢" },
    { label: "التأمين", value: "التعاونية للتأمين" },
  ],
  plateLatin: "RST 4562",
  kingdomAr: "المملكة العربية السعودية",
} as const;

/* ══ Najm operations ════════════════════════════════════════════════ */

export type LangCode = "AR" | "UR" | "EN";
export type TagTone = "najm" | "sarj" | "ok" | "danger" | "warn";
export const TOTAL_FIELDS = 9;

export type CaseStatus =
  | "intake"
  | "awaiting_party_b"
  | "ready"
  | "investigating"
  | "awaiting_info"
  | "escalated"
  | "emergency"
  | "resolved";

export const ACTIVE_STATUSES: CaseStatus[] = [
  "awaiting_party_b",
  "investigating",
  "awaiting_info",
  "escalated",
];

export type ReasonKey = "conflict" | "liability" | "fraud" | "complex";
/**
 * Liability is apportioned, not awarded: Najm splits fault in quarters. The
 * value is PARTY A's share; Party B carries the remainder.
 */
export type FaultPct = 0 | 25 | 50 | 75 | 100;
export const FAULT_STEPS: FaultPct[] = [0, 25, 50, 75, 100];
export type InvId = "inv1" | "inv2" | "inv3" | "inv4";

export interface Investigator {
  id: InvId;
  initials: string;
  capacity: number;
  away?: boolean;
}

export const INVESTIGATORS: Investigator[] = [
  { id: "inv1", initials: "FH", capacity: 5 },
  { id: "inv2", initials: "NA", capacity: 5 },
  { id: "inv3", initials: "SM", capacity: 5 },
  { id: "inv4", initials: "HZ", capacity: 5, away: true },
];

export const ME: InvId = "inv1";
export const SUPERVISOR_INITIALS = "RO";

/* ── The case ─────────────────────────────────────────────────────── */

export interface Turn {
  id: string;
  speaker: Speaker;
  /** The script he actually spoke. Never translated. */
  script: "ar" | "ur" | "en";
  text: string;
  /** The gloss beneath — this is what follows the operator's locale. */
  gloss?: L;
  flagged?: boolean;
}

export interface Party {
  role: "A" | "B";
  lang: LangCode;
  idNumber?: string;
  plate: string;
  narrative: L;
  transcript: Turn[];
}

export type ClaimVerdict = "agree" | "conflict" | "onlyA" | "onlyB";

export interface Claim {
  key: string;
  label: L;
  a: L;
  b: L;
  verdict: ClaimVerdict;
}

export interface Field {
  label: L;
  /** A plate or an ID is evidence: one string, identical in every locale. */
  value: string | L;
  good?: boolean;
  bad?: boolean;
  latin?: boolean;
  spaced?: boolean;
}

export interface Escalation {
  by: InvId;
  mode: "advice" | "transfer";
  reason: ReasonKey;
  /** Seeded notes are bilingual; a note the investigator types is his own words. */
  note: string | L;
  at: string;
}

export interface Emergency {
  trigger: L;
  at: string;
  turnId: string;
}

export interface TimelineEvent {
  at: string;
  text: L;
}

export interface Case {
  ref: string;
  status: CaseStatus;
  lang: LangCode;
  createdAt: string;
  ageMin: number;
  assignedTo?: InvId;
  parties: Party[];
  claims: Claim[];
  aiSummary: L;
  fieldsResolved: number;
  fields: Field[];
  evidence: L[];
  escalation?: Escalation;
  emergency?: Emergency;
  verdict?: L;
  timeline: TimelineEvent[];
  isDemoCase?: boolean;
  captured?: number;
  /** UC6: a supervisor pulled a live call off the assistant. */
  takenOver?: boolean;
  /** UC6: an emergency was dispatched. */
  dispatched?: boolean;
}

/* ── The demo case: complete, and undecidable ────────────────────── */

const A_04512: Party = {
  role: "A",
  lang: "UR",
  idNumber: IDENTITY.digits,
  plate: "ر س ط ٤٥٦٢",
  narrative: {
    en: "He was heading north on King Fahd Road and entered the intersection on a green light when a vehicle coming from his right struck him. He puts his speed at around 50 km/h and says the impact landed on the right side of his car.",
    ar: "كان يسير على طريق الملك فهد باتجاه الشمال ودخل التقاطع والإشارة خضراء، ثم اصطدمت به مركبة قادمة من اليمين. يقول إن سرعته كانت نحو ٥٠ كم/س وإن الصدمة وقعت على الجانب الأيمن لمركبته.",
  },
  transcript: [
    { id: "a1", speaker: "agent", script: "ar", text: "حياك الله، معك مساعد نجم الذكي، وش صار بالضبط؟", gloss: { en: "Welcome — this is the Najm smart assistant. What exactly happened?", ar: "حياك الله، معك مساعد نجم الذكي، وش صار بالضبط؟" } },
    { id: "a2", speaker: "caller", script: "ur", text: "میری گاڑی کا ایکسیڈنٹ ہو گیا ہے", gloss: { en: "My car has had an accident", ar: "تعرّضت سيّارتي لحادث" } },
    { id: "a3", speaker: "agent", script: "ur", text: "پریشان نہ ہوں، حادثہ کہاں ہوا؟", gloss: { en: "Don't worry. Where did the accident happen?", ar: "لا تقلق، وين صار الحادث؟" } },
    { id: "a4", speaker: "caller", script: "ur", text: "کنگ فہد روڈ پر، سگنل سبز تھا", gloss: { en: "On King Fahd Road — the light was green", ar: "على طريق الملك فهد، والإشارة كانت خضراء" } },
    { id: "a5", speaker: "agent", script: "ur", text: "کوئی زخمی تو نہیں؟", gloss: { en: "Is anyone injured?", ar: "هل يوجد مصابون؟" } },
    { id: "a6", speaker: "caller", script: "ur", text: "نہیں، سب ٹھیک ہیں", gloss: { en: "No, everyone is fine", ar: "لا، الجميع بخير" } },
    { id: "a7", speaker: "agent", script: "ur", text: "آپ کی رفتار کتنی تھی؟", gloss: { en: "How fast were you going?", ar: "كم كانت سرعتك؟" } },
    { id: "a8", speaker: "caller", script: "ur", text: "تقریباً پچاس", gloss: { en: "About fifty", ar: "تقريبًا خمسين" } },
  ],
};

const B_04512: Party = {
  role: "B",
  lang: "AR",
  idNumber: "1092837465",
  plate: PARTY_2.plate,
  narrative: {
    en: "He says he entered the intersection on a green light of his own, and that the other vehicle ran a red. He puts the other driver's speed at around 80 km/h and insists the impact landed on the front of his car. He reports no injuries.",
    ar: "يقول إنه دخل التقاطع والإشارة خضراء له، وإن المركبة الأخرى قطعت الإشارة الحمراء. يقدّر سرعة الطرف الآخر بنحو ٨٠ كم/س ويؤكد أن الصدمة وقعت على مقدمة مركبته. لا يذكر أي إصابات.",
  },
  transcript: [
    { id: "b1", speaker: "agent", script: "ar", text: "حياك الله، معك مساعد نجم الذكي، وش صار بالضبط؟", gloss: { en: "Welcome — this is the Najm smart assistant. What exactly happened?", ar: "حياك الله، معك مساعد نجم الذكي، وش صار بالضبط؟" } },
    { id: "b2", speaker: "caller", script: "ar", text: "واحد قطع عليّ الإشارة عند تقاطع الملك فهد ودخل فيني", gloss: { en: "Someone ran the light at the King Fahd intersection and hit me", ar: "واحد قطع عليّ الإشارة عند تقاطع الملك فهد ودخل فيني" } },
    { id: "b3", speaker: "agent", script: "ar", text: "الإشارة كانت خضراء لك؟", gloss: { en: "Was the light green for you?", ar: "الإشارة كانت خضراء لك؟" } },
    { id: "b4", speaker: "caller", script: "ar", text: "إي، خضراء لي، وهو دخل والإشارة حمراء عليه", gloss: { en: "Yes, green for me — he came through on red", ar: "إي، خضراء لي، وهو دخل والإشارة حمراء عليه" } },
    { id: "b5", speaker: "agent", script: "ar", text: "هل يوجد مصابون؟", gloss: { en: "Is anyone injured?", ar: "هل يوجد مصابون؟" } },
    { id: "b6", speaker: "caller", script: "ar", text: "لا، الحمد لله ما فيه إصابات", gloss: { en: "No, thankfully no injuries", ar: "لا، الحمد لله ما فيه إصابات" } },
    { id: "b7", speaker: "agent", script: "ar", text: "بأي سرعة كان قادمًا برأيك؟", gloss: { en: "How fast do you think he was going?", ar: "بأي سرعة كان قادمًا برأيك؟" } },
    { id: "b8", speaker: "caller", script: "ar", text: "سريع، يمكن ثمانين", gloss: { en: "Fast — maybe eighty", ar: "سريع، يمكن ثمانين" } },
  ],
};

const CASE_04512: Case = {
  ref: CASE_REF,
  status: "investigating",
  lang: "UR",
  createdAt: "2:14",
  ageMin: 38,
  assignedTo: "inv1",
  isDemoCase: true,
  parties: [A_04512, B_04512],
  claims: [
    {
      key: "signal",
      label: { en: "Traffic signal", ar: "حالة الإشارة" },
      a: { en: "Green for him", ar: "خضراء له" },
      b: { en: "Green for him — Party A ran the red", ar: "خضراء له — والطرف أ قطع الحمراء" },
      verdict: "conflict",
    },
    {
      key: "speed",
      label: { en: "Party A's estimated speed", ar: "السرعة المقدّرة للطرف أ" },
      a: { en: "About 50 km/h", ar: "نحو ٥٠ كم/س" },
      b: { en: "About 80 km/h", ar: "نحو ٨٠ كم/س" },
      verdict: "conflict",
    },
    {
      key: "impact",
      label: { en: "Point of impact", ar: "نقطة الاصطدام" },
      a: { en: "Right side of his car", ar: "الجانب الأيمن لمركبته" },
      b: { en: "Front of his car", ar: "مقدمة مركبته" },
      verdict: "agree",
    },
    {
      key: "injuries",
      label: { en: "Injuries", ar: "الإصابات" },
      a: { en: "None", ar: "لا يوجد" },
      b: { en: "None", ar: "لا يوجد" },
      verdict: "agree",
    },
    {
      key: "location",
      label: { en: "Location", ar: "الموقع" },
      a: { en: "King Fahd Road intersection", ar: "تقاطع طريق الملك فهد" },
      b: { en: "King Fahd Road intersection", ar: "تقاطع طريق الملك فهد" },
      verdict: "agree",
    },
    {
      key: "direction",
      label: { en: "Direction of travel", ar: "اتجاه السير" },
      a: { en: "Northbound", ar: "شمالًا" },
      b: { en: "—", ar: "—" },
      verdict: "onlyA",
    },
  ],
  aiSummary: {
    en: "Two-vehicle collision at the King Fahd Road intersection, Riyadh, at 2:14 AM. No injuries; both parties insured and verified. The accounts agree on the location and on the absence of injuries, and disagree on the state of the traffic signal and on Party A's speed. Liability is not settled on the present evidence.",
    ar: "تصادم بين مركبتين عند تقاطع طريق الملك فهد، الرياض، الساعة ٢:١٤ ص. لا توجد إصابات، وكلا الطرفين مؤمَّن ومُتحقق. الطرفان يتفقان على الموقع وعدم وجود إصابات، ويختلفان على حالة الإشارة وسرعة الطرف أ. المسؤولية غير محسومة بالأدلة الحالية.",
  },
  fieldsResolved: 9,
  fields: [
    { label: { en: "Party A — ID number", ar: "الطرف أ — رقم الهوية" }, value: IDENTITY.digits, latin: true, spaced: true },
    { label: { en: "Party A — plate", ar: "الطرف أ — اللوحة" }, value: "ر س ط ٤٥٦٢", spaced: true },
    { label: { en: "Party B — ID number", ar: "الطرف ب — رقم الهوية" }, value: "1092837465", latin: true, spaced: true },
    { label: { en: "Party B — plate", ar: "الطرف ب — اللوحة" }, value: PARTY_2.plate, spaced: true },
    { label: { en: "Location", ar: "الموقع" }, value: { en: "King Fahd Road, Riyadh", ar: "طريق الملك فهد، الرياض" } },
    { label: { en: "Injuries", ar: "الإصابات" }, value: { en: "None", ar: "لا يوجد" }, good: true },
    { label: { en: "Party A insurance", ar: "تأمين الطرف أ" }, value: { en: "Tawuniya — verified", ar: "التعاونية — مُتحقق" } },
    { label: { en: "Party B insurance", ar: "تأمين الطرف ب" }, value: { en: "Malath — verified", ar: "ملاذ — مُتحقق" } },
    { label: { en: "Accident description", ar: "وصف الحادث" }, value: { en: "Collision at an intersection", ar: "تصادم عند تقاطع" } },
  ],
  evidence: [
    { en: "Party A registration (OCR)", ar: "استمارة الطرف أ (OCR)" },
    { en: "Party B plate (by voice)", ar: "لوحة الطرف ب (صوتيًا)" },
  ],
  timeline: [
    { at: "2:14", text: { en: "Party A's report opened (Urdu)", ar: "بدأ استقبال بلاغ الطرف أ (أردو)" } },
    { at: "2:21", text: { en: "Registration read by OCR — 4 fields", ar: "استُخرجت بيانات الاستمارة عبر OCR — ٤ حقول" } },
    { at: "2:36", text: { en: "Party B's report arrived and was linked to the case", ar: "ورد بلاغ الطرف ب (عربي) وربطه الذكاء بالقضية" } },
    { at: "2:39", text: { en: "The assistant found two conflicts between the accounts", ar: "رصد الذكاء تعارضين بين الروايتين" } },
    { at: "2:40", text: { en: "Case assigned to Faisal Al-Harbi", ar: "أُسندت القضية إلى فيصل الحربي" } },
  ],
};

/* ── The emergency. Never enters the investigation queue. ─────────── */

const CASE_04519: Case = {
  ref: "NJM-2026-04519",
  status: "emergency",
  lang: "AR",
  createdAt: "2:06",
  ageMin: 4,
  parties: [
    {
      role: "A",
      lang: "AR",
      idNumber: "1055310498",
      plate: "ع ن ب ٧٧٢١",
      narrative: {
        en: "Side-on collision at the Olaya intersection. The caller mentioned a passenger complaining of neck pain.",
        ar: "تصادم جانبي عند تقاطع العليا. ذكر المتصل وجود راكب يشتكي من ألم في الرقبة.",
      },
      transcript: [
        { id: "x1", speaker: "agent", script: "ar", text: "حياك الله، معك مساعد نجم الذكي، وش صار بالضبط؟", gloss: { en: "Welcome — this is the Najm smart assistant. What exactly happened?", ar: "حياك الله، معك مساعد نجم الذكي، وش صار بالضبط؟" } },
        { id: "x2", speaker: "caller", script: "ar", text: "صار لي حادث عند تقاطع العليا، سيارة دخلت فيني من الجنب", gloss: { en: "I had an accident at the Olaya intersection — a car hit me from the side", ar: "صار لي حادث عند تقاطع العليا، سيارة دخلت فيني من الجنب" } },
        { id: "x3", speaker: "agent", script: "ar", text: "سلامتك. هل يوجد مصابون؟", gloss: { en: "I hope you're safe. Is anyone injured?", ar: "سلامتك. هل يوجد مصابون؟" } },
        { id: "x4", speaker: "caller", script: "ar", text: "إي، الراكب اللي معي يشتكي من ألم في رقبته", gloss: { en: "Yes — the passenger with me is complaining of neck pain", ar: "إي، الراكب اللي معي يشتكي من ألم في رقبته" }, flagged: true },
        { id: "x5", speaker: "agent", script: "ar", text: "تم تحويل بلاغك للطوارئ الآن، وجارٍ ترتيب الإسعاف.", gloss: { en: "Your report has been routed to emergency; an ambulance is being arranged.", ar: "تم تحويل بلاغك للطوارئ الآن، وجارٍ ترتيب الإسعاف." } },
      ],
    },
  ],
  claims: [],
  aiSummary: {
    en: "Accident report at the Olaya intersection. The assistant detected an explicit mention of injury during intake and routed the report straight to emergency.",
    ar: "بلاغ حادث عند تقاطع العليا. رصد الذكاء ذكرًا صريحًا لإصابة أثناء الاستقبال وحوّل البلاغ للطوارئ فورًا.",
  },
  fieldsResolved: 6,
  fields: [
    { label: { en: "Party A — ID number", ar: "الطرف أ — رقم الهوية" }, value: "1055310498", latin: true, spaced: true },
    { label: { en: "Party A — plate", ar: "الطرف أ — اللوحة" }, value: "ع ن ب ٧٧٢١", spaced: true },
    { label: { en: "Location", ar: "الموقع" }, value: { en: "Olaya intersection, Riyadh", ar: "تقاطع العليا، الرياض" } },
    { label: { en: "Injuries", ar: "الإصابات" }, value: { en: "One injured — neck pain", ar: "مصاب واحد — ألم في الرقبة" }, bad: true },
    { label: { en: "Party A insurance", ar: "تأمين الطرف أ" }, value: { en: "Al Rajhi Takaful — verified", ar: "الراجحي تكافل — مُتحقق" } },
    { label: { en: "Accident description", ar: "وصف الحادث" }, value: { en: "Side-on collision at an intersection", ar: "تصادم جانبي عند التقاطع" } },
  ],
  evidence: [],
  emergency: {
    trigger: { en: "Injury mentioned", ar: "ذكر إصابة" },
    at: "2:09",
    turnId: "x4",
  },
  timeline: [
    { at: "2:06", text: { en: "Report opened (Arabic)", ar: "بدأ استقبال البلاغ (عربي)" } },
    { at: "2:09", text: { en: "Assistant detected an injury — routed to emergency", ar: "رصد الذكاء ذكر إصابة — تحويل فوري للطوارئ" } },
  ],
};

/* ── A seeded human escalation, so the supervisor has work at load ── */

const CASE_04502: Case = {
  ref: "NJM-2026-04502",
  status: "escalated",
  lang: "AR",
  createdAt: "0:31",
  ageMin: 52,
  assignedTo: "inv3",
  parties: [
    {
      role: "A",
      lang: "AR",
      idNumber: "1043998217",
      plate: "ط ي ق ٨٨٠٤",
      narrative: {
        en: "He says the other vehicle reversed into him while he was completely stationary.",
        ar: "يقول إن المركبة الأخرى رجعت للخلف واصطدمت به وهو متوقف تمامًا.",
      },
      transcript: [
        { id: "p1", speaker: "agent", script: "ar", text: "وش صار بالضبط؟", gloss: { en: "What exactly happened?", ar: "وش صار بالضبط؟" } },
        { id: "p2", speaker: "caller", script: "ar", text: "كنت واقف، وهو رجّع عليّ ودخل فيني", gloss: { en: "I was parked; he reversed into me", ar: "كنت واقف، وهو رجّع عليّ ودخل فيني" } },
      ],
    },
    {
      role: "B",
      lang: "AR",
      idNumber: "1077452390",
      plate: "ص ض ط ٢٢٤٥",
      narrative: {
        en: "He says he was stationary and that Party A drove into the back of him.",
        ar: "يقول إنه كان متوقفًا وإن الطرف أ هو من اصطدم به من الخلف.",
      },
      transcript: [
        { id: "q1", speaker: "agent", script: "ar", text: "وش صار بالضبط؟", gloss: { en: "What exactly happened?", ar: "وش صار بالضبط؟" } },
        { id: "q2", speaker: "caller", script: "ar", text: "أنا كنت واقف، هو اللي دخل فيني من ورا", gloss: { en: "I was parked; he ran into me from behind", ar: "أنا كنت واقف، هو اللي دخل فيني من ورا" } },
      ],
    },
  ],
  claims: [
    {
      key: "moving",
      label: { en: "Who was moving", ar: "من كان متحركًا" },
      a: { en: "Party B was reversing", ar: "الطرف ب كان يرجع للخلف" },
      b: { en: "Party A struck from behind", ar: "الطرف أ اصطدم من الخلف" },
      verdict: "conflict",
    },
    {
      key: "injuries",
      label: { en: "Injuries", ar: "الإصابات" },
      a: { en: "None", ar: "لا يوجد" },
      b: { en: "None", ar: "لا يوجد" },
      verdict: "agree",
    },
    {
      key: "location",
      label: { en: "Location", ar: "الموقع" },
      a: { en: "Retail car park, Al Malqa", ar: "موقف تجاري، حي الملقا" },
      b: { en: "Retail car park, Al Malqa", ar: "موقف تجاري، حي الملقا" },
      verdict: "agree",
    },
  ],
  aiSummary: {
    en: "Collision in a retail car park in Al Malqa. Each party insists he was stationary and that the other was the one moving. No injuries. No photographic evidence settles the direction of travel.",
    ar: "تصادم في موقف تجاري بحي الملقا. كل طرف يؤكد أنه كان متوقفًا وأن الآخر هو المتحرك. لا توجد إصابات. لا توجد أدلة مصوّرة تحسم اتجاه الحركة.",
  },
  // 9/9: the file is complete. The escalation is about the difficulty of the
  // liability decision, not missing information.
  fieldsResolved: 9,
  fields: [
    { label: { en: "Party A — ID number", ar: "الطرف أ — رقم الهوية" }, value: "1043998217", latin: true, spaced: true },
    { label: { en: "Party A — plate", ar: "الطرف أ — اللوحة" }, value: "ط ي ق ٨٨٠٤", spaced: true },
    { label: { en: "Party B — ID number", ar: "الطرف ب — رقم الهوية" }, value: "1077452390", latin: true, spaced: true },
    { label: { en: "Party B — plate", ar: "الطرف ب — اللوحة" }, value: "ص ض ط ٢٢٤٥", spaced: true },
    { label: { en: "Location", ar: "الموقع" }, value: { en: "Al Malqa, Riyadh", ar: "حي الملقا، الرياض" } },
    { label: { en: "Injuries", ar: "الإصابات" }, value: { en: "None", ar: "لا يوجد" }, good: true },
    { label: { en: "Party A insurance", ar: "تأمين الطرف أ" }, value: { en: "Tawuniya — verified", ar: "التعاونية — مُتحقق" } },
    { label: { en: "Party B insurance", ar: "تأمين الطرف ب" }, value: { en: "Malath — verified", ar: "ملاذ — مُتحقق" } },
    { label: { en: "Accident description", ar: "وصف الحادث" }, value: { en: "Collision in a car park", ar: "تصادم في موقف" } },
  ],
  evidence: [
    { en: "Party A registration (OCR)", ar: "استمارة الطرف أ (OCR)" },
    { en: "Party B registration (OCR)", ar: "استمارة الطرف ب (OCR)" },
  ],
  escalation: {
    by: "inv3",
    mode: "advice",
    reason: "liability",
    note: {
      en: "Each party says he was stationary and there is no camera. I need your view before I issue a verdict — I'm worried about an objection.",
      ar: "كل طرف يقول إنه كان متوقفًا ولا توجد كاميرا. أحتاج رأيك قبل إصدار القرار — أخشى اعتراضًا.",
    },
    at: "1:18",
  },
  timeline: [
    { at: "0:31", text: { en: "Party A's report opened", ar: "بدأ استقبال بلاغ الطرف أ" } },
    { at: "0:49", text: { en: "Party B's report arrived and was linked to the case", ar: "ورد بلاغ الطرف ب وربطه الذكاء بالقضية" } },
    { at: "1:18", text: { en: "Saad Al-Mutairi asked the supervisor for advice", ar: "طلب سعد المطيري مشورة المشرف" } },
  ],
};

/** Thin cases: they populate the queue, the roster and the ledger. */
function stub(
  ref: string,
  status: CaseStatus,
  lang: LangCode,
  createdAt: string,
  ageMin: number,
  fieldsResolved: number,
  assignedTo?: InvId,
  extra: Partial<Case> = {}
): Case {
  return {
    ref,
    status,
    lang,
    createdAt,
    ageMin,
    assignedTo,
    parties: [],
    claims: [],
    aiSummary: { en: "—", ar: "—" },
    fieldsResolved,
    fields: [],
    evidence: [],
    timeline: [],
    ...extra,
  };
}

export const CASES: Case[] = [
  stub("NJM-2026-04521", "intake", "EN", "2:50", 2, 3, undefined, { captured: 3 }),
  stub("NJM-2026-04522", "intake", "AR", "2:48", 4, 5, undefined, { captured: 5 }),
  CASE_04519,
  CASE_04512,
  CASE_04502,
  stub("NJM-2026-04517", "awaiting_party_b", "AR", "1:48", 62, 5, "inv1"),
  stub("NJM-2026-04493", "awaiting_info", "UR", "1:02", 27, 7, "inv1"),
  stub("NJM-2026-04488", "investigating", "AR", "0:44", 19, 9, "inv1"),
  stub("NJM-2026-04510", "ready", "EN", "1:22", 41, 9),
  stub("NJM-2026-04486", "investigating", "AR", "0:38", 22, 9, "inv2"),
  stub("NJM-2026-04505", "investigating", "AR", "0:59", 31, 8, "inv3"),
  stub("NJM-2026-04480", "investigating", "AR", "0:26", 44, 9, "inv3"),
  stub("NJM-2026-04478", "awaiting_party_b", "UR", "0:19", 71, 5, "inv3"),
  stub("NJM-2026-04476", "investigating", "EN", "0:14", 48, 7, "inv3"),
  stub("NJM-2026-04498", "resolved", "AR", "0:12", 0, 9, "inv2", {
    verdict: { en: "Party A 0% — Party B 100%", ar: "الطرف أ ٠٪ — الطرف ب ١٠٠٪" },
  }),
];

/* ── Derived — never hand-typed ───────────────────────────────────── */

export const activeCountFor = (cases: Case[], invId: string) =>
  cases.filter((c) => c.assignedTo === invId && ACTIVE_STATUSES.includes(c.status)).length;

export const oldestAgeFor = (cases: Case[], invId: string) =>
  cases
    .filter((c) => c.assignedTo === invId && ACTIVE_STATUSES.includes(c.status))
    .reduce((m, c) => Math.max(m, c.ageMin), 0);

/**
 * Decision readiness — replaces "9/9". A file can be complete and still
 * undecidable, and that gap is the entire objection problem.
 */
export function readiness(c: Case) {
  const conflicts = c.claims.filter((x) => x.verdict === "conflict").length;
  const missing = TOTAL_FIELDS - c.fieldsResolved;
  const waitingB = c.status === "awaiting_party_b" || c.parties.length < 2;
  return { ready: conflicts === 0 && missing === 0 && !waitingB, conflicts, missing, waitingB };
}

export const QUEUE_STAGES: CaseStatus[] = ["awaiting_party_b", "ready", "awaiting_info"];

/* ══ Complaints ═════════════════════════════════════════════════════
 *
 * PRD pain #3: complaints arrive unclassified into one flat queue on a 10
 * working-day commitment, and every one is touched by a human. The AI's value
 * is that it classifies at submission — so the queue arrives triaged instead of
 * sorted by hand.
 *
 * A complaint is NOT a liability decision, so it never reaches an investigator.
 * It is the supervisor's work.
 *
 * NOTE: this taxonomy is invented. The PRD marks the real one as a discovery
 * item ("needs Najm's taxonomy") — swap these four for Najm's own.
 */

export type ComplaintType = "delay" | "conduct" | "verdict" | "service";
export type Urgency = "high" | "medium" | "low";
/** Where a triaged request is routed. */
export type DeptKey = "claims" | "liability" | "field" | "care";

/** Najm's public commitment. Everything ages against it. */
export const COMPLAINT_SLA_DAYS = 10;

export interface Complaint {
  ref: string;
  /**
   * What the CALLER picked for himself. Najm's form makes him self-select a
   * category over free text, and he frequently picks the wrong one — which is
   * how a fault dispute ends up in a "service quality" pile.
   */
  pickedType: ComplaintType;
  /** What the assistant concluded after reading what he actually said. */
  type: ComplaintType;
  urgency: Urgency;
  /** The case it is about, when it is about one. */
  aboutCase?: string;
  lang: LangCode;
  /** What the caller actually said, in his own words. */
  said: L;
  filedAt: string;
  daysLeft: number;
  /** How sure the assistant is of the classification, 0–100. */
  confidence: number;
  department: DeptKey;
}

export const CALLER_COMPLAINT: Complaint = {
  ref: "NJM-C-2026-0117",
  // He filed it as "service quality"; what he described is a processing delay.
  pickedType: "service",
  type: "delay",
  urgency: "high",
  aboutCase: CASE_REF,
  lang: "UR",
  said: {
    en: "It has been three weeks and no assessor has come. Every time I call I am told to wait.",
    ar: "صار لي ثلاث أسابيع وما جاني مُقيّم. كل ما أتصل يقولون انتظر.",
  },
  filedAt: "2:16",
  daysLeft: 10,
  confidence: 94,
  department: "claims",
};

export const COMPLAINTS: Complaint[] = [
  {
    ref: "NJM-C-2026-0113",
    // Filed as a service complaint; it is actually a fault dispute.
    pickedType: "service",
    type: "verdict",
    urgency: "medium",
    aboutCase: "NJM-2026-04498",
    lang: "AR",
    said: {
      en: "The fault was put on me and I do not accept it. Nobody looked at my side of the story.",
      ar: "حطّوا المسؤولية عليّ وأنا ما أقبل. ما أحد سمع روايتي.",
    },
    filedAt: "1:41",
    daysLeft: 6,
    confidence: 89,
    department: "liability",
  },
  {
    ref: "NJM-C-2026-0109",
    pickedType: "conduct",
    type: "conduct",
    urgency: "low",
    lang: "AR",
    said: {
      en: "The assessor arrived late and was short with me.",
      ar: "المُقيّم تأخّر وكان أسلوبه غير لائق.",
    },
    filedAt: "1:05",
    daysLeft: 9,
    confidence: 96,
    department: "field",
  },
  {
    ref: "NJM-C-2026-0104",
    pickedType: "delay",
    type: "delay",
    urgency: "high",
    aboutCase: "NJM-2026-04476",
    lang: "EN",
    said: {
      en: "My claim has been open for a month with no update at all.",
      ar: "بلاغي مفتوح من شهر بدون أي تحديث.",
    },
    filedAt: "0:22",
    daysLeft: 1,
    confidence: 92,
    department: "claims",
  },
];

/** Under two working days left against the 10-day commitment. */
export const atRisk = (c: Complaint) => c.daysLeft <= 2;

/** The assistant overrode what the caller picked for himself. */
export const miscategorised = (c: Complaint) => c.pickedType !== c.type;


/* ══ Customer support ═══════════════════════════════════════════════
 *
 * The same conversational engine, pointed at Najm's other front door. Nothing
 * here is a second product: it reuses the phone frame, the orb, the card slot
 * and the same triage the complaints queue already runs on.
 *
 * The story is one line: he asks in his own words → the assistant works out
 * what he actually needs → it asks only what is missing → it hands the human
 * team a structured request instead of free text.
 */

export type SupportIntent = "status" | "complaint" | "objection" | "unclear";

export interface SupportPrompt {
  id: string;
  text: L;
  intent: SupportIntent;
  /** What the model thought, before it asked anything. */
  confidence: number;
}

export const SUPPORT_PROMPTS: SupportPrompt[] = [
  {
    id: "p1",
    text: { en: "Where is my accident report?", ar: "وين وصل بلاغ الحادث حقّي؟" },
    intent: "status",
    confidence: 96,
  },
  {
    id: "p2",
    text: { en: "My case hasn't been updated.", ar: "قضيتي ما تحدّثت من فترة." },
    intent: "complaint",
    confidence: 94,
  },
  {
    id: "p3",
    text: {
      en: "I want to object to the liability decision.",
      ar: "أبغى أعترض على قرار المسؤولية.",
    },
    intent: "objection",
    confidence: 91,
  },
  // Deliberately ambiguous: a real caller opens like this, and the honest
  // answer is a clarifying question, not a confident guess.
  { id: "p4", text: { en: "I need help.", ar: "أحتاج مساعدة." }, intent: "unclear", confidence: 41 },
];

export interface SupportOption {
  id: string;
  label: L;
}

export interface SupportQuestion {
  id: string;
  ask: L;
  options: SupportOption[];
}

/** Only the gaps. The assistant already knows who he is and which case he means. */
export const COMPLAINT_QUESTIONS: SupportQuestion[] = [
  {
    id: "c1",
    ask: { en: "How long has this been going on?", ar: "من متى والوضع كذا؟" },
    options: [
      { id: "c1a", label: { en: "Under a week", ar: "أقل من أسبوع" } },
      { id: "c1b", label: { en: "One to three weeks", ar: "من أسبوع إلى ثلاثة" } },
      { id: "c1c", label: { en: "Over a month", ar: "أكثر من شهر" } },
    ],
  },
  {
    id: "c2",
    ask: { en: "Has anyone from Najm contacted you?", ar: "هل تواصل معك أحد من نجم؟" },
    options: [
      { id: "c2a", label: { en: "No contact at all", ar: "ولا أحد تواصل" } },
      { id: "c2b", label: { en: "I was told to wait", ar: "قالوا لي انتظر" } },
      { id: "c2c", label: { en: "Yes, but nothing changed", ar: "نعم، لكن ما تغيّر شيء" } },
    ],
  },
];

export const OBJECTION_QUESTIONS: SupportQuestion[] = [
  {
    id: "o1",
    ask: { en: "What is the objection based on?", ar: "على أي أساس اعتراضك؟" },
    options: [
      {
        id: "o1a",
        label: { en: "The other driver's account is wrong", ar: "رواية الطرف الآخر غير صحيحة" },
      },
      { id: "o1b", label: { en: "My evidence was not considered", ar: "أدلّتي ما أُخذت بالحسبان" } },
      { id: "o1c", label: { en: "The fault percentage is wrong", ar: "نسبة المسؤولية غير صحيحة" } },
    ],
  },
  {
    id: "o2",
    ask: { en: "Do you have anything to support it?", ar: "هل لديك ما يدعم اعتراضك؟" },
    options: [
      { id: "o2a", label: { en: "Dashcam video", ar: "مقطع من كاميرا السيارة" } },
      { id: "o2b", label: { en: "Photos of the scene", ar: "صور من موقع الحادث" } },
      { id: "o2c", label: { en: "A witness", ar: "شاهد عيان" } },
      { id: "o2d", label: { en: "Nothing further", ar: "لا شيء إضافي" } },
    ],
  },
];

/** What the assistant hands the human team. Mocked, like everything else here. */
export const SUPPORT_STATUS = {
  ref: CASE_REF,
  latestUpdate: {
    en: "Assessor assignment in progress — no change since the report was filed.",
    ar: "جارٍ تعيين مُقيّم — لا تغيير منذ تسجيل البلاغ.",
  },
  updatedAt: "2:40",
} as const;

export const SUPPORT_COMPLAINT: Complaint = {
  ref: "NJM-C-2026-0121",
  pickedType: "service",
  type: "delay",
  urgency: "high",
  aboutCase: CASE_REF,
  lang: "AR",
  said: {
    en: "Case has not been updated; no contact from Najm for over a month.",
    ar: "القضية ما تحدّثت؛ ولا تواصل من نجم لأكثر من شهر.",
  },
  filedAt: "2:54",
  daysLeft: 10,
  confidence: 94,
  department: "claims",
};

export const SUPPORT_OBJECTION: Complaint = {
  ref: "NJM-O-2026-0042",
  pickedType: "verdict",
  type: "verdict",
  urgency: "high",
  aboutCase: CASE_REF,
  lang: "AR",
  said: {
    en: "Objects to the liability split; says the other driver's account is wrong and has dashcam video.",
    ar: "يعترض على توزيع المسؤولية؛ يقول إن رواية الطرف الآخر غير صحيحة ولديه مقطع من كاميرا السيارة.",
  },
  filedAt: "2:56",
  daysLeft: 10,
  confidence: 91,
  department: "liability",
};
