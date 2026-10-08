# MAX Chat (GREEN-API)

Минимальный веб-чат для отправки и получения текстовых сообщений в MAX через [GREEN-API](https://green-api.com/max).

**Стек:** React 19, TypeScript, Vite, SCSS, Vitest, ESLint, Stylelint, Prettier.

## Запуск

```bash
yarn install
yarn dev
```

### Без реального API (моки)

```bash
yarn dev:mocked
```

Логин принимает любые значения в верном формате (`idInstance` — 9–12 цифр, `apiTokenInstance` — 50 символов `0-9a-f`). На каждое отправленное сообщение через ~2 с приходит ответ «Получил: …» от тестового собеседника с числовым `chatId`, как в MAX.

## Скрипты

| Команда                | Что делает                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| `yarn dev`             | dev-сервер с реальным API                                           |
| `yarn dev:mocked`      | dev-сервер с мок-API                                                |
| `yarn build`           | проверка типов и прод-сборка в `dist/`                              |
| `yarn preview`         | локальный просмотр прод-сборки                                      |
| `yarn test`            | unit-тесты (Vitest)                                                 |
| `yarn test:watch`      | тесты в watch-режиме                                                |
| `yarn lint`            | ESLint для `.ts` / `.tsx`                                           |
| `yarn lint:fix`        | ESLint с автоисправлением                                           |
| `yarn lint:styles`     | Stylelint для `.scss`                                               |
| `yarn lint:styles:fix` | Stylelint с автоисправлением                                        |
| `yarn format`          | форматирование Prettier                                             |
| `yarn format:check`    | проверка форматирования без изменения файлов                        |
| `yarn check-build`     | ESLint, Stylelint, проверка Prettier и сборка — всё по очереди      |
| `yarn check-build:fix` | то же с автоисправлением: ESLint, Stylelint, Prettier, затем сборка |

## Подготовка инстанса

В личном кабинете GREEN-API для инстанса MAX:

- инстанс авторизован (состояние `authorized`);
- поле `webhookUrl` пустое (получение идёт через HTTP API);
- включены «Получать уведомления о входящих сообщениях» и «Получать уведомления об отправленных с API сообщениях».

## Использование

1. Введите `idInstance` и `apiTokenInstance` из личного кабинета.
2. Введите номер получателя: `+7` подставится автоматически, номер должен начинаться с `9`. Нажмите «Создать».
3. Напишите сообщение и отправьте (Enter — отправить, Shift+Enter — перенос строки).
4. Ответ получателя появится в чате.

## Структура проекта

```
├── .env                      # адрес API, мок-режим, параметры номера телефона
├── index.html
├── vite.config.ts            # Vite, алиас @ → src, настройки Vitest
├── eslint.config.js
├── .stylelintrc.json
├── .prettierrc.json
└── src/
    ├── main.tsx              # точка входа: глобальные стили, title, рендер App
    ├── App.tsx               # выбор экрана: форма входа или мессенджер
    ├── constants.ts          # все константы; часть читается из .env
    ├── types.ts              # Chat, Message
    ├── utils.ts              # маска и валидация номера, валидация учётных данных, формат времени
    ├── vite-env.d.ts         # типы переменных окружения
    ├── api/
    │   ├── greenApi.ts       # запросы к GREEN-API, выбор реального или мок-API
    │   └── mockGreenApi.ts   # мок: очередь уведомлений и автоответ
    ├── components/           # тонкие view: только разметка и обработка событий DOM
    │   ├── LoginForm.tsx
    │   ├── Messenger.tsx     # раскладка: сайдбар + область чата
    │   ├── Sidebar.tsx       # создание чата и список чатов
    │   ├── ChatWindow.tsx    # лента сообщений и поле ввода
    │   ├── Avatar.tsx
    │   ├── WelcomeBanner.tsx # чат не выбран
    │   └── EmptyChatBanner.tsx # в чате нет сообщений
    ├── hooks/                # бизнес-логика компонентов: use + имя компонента
    │   ├── useApp.ts         # вход / выход, хранение учётных данных
    │   ├── useLoginForm.ts
    │   ├── useMessenger.ts   # чаты, отправка, цикл получения уведомлений
    │   ├── useSidebar.ts
    │   ├── useChatWindow.ts
    │   └── useAvatar.ts
    ├── i18n/
    │   ├── index.ts          # t(key, params)
    │   └── ru.ts             # все надписи интерфейса
    ├── styles/
    │   ├── _variables.scss   # цвета, размеры, брейкпоинт
    │   ├── _mixins.scss
    │   ├── _normalize.scss
    │   ├── global.scss       # базовые стили, кнопки, раскладка
    │   └── components/       # стили компонентов, импортируются из .tsx
    └── tests/                # unit-тесты, повторяют структуру src
        ├── setup.ts
        ├── utils.test.ts
        ├── api/
        ├── hooks/
        └── i18n/
```

### Соглашения

- Импорты внутри `src` — через алиас `@/` (например, `@/hooks/useSidebar`).
- Бизнес-логика компонента живёт в хуке `src/hooks/use<Компонент>.ts`, в `.tsx` — только представление.
- Все надписи — в `src/i18n/ru.ts`, в коде — `t('ключ')`.
- Константы — в `src/constants.ts`; значения, зависящие от окружения, — в `.env` с префиксом `VITE_`.

## Как устроено

- Отправка — [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/), `chatId = <номер>@c.us`.
- Получение — [HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/): цикл `ReceiveNotification` (long-poll 5 с) → обработка → `DeleteNotification`.
- MAX может присылать входящие с числовым `chatId` пользователя, а не с номером телефона. Чтобы ответ попал в тот же чат, приложение берёт `chatId` из уведомления `outgoingAPIMessageReceived` о нашем отправленном сообщении и сохраняет его как алиас чата.
- Учётные данные хранятся в `sessionStorage`, история чатов — в `localStorage`.
