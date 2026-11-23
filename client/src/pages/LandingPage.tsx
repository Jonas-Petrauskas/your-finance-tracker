import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const FEATURE_KEYS = ['plan', 'bills', 'wealth'] as const

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="landing relative overflow-x-hidden">
      <div className="landing-blobs pointer-events-none absolute inset-0" aria-hidden>
        <span className="landing-blob landing-blob-income" />
        <span className="landing-blob landing-blob-expense" />
        <span className="landing-blob landing-blob-left" />
      </div>

      <section className="relative mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 px-4 py-16 sm:px-6">
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
              className="btn-primary inline-flex px-6 py-3 text-base"
            >
              {t('landing.cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2 className="display text-2xl font-semibold tracking-tight text-(--ink) sm:text-3xl">
          {t('landing.featuresTitle')}
        </h2>
        <p className="mt-2 max-w-lg text-(--muted)">{t('landing.featuresIntro')}</p>
        <ul className="mt-10 flex flex-col gap-8 sm:gap-10">
          {FEATURE_KEYS.map((key) => (
            <li key={key} className="flex gap-4 text-left">
              <span
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
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
