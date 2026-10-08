import { LoginForm } from '@/components/LoginForm'
import { Messenger } from '@/components/Messenger'
import { useApp } from '@/hooks/useApp'

export default function App() {
  const { credentials, login, logout } = useApp()

  if (!credentials) return <LoginForm onLogin={login} />
  return <Messenger key={credentials.idInstance} credentials={credentials} onLogout={logout} />
}
