import type { Chat } from '@/types'
import { Avatar } from '@/components/Avatar'
import { t } from '@/i18n'
import '@/styles/components/Banner.scss'

export function EmptyChatBanner({ chat }: { chat: Chat }) {
  return (
    <div className="banner banner--chat">
      <Avatar name={chat.name} />
      <h2 className="banner__title">{chat.name}</h2>
      <p className="banner__text">{t('emptyChat.text')}</p>
    </div>
  )
}
