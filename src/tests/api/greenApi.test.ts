import { describe, expect, it } from 'vitest'
import { extractText, type WebhookBody } from '@/api/greenApi'

const body = (messageData: WebhookBody['messageData']): WebhookBody => ({
  typeWebhook: 'incomingMessageReceived',
  messageData,
})

describe('extractText', () => {
  it('reads text messages', () => {
    expect(extractText(body({ typeMessage: 'textMessage', textMessageData: { textMessage: 'hi' } }))).toBe('hi')
  })

  it('reads extended text messages', () => {
    expect(extractText(body({ typeMessage: 'extendedTextMessage', extendedTextMessageData: { text: 'link' } }))).toBe(
      'link',
    )
  })

  it('ignores other message types', () => {
    expect(extractText(body({ typeMessage: 'imageMessage' }))).toBeNull()
  })

  it('ignores notifications without message data', () => {
    expect(extractText(body(undefined))).toBeNull()
  })
})
