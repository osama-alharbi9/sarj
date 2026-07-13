import type { Config } from "tailwindcss";

/**
 * Tokens are transcribed verbatim from the design-system README
 * ("Handoff: Najm × Sarj AI Voice Intake" → Design Tokens).
 *
 * Colour split is the core of the pitch and is enforced by naming:
 *   najm-*    → operational chrome (tickets, statuses, queues, refs, buttons)
 *   sarj-*    → AI-native elements only (waveform, transcript, language badge,
 *               OCR panel, completeness meter)
 * Never mix.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        najm: {
          green: "#0F5C43",
          deep: "#0A3D2E",
          bezel: "#0A2A20",
          tint: "#E7F1EC",
          border: "#D6E7DE",
          "border-strong": "#C7E0D4",
          "on-dark": "#A9D4C3",
          "on-dark-soft": "#8FBCAA",
          "on-dark-mute": "#CDE5DB",
        },
        sarj: {
          violet: "#6C5CE7",
          hover: "#5B4BD6",
          deep: "#4A3FA8",
          tint: "#F0EEFC",
          border: "#DCD6F7",
          "border-soft": "#E4DFFA",
          "on-dark": "#A99BF5",
          faint: "#B7AEF2",
        },
        page: "#EDF1EE",
        screen: "#F7FAF8",
        ink: {
          DEFAULT: "#16241D",
          soft: "#4A5A52",
          muted: "#7A8880",
          "muted-2": "#8A988F",
          faint: "#9AA8A0",
          "faint-2": "#B4C0B9",
          sub: "#5B6B63",
          gloss: "#6E8378",
        },
        hair: {
          DEFAULT: "#E4E9E6",
          alt: "#E1E8E4",
          inner: "#F0F3F1",
        },
        ok: {
          text: "#0F7A50",
          tint: "#E4F3EC",
          live: "#3FD98B",
        },
        warn: {
          text: "#B8791A",
          tint: "#FBF2E0",
          dot: "#F5A623",
          "dot-soft": "#F5C24B",
        },
        danger: {
          text: "#C0392B",
          tint: "#FCECEC",
          row: "#FDF4F3",
          avatar: "#FADED9",
        },
        lang: {
          "en-tint": "#EFF3F6",
          "en-text": "#4A6785",
        },
      },
      fontFamily: {
        ar: ["var(--font-plex-ar)", "system-ui", "sans-serif"],
        latin: ["var(--font-plex)", "system-ui", "sans-serif"],
        ur: ["var(--font-nastaliq)", "serif"],
      },
      borderRadius: {
        pill: "8px",
        chip: "10px",
        "chip-lg": "11px",
        card: "14px",
        "card-lg": "16px",
        "card-xl": "18px",
        screen: "34px",
        bezel: "46px",
      },
      boxShadow: {
        bezel:
          "0 30px 60px -20px rgba(10,42,32,.5), 0 0 0 1px rgba(255,255,255,.04) inset",
        lift: "0 8px 24px -16px rgba(16,40,30,.3)",
        primary: "0 10px 22px -10px rgba(15,92,67,.6)",
        "primary-sm": "0 10px 22px -12px rgba(15,92,67,.6)",
        accent: "0 6px 18px -12px rgba(108,92,231,.4)",
        mic: "0 8px 20px -6px rgba(108,92,231,.6)",
      },
      keyframes: {
        sarjWave: {
          "0%,100%": { transform: "scaleY(.32)" },
          "50%": { transform: "scaleY(1)" },
        },
        ringPulse: {
          "0%": { transform: "scale(.7)", opacity: ".55" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        msgIn: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" },
        },
        typingDot: {
          "0%,60%,100%": { transform: "translateY(0)", opacity: ".35" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        meterGrow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        popIn: {
          "0%": { transform: "scale(.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        softglow: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(108,92,231,.35)" },
          "50%": { boxShadow: "0 0 0 10px rgba(108,92,231,0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        /* The orb is the whole screen, so its state has to be legible from the
           motion alone — no labels, no glyph. */
        orbIdle: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.04)" },
        },
        orbSpeak: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.07)" },
        },
        orbListen: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.1)" },
        },
        cardUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "ring-pulse": "ringPulse 2.4s ease-out infinite",
        "msg-in": "msgIn .5s ease both",
        "typing-dot": "typingDot 1.2s ease infinite",
        "meter-grow": "meterGrow .9s ease both",
        "pop-in": "popIn .5s cubic-bezier(.34,1.56,.64,1) both",
        softglow: "softglow 2s ease infinite",
        "fade-in": "fadeIn .35s ease both",
        "orb-idle": "orbIdle 3s ease-in-out infinite alternate",
        "orb-speak": "orbSpeak 1.7s ease-in-out infinite alternate",
        "orb-listen": "orbListen 2.4s ease-in-out infinite alternate",
        "card-up": "cardUp .25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
