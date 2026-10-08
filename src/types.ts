export type MessageStatus = 'pending' | 'sent' | 'error'

export interface Message {
  id: string
  text: string
  outgoing: boolean
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  id: string
  aliases: string[]
  name: string
  messages: Message[]
}
