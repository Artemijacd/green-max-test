const requireEnv = (name: keyof ImportMetaEnv): string => {
  const value = import.meta.env[name]
  if (!value) throw new Error(`Missing env variable ${name}`)
  return value
}

export const API_URL = requireEnv('VITE_API_URL')
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const RECEIVE_TIMEOUT_SEC = 5
export const RECEIVE_RETRY_DELAY_MS = 5000

export const MAX_MESSAGE_LENGTH = 4000
export const PHONE_COUNTRY_CODE = requireEnv('VITE_PHONE_COUNTRY_CODE')
export const PHONE_NATIONAL_LENGTH = Number(requireEnv('VITE_PHONE_NATIONAL_LENGTH'))
export const PHONE_MOBILE_PREFIX = requireEnv('VITE_PHONE_MOBILE_PREFIX')
export const PHONE_TRUNK_PREFIX = requireEnv('VITE_PHONE_TRUNK_PREFIX')
export const PHONE_CHAT_SUFFIX = requireEnv('VITE_PHONE_CHAT_SUFFIX')
export const LOCAL_MESSAGE_PREFIX = 'local-'

export const LOCALE = 'ru-RU'

export const STORAGE_KEYS = {
  credentials: 'max-credentials',
  chats: (idInstance: string) => `max-chats:${idInstance}`,
} as const

export const INSTANCE_STATE_AUTHORIZED = 'authorized'

// Credential formats are not documented for MAX; patterns follow real instances and docs examples
export const ID_INSTANCE_PATTERN = /^\d{9,12}$/
export const API_TOKEN_PATTERN = /^[0-9a-f]{50}$/i

export const WEBHOOK_TYPES = {
  incoming: 'incomingMessageReceived',
  outgoing: 'outgoingMessageReceived',
  outgoingApi: 'outgoingAPIMessageReceived',
} as const

export const MESSAGE_TYPES = {
  text: 'textMessage',
  extendedText: 'extendedTextMessage',
} as const

export const AVATAR_COLORS = ['#5b6cff', '#ff7a59', '#2bb673', '#a35bff', '#ffb020', '#16a3c9']

export const ICONS = {
  back: '←',
  pending: '🕓',
  sent: '✓',
  error: '⚠',
} as const

export const MOCK = {
  responseDelayMs: 300,
  outgoingWebhookDelayMs: 100,
  replyDelayMs: 2000,
  userIdBase: 10_000_000,
  idPrefix: 'MOCK-',
  incomingIdPrefix: 'MOCK-IN-',
} as const
