import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function LandingFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <p className="landing-footer-name">{t('landing.footer.brand')}</p>
          <p className="landing-footer-tagline">{t('landing.footer.tagline')}</p>
        </div>

        <div className="landing-footer-meta">
          <nav className="landing-footer-nav" aria-label={t('landing.footer.navLabel')}>
            <Link to="/privacy" className="landing-footer-link">
              {t('landing.footer.privacy')}
            </Link>
            <Link to="/terms" className="landing-footer-link">
              {t('landing.footer.terms')}
            </Link>
          </nav>
          <p className="landing-footer-copy">
            {t('landing.footer.copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  )
}
