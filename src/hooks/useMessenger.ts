import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteNotification,
  extractText,
  receiveNotification,
  sendMessage,
  type Credentials,
  type WebhookBody,
} from '@/api/greenApi'
import type { Chat, Message } from '@/types'
import {
  LOCAL_MESSAGE_PREFIX,
  PHONE_CHAT_SUFFIX,
  RECEIVE_RETRY_DELAY_MS,
  STORAGE_KEYS,
  WEBHOOK_TYPES,
} from '@/constants'
import { t } from '@/i18n'
import { formatPhone, getPhoneError, phoneDigits } from '@/utils'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const loadChats = (idInstance: string): Chat[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.chats(idInstance))
    return raw ? (JSON.parse(raw) as Chat[]) : []
  } catch {
    return []
  }
}

const matches = (chat: Chat, chatId: string) => chat.id === chatId || chat.aliases.includes(chatId)

const upsertMessage = (chats: Chat[], chatId: string, name: string, msg: Message): Chat[] => {
  const chat = chats.find((c) => matches(c, chatId))
  if (!chat) return [{ id: chatId, aliases: [], name, messages: [msg] }, ...chats]
  if (chat.messages.some((m) => m.id === msg.id)) return chats
  const updated = { ...chat, messages: [...chat.messages, msg] }
  return [updated, ...chats.filter((c) => c !== chat)]
}

const linkAlias = (chats: Chat[], localId: string, remoteId: string): Chat[] =>
  chats.map((c) => (c.id === localId && !matches(c, remoteId) ? { ...c, aliases: [...c.aliases, remoteId] } : c))

export function useMessenger(credentials: Credentials) {
  const [chats, setChats] = useState<Chat[]>(() => loadChats(credentials.idInstance))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sentIds = useRef(new Map<string, string>())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.chats(credentials.idInstance), JSON.stringify(chats))
  }, [chats, credentials.idInstance])

  const handleNotification = useCallback((body: WebhookBody) => {
    const { typeWebhook, idMessage, senderData } = body
    if (!senderData || !idMessage) return

    if (typeWebhook === WEBHOOK_TYPES.outgoingApi) {
      const localId = sentIds.current.get(idMessage)
      if (localId) {
        sentIds.current.delete(idMessage)
        setChats((cs) => linkAlias(cs, localId, senderData.chatId))
      }
      return
    }

    if (typeWebhook !== WEBHOOK_TYPES.incoming && typeWebhook !== WEBHOOK_TYPES.outgoing) return
    const text = extractText(body)
    if (text === null) return

    const name = senderData.chatName || senderData.senderName || senderData.chatId
    setChats((cs) =>
      upsertMessage(cs, senderData.chatId, name, {
        id: idMessage,
        text,
        outgoing: typeWebhook === WEBHOOK_TYPES.outgoing,
        timestamp: (body.timestamp ?? Date.now() / 1000) * 1000,
      }),
    )
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      while (!ctrl.signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, ctrl.signal)
          if (!notification) continue
          handleNotification(notification.body)
          await deleteNotification(credentials, notification.receiptId)
          setError(null)
        } catch (e) {
          if (ctrl.signal.aborted) return
          setError(t('chat.receiveError', { message: (e as Error).message }))
          await delay(RECEIVE_RETRY_DELAY_MS)
        }
      }
    })()
    return () => ctrl.abort()
  }, [credentials, handleNotification])

  const createChat = useCallback((phone: string): string | null => {
    const phoneError = getPhoneError(phone)
    if (phoneError) return t(phoneError)
    const digits = phoneDigits(phone)
    const id = `${digits}${PHONE_CHAT_SUFFIX}`
    setChats((cs) =>
      cs.some((c) => c.id === id) ? cs : [{ id, aliases: [], name: formatPhone(phone), messages: [] }, ...cs],
    )
    setActiveId(id)
    return null
  }, [])

  const updateMessage = (chatId: string, msgId: string, patch: Partial<Message>) =>
    setChats((cs) =>
      cs.map((c) =>
        c.id === chatId ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) } : c,
      ),
    )

  const send = useCallback(
    async (chatId: string, text: string) => {
      const tempId = `${LOCAL_MESSAGE_PREFIX}${Date.now()}`
      setChats((cs) =>
        upsertMessage(cs, chatId, chatId, {
          id: tempId,
          text,
          outgoing: true,
          timestamp: Date.now(),
          status: 'pending',
        }),
      )
      try {
        const { idMessage } = await sendMessage(credentials, chatId, text)
        sentIds.current.set(idMessage, chatId)
        updateMessage(chatId, tempId, { id: idMessage, status: 'sent' })
      } catch (e) {
        updateMessage(chatId, tempId, { status: 'error' })
        setError(t('chat.sendError', { message: (e as Error).message }))
      }
    },
    [credentials],
  )

  const closeChat = useCallback(() => setActiveId(null), [])

  const activeChat = chats.find((c) => c.id === activeId) ?? null

  return { chats, activeChat, setActiveId, closeChat, createChat, send, error }
}
