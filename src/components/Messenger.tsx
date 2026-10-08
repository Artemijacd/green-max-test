import type { Credentials } from '@/api/greenApi'
import { Sidebar } from '@/components/Sidebar'
import { ChatWindow } from '@/components/ChatWindow'
import { WelcomeBanner } from '@/components/WelcomeBanner'
import { useMessenger } from '@/hooks/useMessenger'

interface Props {
  credentials: Credentials
  onLogout: () => void
}

export function Messenger({ credentials, onLogout }: Props) {
  const { chats, activeChat, setActiveId, closeChat, createChat, send, error } = useMessenger(credentials)

  return (
    <div className="layout">
      <Sidebar
        chats={chats}
        activeId={activeChat?.id ?? null}
        onSelect={setActiveId}
        onCreate={createChat}
        onLogout={onLogout}
      />
      <main className="main">
        {error && <div className="toast">{error}</div>}
        {activeChat ? <ChatWindow chat={activeChat} onSend={send} onBack={closeChat} /> : <WelcomeBanner />}
      </main>
    </div>
  )
}
