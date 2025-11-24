import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Зареждаме променливите от .env файла
load_dotenv()

# Взимаме стойностите
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Проверка дали ги има (за да не се чудим защо не работи, ако сме ги забравили)
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Липсват SUPABASE_URL или SUPABASE_KEY в .env файла!")

# Създаваме клиента веднъж (Singleton pattern)
# Така не създаваме нова връзка всеки път, когато ни трябва.
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_client() -> Client:
    """
    Връща инстанция на Supabase клиента.
    Използвай тази функция навсякъде, където ти трябва достъп до базата.
    """
    return supabase
