/**
 * The caller screen is one object: this orb. No icon, no ring, no waveform,
 * no label — a driver at a crash site is holding a phone to his ear, not
 * reading a UI.
 *
 * Which means the orb's motion is the only channel left to say what the call
 * is doing, so the three states differ by animation alone and each beat pins
 * one of them. Najm green: the caller is talking to Najm, not to a vendor.
 */
export type OrbState = "idle" | "speaking" | "listening";

/** Roughly 40% of the 390px screen. */
const ORB_PX = 156;

const MOTION: Record<OrbState, string> = {
  idle: "animate-orb-idle",
  speaking: "animate-orb-speak",
  listening: "animate-orb-listen",
};

export function Orb({ state = "idle" }: { state?: OrbState }) {
  return (
    <div
      className="relative flex flex-none items-center justify-center"
      style={{ width: ORB_PX * 1.2, height: ORB_PX * 1.2 }}
    >
      {/* soft halo — a glow, not a ring: no hard edge anywhere */}
      <span
        className={`absolute rounded-full bg-najm-green/25 blur-3xl ${MOTION[state]}`}
        style={{ width: ORB_PX * 1.15, height: ORB_PX * 1.15 }}
      />

      <span
        className={`relative rounded-full ${MOTION[state]}`}
        style={{
          width: ORB_PX,
          height: ORB_PX,
          background:
            "radial-gradient(circle at 50% 42%, #0F5C43 0%, #1E7355 32%, #2E8A66 60%, #A9D4C3 100%)",
          boxShadow:
            "0 0 70px rgba(15,92,67,.38), 0 26px 60px -18px rgba(15,92,67,.5)",
        }}
      />
    </div>
  );
}
