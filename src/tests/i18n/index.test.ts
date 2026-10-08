import { describe, expect, it } from 'vitest'
import { t } from '@/i18n'

describe('t', () => {
  it('returns the translation by key', () => {
    expect(t('sidebar.title')).toBe('Чаты')
  })

  it('substitutes params', () => {
    expect(t('login.notAuthorized', { state: 'blocked' })).toBe('Инстанс не авторизован (состояние: blocked)')
  })

  it('keeps placeholders without params', () => {
    expect(t('chat.sendError')).toBe('Не удалось отправить: {message}')
  })
})
