import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LandingHeroVisual } from '../components/Landing/LandingHeroVisual'
import '../components/Landing/landing.css'

const FEATURE_KEYS = ['plan', 'bills', 'wealth'] as const

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="landing relative overflow-x-hidden">
      <div className="landing-blobs pointer-events-none absolute inset-0" aria-hidden>
        <span className="landing-blob landing-blob-income" />
        <span className="landing-blob landing-blob-expense" />
        <span className="landing-blob landing-blob-left" />
        <span className="landing-blob landing-blob-warm" />
      </div>

      <section className="relative mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
          <div className="landing-hero-copy flex max-w-xl flex-col gap-5 text-left">
            <p className="landing-fade landing-delay-1 text-sm font-medium uppercase tracking-[0.2em] text-(--accent)">
              {t('landing.brand')}
            </p>
            <h1 className="landing-fade landing-delay-2 display text-4xl font-bold leading-[1.1] tracking-tight text-(--ink) sm:text-5xl md:text-6xl">
              {t('landing.headline')}
            </h1>
            <p className="landing-fade landing-delay-3 text-lg text-(--muted) sm:text-xl">
              {t('landing.blurb')}
            </p>
            <div className="landing-fade landing-delay-4 pt-1">
              <Link
                to="/months"
                className="btn-primary landing-cta inline-flex px-6 py-3 text-base"
              >
                {t('landing.cta')}
              </Link>
            </div>
          </div>

          <div className="landing-fade landing-delay-3 flex justify-center lg:justify-end">
            <LandingHeroVisual />
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <h2 className="display text-2xl font-semibold tracking-tight text-(--ink) sm:text-3xl">
          {t('landing.featuresTitle')}
        </h2>
        <p className="mt-2 max-w-lg text-(--muted)">{t('landing.featuresIntro')}</p>
        <ul className="mt-10 flex flex-col gap-8 sm:gap-10">
          {FEATURE_KEYS.map((key, index) => (
            <li
              key={key}
              className={`landing-feature-row landing-feature-delay-${index + 1} flex gap-4 text-left`}
            >
              <span
                className={`landing-feature-dot mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  key === 'plan'
                    ? 'bg-(--income)'
                    : key === 'bills'
                      ? 'bg-(--expense)'
                      : 'bg-(--left)'
                }`}
                aria-hidden
              />
              <div>
                <h3 className="display text-lg font-semibold text-(--ink)">
                  {t(`landing.features.${key}.title`)}
                </h3>
                <p className="mt-1 text-(--muted)">
                  {t(`landing.features.${key}.description`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
