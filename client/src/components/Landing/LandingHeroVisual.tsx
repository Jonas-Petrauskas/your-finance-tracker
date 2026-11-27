/** Decorative week-pulse scene for the landing hero (not live data). */
export function LandingHeroVisual() {
  return (
    <div className="landing-visual" aria-hidden>
      <div className="landing-visual-glow" />
      <span className="landing-bubble landing-bubble-1" />
      <span className="landing-bubble landing-bubble-2" />
      <span className="landing-bubble landing-bubble-3" />

      <svg
        className="landing-visual-svg"
        viewBox="0 0 360 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="landingArc" x1="40" y1="230" x2="320" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e8a06a" stopOpacity="0.35" />
            <stop offset="0.45" stopColor="#e07a4a" stopOpacity="0.85" />
            <stop offset="1" stopColor="#5b8fd4" />
          </linearGradient>
        </defs>

        {/* Soft week-cycle ring — background context only */}
        <circle className="landing-week-ring" cx="180" cy="180" r="128" />

        <path
          className="landing-week-arc"
          d="M48 248 C 92 210, 112 168, 148 152 C 188 134, 210 198, 248 176 C 286 156, 304 118, 328 96"
          stroke="url(#landingArc)"
        />

        <circle className="landing-day landing-day-1" cx="72" cy="232" r="8" />
        <circle className="landing-day landing-day-2" cx="128" cy="158" r="8" />
        <circle className="landing-day landing-day-3" cx="188" cy="168" r="8" />
        <circle className="landing-day landing-day-4" cx="246" cy="172" r="8" />
        <circle className="landing-day landing-day-5" cx="308" cy="112" r="8" />

        {/* “You’re fine” tip at end of the week path */}
        <circle className="landing-week-tip" cx="328" cy="96" r="12" />
        <circle className="landing-week-tip-core" cx="328" cy="96" r="5" />
      </svg>
    </div>
  )
}
