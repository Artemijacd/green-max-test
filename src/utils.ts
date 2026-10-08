import type { Credentials } from '@/api/greenApi'
import {
  API_TOKEN_PATTERN,
  ID_INSTANCE_PATTERN,
  LOCALE,
  PHONE_COUNTRY_CODE,
  PHONE_MOBILE_PREFIX,
  PHONE_NATIONAL_LENGTH,
  PHONE_TRUNK_PREFIX,
} from '@/constants'
import type { LocaleKey } from '@/i18n'

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })

const COUNTRY_PREFIX = `+${PHONE_COUNTRY_CODE}`

export const phoneDigits = (value: string) => value.replace(/\D/g, '')

/**
 * Formats input as +7 (911) 123-45-67; the country code is added on the first typed digit.
 * A leading 7 or 8 is treated as the country code, so "+7 (" is shown right away unless the user is deleting.
 */
export const formatPhone = (value: string, isDeleting = false): string => {
  const digits = phoneDigits(value)
  const hasPrefix = digits.startsWith(PHONE_COUNTRY_CODE) || digits.startsWith(PHONE_TRUNK_PREFIX)
  const national = (hasPrefix ? digits.slice(1) : digits).slice(0, PHONE_NATIONAL_LENGTH)
  if (!national) return digits && !isDeleting ? `${COUNTRY_PREFIX} (` : ''

  let result = `${COUNTRY_PREFIX} (${national.slice(0, 3)}`
  if (national.length > 3) result += `) ${national.slice(3, 6)}`
  if (national.length > 6) result += `-${national.slice(6, 8)}`
  if (national.length > 8) result += `-${national.slice(8, 10)}`
  return result
}

export const getPhoneError = (value: string): LocaleKey | null => {
  const national = phoneDigits(value).slice(PHONE_COUNTRY_CODE.length)
  if (!national.startsWith(PHONE_MOBILE_PREFIX)) return 'sidebar.invalidPhonePrefix'
  if (national.length !== PHONE_NATIONAL_LENGTH) return 'sidebar.invalidPhone'
  return null
}

export const getCredentialsError = ({ idInstance, apiTokenInstance }: Credentials): LocaleKey | null => {
  if (!ID_INSTANCE_PATTERN.test(idInstance)) return 'login.invalidIdInstance'
  if (!API_TOKEN_PATTERN.test(apiTokenInstance)) return 'login.invalidApiToken'
  return null
}
