import { useState } from 'react'
import { formatPhone } from '@/utils'

export function useSidebar(onCreate: (phone: string) => string | null) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const changePhone = (value: string) => {
    setPhone(formatPhone(value, value.length < phone.length))
    setError(null)
  }

  const createChat = () => {
    const err = onCreate(phone)
    setError(err)
    if (!err) setPhone('')
  }

  return { phone, error, canCreate: Boolean(phone), changePhone, createChat }
}
