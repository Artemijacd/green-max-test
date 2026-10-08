export const ru = {
  'app.brand': 'MAX',
  'app.title': 'MAX Chat · GREEN-API',

  'api.networkError': 'Проверьте подключение к интернету, idInstance и apiTokenInstance',

  'login.title': 'Вход через GREEN-API',
  'login.mockHint': 'Мок-режим: подойдут любые значения в верном формате',
  'login.idInstance': 'idInstance',
  'login.apiTokenInstance': 'apiTokenInstance',
  'login.submit': 'Войти',
  'login.checking': 'Проверка…',
  'login.notAuthorized': 'Инстанс не авторизован (состояние: {state})',
  'login.connectionError': 'Не удалось подключиться. {message}',
  'login.invalidIdInstance': 'idInstance должен состоять из 9–12 цифр',
  'login.invalidApiToken': 'apiTokenInstance должен состоять из 50 символов: цифры и латинские буквы a–f',

  'sidebar.title': 'Чаты',
  'sidebar.logout': 'Выйти',
  'sidebar.phonePlaceholder': '+7 (911) 123-45-67',
  'sidebar.create': 'Создать',
  'sidebar.youPrefix': 'Вы: ',
  'sidebar.noMessages': 'Нет сообщений',
  'sidebar.empty': 'Создайте чат по номеру телефона',
  'sidebar.invalidPhone': 'Введите номер полностью, например +7 (911) 123-45-67',
  'sidebar.invalidPhonePrefix': 'Номер должен начинаться с +7 (9…)',

  'welcome.title': 'Добро пожаловать в MAX Chat',
  'welcome.text': 'Отправляйте и получайте текстовые сообщения в MAX через GREEN-API',
  'welcome.step1': 'Введите номер получателя слева и нажмите «Создать»',
  'welcome.step2': 'Напишите сообщение и нажмите Enter',
  'welcome.step3': 'Ответ получателя появится в чате',

  'emptyChat.text': 'Здесь пока нет сообщений. Напишите первое — получатель увидит его в MAX',

  'chat.back': 'Назад',
  'chat.messagePlaceholder': 'Сообщение',
  'chat.send': 'Отправить',
  'chat.receiveError': 'Ошибка получения сообщений: {message}',
  'chat.sendError': 'Не удалось отправить: {message}',

  'mock.senderName': 'Тестовый собеседник',
  'mock.reply': 'Получил: «{text}»',
} as const
