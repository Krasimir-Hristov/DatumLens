# 🚀 DatumLens RAG: Execution Plan

**Current Phase:** `Phase 6: Security Hardening & Deployment`
**Status:** 🏗️ In Progress

---

## ✅ Фаза 1: Backend Основа & DB Setup

**Цел:** Настройване на професионална FastAPI среда, Pydantic модели и Supabase връзка.

| Статус | Стъпка  | Описание                              | Технологии                             |
| :----: | :------ | :------------------------------------ | :------------------------------------- |
|   ✅   | **1.1** | **Setup: Project Structure & `venv`** | `python`, `venv`                       |
|   ✅   | **1.2** | **Backend Setup: Core Dependencies**  | `fastapi`, `uvicorn`, `pydantic`, `uv` |
|   ✅   | **1.3** | **Models: RAG Pydantic Schema**       | `Pydantic BaseModel`, `UUID`           |
|   ✅   | **1.4** | **API: FastAPI "Health Check"**       | `FastAPI`, `CORS`                      |
|   ✅   | **1.5** | **DB: Supabase Project & Extensions** | `Supabase`, `pgvector`, `uuid-ossp`    |
|   ✅   | **1.6** | **DB: SQL Schema Creation**           | `SQL`, `PostgreSQL`                    |
|   ✅   | **1.7** | **DB: FastAPI Supabase Connector**    | `supabase-py`                          |

---

## ✅ Фаза 2: RAG Core: Upload & Indexing

**Цел:** Изграждане на пайплайн за интелигентна обработка на PDF и съхранение в `pgvector`.

| Статус | Стъпка  | Описание                            | Технологии                                                                |
| :----: | :------ | :---------------------------------- | :------------------------------------------------------------------------ |
|   ✅   | **2.1** | **Dependencies: AI & Parsing**      | `langchain`, `openai`, `google-genai`, `pypdf`                            |
|   ✅   | **2.2** | **LangChain: Document Loading**     | `PyPDFLoader`                                                             |
|   ✅   | **2.3** | **LangChain: Structured Chunking**  | `SemanticChunker` (AI-based)                                              |
|   ✅   | **2.4** | **Embedding: OpenAI Model Setup**   | `OpenAIEmbeddings`                                                        |
|   ✅   | **2.5** | **Storage: `pgvector` Integration** | `Supabase + pgvector`                                                     |
|   ✅   | **2.6** | **API: `/upload` Endpoint**         | `FastAPI UploadFile`, Router pattern                                      |
|   ✅   | **2.7** | **API: `/delete` Endpoint**         | `DELETE` endpoint за премахване на документи и техните вектори от базата. |

---

## ✅ Фаза 3: RAG Core: Chat & Retrieval

**Цел:** Имплементиране на Хибридно Търсене и RAG веригата с Gemini за генериране на цитиран отговор.

| Статус | Стъпка  | Описание                                | Технологии                                                    |
| :----: | :------ | :-------------------------------------- | :------------------------------------------------------------ |
|   ✅   | **3.1** | **Search: Keyword Retriever (FTS)**     | `PostgreSQL FTS` ('simple' config)                            |
|   ✅   | **3.2** | **Search: Vector Retriever**            | `pgvector`, `cosine similarity`                               |
|   ✅   | **3.3** | **Search: Hybrid Search Orchestration** | `Custom scoring algorithm`, `deduplication`                   |
|   ✅   | **3.4** | **LLM: Gemini Setup**                   | `Google Gemini`, Environment-based config                     |
|   ✅   | **3.5** | **Prompt Engineering: Citation Focus**  | `System Prompts` (вкл. инструкции за Multi-language отговори) |
|   ✅   | **3.6** | **RAG Chain: Final Orchestration**      | `LangChain`, In-memory conversation history                   |
|   ✅   | **3.7** | **API: `/chat` Endpoint**               | `FastAPI`, `StreamingResponse`                                |

---

## ✅ Фаза 4: Frontend (Next.js) & State

**Цел:** Изграждане на клиентския интерфейс с модерни инструменти за управление на състоянието.

| Статус | Стъпка  | Описание                         | Технологии                             |
| :----: | :------ | :------------------------------- | :------------------------------------- |
|   ✅   | **4.1** | **Frontend Setup: Next.js & TS** | `Next.js 16`, `React 19`, `Tailwind 4` |
|   ✅   | **4.2** | **State: TanStack Query Setup**  | `TanStack Query` (Server State)        |
|   ✅   | **4.3** | **State: Zustand Setup**         | `Zustand` (Client UI State)            |
|   ✅   | **4.4** | **UX: Upload Component**         | `Drag-n-Drop`, `Mutations`             |
|   ✅   | **4.5** | **UX: Chat Interface**           | `Chat UI`, `Optimistic Updates`        |

---

## ✅ Фаза 5: Polish & Final Features

**Цел:** Внедряване на ключовата функция за хайлайтване на цитати и добавяне на SaaS-готовност.

| Статус | Стъпка  | Описание                             | Технологии                                                  |
| :----: | :------ | :----------------------------------- | :---------------------------------------------------------- |
|   ✅   | **5.1** | **Citation: Front-end Parsing**      | `Regex`, `String Manipulation`                              |
|   ✅   | **5.2** | **Knowledge: Document Registry**     | Backend: SQL Table, Storage bucket, Fallback logic          |
|   ✅   | **5.3** | **Knowledge: Management UI**         | Frontend: `/knowledge` page, CRUD operations                |
|   ✅   | **5.4** | **Safety: Duplicate Prevention**     | Backend check for duplicate uploads                         |
|  Native | **5.5** | **Citation: PDF Viewer Integration** | *Implemented via browser native viewer with `#page=X`*      |
| Skipped | **5.6** | **Citation: Highlighting Logic**     | *Postponed for v2 (requires react-pdf)*                     |
|   ⬜   | **5.7** | **Feature: Chat History**            | Запазване на чат историята в Supabase и зареждане при вход. |
|   ⬜   | **5.8** | **Feature: Session Memory (Redis)**  | Upgrade на in-memory sessions към Redis с TTL (1-3 часа).   |


---

## 🔒 Фаза 6: Security Hardening & Deployment

**Цел:** Осигуряване на сигурността на приложението чрез RLS, Auth и подготовка за продукция.

| Статус | Стъпка  | Описание                              | Технологии                                      |
| :----: | :------ | :------------------------------------ | :---------------------------------------------- |
|   ⬜   | **6.1** | **Security: Supabase Auth**           | Настройка на Auth Providers (Email/Google)      |
|   ⬜   | **6.2** | **Security: RLS Policies (DB)**       | Ограничаване на достъпа до данни по `user_id`   |
|   ⬜   | **6.3** | **Security: Storage Policies**        | RLS за private bucket access (removing Public)  |
|   ⬜   | **6.4** | **Security: Backend Auth Middleware** | Валидация на JWT токени във FastAPI             |
|   ⬜   | **6.5** | **Deployment: Dockerization**         | `Dockerfile`, `docker-compose`                  |
|   ⬜   | **6.6** | **Deployment: Production Build**      | `Vercel` (Frontend), `Render/Railway` (Backend) |
