import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import type { Chat } from '@/types'
import { Avatar } from '@/components/Avatar'
import { EmptyChatBanner } from '@/components/EmptyChatBanner'
import { formatTime } from '@/utils'
import { ICONS, MAX_MESSAGE_LENGTH } from '@/constants'
import { t } from '@/i18n'
import { useChatWindow } from '@/hooks/useChatWindow'
import '@/styles/components/ChatWindow.scss'

interface Props {
  chat: Chat
  onSend: (chatId: string, text: string) => void
  onBack: () => void
}

export function ChatWindow({ chat, onSend, onBack }: Props) {
  const { text, setText, canSend, send } = useChatWindow(chat, onSend)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [chat.messages.length, chat.id])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <section className="chat">
      <header className="chat__header">
        <button className="chat__back link" onClick={onBack} aria-label={t('chat.back')}>
          {ICONS.back}
        </button>
        <Avatar name={chat.name} />
        <div>
          <div className="chat__name">{chat.name}</div>
          <div className="chat__sub">{chat.id}</div>
        </div>
      </header>

      <div className="chat__messages" ref={listRef}>
        {!chat.messages.length && <EmptyChatBanner chat={chat} />}
        {chat.messages.map((m) => (
          <div key={m.id} className={`bubble ${m.outgoing ? 'bubble--out' : 'bubble--in'}`}>
            <span className="bubble__text">{m.text}</span>
            <span className="bubble__meta">
              {formatTime(m.timestamp)}
              {m.outgoing && m.status && (
                <span className={`bubble__status bubble__status--${m.status}`}>{ICONS[m.status]}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <textarea
          rows={1}
          placeholder={t('chat.messagePlaceholder')}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="composer__send" disabled={!canSend} aria-label={t('chat.send')}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
          </svg>
        </button>
      </form>
    </section>
  )
}
