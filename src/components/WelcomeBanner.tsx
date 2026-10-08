import { t, type LocaleKey } from '@/i18n'
import '@/styles/components/Banner.scss'

const STEPS: LocaleKey[] = ['welcome.step1', 'welcome.step2', 'welcome.step3']

export function WelcomeBanner() {
  return (
    <div className="banner">
      <div className="logo">{t('app.brand')}</div>
      <h2 className="banner__title">{t('welcome.title')}</h2>
      <p className="banner__text">{t('welcome.text')}</p>
      <ol className="banner__steps">
        {STEPS.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ol>
    </div>
  )
}
