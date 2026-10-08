import { ru } from '@/i18n/ru'

export type LocaleKey = keyof typeof ru

export const t = (key: LocaleKey, params?: Record<string, string | number>): string =>
  ru[key].replace(/\{(\w+)\}/g, (match, name: string) => String(params?.[name] ?? match))
