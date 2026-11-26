import { SignInButton, useAuth } from '@clerk/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LandingFeatures } from '../components/Landing/LandingFeatures'
import { LandingHeroVisual } from '../components/Landing/LandingHeroVisual'
import '../components/Landing/landing.css'

function LandingCta() {
  const { t } = useTranslation()
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <span className="landing-cta landing-cta-pending" aria-hidden>
        {t('landing.cta')}
      </span>
    )
  }

  if (isSignedIn) {
    return (
      <Link to="/months" className="landing-cta">
        {t('landing.ctaSignedIn')}
      </Link>
    )
  }

  return (
    <SignInButton mode="modal" forceRedirectUrl="/months">
      <button type="button" className="landing-cta">
        {t('landing.cta')}
      </button>
    </SignInButton>
  )
}

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="landing">
      <div className="landing-stage">
        <div className="landing-mesh" aria-hidden />
        <div className="landing-mesh-blobs" aria-hidden>
          <span className="landing-blob landing-blob-a" />
          <span className="landing-blob landing-blob-b" />
          <span className="landing-blob landing-blob-c" />
        </div>

        <section className="landing-hero">
          <div className="landing-copy">
            <p className="landing-brand landing-fade landing-delay-1">{t('landing.brand')}</p>
            <h1 className="landing-headline landing-fade landing-delay-2 display">
              {t('landing.headline')}
            </h1>
            <p className="landing-blurb landing-fade landing-delay-3">{t('landing.blurb')}</p>
            <div className="landing-cta-slot landing-fade landing-delay-4">
              <LandingCta />
            </div>
          </div>

          <div className="landing-visual-wrap">
            <LandingHeroVisual />
          </div>
        </section>
      </div>

      <LandingFeatures />
    </div>
  )
}
