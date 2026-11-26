/** Decorative week-pulse scene for the landing hero (not live data). */
export function LandingHeroVisual() {
  return (
    <div className="landing-visual" aria-hidden>
      <div className="landing-visual-glow" />
      <span className="landing-bubble landing-bubble-1" />
      <span className="landing-bubble landing-bubble-2" />
      <span className="landing-bubble landing-bubble-3" />
      <span className="landing-bubble landing-bubble-4" />

      <svg
        className="landing-visual-svg"
        viewBox="0 0 360 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="landingArc" x1="40" y1="230" x2="320" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0d8a55" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="#1a6fd4" stopOpacity="0.65" />
            <stop offset="1" stopColor="#0f7a5c" />
          </linearGradient>
          <linearGradient id="landingCore" x1="120" y1="120" x2="240" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e8fff4" />
            <stop offset="1" stopColor="#7ee0b8" />
          </linearGradient>
        </defs>

        <circle className="landing-ring landing-ring-a" cx="180" cy="180" r="148" />
        <circle className="landing-ring landing-ring-b" cx="180" cy="180" r="118" />
        <circle className="landing-ring landing-ring-c" cx="180" cy="180" r="88" />

        <path
          className="landing-week-arc"
          d="M42 236 C 88 205, 108 148, 152 136 C 196 124, 214 196, 256 178 C 298 160, 312 108, 332 82"
          stroke="url(#landingArc)"
        />

        <circle className="landing-day landing-day-1" cx="68" cy="220" r="7" />
        <circle className="landing-day landing-day-2" cx="126" cy="146" r="7" />
        <circle className="landing-day landing-day-3" cx="190" cy="150" r="7" />
        <circle className="landing-day landing-day-4" cx="252" cy="170" r="7" />
        <circle className="landing-day landing-day-5" cx="310" cy="112" r="7" />

        <circle className="landing-week-tip" cx="332" cy="82" r="10" />

        <circle className="landing-core" cx="180" cy="180" r="58" fill="url(#landingCore)" />
        <circle className="landing-core-ring" cx="180" cy="180" r="58" />
        <path
          className="landing-core-check"
          d="M154 182 L172 200 L210 158"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
