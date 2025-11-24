from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Създаваме инстанция на FastAPI приложението
# title и version се показват в автоматичната документация (Swagger UI)
app = FastAPI(
    title="DatumLens RAG API",
    version="1.0.0",
    description="API за интелигентен анализ на документи с RAG"
)

# Настройка на CORS (Cross-Origin Resource Sharing)
# Това е важно, защото Frontend-ът (Next.js) ще върви на друг порт (напр. 3000),
# а Backend-ът на 8000. Браузърът блокира такива заявки по подразбиране, освен ако не ги разрешим тук.
origins = [
    "http://localhost:3000", # Next.js локално
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Кой има право да ни вика
    allow_credentials=True,
    allow_methods=["*"],         # Позволяваме всички методи (GET, POST, PUT, DELETE)
    allow_headers=["*"],         # Позволяваме всички хедъри
)

@app.get("/health")
async def health_check():
    """
    Прост endpoint за проверка на състоянието на сървъра.
    Връща JSON статус {"status": "ok"}.
    """
    return {"status": "ok", "message": "DatumLens API is running 🚀"}

@app.get("/")
async def root():
    """
    Root endpoint - просто за да не виждаме 404, когато отворим главния URL.
    """
    return {"message": "Welcome to DatumLens API. Visit /docs for Swagger UI."}
