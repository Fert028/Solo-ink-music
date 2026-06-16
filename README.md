# 🎵 Solo ink. Music

Музыкальная онлайн-платформа для публикации и прослушивания треков без авторских прав.

## Стек технологий

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Стили:** SCSS (CSS Modules + глобальные переменные)
- **База данных:** PostgreSQL + Prisma ORM
- **Сессии:** iron-session (cookie-based, httpOnly)
- **Аудио:** нативный HTML5 Audio API

---

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и заполните переменные:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/solo_ink_music"
SESSION_SECRET="your-super-secret-key-min-32-characters-long"
```

> **SESSION_SECRET** должен быть строкой длиной минимум 32 символа.

### 3. База данных

```bash
# Создать таблицы
npm run db:push

# Создать начального администратора (admin / admin123)
npm run db:seed
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## Структура проекта

```
src/
├── app/
│   ├── (public)/          # Публичные страницы (без авторизации)
│   │   ├── layout.tsx     # Header + Player
│   │   ├── page.tsx       # Главная — список треков
│   │   └── TrackList.tsx  # Клиентский компонент списка
│   │
│   ├── (admin)/           # Защищённые страницы
│   │   └── admin/
│   │       ├── layout.tsx     # Сайдбар + проверка сессии
│   │       ├── page.tsx       # Дашборд
│   │       ├── tracks/        # Управление треками
│   │       └── upload/        # Загрузка нового трека
│   │
│   ├── admin/login/       # Страница входа (не защищена)
│   │
│   └── api/
│       ├── tracks/        # GET все треки
│       │   └── [id]/
│       │       ├── route.ts       # PATCH / DELETE трека
│       │       └── play/route.ts  # POST — счётчик прослушиваний
│       ├── upload/        # POST — загрузка файла
│       └── auth/
│           ├── login/     # POST — вход
│           ├── logout/    # POST — выход
│           └── me/        # GET — текущая сессия
│
├── components/
│   ├── Header/            # Шапка с логотипом, соцсетями, темой
│   ├── Player/            # Аудиоплеер (кастомный)
│   ├── TrackCard/         # Карточка трека
│   ├── ClientProviders.tsx
│   ├── ThemeProvider.tsx  # Контекст тёмной/светлой темы
│   └── PlayerContext.tsx  # Контекст плеера
│
├── lib/
│   ├── prisma.ts          # Singleton клиент Prisma
│   └── session.ts         # iron-session конфигурация
│
├── styles/
│   ├── globals.scss       # Глобальные стили + CSS-переменные тем
│   └── _variables.scss    # SCSS-переменные
│
└── types/
    └── index.ts           # Типы Track, Theme
```

---

## Функциональность

### Публичная часть
- 🎵 Список всех треков с поиском
- ▶️ Кастомный аудиоплеер (прогресс-бар, громкость, следующий/предыдущий)
- 🌊 Анимация волн во время воспроизведения
- 🌙 Переключение тёмной/светлой темы
- 🔗 Ссылки на ВКонтакте и Telegram

### Админ-панель (`/admin`)
- 🔐 Вход по логину и паролю (сессия 7 дней)
- 📊 Дашборд со статистикой
- 📋 Список треков с редактированием и удалением
- ⬆️ Загрузка треков (аудио + обложка + метаданные)
- 👤 Выход из системы

---

## Добавление социальных ссылок

Откройте `src/components/Header/Header.tsx` и замените заглушки:

```tsx
// ВКонтакте
href="https://vk.com/YOUR_LINK"  →  href="https://vk.com/ваш_профиль"

// Telegram
href="https://t.me/YOUR_LINK"  →  href="https://t.me/ваш_канал"
```

---

## Смена пароля администратора

```bash
# Запустить Prisma Studio
npm run db:studio
```

Или обновить через скрипт — хэшировать новый пароль через bcrypt и вставить в таблицу `Admin`.

---

## Деплой (рекомендуемый)

### Vercel + Railway (PostgreSQL)

1. Создать PostgreSQL базу на [Railway](https://railway.app)
2. Задеплоить репозиторий на [Vercel](https://vercel.com)
3. Добавить переменные окружения в настройках Vercel
4. Запустить `npm run db:push` против продакшн БД

> ⚠️ Для продакшна файлы треков лучше хранить в S3/Cloudflare R2, а не в `public/`.

---

## Дефолтные данные для входа

После `npm run db:seed`:
- **Логин:** `admin`
- **Пароль:** `admin123`

> Обязательно смените пароль перед деплоем!
