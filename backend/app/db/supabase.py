import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Зареждаме променливите от .env файла
load_dotenv()

# Взимаме стойностите
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Опитваме се да вземем Service Role Key (за bypass на RLS), иначе ползваме стандартния Key
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

# Проверка дали ги има
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Липсват SUPABASE_URL или SUPABASE_KEY (или SUPABASE_SERVICE_ROLE_KEY) в .env файла!"
    )

# Създаваме клиента веднъж (Singleton pattern)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase_client() -> Client:
    """
    Връща инстанция на Supabase клиента.
    Използвай тази функция навсякъде, където ти трябва достъп до базата.
    """
    return supabase


def get_user_supabase_client(access_token: str) -> Client:
    """
    Създава Supabase клиент с JWT токен на конкретен потребител.
    Този клиент използва auth контекста на потребителя за RLS политики.

    Args:
        access_token: JWT токен на потребителя от Supabase Auth

    Returns:
        Client инстанция с user auth context
    """
    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL не е конфигуриран")

    # Използваме anon key за публичния API, но с user JWT за auth контекст
    anon_key = os.getenv("SUPABASE_KEY")
    if not anon_key:
        raise ValueError("SUPABASE_KEY не е конфигуриран")

    # Създаваме нов клиент с user access token
    user_client = create_client(SUPABASE_URL, anon_key)

    # Задаваме access token за auth контекст
    user_client.auth.set_session(access_token, "")

    return user_client
