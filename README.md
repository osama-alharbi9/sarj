# Najm × Sarj AI — Voice Intake Demo

A scripted, clickable simulation for a live sales presentation. **Not a real AI product**: there is no backend, no API, no auth, and no model. Every word, field, and ticket is hardcoded in [`lib/mockData.ts`](lib/mockData.ts).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # clean production build, both routes static
```

## The demo

| Route | What it is |
| --- | --- |
| `/` | The caller experience, inside a 390px phone screen. |
| `/admin` | The Najm operations console: live conversations, conversation detail, ticket queue. |

One case — **NJM-2026-04512** — threads through both: a delivery rider reports an accident in Urdu at 2:14 AM, and the Najm team sees the finished, fully-extracted case.

## Running it live

The caller journey **never auto-advances**. It moves only on your input.

| Key | Action |
| --- | --- |
| `Space` (or **التالي**) | Next beat |
| `R` | Full reset — remounts the run, replays every animation from zero |
| `A` | Jump to `/admin` |

You can also click any of the seven progress dots to jump straight to a beat, and **‹ السابق** to step back. Reset is safe to hit at any point, as many times as you like: it remounts the entire run, so no timer, typewriter, or animation survives it.

### The seven beats

1. **الترحيب بالعربية** — agent greets in Arabic; animated mic + waveform.
2. **كشف اللغة** — caller answers in Urdu; the language badge switches العربية → اردو.
3. **الاستقصاء الموجَّه** — agent asks parties, location, injuries; the three progress chips fill as each is answered.
4. **المستندات** — agent asks for the registration card; OCR types the four extracted fields in one by one, each tagged «من المستند».
5. **تأكيد التفاصيل** — structured read-back; **أكّد التفاصيل** advances.
6. **إنشاء البلاغ** — ticket **NJM-2026-04512**, status قيد المراجعة, completeness ٩/٩.
7. **استعلام الحالة** — caller asks «وين وصلت قضيتي؟» at 2:14 AM and gets an instant answer.

Beat 7 ends with **شاهد ما رآه فريق نجم**, which hands over to `/admin`.

## Design system

Styling is taken from the handoff README (*Handoff: Najm × Sarj AI Voice Intake*): every colour, radius, shadow, font, keyframe, and Arabic/Urdu string comes from that spec. Tokens live in [`tailwind.config.ts`](tailwind.config.ts).

**The colour split is the pitch, and it is enforced by naming:**

- `najm-*` (dark green `#0F5C43`) owns every operational element — tickets, statuses, queues, reference numbers, buttons.
- `sarj-*` (violet `#6C5CE7`) appears **only** on AI-native elements — voice waveform, language badge, OCR panel, completeness meter, transcript labels.

Never mix them. A violet ticket or a green waveform breaks the story.

Typography is Arabic-first: **IBM Plex Sans Arabic** for UI, **IBM Plex Sans** for Latin runs (refs, plates, clocks — always wrapped in `dir="ltr"`), and **Noto Nastaliq Urdu** for the caller's Urdu lines. The calligraphic Urdu script is deliberate: it makes the language switch unmistakable from the back of the room.

## Structure

```
app/
  page.tsx              /       → caller
  admin/page.tsx        /admin  → console
components/
  caller/               phone frame, beats, waveform, OCR, screens
  admin/Console.tsx     three tabs
  ui.tsx  icons.tsx     shared primitives
lib/mockData.ts         ALL content — the only file to edit to change the story
```

## Notes for the presenter

- The phone scales down automatically on short viewports, so the beat controls are never below the fold.
- Next's dev overlay is disabled (`devIndicators: false`) — nothing but the product on screen.
- The registration card is drawn in markup, not a binary asset, so it renders identically on any machine.
