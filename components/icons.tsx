/** Inline SVG icon set — shapes and sizes taken from the design reference. */

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

export function CheckIcon({ size = 13, color = "#0F5C43", width = 2.4 }: IconProps & { width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MicIcon({ size = 26, color = "#fff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
      <path d="M18 11a1 1 0 0 0-2 0 4 4 0 0 1-8 0 1 1 0 0 0-2 0 6 6 0 0 0 5 5.9V19H8.5a1 1 0 0 0 0 2h7a1 1 0 0 0 0-2H13v-2.1A6 6 0 0 0 18 11z" />
    </svg>
  );
}

export function PersonIcon({ size = 16, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0z" />
    </svg>
  );
}

export function PersonOutlineIcon({ size = 18, color = "#fff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TwoPeopleIcon({ size = 19, color = "#0F5C43" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <circle cx="8" cy="8" r="3.2" />
      <circle cx="16" cy="8" r="3.2" />
      <path d="M2 19a6 6 0 0 1 12 0zM12 19a6 6 0 0 1 10-4" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 19, color = "#0F5C43" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" stroke={color} strokeWidth="1.8" />
      <path
        d="M8 12l2.5 2.5L16 9"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 19, color = "#0F5C43" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon({ size = 17, color = "#fff" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5v5l3 2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ size = 15, color = "#0F5C43" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 5l7 7-7 7M20 12H4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LangArrowIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden>
      <path
        d="M1 7h16M12 2l6 5-6 5"
        stroke="#6C5CE7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WarningTriangleIcon({ size = 12, color = "#C0392B" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l9 16H3z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v4M12 16.5v.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function OcrFrameIcon({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7V5a1 1 0 0 1 1-1h2M4 17v2a1 1 0 0 0 1 1h2M20 7V5a1 1 0 0 0-1-1h-2M20 17v2a1 1 0 0 1-1 1h-2M4 12h16"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MapPinIcon({ size = 20, color = "#0F5C43" }: IconProps & { style?: object }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
      <circle cx="12" cy="9" r="2.6" fill="#fff" />
    </svg>
  );
}

/* iOS-style status-bar glyphs (LTR run) */

export function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
      <rect x="0" y="7" width="3" height="5" rx="1" />
      <rect x="4.5" y="4.5" width="3" height="7.5" rx="1" />
      <rect x="9" y="2" width="3" height="10" rx="1" />
      <rect x="13.5" y="0" width="3" height="12" rx="1" />
    </svg>
  );
}

export function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
      <path
        d="M8 2.6c2 0 3.9.8 5.3 2.1l1.2-1.3C13 1.7 10.6.8 8 .8S3 1.7 1.5 3.4l1.2 1.3C4.1 3.4 6 2.6 8 2.6z"
        opacity=".9"
      />
      <path d="M8 6c1.1 0 2.2.4 3 1.2l1.2-1.3C11 4.7 9.6 4.1 8 4.1s-3 .6-4.2 1.8L5 7.2C5.8 6.4 6.9 6 8 6z" />
      <circle cx="8" cy="9.6" r="1.6" />
    </svg>
  );
}

export function BatteryIcon() {
  return (
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden>
      <rect
        x="1"
        y="1"
        width="20"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity=".6"
      />
      <rect x="2.5" y="2.5" width="15" height="7" rx="1" fill="currentColor" />
      <rect x="22" y="4" width="1.6" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}
