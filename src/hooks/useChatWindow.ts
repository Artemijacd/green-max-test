import { useState } from 'react'
import type { Chat } from '@/types'

export function useChatWindow(chat: Chat, onSend: (chatId: string, text: string) => void) {
  const [text, setText] = useState('')
  const canSend = Boolean(text.trim())

  const send = () => {
    if (!canSend) return
    onSend(chat.id, text.trim())
    setText('')
  }

  return { text, setText, canSend, send }
}
