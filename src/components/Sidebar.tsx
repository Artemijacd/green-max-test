import type { FormEvent } from 'react'
import type { Chat } from '@/types'
import { Avatar } from '@/components/Avatar'
import { formatTime } from '@/utils'
import { t } from '@/i18n'
import { useSidebar } from '@/hooks/useSidebar'
import '@/styles/components/Sidebar.scss'

interface Props {
  chats: Chat[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: (phone: string) => string | null
  onLogout: () => void
}

export function Sidebar({ chats, activeId, onSelect, onCreate, onLogout }: Props) {
  const { phone, error, canCreate, changePhone, createChat } = useSidebar(onCreate)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    createChat()
  }

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2>{t('sidebar.title')}</h2>
        <button className="link" onClick={onLogout}>
          {t('sidebar.logout')}
        </button>
      </header>

      <form className="new-chat" onSubmit={onSubmit}>
        <input
          type="tel"
          inputMode="tel"
          placeholder={t('sidebar.phonePlaceholder')}
          value={phone}
          onChange={(e) => changePhone(e.target.value)}
        />
        <button className="btn btn--small" disabled={!canCreate}>
          {t('sidebar.create')}
        </button>
      </form>
      {error && <div className="new-chat__error">{error}</div>}

      <ul className="chat-list">
        {chats.map((chat) => {
          const last = chat.messages.at(-1)
          return (
            <li
              key={chat.id}
              className={`chat-list__item${chat.id === activeId ? ' chat-list__item--active' : ''}`}
              onClick={() => onSelect(chat.id)}
            >
              <Avatar name={chat.name} />
              <div className="chat-list__body">
                <div className="chat-list__row">
                  <span className="chat-list__name">{chat.name}</span>
                  {last && <span className="chat-list__time">{formatTime(last.timestamp)}</span>}
                </div>
                <div className="chat-list__preview">
                  {last ? `${last.outgoing ? t('sidebar.youPrefix') : ''}${last.text}` : t('sidebar.noMessages')}
                </div>
              </div>
            </li>
          )
        })}
        {!chats.length && <li className="chat-list__empty">{t('sidebar.empty')}</li>}
      </ul>
    </aside>
  )
}
