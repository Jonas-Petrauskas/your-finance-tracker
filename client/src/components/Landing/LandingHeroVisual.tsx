export function LandingHeroVisual() {
  return (
    <div className="landing-visual" aria-hidden>
      <div className="landing-visual-glow" />
      <svg
        className="landing-visual-svg"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="landing-ring landing-ring-a" cx="160" cy="160" r="128" />
        <circle className="landing-ring landing-ring-b" cx="160" cy="160" r="96" />
        <circle className="landing-ring landing-ring-c" cx="160" cy="160" r="64" />

        <path
          className="landing-runway-line"
          d="M36 228 C 72 210, 88 168, 118 158 C 148 148, 162 198, 198 186 C 234 174, 248 118, 284 96"
        />
        <circle className="landing-runway-dot" cx="284" cy="96" r="7" />

        <g className="landing-bars">
          <rect className="landing-bar landing-bar-1" x="58" y="168" width="22" height="72" rx="6" />
          <rect className="landing-bar landing-bar-2" x="98" y="140" width="22" height="100" rx="6" />
          <rect className="landing-bar landing-bar-3" x="138" y="152" width="22" height="88" rx="6" />
          <rect className="landing-bar landing-bar-4" x="178" y="120" width="22" height="120" rx="6" />
          <rect className="landing-bar landing-bar-5" x="218" y="108" width="22" height="132" rx="6" />
        </g>
      </svg>
    </div>
  )
}
