import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type LegalDoc = 'privacy' | 'terms'

const SECTION_COUNTS: Record<LegalDoc, number> = {
  privacy: 7,
  terms: 7,
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation()
  const updated = t(`legal.${doc}.updated`)
  const sectionCount = SECTION_COUNTS[doc]

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="text-left">
        <Link
          to="/"
          className="text-sm font-medium text-(--muted) underline-offset-2 hover:text-(--ink) hover:underline"
        >
          {t('legal.back')}
        </Link>
        <h1 className="display mt-4 text-3xl font-semibold tracking-tight text-(--ink) sm:text-4xl">
          {t(`legal.${doc}.title`)}
        </h1>
        <p className="mt-2 text-sm text-(--muted)">{updated}</p>
      </header>

      <div className="flex flex-col gap-7 text-left">
        {Array.from({ length: sectionCount }, (_, i) => {
          const n = i + 1
          return (
            <section key={n}>
              <h2 className="display text-lg font-semibold tracking-tight text-(--ink)">
                {t(`legal.${doc}.s${n}.heading`)}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-(--muted)">
                {t(`legal.${doc}.s${n}.body`)}
              </p>
            </section>
          )
        })}
      </div>

      <p className="border-t border-(--line) pt-6 text-sm text-(--muted)">
        {t('legal.footerNote')}
      </p>
    </div>
  )
}

export function PrivacyPage() {
  return <LegalPage doc="privacy" />
}

export function TermsPage() {
  return <LegalPage doc="terms" />
}
