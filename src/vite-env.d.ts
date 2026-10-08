/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_PHONE_COUNTRY_CODE: string
  readonly VITE_PHONE_NATIONAL_LENGTH: string
  readonly VITE_PHONE_MOBILE_PREFIX: string
  readonly VITE_PHONE_TRUNK_PREFIX: string
  readonly VITE_PHONE_CHAT_SUFFIX: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
