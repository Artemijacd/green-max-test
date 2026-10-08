import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useChatWindow } from '@/hooks/useChatWindow'
import type { Chat } from '@/types'

const chat: Chat = { id: '79991234567@c.us', aliases: [], name: '+7 (999) 123-45-67', messages: [] }

describe('useChatWindow', () => {
  it('sends trimmed text and clears the input', () => {
    const onSend = vi.fn()
    const { result } = renderHook(() => useChatWindow(chat, onSend))

    act(() => result.current.setText('  hello  '))
    expect(result.current.canSend).toBe(true)

    act(() => result.current.send())

    expect(onSend).toHaveBeenCalledWith(chat.id, 'hello')
    expect(result.current.text).toBe('')
  })

  it('does not send whitespace-only text', () => {
    const onSend = vi.fn()
    const { result } = renderHook(() => useChatWindow(chat, onSend))

    act(() => result.current.setText('   '))
    act(() => result.current.send())

    expect(result.current.canSend).toBe(false)
    expect(onSend).not.toHaveBeenCalled()
  })
})
