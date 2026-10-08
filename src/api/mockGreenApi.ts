import type { Credentials, Notification, WebhookBody } from '@/api/greenApi'
import {
  INSTANCE_STATE_AUTHORIZED,
  MESSAGE_TYPES,
  MOCK,
  PHONE_CHAT_SUFFIX,
  RECEIVE_TIMEOUT_SEC,
  WEBHOOK_TYPES,
} from '@/constants'
import { t } from '@/i18n'

const queue: Notification[] = []
const listeners = new Set<() => void>()
let lastReceiptId = 0

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const nowSec = () => Math.floor(Date.now() / 1000)

const userIdFor = (chatId: string) =>
  chatId.endsWith(PHONE_CHAT_SUFFIX) ? String(MOCK.userIdBase + Number(chatId.replace(/\D/g, '').slice(-7))) : chatId

const push = (body: WebhookBody) => {
  queue.push({ receiptId: ++lastReceiptId, body })
  listeners.forEach((l) => l())
}

export const getStateInstance = async (_c: Credentials) => {
  await delay(MOCK.responseDelayMs)
  return { stateInstance: INSTANCE_STATE_AUTHORIZED }
}

export const sendMessage = async (_c: Credentials, chatId: string, message: string) => {
  await delay(MOCK.responseDelayMs)
  const idMessage = `${MOCK.idPrefix}${Date.now()}`
  const userId = userIdFor(chatId)
  const senderName = t('mock.senderName')
  const senderData = { chatId: userId, chatName: senderName, senderName }

  setTimeout(
    () => push({ typeWebhook: WEBHOOK_TYPES.outgoingApi, idMessage, timestamp: nowSec(), senderData }),
    MOCK.outgoingWebhookDelayMs,
  )
  setTimeout(
    () =>
      push({
        typeWebhook: WEBHOOK_TYPES.incoming,
        idMessage: `${MOCK.incomingIdPrefix}${Date.now()}`,
        timestamp: nowSec(),
        senderData,
        messageData: {
          typeMessage: MESSAGE_TYPES.text,
          textMessageData: { textMessage: t('mock.reply', { text: message }) },
        },
      }),
    MOCK.replyDelayMs,
  )
  return { idMessage }
}

export const receiveNotification = (_c: Credentials, signal?: AbortSignal) =>
  new Promise<Notification | null>((resolve, reject) => {
    if (queue.length) return resolve(queue[0])

    const cleanup = () => {
      clearTimeout(timer)
      listeners.delete(onPush)
      signal?.removeEventListener('abort', onAbort)
    }
    const onPush = () => {
      cleanup()
      resolve(queue[0])
    }
    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      cleanup()
      resolve(null)
    }, RECEIVE_TIMEOUT_SEC * 1000)

    listeners.add(onPush)
    signal?.addEventListener('abort', onAbort)
  })

export const deleteNotification = async (_c: Credentials, receiptId: number) => {
  const index = queue.findIndex((n) => n.receiptId === receiptId)
  if (index !== -1) queue.splice(index, 1)
  return { result: index !== -1 }
}
