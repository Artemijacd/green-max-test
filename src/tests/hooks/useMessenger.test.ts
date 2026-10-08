import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useMessenger } from '@/hooks/useMessenger'
import { deleteNotification, receiveNotification, sendMessage, type WebhookBody } from '@/api/greenApi'
import { STORAGE_KEYS } from '@/constants'
import { t } from '@/i18n'

vi.mock('@/api/greenApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/greenApi')>()),
  sendMessage: vi.fn(),
  receiveNotification: vi.fn(),
  deleteNotification: vi.fn(),
}))

const credentials = { idInstance: '1101000001', apiTokenInstance: 'token' }
const PHONE_CHAT_ID = '79991234567@c.us'
const USER_ID = '10000000'

let queue: WebhookBody[] = []
let receiptId = 0

const notify = (body: WebhookBody) => queue.push(body)

const incoming = (chatId: string, text: string, idMessage = `in-${text}`): WebhookBody => ({
  typeWebhook: 'incomingMessageReceived',
  idMessage,
  timestamp: 1_700_000_000,
  senderData: { chatId, senderName: 'Sender' },
  messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
})

describe('useMessenger', () => {
  beforeEach(() => {
    queue = []
    vi.mocked(sendMessage).mockReset()
    vi.mocked(deleteNotification).mockReset().mockResolvedValue({ result: true })
    vi.mocked(receiveNotification)
      .mockReset()
      .mockImplementation(async () => {
        const body = queue.shift()
        if (body) return { receiptId: ++receiptId, body }
        await new Promise((r) => setTimeout(r, 5))
        return null
      })
  })

  it('validates the phone when creating a chat', () => {
    const { result } = renderHook(() => useMessenger(credentials))

    let error: string | null = null
    act(() => {
      error = result.current.createChat('+7 (495) 123-45-67')
    })

    expect(error).toBe(t('sidebar.invalidPhonePrefix'))
    expect(result.current.chats).toHaveLength(0)
  })

  it('creates and opens a chat by phone', () => {
    const { result } = renderHook(() => useMessenger(credentials))

    act(() => {
      result.current.createChat('+7 (999) 123-45-67')
    })

    expect(result.current.activeChat).toMatchObject({ id: PHONE_CHAT_ID, name: '+7 (999) 123-45-67' })
  })

  it('closes the active chat', () => {
    const { result } = renderHook(() => useMessenger(credentials))

    act(() => {
      result.current.createChat('+7 (999) 123-45-67')
    })
    act(() => result.current.closeChat())

    expect(result.current.activeChat).toBeNull()
  })

  it('sends a message and marks it as sent', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ idMessage: 'out-1' })
    const { result } = renderHook(() => useMessenger(credentials))

    await act(() => result.current.send(PHONE_CHAT_ID, 'hello'))

    expect(sendMessage).toHaveBeenCalledWith(credentials, PHONE_CHAT_ID, 'hello')
    expect(result.current.chats[0].messages).toEqual([
      expect.objectContaining({ id: 'out-1', text: 'hello', outgoing: true, status: 'sent' }),
    ])
  })

  it('marks the message as failed when sending fails', async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error('HTTP 500'))
    const { result } = renderHook(() => useMessenger(credentials))

    await act(() => result.current.send(PHONE_CHAT_ID, 'hello'))

    expect(result.current.chats[0].messages[0].status).toBe('error')
    expect(result.current.error).toBe(t('chat.sendError', { message: 'HTTP 500' }))
  })

  it('creates a new chat for a message from an unknown sender', async () => {
    const { result } = renderHook(() => useMessenger(credentials))

    act(() => notify(incoming(USER_ID, 'hi')))

    await waitFor(() => expect(result.current.chats).toHaveLength(1))
    expect(result.current.chats[0]).toMatchObject({ id: USER_ID, name: 'Sender' })
    expect(result.current.chats[0].messages[0]).toMatchObject({ text: 'hi', outgoing: false })
    expect(deleteNotification).toHaveBeenCalled()
  })

  it('puts the reply into the phone chat via the outgoing API notification', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ idMessage: 'out-1' })
    const { result } = renderHook(() => useMessenger(credentials))

    await act(() => result.current.send(PHONE_CHAT_ID, 'hello'))
    act(() => {
      notify({ typeWebhook: 'outgoingAPIMessageReceived', idMessage: 'out-1', senderData: { chatId: USER_ID } })
      notify(incoming(USER_ID, 'reply'))
    })

    await waitFor(() => expect(result.current.chats[0].messages).toHaveLength(2))
    expect(result.current.chats).toHaveLength(1)
    expect(result.current.chats[0]).toMatchObject({ id: PHONE_CHAT_ID, aliases: [USER_ID] })
    expect(result.current.chats[0].messages[1]).toMatchObject({ text: 'reply', outgoing: false })
  })

  it('ignores duplicate notifications', async () => {
    const { result } = renderHook(() => useMessenger(credentials))

    act(() => {
      notify(incoming(USER_ID, 'hi', 'same-id'))
      notify(incoming(USER_ID, 'hi', 'same-id'))
    })

    await waitFor(() => expect(deleteNotification).toHaveBeenCalledTimes(2))
    expect(result.current.chats[0].messages).toHaveLength(1)
  })

  it('persists chats to localStorage', async () => {
    const { result } = renderHook(() => useMessenger(credentials))

    act(() => {
      result.current.createChat('+7 (999) 123-45-67')
    })

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.chats(credentials.idInstance)) ?? '[]')
    expect(saved).toEqual([expect.objectContaining({ id: PHONE_CHAT_ID })])
  })
})
