---


### Фаза 1: Backend Основа & DB Setup

**Цел:** Настройване на професионална FastAPI среда, Pydantic модели и Supabase връзка.

| Стъпка      | Описание                              | Технологии                                                                                                                                             |
| :---------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[X] 1.1** | **Setup: Project Structure & `venv`** | Създаване на `datumlens-rag` root, `backend/`, `frontend/` директории и активиране на Python `venv`.                                                   |
| **[ ] 1.2** | **Backend Setup: Core Dependencies**  | Инсталиране на `fastapi`, `uvicorn[standard]`, `pydantic`, `python-dotenv` (за по-късно четене на API ключове).                                        |
| **[ ] 1.3** | **Models: RAG Pydantic Schema**       | Дефиниране на `RAGChunkMetadata` и `RAGChunk` в `backend/app/models/rag_model.py`.                                                                     |
| **[ ] 1.4** | **API: FastAPI "Health Check"**       | Създаване на `backend/app/main.py` с `app = FastAPI()` и прост `/health` endpoint. Тестване на стартирането с `uvicorn`.                               |
| **[ ] 1.5** | **DB: Supabase Project & Extensions** | Създаване на Supabase проект. Атирвиране на **`vector`** extension и `uuid-ossp`.                                                                      |
| **[ ] 1.6** | **DB: SQL Schema Creation**           | Създаване на таблица `document_chunks` със задължителните колони: `id (UUID)`, `content (text)`, `metadata (jsonb)`, и **`embedding (vector(1536))`**. |
| **[ ] 1.7** | **DB: FastAPI Supabase Connector**    | Инсталиране на `asyncpg`. Настройка на `backend/app/db/database.py` за асинхронна връзка с PostgreSQL.                                                 |

### Фаза 2: RAG Core: Upload & Indexing

**Цел:** Изграждане на пайплайн за интелигентна обработка на PDF и съхранение в `pgvector`.

| Стъпка      | Описание                                        | Технологии                                                                                                                             |
| :---------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **[ ] 2.1** | **Dependencies: AI & Parsing**                  | Инсталиране на `langchain`, `google-genai`, `openai`, `unstructured` и `python-multipart`.                                             |
| **[ ] 2.2** | **LangChain: Document Loading**                 | Създаване на функция, която използва LangChain **`UnstructuredFileLoader`** за зареждане на PDF.                                       |
| **[ ] 2.3** | **LangChain: Structured Chunking**              | Използване на `RecursiveCharacterTextSplitter` за логическо разделяне, запазвайки `page_number` и `section_title_path`.                |
| **[ ] 2.4** | **Embedding: OpenAI Model Setup**               | Инициализиране на **`OpenAIEmbeddings`** в Python.                                                                                     |
| **[ ] 2.5** | **Storage: `pgvector` Integration (LangChain)** | Използване на `LangChain` **`PostgresVectorStore`** за автоматично генериране на embedding-и и съхранение на chunk + метаданни.        |
| **[ ] 2.6** | **API: `/upload` Endpoint**                     | Изграждане на асинхронен `POST` endpoint във `backend/app/api/document.py`, който получава PDF, извиква стъпки 2.2-2.5 и връща статус. |

### Фаза 3: RAG Core: Chat & Retrieval

**Цел:** Имплементиране на Хибридно Търсене и RAG веригата с Gemini за генериране на цитиран отговор.

| Стъпка      | Описание                                | Технологии                                                                                                       |
| :---------- | :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **[ ] 3.1** | **Search: Keyword Retriever (FTS)**     | Настройване на PostgreSQL за пълнотекстово търсене (FTS) върху колоната `content` за ключови думи.               |
| **[ ] 3.2** | **Search: Vector Retriever**            | Настройване на LangChain **`PostgresVectorStore.as_retriever()`** за семантично търсене.                         |
| **[ ] 3.3** | **Search: Hybrid Search Orchestration** | Комбиниране на резултатите от 3.1 и 3.2 чрез `EnsembleRetriever` или ръчно сливане.                              |
| **[ ] 3.4** | **LLM: Gemini Setup**                   | Инициализиране на **`Gemini`** модела чрез `langchain_google_genai`.                                             |
| **[ ] 3.5** | **Prompt Engineering: Citaton Focus**   | Създаване на **системен промпт** за LLM, който изисква **стриктно** генериране на цитати във формата: ``.        |
| **[ ] 3.6** | **RAG Chain: Final Orchestration**      | Създаване на LangChain/LangGraph веригата: `Query -> Hybrid Retriever -> Context -> Gemini LLM -> Final Answer`. |
| **[ ] 3.7** | **API: `/chat` Endpoint**               | Изграждане на асинхронен `POST` endpoint, който приема въпрос и връща структуриран отговор с цитати.             |

### Фаза 4: Frontend (Next.js) & State

**Цел:** Изграждане на клиентския интерфейс с модерни инструменти за управление на състоянието.

| Стъпка      | Описание                         | Технологии                                                                                                                          |
| :---------- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **[ ] 4.1** | **Frontend Setup: Next.js & TS** | Създаване на Next.js проект с TypeScript. Интегриране на TailwindCSS и Shadcn/UI.                                                   |
| **[ ] 4.2** | **State: TanStack Query Setup**  | Инсталиране на `tanstack/react-query`. Настройка на `QueryClientProvider` в root на приложението. **(Учене на Server State)**       |
| **[ ] 4.3** | **State: Zustand Setup**         | Инсталиране на `zustand`. Създаване на store за UI състояние (напр. `isChatVisible`, `activeDocID`). **(Учене на Client UI State)** |
| **[ ] 4.4** | **UX: Upload Component**         | Създаване на Drag-and-Drop компонент. Използване на **TanStack Query Mutations** за извикване на `/upload` API.                     |
| **[ ] 4.5** | **UX: Chat Interface**           | Създаване на чат UI. Използване на **TanStack Query** за извикване на `/chat` API и управление на състоянието на съобщенията.       |

### Фаза 5: Polish & Final Features

**Цел:** Внедряване на ключовата функция за хайлайтване на цитати и добавяне на SaaS-готовност (Auth).

| Стъпка      | Описание                                  | Технологии                                                                                                                                       |
| :---------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **[ ] 5.1** | **Citation: Front-end Parsing**           | Обработване на отговора от `/chat`. Разпознаване на цитатите (``) и превръщането им в интерактивни бутони.                                       |
| **[ ] 5.2** | **Citation: PDF Viewer Integration**      | Интегриране на PDF Viewer компонент (`react-pdf`).                                                                                               |
| **[ ] 5.3** | **Citation: Highlighting Logic**          | При клик върху цитат, използване на `start_offset` за изчисляване на позицията на текста в PDF и **маркиране** на съответната част от документа. |
| **[ ] 5.4** | **Security: Supabase Auth Setup**         | Настройване на потребителска автентикация чрез Supabase Auth.                                                                                    |
| **[ ] 5.5** | **Security: Full-Stack Auth Integration** | Прилагане на Guard Clauses във FastAPI (защитени API пътища) и използване на TanStack Query за управление на потребителските сесии.              |
| **[ ] 5.6** | **Final: Deployment Preparation**         | Конфигуриране на Dockerfile и `docker-compose.yml` за лесно разполагане на Backend и Frontend.                                                   |

---
