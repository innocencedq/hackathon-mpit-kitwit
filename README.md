# Hackathon MPIT 25/26 | KitWit | chatgptdestroyers.io
# 1. KitWiz - P2P сервис аренды вещей
P2P сервис аренды вещей, инструментов и оборудования.

##  2. Технологии

- **Backend**: Python, TortoiseORM, PostgreSQL, aiogram
- **Frontend**: TypeScript, Vite + React, TailwindCSS, Radix UI
- **Telegram**: Telegram Apps SDK

## 3. Быстрый старт

### Предварительные требования

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Poetry
- Ngrok (для туннелирования)

### Установка

1. **Клонируйте репозиторий**
```
git clone https://github.com/yourusername/kitwiz.git
cd kitwiz

# Создайте и отредактируйте .env файл в src/back:
BOT_TOKEN=yourbottoken
DB_URL=asyncpg://admin:password@localhost:5432/yourbase

# Установите зависимости
curl -sSL https://install.python-poetry.org | python3 -

cd src/back
poetry install

# Создайте и отредактируйте .env файл в src/front:
VITE_BASE_API_URL=https://back.end

# Установите зависимости
cd src/front
npm install

# Настройте базу данных
cd src/back
poetry run aerich init -t config_reader.TORTOISE_ORM --location ./db/migrations
poetry run aerich init-db

#Запустите приложение вместе с туннелированием
# Frontend
cd src/frontend
npm run dev

# Backend  
cd src/backend
poetry run python __main__.py
```
