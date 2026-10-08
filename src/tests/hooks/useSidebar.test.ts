import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSidebar } from '@/hooks/useSidebar'

describe('useSidebar', () => {
  it('formats the phone while typing', () => {
    const { result } = renderHook(() => useSidebar(vi.fn()))

    act(() => result.current.changePhone('8'))
    expect(result.current.phone).toBe('+7 (')

    act(() => result.current.changePhone('+7 (9'))
    expect(result.current.phone).toBe('+7 (9')
    expect(result.current.canCreate).toBe(true)
  })

  it('clears the field when the last digit is deleted', () => {
    const { result } = renderHook(() => useSidebar(vi.fn()))

    act(() => result.current.changePhone('9'))
    act(() => result.current.changePhone('+7 ('))

    expect(result.current.phone).toBe('')
    expect(result.current.canCreate).toBe(false)
  })

  it('shows the error from onCreate and keeps the phone', () => {
    const onCreate = vi.fn(() => 'error text')
    const { result } = renderHook(() => useSidebar(onCreate))

    act(() => result.current.changePhone('495'))
    act(() => result.current.createChat())

    expect(onCreate).toHaveBeenCalledWith('+7 (495')
    expect(result.current.error).toBe('error text')
    expect(result.current.phone).toBe('+7 (495')
  })

  it('resets the error on change', () => {
    const { result } = renderHook(() => useSidebar(() => 'error text'))

    act(() => result.current.createChat())
    act(() => result.current.changePhone('9'))

    expect(result.current.error).toBeNull()
  })

  it('clears the phone after a successful create', () => {
    const { result } = renderHook(() => useSidebar(() => null))

    act(() => result.current.changePhone('9991234567'))
    act(() => result.current.createChat())

    expect(result.current.phone).toBe('')
    expect(result.current.error).toBeNull()
  })
})
