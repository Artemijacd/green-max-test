import type { FormEvent } from 'react'
import type { Credentials } from '@/api/greenApi'
import { USE_MOCK } from '@/constants'
import { t } from '@/i18n'
import { useLoginForm } from '@/hooks/useLoginForm'
import '@/styles/components/LoginForm.scss'

interface Props {
  onLogin: (credentials: Credentials) => void
}

export function LoginForm({ onLogin }: Props) {
  const { form, error, loading, changeField, submit } = useLoginForm(onLogin)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={onSubmit}>
        <div className="logo">{t('app.brand')}</div>
        <h1>{t('login.title')}</h1>
        {USE_MOCK && <div className="login__hint">{t('login.mockHint')}</div>}
        <label>
          {t('login.idInstance')}
          <input
            value={form.idInstance}
            onChange={(e) => changeField('idInstance', e.target.value)}
            required
            inputMode="numeric"
          />
        </label>
        <label>
          {t('login.apiTokenInstance')}
          <input
            value={form.apiTokenInstance}
            onChange={(e) => changeField('apiTokenInstance', e.target.value)}
            required
            type="password"
          />
        </label>
        {error && <div className="login__error">{error}</div>}
        <button className="btn" disabled={loading}>
          {loading ? t('login.checking') : t('login.submit')}
        </button>
      </form>
    </div>
  )
}
