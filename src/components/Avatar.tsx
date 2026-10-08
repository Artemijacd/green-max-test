import { useAvatar } from '@/hooks/useAvatar'
import '@/styles/components/Avatar.scss'

export function Avatar({ name }: { name: string }) {
  const { letter, color } = useAvatar(name)
  return (
    <div className="avatar" style={{ background: color }}>
      {letter}
    </div>
  )
}
