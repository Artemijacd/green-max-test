import { AVATAR_COLORS } from '@/constants'

export function useAvatar(name: string) {
  const letter = name.replace(/^\+/, '').charAt(0).toUpperCase() || '?'
  const color = AVATAR_COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length]
  return { letter, color }
}
