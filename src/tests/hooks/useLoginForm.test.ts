import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLoginForm } from '@/hooks/useLoginForm'
import { getStateInstance } from '@/api/greenApi'
import { t } from '@/i18n'

vi.mock('@/api/greenApi', () => ({ getStateInstance: vi.fn() }))

const ID_INSTANCE = '1101000001'
const TOKEN = 'd75b3a66374942c5b3c019c698abc2067e151558acbd451234'

const fillForm = (result: { current: ReturnType<typeof useLoginForm> }, idInstance = ID_INSTANCE) => {
  act(() => result.current.changeField('idInstance', ` ${idInstance} `))
  act(() => result.current.changeField('apiTokenInstance', TOKEN))
}

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.mocked(getStateInstance).mockReset()
  })

  it('trims field values', () => {
    const { result } = renderHook(() => useLoginForm(vi.fn()))
    fillForm(result)
    expect(result.current.form.idInstance).toBe(ID_INSTANCE)
  })

  it('validates the format before calling the API', async () => {
    const { result } = renderHook(() => useLoginForm(vi.fn()))
    fillForm(result, '123')

    await act(() => result.current.submit())

    expect(result.current.error).toBe(t('login.invalidIdInstance'))
    expect(getStateInstance).not.toHaveBeenCalled()
  })

  it('logs in when the instance is authorized', async () => {
    vi.mocked(getStateInstance).mockResolvedValue({ stateInstance: 'authorized' })
    const onLogin = vi.fn()
    const { result } = renderHook(() => useLoginForm(onLogin))
    fillForm(result)

    await act(() => result.current.submit())

    expect(onLogin).toHaveBeenCalledWith({ idInstance: ID_INSTANCE, apiTokenInstance: TOKEN })
    expect(result.current.loading).toBe(false)
  })

  it('shows the state when the instance is not authorized', async () => {
    vi.mocked(getStateInstance).mockResolvedValue({ stateInstance: 'notAuthorized' })
    const onLogin = vi.fn()
    const { result } = renderHook(() => useLoginForm(onLogin))
    fillForm(result)

    await act(() => result.current.submit())

    expect(result.current.error).toBe(t('login.notAuthorized', { state: 'notAuthorized' }))
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('shows the request error', async () => {
    vi.mocked(getStateInstance).mockRejectedValue(new Error('HTTP 401'))
    const { result } = renderHook(() => useLoginForm(vi.fn()))
    fillForm(result)

    await act(() => result.current.submit())

    expect(result.current.error).toBe(t('login.connectionError', { message: 'HTTP 401' }))
    expect(result.current.loading).toBe(false)
  })
})
