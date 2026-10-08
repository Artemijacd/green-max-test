import { useState } from 'react'
import type { Credentials } from '@/api/greenApi'
import { STORAGE_KEYS } from '@/constants'

const loadCredentials = (): Credentials | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.credentials)
    return raw ? (JSON.parse(raw) as Credentials) : null
  } catch {
    return null
  }
}

export function useApp() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials)

  const login = (c: Credentials) => {
    sessionStorage.setItem(STORAGE_KEYS.credentials, JSON.stringify(c))
    setCredentials(c)
  }

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.credentials)
    setCredentials(null)
  }

  return { credentials, login, logout }
}
