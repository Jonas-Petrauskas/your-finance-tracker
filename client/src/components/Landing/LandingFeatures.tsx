import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { LandingFeatureMini } from './LandingFeatureMini'

const FEATURE_KEYS = ['pulse', 'bills', 'calm'] as const

export function LandingFeatures() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`landing-reasons ${visible ? 'landing-reasons-visible' : ''}`}
    >
      <div className="landing-reasons-inner">
        <div className="landing-reasons-intro">
          <h2 className="display text-2xl font-semibold tracking-tight text-(--ink) sm:text-3xl">
            {t('landing.featuresTitle')}
          </h2>
          <p className="mt-3 max-w-xl text-base text-(--muted) sm:text-lg">
            {t('landing.featuresIntro')}
          </p>
        </div>

        <ul className="landing-feature-list">
          {FEATURE_KEYS.map((key, index) => (
            <li
              key={key}
              className="landing-feature-item"
              style={{ '--feature-i': index } as CSSProperties}
            >
              <div className="landing-feature-visual" aria-hidden>
                <LandingFeatureMini feature={key} />
              </div>
              <div className="landing-feature-copy">
                <h3 className="display text-xl font-semibold text-(--ink) sm:text-2xl">
                  {t(`landing.features.${key}.title`)}
                </h3>
                <p className="mt-2 text-(--muted) sm:text-lg">
                  {t(`landing.features.${key}.description`)}
                </p>
                <p className="landing-feature-detail mt-3 text-sm text-(--ink)/75 sm:text-base">
                  {t(`landing.features.${key}.detail`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
