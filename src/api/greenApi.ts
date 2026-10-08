import * as mock from '@/api/mockGreenApi'
import { API_URL, MESSAGE_TYPES, RECEIVE_TIMEOUT_SEC, USE_MOCK } from '@/constants'
import { t } from '@/i18n'

export interface Credentials {
  idInstance: string
  apiTokenInstance: string
}

export interface WebhookBody {
  typeWebhook: string
  idMessage?: string
  timestamp?: number
  senderData?: {
    chatId: string
    chatName?: string
    senderName?: string
  }
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}

export interface Notification {
  receiptId: number
  body: WebhookBody
}

const methodUrl = (c: Credentials, method: string) =>
  `${API_URL}/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}`

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch (e) {
    // fetch rejects with TypeError on network/CORS failures; AbortError must pass through
    if (e instanceof TypeError) throw new Error(t('api.networkError'))
    throw e
  }
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ''}`)
  return (text ? JSON.parse(text) : null) as T
}

const realApi = {
  getStateInstance: (c: Credentials) => request<{ stateInstance: string }>(methodUrl(c, 'getStateInstance')),

  sendMessage: (c: Credentials, chatId: string, message: string) =>
    request<{ idMessage: string }>(methodUrl(c, 'sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    }),

  receiveNotification: (c: Credentials, signal?: AbortSignal) =>
    request<Notification | null>(`${methodUrl(c, 'receiveNotification')}?receiveTimeout=${RECEIVE_TIMEOUT_SEC}`, {
      signal,
    }),

  deleteNotification: (c: Credentials, receiptId: number) =>
    request<{ result: boolean }>(`${methodUrl(c, 'deleteNotification')}/${receiptId}`, { method: 'DELETE' }),
}

export const { getStateInstance, sendMessage, receiveNotification, deleteNotification } = USE_MOCK ? mock : realApi

export const extractText = (body: WebhookBody): string | null => {
  const data = body.messageData
  if (!data) return null
  if (data.typeMessage === MESSAGE_TYPES.text) return data.textMessageData?.textMessage ?? null
  if (data.typeMessage === MESSAGE_TYPES.extendedText) return data.extendedTextMessageData?.text ?? null
  return null
}
