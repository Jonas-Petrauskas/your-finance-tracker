type FeatureKey = 'pulse' | 'bills' | 'calm'

export function LandingFeatureMini({ feature }: { feature: FeatureKey }) {
  if (feature === 'pulse') {
    return (
      <svg className="landing-mini" viewBox="0 0 96 96" aria-hidden>
        <circle className="landing-mini-ring" cx="48" cy="48" r="34" />
        <path
          className="landing-mini-wave"
          d="M14 58 C 26 42, 34 70, 46 52 C 58 34, 66 60, 82 40"
        />
        <circle className="landing-mini-tip" cx="82" cy="40" r="4" />
      </svg>
    )
  }

  if (feature === 'bills') {
    return (
      <svg className="landing-mini" viewBox="0 0 96 96" aria-hidden>
        <rect className="landing-mini-sheet" x="22" y="18" width="52" height="60" rx="8" />
        <line className="landing-mini-line" x1="34" y1="36" x2="62" y2="36" />
        <line className="landing-mini-line landing-mini-line-2" x1="34" y1="48" x2="56" y2="48" />
        <line className="landing-mini-line landing-mini-line-3" x1="34" y1="60" x2="50" y2="60" />
        <circle className="landing-mini-check-bg" cx="66" cy="66" r="14" />
        <path className="landing-mini-check" d="M59 66 L64 71 L74 59" />
      </svg>
    )
  }

  return (
    <svg className="landing-mini" viewBox="0 0 96 96" aria-hidden>
      <circle className="landing-mini-soft" cx="48" cy="48" r="30" />
      <circle className="landing-mini-soft-inner" cx="48" cy="48" r="18" />
      <path
        className="landing-mini-breath"
        d="M28 52 C 36 40, 44 40, 48 48 C 52 56, 60 56, 68 44"
      />
    </svg>
  )
}
