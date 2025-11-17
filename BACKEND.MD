backend/.env файл
Python pydantic-settings (най-новият клас за Pydantic V2)
python-dotenv
⚠️ Насоки за AI Coding Buddy (Best Practice & Security)
Security First: Никога не хардкодваме секрети в кода. Използваме Pydantic Settings за сигурно и валидирано зареждане от .env.
Best Practice: Използваме специален Settings клас, за да сме сигурни, че всички необходими променливи на средата са налични преди стартиране на приложението.
📝 Детайлни Инструкции (Стъпка по Стъпка)
Стъпка 1: Попълване на .env Файла
[Инструкция за AI Buddy]: Отвори файла backend/.env и добави необходимите променливи.
Вземи стойностите от Supabase Dashboard (Project Settings -> API):
code
Env

# backend/.env

# Supabase Credentials (ВАЖНО: Добави твоите РЕАЛНИ URL и ANON KEY тук)

SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"

# Gemini API Key (Ще ни трябва във Фаза 3)

GEMINI_API_KEY="[YOUR_GEMINI_API_KEY]"
Напомняне: Увери се, че .env е в .gitignore!
Стъпка 2: Създаване на Pydantic Settings Клас
[Инструкция за AI Buddy]: Създай файл backend/app/config.py (или settings.py) и дефинирай класа за настройките.
code
Python

# backend/app/config.py (или settings.py)

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Клас за зареждане на настройките

class Settings(BaseSettings): # Указваме къде да търси .env файла
model_config = SettingsConfigDict(
env_file='.env',
env_file_encoding='utf-8',
extra='ignore' # Игнорираме допълнителни променливи
)

    # 1. Supabase Credentials
    SUPABASE_URL: str = Field(..., description="The URL of the Supabase project.")
    SUPABASE_ANON_KEY: str = Field(..., description="The public anonymous key for Supabase.")

    # 2. AI Credentials
    GEMINI_API_KEY: str = Field(..., description="The API key for Google Gemini models.")

    # 3. FastAPI/App Settings (Може да се променя по-късно)
    APP_NAME: str = "DatumLens API"
    API_V1_STR: str = "/api/v1"

# Инициализираме Settings класа (той автоматично чете .env)

settings = Settings()
Стъпка 3: Тестване на Зареждането в main.py
[Инструкция за AI Buddy]: Модифицирай backend/app/main.py, за да импортира и покаже, че настройките са заредени.
code
Python

# backend/app/main.py

from fastapi import FastAPI
from .config import settings # <-- Импортираме настройките

app = FastAPI(
title=settings.APP_NAME, # <-- Използваме Pydantic настройка
description="Backend API for secure personal data and AI integration.",
version="1.0.0",
)

@app.get("/")
def read_root():
return {
"Hello": "DatumLens Backend is Running",
"App_Name": settings.APP_NAME, # ВНИМАНИЕ: Никога не връщай API ключове в production endpoint!
"Supabase_URL_Loaded": settings.SUPABASE_URL is not None
}
Стъпка 4: Финална Проверка
[Инструкция за AI Buddy]: Стартирай сървъра и провери дали settings.APP_NAME е "DatumLens API" и дали Supabase_URL_Loaded е true.
code
Bash

# Увери се, че venv е активна: (.venv)

uvicorn app.main:app --reload
Проверка: Отвори http://127.0.0.1:8000.
