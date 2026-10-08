import { useState } from 'react'
import { getStateInstance, type Credentials } from '@/api/greenApi'
import { INSTANCE_STATE_AUTHORIZED } from '@/constants'
import { t } from '@/i18n'
import { getCredentialsError } from '@/utils'

export function useLoginForm(onLogin: (credentials: Credentials) => void) {
  const [form, setForm] = useState<Credentials>({ idInstance: '', apiTokenInstance: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const changeField = (key: keyof Credentials, value: string) => {
    setForm((f) => ({ ...f, [key]: value.trim() }))
    setError(null)
  }

  const submit = async () => {
    const credentialsError = getCredentialsError(form)
    if (credentialsError) {
      setError(t(credentialsError))
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { stateInstance } = await getStateInstance(form)
      if (stateInstance !== INSTANCE_STATE_AUTHORIZED) {
        setError(t('login.notAuthorized', { state: stateInstance }))
        return
      }
      onLogin(form)
    } catch (err) {
      setError(t('login.connectionError', { message: (err as Error).message }))
    } finally {
      setLoading(false)
    }
  }

  return { form, error, loading, changeField, submit }
}
